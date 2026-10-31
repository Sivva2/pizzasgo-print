import { useCallback, useEffect, useRef, useState } from 'react';
import { createApiClient } from './api';
import { buildTicket } from './ticket';
import { initPrinter, printLines } from './printer';
import { CONFIG } from './config';
import type { Order } from './types';

export type ConnectionState = 'init' | 'ok' | 'network-error' | 'auth-error' | 'printer-error';

export interface LogEntry {
  at: number;
  message: string;
  level: 'info' | 'error';
}

const MAX_LOG = 40;

export function usePrintQueue() {
  const [connection, setConnection] = useState<ConnectionState>('init');
  const [lastPollAt, setLastPollAt] = useState<number | null>(null);
  const [printedCount, setPrintedCount] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);

  const handledIds = useRef<Set<number>>(new Set());
  const attempts = useRef<Map<number, number>>(new Map());
  const busy = useRef(false);

  const api = useRef(
    createApiClient({
      baseUrl: CONFIG.baseUrl,
      token: CONFIG.token,
      timeoutMs: CONFIG.requestTimeoutMs,
    }),
  ).current;

  const addLog = useCallback((message: string, level: LogEntry['level'] = 'info') => {
    setLog((previous) => [{ at: Date.now(), message, level }, ...previous].slice(0, MAX_LOG));
  }, []);

  const handleOrder = useCallback(
    async (order: Order) => {
      const tried = attempts.current.get(order.id) ?? 0;

      if (tried >= CONFIG.maxPrintAttempts) {
        return;
      }

      attempts.current.set(order.id, tried + 1);

      const lines = buildTicket(order, {
        width: CONFIG.ticketWidth,
        shopName: CONFIG.shopName,
        shopPhone: CONFIG.shopPhone,
        currencySymbol: CONFIG.currencySymbol,
      });

      await printLines(lines);
      await api.markPrinted(order.id);

      handledIds.current.add(order.id);
      attempts.current.delete(order.id);
      setPrintedCount((count) => count + 1);
      addLog(`Commande #${order.number} imprimee`);
    },
    [addLog, api],
  );

  const poll = useCallback(async () => {
    if (busy.current) {
      return;
    }

    busy.current = true;

    try {
      const result = await api.pending();
      setLastPollAt(Date.now());
      setConnection('ok');

      const queue = result.orders.filter((order) => !handledIds.current.has(order.id));

      for (const order of queue) {
        try {
          await handleOrder(order);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          addLog(`Commande #${order.number}: ${message}`, 'error');
          setConnection('printer-error');
        }
      }
    } catch (error) {
      const status = (error as { status?: number }).status;

      if (status === 401 || status === 403) {
        setConnection('auth-error');
        addLog('Jeton refuse par le site', 'error');
      } else {
        setConnection('network-error');
        addLog('Site injoignable', 'error');
      }
    } finally {
      busy.current = false;
    }
  }, [addLog, api, handleOrder]);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      try {
        await initPrinter(CONFIG.useUtf8Command);
        addLog('Imprimante prete');
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        addLog(`Imprimante indisponible: ${message}`, 'error');
        setConnection('printer-error');
      }

      if (!cancelled) {
        void poll();
      }
    };

    void start();

    const timer = setInterval(() => {
      void poll();
    }, CONFIG.pollIntervalMs);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [addLog, poll]);

  return { connection, lastPollAt, printedCount, log, poll };
}
