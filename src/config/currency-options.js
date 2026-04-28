import { isSupportedCurrency } from "./currency.js";

const FALLBACK_CODES = [
  "AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN",
  "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BRL",
  "BSD", "BTN", "BWP", "BYN", "BZD", "CAD", "CDF", "CHF", "CLP", "CNY",
  "COP", "CRC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP",
  "ERN", "ETB", "EUR", "FJD", "FKP", "GBP", "GEL", "GHS", "GIP", "GMD",
  "GNF", "GTQ", "GYD", "HKD", "HNL", "HTG", "HUF", "IDR", "ILS", "INR",
  "IQD", "IRR", "ISK", "JMD", "JOD", "JPY", "KES", "KGS", "KHR", "KMF",
  "KPW", "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", "LKR", "LRD", "LSL",
  "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRU", "MUR",
  "MVR", "MWK", "MXN", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR",
  "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG", "QAR",
  "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG", "SEK", "SGD",
  "SHP", "SLE", "SOS", "SRD", "SSP", "STN", "SYP", "SZL", "THB", "TJS",
  "TMT", "TND", "TOP", "TRY", "TTD", "TWD", "TZS", "UAH", "UGX", "USD",
  "UYU", "UZS", "VES", "VND", "VUV", "WST", "XAF", "XCD", "XOF", "XPF",
  "YER", "ZAR", "ZMW", "ZWG"
];

const COMMON_ALIASES = {
  AED: "dirham uae united arab emirates dubai",
  GBP: "pound sterling united kingdom britain",
  INR: "rupee india",
  PKR: "rupee pakistan",
  SAR: "riyal saudi arabia",
  USD: "dollar united states america",
  XOF: "west african cfa franc benin burkina faso cote d ivoire guinea bissau mali niger senegal togo",
  XAF: "central african cfa franc cameroon central african republic chad congo equatorial guinea gabon"
};

export function getCurrencyOptions(locale = "en") {
  const codes = getSupportedCurrencyCodes();
  const names = getDisplayNames(locale);

  return [...new Set([...codes, ...FALLBACK_CODES])]
    .filter(isSupportedCurrency)
    .sort((a, b) => a.localeCompare(b))
    .map((code) => {
      const name = safeCurrencyName(names, code);
      return {
        code,
        label: `${code} - ${name}`,
        search: `${code} ${name} ${COMMON_ALIASES[code] || ""}`.toLowerCase()
      };
    });
}

function getSupportedCurrencyCodes() {
  try {
    return typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("currency")
      : FALLBACK_CODES;
  } catch {
    return FALLBACK_CODES;
  }
}

function getDisplayNames(locale) {
  try {
    return typeof Intl.DisplayNames === "function"
      ? new Intl.DisplayNames([locale], { type: "currency" })
      : null;
  } catch {
    return null;
  }
}

function safeCurrencyName(names, code) {
  try {
    return names?.of(code) || code;
  } catch {
    return code;
  }
}
