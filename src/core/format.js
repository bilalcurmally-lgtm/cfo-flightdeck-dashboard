export function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function truncate(text, length) {
  return text.length > length ? `${text.slice(0, length - 1)}...` : text;
}

export function tidyValue(value, fallback) {
  const text = String(value || "").trim();
  return text || fallback;
}

export function signedPercent(value) {
  if (!Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function percentChange(current, previous) {
  if (!previous) return current ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function shareOf(value, total) {
  if (!total) return "0.0%";
  return `${((value / total) * 100).toFixed(1)}%`;
}

export function groupBy(items, keyFn) {
  return items.reduce((map, item) => {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
    return map;
  }, new Map());
}
