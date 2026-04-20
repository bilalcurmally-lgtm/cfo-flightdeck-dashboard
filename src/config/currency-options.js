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
  const codes = typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("currency")
    : FALLBACK_CODES;
  const names = typeof Intl.DisplayNames === "function"
    ? new Intl.DisplayNames([locale], { type: "currency" })
    : null;

  return [...new Set([...codes, ...FALLBACK_CODES])]
    .sort((a, b) => a.localeCompare(b))
    .map((code) => {
      const name = names?.of(code) || code;
      return {
        code,
        label: `${code} - ${name}`,
        search: `${code} ${name} ${COMMON_ALIASES[code] || ""}`.toLowerCase()
      };
    });
}
