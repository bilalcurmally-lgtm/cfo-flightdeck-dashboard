import { state } from "../store/state.js";
import { els } from "../store/elements.js";
import { render } from "../store/renderer.js";
import { escapeHtml } from "../core/escape.js";
import { humanPeriodLabel } from "../core/date.js";
import { formatCurrency } from "../config/currency.js";

export function renderPeriodMatrix(periodSummary) {
  if (!periodSummary.length) {
    els.periodMatrix.innerHTML = `<div class="chart-empty">No periods match the current filters.</div>`;
    return;
  }

  els.periodMatrix.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Period</th>
          <th>Revenue</th>
          <th>Outflow</th>
          <th>Net Cash</th>
          <th>Efficiency</th>
        </tr>
      </thead>
      <tbody>
        ${periodSummary.map((item) => `
          <tr class="period-row ${state.filters.focusedPeriod === item.period ? "table-row-highlight" : ""}" data-period-row="${escapeHtml(item.period)}">
            <td>${escapeHtml(humanPeriodLabel(item.period, state.grain))}</td>
            <td>${formatCurrency(item.revenue)}</td>
            <td>${formatCurrency(item.outflow)}</td>
            <td class="${item.net >= 0 ? "metric-positive" : "metric-negative"}">${formatCurrency(item.net)}</td>
            <td>${item.outflow ? `${(item.revenue / item.outflow).toFixed(2)}x` : "∞"}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  Array.from(els.periodMatrix.querySelectorAll("[data-period-row]")).forEach((row) => {
    row.addEventListener("click", () => {
      state.filters.focusedPeriod = state.filters.focusedPeriod === row.dataset.periodRow ? "" : row.dataset.periodRow;
      render();
    });
  });
}
