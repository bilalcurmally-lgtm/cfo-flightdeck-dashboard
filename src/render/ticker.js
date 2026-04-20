import { formatCurrency } from "../config/currency.js";

export function buildTickerItems({ periodSummary = [], cashHealth, currency }) {
  const latest = periodSummary[periodSummary.length - 1];
  const prev = periodSummary.length >= 2 ? periodSummary[periodSummary.length - 2] : null;
  const revenue = latest?.revenue || 0;
  const outflow = latest?.outflow || 0;
  const net = revenue - outflow;
  const runway = cashHealth?.runwayMonths;

  const revDelta = prev && prev.revenue ? ((revenue - prev.revenue) / prev.revenue * 100) : 0;
  const outDelta = prev && prev.outflow ? ((outflow - prev.outflow) / prev.outflow * 100) : 0;
  const netDelta = prev && prev.net != null ? ((net - prev.net) / Math.abs(prev.net || 1) * 100) : 0;

  return [
    { label: "Revenue", value: formatCurrency(revenue, currency), delta: revDelta, kind: revDelta >= 0 ? "up" : "dn" },
    { label: "Outflow", value: formatCurrency(outflow, currency), delta: outDelta, kind: outDelta >= 0 ? "dn" : "up" },
    { label: "Net Cash", value: formatCurrency(net, currency), delta: netDelta, kind: netDelta >= 0 ? "up" : "dn" },
    { label: "Runway", value: Number.isFinite(runway) ? `${runway.toFixed(1)} mo` : "n/a", delta: 0, kind: "up" }
  ];
}

export function mountTicker(target, items) {
  if (!target) return;
  const doubled = [...items, ...items];
  target.innerHTML = doubled.map((item, i) => `
    <span class="tk-item">
      <span>${item.label}</span>
      <b>${item.value}</b>
      <span class="${item.kind}">${item.delta >= 0 ? "▲" : "▼"} ${Math.abs(item.delta).toFixed(1)}%</span>
    </span>
  `).join("");
}