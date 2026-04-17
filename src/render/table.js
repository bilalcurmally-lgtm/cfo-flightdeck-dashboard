import { state } from "../store/state.js";
import { els } from "../store/elements.js";
import { render } from "../store/renderer.js";
import { escapeHtml } from "../core/escape.js";
import { capitalize } from "../core/format.js";
import { formatCurrency } from "../config/currency.js";
import { renderBreadcrumbs } from "../filter/drill.js";

export function renderDetailTable(filtered) {
  const sorted = filtered.slice().sort((a, b) => b.date - a.date);
  const capped = state.detailRowCap ? sorted.slice(0, state.detailRowCap) : sorted;
  els.detailBody.innerHTML = capped.map((record) => `
    <tr>
      <td>${escapeHtml(record.dateISO)}</td>
      <td>${escapeHtml(capitalize(record.flow))}</td>
      <td>${escapeHtml(record.head)}</td>
      <td>${escapeHtml(record.parent)}</td>
      <td>${escapeHtml(record.description)}</td>
      <td class="${record.flow === "revenue" ? "metric-positive" : "metric-negative"}">${formatCurrency(record.flow === "revenue" ? record.amount : -record.amount)}</td>
    </tr>
  `).join("") || `<tr><td colspan="6" class="table-empty">No visible transactions.</td></tr>`;

  if (sorted.length > capped.length) {
    els.detailFooter.innerHTML = `<span class="chip-note">Showing ${capped.length.toLocaleString()} of ${sorted.length.toLocaleString()} rows <button id="showAllRowsBtn" class="text-button" type="button">Show all</button></span>`;
    document.getElementById("showAllRowsBtn").addEventListener("click", () => {
      state.detailRowCap = 0;
      render();
    });
  } else if (sorted.length > 0) {
    els.detailFooter.innerHTML = `<span class="chip-note">${sorted.length.toLocaleString()} transactions</span>`;
  } else {
    els.detailFooter.innerHTML = "";
  }
}

let headChecklistHandler = null;

export function renderHeadChecklist() {
  const counts = new Map();
  state.records.forEach((record) => {
    counts.set(record.head, (counts.get(record.head) || 0) + 1);
  });

  const allHeads = Array.from(counts.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .filter(([head]) => !state.filters.headSearch || head.toLowerCase().includes(state.filters.headSearch));

  if (headChecklistHandler) {
    els.headChecklist.removeEventListener("change", headChecklistHandler);
  }

  els.headChecklist.innerHTML = allHeads.map(([head, count]) => {
    const checked = !state.filters.selectedHeads.size || state.filters.selectedHeads.has(head);
    return `
      <label class="head-option">
        <input data-head-option="${escapeHtml(head)}" type="checkbox" ${checked ? "checked" : ""}>
        <span>${escapeHtml(head)}</span>
        <small>${count.toLocaleString()}</small>
      </label>
    `;
  }).join("") || `<div class="chip-note">No heads match that search.</div>`;

  headChecklistHandler = (event) => {
    const checkbox = event.target;
    if (!checkbox.dataset.headOption) return;
    const head = checkbox.dataset.headOption;
    const allHeadValues = Array.from(els.headChecklist.querySelectorAll("[data-head-option]")).map((item) => item.dataset.headOption);
    if (state.filters.selectedHeads.size === 0) {
      allHeadValues.forEach((value) => state.filters.selectedHeads.add(value));
    }
    if (checkbox.checked) {
      state.filters.selectedHeads.add(head);
    } else {
      state.filters.selectedHeads.delete(head);
    }
    if (state.filters.selectedHeads.size === allHeadValues.length) {
      state.filters.selectedHeads.clear();
    }
    render();
  };

  els.headChecklist.addEventListener("change", headChecklistHandler);
}

export function renderEmptyState(message) {
  const text = message || "Load a CSV to populate the dashboard.";
  els.totalRevenue.textContent = "-";
  els.totalOutflow.textContent = "-";
  els.netCash.textContent = "-";
  els.efficiencyRatio.textContent = "-";
  els.revenueDelta.textContent = text;
  els.outflowDelta.textContent = text;
  els.netDelta.textContent = text;
  els.efficiencyNote.textContent = text;
  els.insightList.innerHTML = `<div class="chart-empty">${escapeHtml(text)}</div>`;
  els.focusStats.innerHTML = `<div class="chart-empty">${escapeHtml(text)}</div>`;
  els.trendChart.innerHTML = `<div class="chart-empty">${escapeHtml(text)}</div>`;
  els.headChart.innerHTML = `<div class="chart-empty">${escapeHtml(text)}</div>`;
  els.periodMatrix.innerHTML = `<div class="chart-empty">${escapeHtml(text)}</div>`;
  els.pressureList.innerHTML = `<div class="chart-empty">${escapeHtml(text)}</div>`;
  els.detailBody.innerHTML = `<tr><td colspan="6" class="table-empty">${escapeHtml(text)}</td></tr>`;
  renderBreadcrumbs();
}
