import { state } from "../store/state.js";
import { els } from "../store/elements.js";
import { render } from "../store/renderer.js";
import { escapeHtml } from "../core/escape.js";
import { truncate } from "../core/format.js";
import { humanPeriodLabel } from "../core/date.js";
import { shortCurrency } from "../config/currency.js";

export function renderTrendChart(periodSummary) {
  if (!periodSummary.length) {
    els.trendChart.innerHTML = `<div class="chart-empty">No period data to plot.</div>`;
    return;
  }

  const width = 920;
  const height = 320;
  const margin = { top: 16, right: 16, bottom: 70, left: 70 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const barSlot = innerWidth / periodSummary.length;
  const barWidth = Math.max(12, Math.min(34, barSlot * 0.32));
  const maxValue = Math.max(...periodSummary.flatMap((item) => [item.revenue, item.outflow, Math.abs(item.net)]), 1);

  const bars = periodSummary.map((item, index) => {
    const xCenter = margin.left + index * barSlot + barSlot / 2;
    const revenueHeight = (item.revenue / maxValue) * innerHeight;
    const outflowHeight = (item.outflow / maxValue) * innerHeight;
    const revenueY = margin.top + innerHeight - revenueHeight;
    const outflowY = margin.top + innerHeight - outflowHeight;
    const label = truncate(humanPeriodLabel(item.period, state.grain), 12);
    return `
      <g class="period-group" data-period-drill="${escapeHtml(item.period)}">
        <rect x="${xCenter - barWidth - 3}" y="${revenueY}" width="${barWidth}" height="${Math.max(revenueHeight, 2)}" rx="8" fill="rgba(93, 221, 161, 0.82)"></rect>
        <rect x="${xCenter + 3}" y="${outflowY}" width="${barWidth}" height="${Math.max(outflowHeight, 2)}" rx="8" fill="rgba(255, 185, 80, 0.78)"></rect>
        <text x="${xCenter}" y="${height - 28}" text-anchor="middle" font-size="11" fill="#86948a">${escapeHtml(label)}</text>
        <text x="${xCenter - barWidth - 3 + barWidth / 2}" y="${revenueY - 6}" text-anchor="middle" font-size="10" fill="#5ddda1">${shortCurrency(item.revenue)}</text>
        <text x="${xCenter + 3 + barWidth / 2}" y="${outflowY - 6}" text-anchor="middle" font-size="10" fill="#ffb950">${shortCurrency(item.outflow)}</text>
      </g>
    `;
  }).join("");

  const netPoints = periodSummary.map((item, index) => {
    const xCenter = margin.left + index * barSlot + barSlot / 2;
    const y = margin.top + innerHeight - ((item.net + maxValue) / (maxValue * 2)) * innerHeight;
    return `${xCenter},${y}`;
  }).join(" ");

  els.trendChart.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Revenue and outflow trend chart">
      <line x1="${margin.left}" y1="${margin.top + innerHeight}" x2="${width - margin.right}" y2="${margin.top + innerHeight}" stroke="rgba(225, 226, 231, 0.12)"></line>
      <line x1="${margin.left}" y1="${margin.top + innerHeight / 2}" x2="${width - margin.right}" y2="${margin.top + innerHeight / 2}" stroke="rgba(225, 226, 231, 0.06)" stroke-dasharray="6 6"></line>
      <polyline fill="none" stroke="#e1e2e7" stroke-width="3" points="${netPoints}"></polyline>
      ${bars}
    </svg>
  `;

  Array.from(els.trendChart.querySelectorAll("[data-period-drill]")).forEach((node) => {
    node.style.cursor = "pointer";
    node.addEventListener("click", () => {
      state.filters.focusedPeriod = state.filters.focusedPeriod === node.dataset.periodDrill ? "" : node.dataset.periodDrill;
      render();
    });
  });
}

export function renderHeadChart(headSummary) {
  if (!headSummary.length) {
    els.headChart.innerHTML = `<div class="chart-empty">No head data to plot.</div>`;
    return;
  }

  const topHeads = [...headSummary].sort((a, b) => (b.revenue + b.outflow) - (a.revenue + a.outflow)).slice(0, 10);
  const width = 920;
  const rowHeight = 28;
  const height = topHeads.length * rowHeight + 56;
  const middle = width / 2;
  const maxValue = Math.max(...topHeads.flatMap((item) => [item.revenue, item.outflow]), 1);

  const rows = topHeads.map((item, index) => {
    const y = 24 + index * rowHeight;
    const revenueWidth = (item.revenue / maxValue) * (middle - 180);
    const outflowWidth = (item.outflow / maxValue) * (middle - 180);
    return `
      <g data-head-drill="${escapeHtml(item.head)}">
        <text x="${middle}" y="${y + 14}" text-anchor="middle" font-size="12" fill="#e1e2e7">${escapeHtml(truncate(item.head, 28))}</text>
        <rect x="${middle - outflowWidth}" y="${y + 18}" width="${Math.max(outflowWidth, 2)}" height="12" rx="6" fill="rgba(255,185,80,0.78)"></rect>
        <rect x="${middle}" y="${y + 18}" width="${Math.max(revenueWidth, 2)}" height="12" rx="6" fill="rgba(93,221,161,0.82)"></rect>
        <text x="${middle - outflowWidth - 8}" y="${y + 28}" text-anchor="end" font-size="11" fill="#ffb950">${shortCurrency(item.outflow)}</text>
        <text x="${middle + revenueWidth + 8}" y="${y + 28}" text-anchor="start" font-size="11" fill="#5ddda1">${shortCurrency(item.revenue)}</text>
      </g>
    `;
  }).join("");

  els.headChart.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Top account heads chart">
      <line x1="${middle}" y1="18" x2="${middle}" y2="${height - 16}" stroke="rgba(225, 226, 231, 0.15)"></line>
      ${rows}
    </svg>
  `;

  Array.from(els.headChart.querySelectorAll("[data-head-drill]")).forEach((node) => {
    node.style.cursor = "pointer";
    node.addEventListener("click", () => {
      state.filters.focusedHead = state.filters.focusedHead === node.dataset.headDrill ? "" : node.dataset.headDrill;
      render();
    });
  });
}
