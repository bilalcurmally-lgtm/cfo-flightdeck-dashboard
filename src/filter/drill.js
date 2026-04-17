import { state } from "../store/state.js";
import { els } from "../store/elements.js";
import { render } from "../store/renderer.js";
import { escapeHtml } from "../core/escape.js";
import { capitalize } from "../core/format.js";
import { humanPeriodLabel } from "../core/date.js";

function renderCrumb(label, value, key) {
  return `<span class="crumb">${escapeHtml(label)}: ${escapeHtml(value)} <button data-clear-crumb="${escapeHtml(key)}" type="button">x</button></span>`;
}

export function renderBreadcrumbs() {
  const crumbs = [`<span class="crumb">Grain: ${escapeHtml(capitalize(state.grain))}</span>`];
  if (state.filters.focusedPeriod) crumbs.push(renderCrumb("Period", humanPeriodLabel(state.filters.focusedPeriod, state.grain), "period"));
  if (state.filters.focusedHead) crumbs.push(renderCrumb("Head", state.filters.focusedHead, "head"));
  if (state.filters.selectedHeads.size) crumbs.push(renderCrumb("Selected heads", `${state.filters.selectedHeads.size} heads`, "selectedHeads"));
  if (state.filters.search) crumbs.push(renderCrumb("Search", state.filters.search, "search"));
  if (state.filters.startDate || state.filters.endDate) {
    const range = `${state.filters.startDate || "start"} to ${state.filters.endDate || "end"}`;
    crumbs.push(`<span class="crumb">Range: ${escapeHtml(range)}</span>`);
  }

  els.breadcrumbs.innerHTML = crumbs.join("");
  Array.from(els.breadcrumbs.querySelectorAll("[data-clear-crumb]")).forEach((button) => {
    button.addEventListener("click", () => clearCrumb(button.dataset.clearCrumb));
  });
}

export function clearCrumb(key) {
  if (key === "period") state.filters.focusedPeriod = "";
  if (key === "head") state.filters.focusedHead = "";
  if (key === "selectedHeads") state.filters.selectedHeads.clear();
  if (key === "search") {
    state.filters.search = "";
    els.searchInput.value = "";
  }
  render();
}
