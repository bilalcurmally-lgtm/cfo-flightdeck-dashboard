import { LOCALE } from "./locale.js";

export let CURRENCY = "USD";

const ZERO_DECIMAL_CURRENCIES = new Set(["JPY", "KRW", "IDR"]);

export function setCurrency(code) {
  CURRENCY = code;
}

export function formatCurrency(value) {
  if (!Number.isFinite(value)) return "—";
  const maximumFractionDigits = ZERO_DECIMAL_CURRENCIES.has(CURRENCY) ? 0 : 2;
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: maximumFractionDigits
  }).format(value);
}

let _symCache = null;
let _symCurrency = null;

function currencySymbol() {
  if (_symCurrency === CURRENCY && _symCache !== null) return _symCache;
  try {
    const parts = new Intl.NumberFormat(LOCALE, { style: "currency", currency: CURRENCY, maximumFractionDigits: 0 }).formatToParts(0);
    _symCache = parts.find((p) => p.type === "currency")?.value ?? "";
  } catch {
    _symCache = "";
  }
  _symCurrency = CURRENCY;
  return _symCache;
}

export function shortCurrency(value) {
  if (!Number.isFinite(value)) return "—";
  const sym = currencySymbol();
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1000000) return `${sign}${sym}${(abs / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `${sign}${sym}${(abs / 1000).toFixed(1)}K`;
  return `${sign}${sym}${Math.round(abs)}`;
}
