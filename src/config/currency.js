import { LOCALE } from "./locale.js";

export let CURRENCY = "USD";

const ZERO_DECIMAL_CURRENCIES = new Set(["JPY", "KRW", "IDR"]);

export function setCurrency(code) {
  CURRENCY = code;
}

export function formatCurrency(value) {
  if (!Number.isFinite(value)) return "—";
  const maximumFractionDigits = ZERO_DECIMAL_CURRENCIES.has(CURRENCY) ? 0 : 0;
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: maximumFractionDigits
  }).format(value);
}

export function shortCurrency(value) {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return `${Math.round(value)}`;
}
