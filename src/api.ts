import type { PendingResponse, PrintedResponse } from './types';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export interface ApiClientOptions {
  baseUrl: string;
  token: string;
  timeoutMs: number;
}

async function request<T>(
  options: ApiClientOptions,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs);

  try {
    const response = await fetch(`${options.baseUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        ...(init.headers ?? {}),
        'X-Print-Token': options.token,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new ApiError(`HTTP ${response.status}`, response.status);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export function createApiClient(options: ApiClientOptions) {
  return {
    ping: () => request<{ ok: boolean; server_time: string; site: string }>(options, '/ping'),
    pending: () => request<PendingResponse>(options, '/orders/pending'),
    markPrinted: (orderId: number) =>
      request<PrintedResponse>(options, `/orders/${orderId}/printed`, { method: 'POST' }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
