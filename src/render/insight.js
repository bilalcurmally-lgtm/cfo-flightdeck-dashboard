import { state } from "../store/state.js";
import { els } from "../store/elements.js";
import { escapeHtml } from "../core/escape.js";
import { humanPeriodLabel } from "../core/date.js";
import { groupBy, shareOf } from "../core/format.js";
import { detectOutflowAnomaly } from "../filter/filter.js";
import { formatCurrency } from "../config/currency.js";

export function renderInsights(periodSummary, headSummary, filtered) {
  const items = [];
  const topRevenueHead = [...headSummary].sort((a, b) => b.revenue - a.revenue)[0];
  const topOutflowHead = [...headSummary].sort((a, b) => b.outflow - a.outflow)[0];
  const worstPeriod = [...periodSummary].sort((a, b) => a.net - b.net)[0];
  const bestPeriod = [...periodSummary].sort((a, b) => b.net - a.net)[0];
  const outflowTotal = headSummary.reduce((sum, item) => sum + item.outflow, 0);
  const topThreeOutflows = [...headSummary].sort((a, b) => b.outflow - a.outflow).slice(0, 3).reduce((sum, item) => sum + item.outflow, 0);
  const concentration = outflowTotal ? (topThreeOutflows / outflowTotal) * 100 : 0;
  const anomaly = detectOutflowAnomaly(periodSummary);

  if (topRevenueHead && topRevenueHead.revenue > 0) {
    items.push({
      level: "normal",
      title: `Revenue is led by ${topRevenueHead.head}`,
      body: `${formatCurrency(topRevenueHead.revenue)} contributed from this head, ${shareOf(topRevenueHead.revenue, headSummary.reduce((sum, item) => sum + item.revenue, 0))} of selected revenue.`
    });
  }
  if (topOutflowHead && topOutflowHead.outflow > 0) {
    items.push({
      level: topOutflowHead.outflow > outflowTotal * 0.35 ? "warning" : "normal",
      title: `${topOutflowHead.head} is your biggest cash pull`,
      body: `${formatCurrency(topOutflowHead.outflow)} left through this head, ${shareOf(topOutflowHead.outflow, outflowTotal)} of total outflows.`
    });
  }
  if (bestPeriod) {
    items.push({
      level: bestPeriod.net >= 0 ? "normal" : "warning",
      title: `Best ${state.grain} period: ${humanPeriodLabel(bestPeriod.period, state.grain)}`,
      body: `Net cash reached ${formatCurrency(bestPeriod.net)} on revenue of ${formatCurrency(bestPeriod.revenue)}.`
    });
  }
  if (worstPeriod) {
    items.push({
      level: worstPeriod.net < 0 ? "critical" : "normal",
      title: `Weakest ${state.grain} period: ${humanPeriodLabel(worstPeriod.period, state.grain)}`,
      body: `Net cash landed at ${formatCurrency(worstPeriod.net)} with outflows of ${formatCurrency(worstPeriod.outflow)}.`
    });
  }
  if (anomaly) {
    items.push({
      level: anomaly.severity,
      title: `Outflow spike detected in ${humanPeriodLabel(anomaly.period, state.grain)}`,
      body: `${formatCurrency(anomaly.outflow)} of outflows, ${anomaly.multiple.toFixed(1)}x the average selected period. Click the trend chart to inspect it.`
    });
  }
  if (outflowTotal > 0) {
    items.push({
      level: concentration > 65 ? "warning" : "normal",
      title: "Outflows are concentrated",
      body: `Top three heads account for ${concentration.toFixed(1)}% of cash outflows in the current slice.`
    });
  }
  if (!items.length && filtered.length) {
    items.push({
      level: "normal",
      title: "Slice is loaded",
      body: `${filtered.length.toLocaleString()} rows are visible. Start drilling into a period or head for deeper insight.`
    });
  }

  els.insightList.innerHTML = items.map((item) => `
    <article class="insight-item ${item.level}">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.body)}</span>
    </article>
  `).join("");
}

export function renderFocus(filtered, headSummary) {
  const parentSummary = Array.from(groupBy(filtered, (record) => record.parent), ([parent, rows]) => ({
    parent,
    revenue: rows.filter((row) => row.flow === "revenue").reduce((sum, row) => sum + row.amount, 0),
    outflow: rows.filter((row) => row.flow === "outflow").reduce((sum, row) => sum + row.amount, 0)
  })).sort((a, b) => (b.revenue + b.outflow) - (a.revenue + a.outflow)).slice(0, 4);

  const headCount = new Set(filtered.map((row) => row.head)).size;
  const parentCount = new Set(filtered.map((row) => row.parent)).size;
  const largestParent = parentSummary[0];
  const largestHead = headSummary[0];
  const items = [
    { title: "Visible rows", body: `${filtered.length.toLocaleString()} transactions in play.` },
    { title: "Heads in slice", body: `${headCount.toLocaleString()} account heads across ${parentCount.toLocaleString()} parent groups.` }
  ];
  if (largestParent) items.push({ title: `Largest parent group: ${largestParent.parent}`, body: `Revenue ${formatCurrency(largestParent.revenue)}, outflow ${formatCurrency(largestParent.outflow)}.` });
  if (largestHead) items.push({ title: `Most active head: ${largestHead.head}`, body: `Revenue ${formatCurrency(largestHead.revenue)}, outflow ${formatCurrency(largestHead.outflow)}.` });

  els.focusStats.innerHTML = items.map((item) => `
    <article class="focus-item">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.body)}</span>
    </article>
  `).join("");
}

export function renderPressureList(headSummary) {
  const topPressure = [...headSummary].filter((item) => item.outflow > 0).sort((a, b) => b.outflow - a.outflow).slice(0, 6);
  if (!topPressure.length) {
    els.pressureList.innerHTML = `<div class="chart-empty">No outflows in this slice.</div>`;
    return;
  }

  const totalOutflow = topPressure.reduce((sum, item) => sum + item.outflow, 0);
  els.pressureList.innerHTML = topPressure.map((item) => `
    <article class="pressure-item ${item.outflow > totalOutflow * 0.3 ? "warning" : ""}">
      <strong>${escapeHtml(item.head)}</strong>
      <div>${formatCurrency(item.outflow)} outflow, ${shareOf(item.outflow, totalOutflow)} of the top pressure stack.</div>
    </article>
  `).join("");
}
