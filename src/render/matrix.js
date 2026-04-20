import { state } from "../store/state.js";
import { els } from "../store/elements.js";
import { render } from "../store/renderer.js";
import { escapeHtml } from "../core/escape.js";
import { humanPeriodLabel } from "../core/date.js";
import { formatCurrency } from "../config/currency.js";
import { buildPeriodContext } from "../finance/period-context.js";

export function renderPeriodMatrix(periodSummary) {
  if (!periodSummary.length) {
    els.periodMatrix.innerHTML = `<div class="chart-empty">No periods match the current filters.</div>`;
    return;
  }

  const rows = buildPeriodContext(periodSummary);
  const maxRevenue = Math.max(...rows.map((item) => item.revenue), 1);
  const maxOutflow = Math.max(...rows.map((item) => item.outflow), 1);
  const maxNet = Math.max(...rows.map((item) => Math.abs(item.net)), 1);
  const selected = rows.find((item) => state.filters.focusedPeriod === item.period) || rows[rows.length - 1];

  els.periodMatrix.innerHTML = `
    <div class="matrix-board">
      <aside class="matrix-inspector">
        <span class="lbl">Selected period</span>
        <strong>${escapeHtml(humanPeriodLabel(selected.period, state.grain))}</strong>
        <div class="matrix-inspector-grid">
          <span>Revenue <b>${formatCurrency(selected.revenue)}</b></span>
          <span>Outflow <b>${formatCurrency(selected.outflow)}</b></span>
          <span>Net <b class="${selected.net >= 0 ? "metric-positive" : "metric-negative"}">${formatCurrency(selected.net)}</b></span>
          <span>Efficiency <b>${formatEfficiency(selected)}</b></span>
        </div>
      </aside>
      <div class="matrix-rows" role="table" aria-label="Period matrix">
        <div class="matrix-row matrix-row-head" role="row">
          <span>Period</span>
          <span>Revenue</span>
          <span>Outflow</span>
          <span>Net cash</span>
          <span>Efficiency</span>
        </div>
        ${rows.map((item) => renderMatrixRow(item, { maxRevenue, maxOutflow, maxNet })).join("")}
      </div>
    </div>
  `;

  Array.from(els.periodMatrix.querySelectorAll("[data-period-row]")).forEach((row) => {
    row.addEventListener("click", () => {
      state.filters.focusedPeriod = state.filters.focusedPeriod === row.dataset.periodRow ? "" : row.dataset.periodRow;
      render();
    });
  });
}

function renderMatrixRow(item, maxes) {
  const active = state.filters.focusedPeriod === item.period;
  const netClass = item.net >= 0 ? "metric-positive" : "metric-negative";
  return `
    <button class="matrix-row period-row ${active ? "table-row-highlight" : ""}" data-period-row="${escapeHtml(item.period)}" role="row" type="button">
      <span class="matrix-period">${escapeHtml(humanPeriodLabel(item.period, state.grain))}</span>
      ${renderMetricCell(item.revenue, maxes.maxRevenue, "revenue", item.variance?.revenueChange)}
      ${renderMetricCell(item.outflow, maxes.maxOutflow, "outflow", item.variance?.outflowChange, true)}
      ${renderMetricCell(item.net, maxes.maxNet, "net", item.variance?.netChange, false, netClass)}
      <span class="matrix-eff">
        <strong>${formatEfficiency(item)}</strong>
        ${formatVariance(item.variance?.efficiencyChange)}
      </span>
    </button>
  `;
}

function renderMetricCell(value, max, type, variance, inverseColors = false, extraClass = "") {
  const size = Math.max(0.04, Math.min(1, Math.abs(value) / Math.max(max, 1))).toFixed(3);
  return `
    <span class="matrix-metric ${type} ${extraClass}">
      <strong>${formatCurrency(value)}</strong>
      ${formatVariance(variance, inverseColors)}
      <i aria-hidden="true" style="--bar-size:${size}"></i>
    </span>
  `;
}

function formatEfficiency(item) {
  return item.outflow ? `${(item.revenue / item.outflow).toFixed(2)}x` : "∞";
}

function formatVariance(value, inverseColors = false) {
  if (!Number.isFinite(value)) return `<span class="matrix-delta muted">—</span>`;
  const positive = value > 0;
  const colorClass = (positive === inverseColors) ? "metric-negative" : "metric-positive";
  const arrow = positive ? "↑" : value < 0 ? "↓" : "→";
  return `<span class="matrix-delta ${colorClass}">${arrow} ${Math.abs(value).toFixed(1)}%</span>`;
}
