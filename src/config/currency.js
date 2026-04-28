import { LOCALE } from "./locale.js";

export let CURRENCY = "USD";

const ZERO_DECIMAL_CURRENCIES = new Set(["JPY", "KRW", "IDR"]);
const DEFAULT_CURRENCY = "USD";

export function setCurrency(code) {
  CURRENCY = normalizeCurrencyCode(code);
}

export function formatCurrency(value) {
  if (!Number.isFinite(value)) return "—";
  const maximumFractionDigits = ZERO_DECIMAL_CURRENCIES.has(CURRENCY) ? 0 : 2;
  try {
    return new Intl.NumberFormat(LOCALE, {
      style: "currency",
      currency: CURRENCY,
      maximumFractionDigits: maximumFractionDigits
    }).format(value);
  } catch {
    CURRENCY = DEFAULT_CURRENCY;
    return new Intl.NumberFormat(LOCALE, {
      style: "currency",
      currency: CURRENCY,
      maximumFractionDigits: 2
    }).format(value);
  }
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

export function normalizeCurrencyCode(code) {
  const normalized = String(code || "").trim().toUpperCase();
  if (!isSupportedCurrency(normalized)) return DEFAULT_CURRENCY;
  return normalized;
}

export function isSupportedCurrency(code) {
  if (!/^[A-Z]{3}$/.test(code)) return false;
  try {
    new Intl.NumberFormat(LOCALE, { style: "currency", currency: code }).format(0);
    return true;
  } catch {
    return false;
  }
}
