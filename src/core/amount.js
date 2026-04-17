export function parseAmount(value) {
  if (value === null || value === undefined || value === "") return null;
  const normalized = String(value)
    .replace(/[$£€,]/g, "")
    .replace(/\(([^)]+)\)/, "-$1")
    .trim();
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

export function classifyFlow(typeValue, amountRaw, revenueTokens, outflowTokens) {
  if (typeValue) {
    if (revenueTokens.some((token) => typeValue.includes(token))) return "revenue";
    if (outflowTokens.some((token) => typeValue.includes(token))) return "outflow";
  }
  return amountRaw >= 0 ? "revenue" : "outflow";
}
