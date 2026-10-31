import type { Order, OrderItem } from './types';

export interface TicketOptions {
  width: number;
  shopName: string;
  shopPhone: string;
  currencySymbol: string;
}

const DEFAULTS: TicketOptions = {
  width: 32,
  shopName: "PIZZA'S GO",
  shopPhone: '',
  currencySymbol: 'EUR',
};

export function formatMoney(amount: number, symbol: string): string {
  const value = amount.toFixed(2).replace('.', ',');
  return symbol ? `${value} ${symbol}` : value;
}

export function formatDateTime(iso: string | null): string {
  if (!iso) {
    return '';
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const pad = (n: number) => String(n).padStart(2, '0');

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function rule(char: string, width: number): string {
  return char.repeat(width);
}

function center(text: string, width: number): string {
  const trimmed = text.slice(0, width);
  const left = Math.floor((width - trimmed.length) / 2);
  return ' '.repeat(Math.max(0, left)) + trimmed;
}

function wrap(text: string, width: number, indent = 0): string[] {
  const available = Math.max(1, width - indent);
  const prefix = ' '.repeat(indent);
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if (word.length > available) {
      if (current) {
        lines.push(prefix + current);
        current = '';
      }

      let rest = word;

      while (rest.length > available) {
        lines.push(prefix + rest.slice(0, available));
        rest = rest.slice(available);
      }

      current = rest;
      continue;
    }

    if (!current) {
      current = word;
    } else if (current.length + 1 + word.length <= available) {
      current += ' ' + word;
    } else {
      lines.push(prefix + current);
      current = word;
    }
  }

  if (current) {
    lines.push(prefix + current);
  }

  return lines.length ? lines : [prefix];
}

function columns(left: string, right: string, width: number, continuationIndent = 0): string[] {
  const rightText = right.slice(0, width);
  const leftAvailable = width - rightText.length - 1;
  const leftLines = wrap(left, leftAvailable);
  const firstLine = leftLines[0];
  const gap = Math.max(1, width - firstLine.length - rightText.length);
  const prefix = ' '.repeat(continuationIndent);

  return [
    firstLine + ' '.repeat(gap) + rightText,
    ...leftLines.slice(1).map((line) => prefix + line),
  ];
}

function itemLines(item: OrderItem, options: TicketOptions): string[] {
  const label = `${item.quantity}x ${item.name}`;
  const price = formatMoney(item.total, '');
  const lines = columns(label, price, options.width, 3);

  for (const option of item.options) {
    const text = option.value ? `${option.label}: ${option.value}` : option.label;
    lines.push(...wrap(text, options.width, 3));
  }

  return lines;
}

export function buildTicket(order: Order, overrides: Partial<TicketOptions> = {}): string[] {
  const options: TicketOptions = { ...DEFAULTS, ...overrides };
  const { width } = options;
  const lines: string[] = [];

  lines.push(rule('=', width));
  lines.push(center(options.shopName, width));

  if (options.shopPhone) {
    lines.push(center(options.shopPhone, width));
  }

  lines.push(rule('=', width));
  lines.push('');
  lines.push(`COMMANDE #${order.number}`);

  const date = formatDateTime(order.created_at);

  if (date) {
    lines.push(date);
  }

  lines.push(rule('-', width));
  lines.push(center(`** ${order.mode.toUpperCase()} **`, width));
  lines.push(rule('-', width));

  if (order.customer.name) {
    lines.push(...wrap(order.customer.name, width));
  }

  if (order.customer.phone) {
    lines.push(`Tel: ${order.customer.phone}`);
  }

  if (order.mode === 'livraison' && order.address) {
    const { line1, line2, postcode, city } = order.address;

    if (line1) {
      lines.push(...wrap(line1, width));
    }

    if (line2) {
      lines.push(...wrap(line2, width));
    }

    const cityLine = [postcode, city].filter(Boolean).join(' ');

    if (cityLine) {
      lines.push(...wrap(cityLine, width));
    }
  }

  lines.push(rule('-', width));

  for (const item of order.items) {
    lines.push(...itemLines(item, options));
  }

  lines.push(rule('-', width));
  lines.push(...columns('TOTAL', formatMoney(order.total, options.currencySymbol), width));

  if (order.note) {
    lines.push(rule('-', width));
    lines.push('NOTE CLIENT:');
    lines.push(...wrap(order.note, width));
  }

  lines.push(rule('=', width));

  return lines;
}

export function renderTicket(order: Order, overrides: Partial<TicketOptions> = {}): string {
  return buildTicket(order, overrides).join('\n');
}
