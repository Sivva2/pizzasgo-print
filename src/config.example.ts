export const CONFIG = {
  baseUrl: 'https://pizzasgo91.fr/wp-json/pizzasgo/v1',
  token: 'REMPLACER_PAR_LE_JETON',
  pollIntervalMs: 10000,
  requestTimeoutMs: 15000,
  maxPrintAttempts: 3,
  shopName: "PIZZA'S GO",
  shopPhone: '',
  ticketWidth: 32,
  currencySymbol: 'EUR',
  useUtf8Command: true,
};

export type AppConfig = typeof CONFIG;
