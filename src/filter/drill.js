import { state } from "../store/state.js";
import { els } from "../store/elements.js";
import { render } from "../store/renderer.js";
import { escapeHtml } from "../core/escape.js";
import { capitalize } from "../core/format.js";
import { humanPeriodLabel } from "../core/date.js";

function renderCrumb(label, value, key) {
  return `
    <span class="crumb">
      <span class="crumb-label">${escapeHtml(label)}</span>
      <span class="crumb-value">${escapeHtml(value)}</span>
      <button class="crumb-clear" data-clear-crumb="${escapeHtml(key)}" type="button" title="Remove this filter">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          <line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </button>
    </span>`;
}

export function renderBreadcrumbs() {
  const hasDrill = state.filters.focusedPeriod || state.filters.focusedHead;
  const hasFilter = state.filters.selectedHeads.size || state.filters.search;

  // Build crumb list
  const crumbs = [
    `<span class="crumb crumb-static">
       <span class="crumb-dot"></span>
       ${escapeHtml(capitalize(state.grain))}
     </span>`
  ];

  if (state.filters.startDate || state.filters.endDate) {
    const range = `${state.filters.startDate || "start"} → ${state.filters.endDate || "end"}`;
    crumbs.push(`<span class="crumb crumb-static">${escapeHtml(range)}</span>`);
  }
  if (state.filters.search) crumbs.push(renderCrumb("Search", state.filters.search, "search"));
  if (state.filters.selectedHeads.size) crumbs.push(renderCrumb(`${state.filters.selectedHeads.size} head${state.filters.selectedHeads.size > 1 ? "s" : ""}`, "selected", "selectedHeads"));
  if (state.filters.focusedPeriod) crumbs.push(renderCrumb("Period", humanPeriodLabel(state.filters.focusedPeriod, state.grain), "period"));
  if (state.filters.focusedHead) crumbs.push(renderCrumb("Head", state.filters.focusedHead, "head"));

  // Drill hint banner — shown whenever user is drilled into a period or head
  const drillBanner = hasDrill ? `
    <div class="drill-banner" role="status">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.4"/>
        <path d="M7 4v4M7 9.5v.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
      </svg>
      <span>You're viewing a drilled-in slice. Click the <strong>× button</strong> on a filter tag above to go back, or</span>
      <button class="drill-banner-btn" id="clearDrillBtn" type="button">← Clear drill</button>
    </div>` : "";

  els.breadcrumbs.innerHTML = `
    <div class="crumb-row">${crumbs.join("")}</div>
    ${drillBanner}
  `;

  // Wire crumb clear buttons
  Array.from(els.breadcrumbs.querySelectorAll("[data-clear-crumb]")).forEach((button) => {
    button.addEventListener("click", () => clearCrumb(button.dataset.clearCrumb), { once: true });
  });

  // Wire clear drill button
  const clearDrillBtn = document.getElementById("clearDrillBtn");
  if (clearDrillBtn) {
    clearDrillBtn.addEventListener("click", () => {
      state.filters.focusedPeriod = "";
      state.filters.focusedHead = "";
      render();
    }, { once: true });
  }
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
