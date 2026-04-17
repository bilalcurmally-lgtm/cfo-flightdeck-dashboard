import { state } from "./store/state.js";
import { els, dateFormatSelect, grainButtons, flowButtons, currencySelect } from "./store/elements.js";
import { registerRender } from "./store/renderer.js";
import { onFileSelected, ingestCsvText, applyCurrentMapping } from "./io/file.js";
import { loadSampleData } from "./io/fetch.js";
import { filterRecords, buildPeriodSummary, buildHeadSummary } from "./filter/filter.js";
import { renderBreadcrumbs } from "./filter/drill.js";
import { renderKpis } from "./render/kpi.js";
import { renderTrendChart, renderHeadChart } from "./render/chart.js";
import { renderPeriodMatrix } from "./render/matrix.js";
import { renderInsights, renderFocus, renderPressureList } from "./render/insight.js";
import { renderDetailTable, renderHeadChecklist, renderEmptyState } from "./render/table.js";
import { exportVisibleRows } from "./render/export.js";
import { saveState, loadState } from "./store/local-storage.js";
import { setCurrency } from "./config/currency.js";
import { debounce } from "./core/debounce.js";
import { readUrlState, writeUrlState } from "./store/url-state.js";
import { MAX_FILE_SIZE, VALID_EXTENSIONS, VALID_TYPES } from "./io/constants.js";

state.detailRowCap = 250;

let lastFilterKey = "";
let cachedPeriodSummary = null;
let cachedHeadSummary = null;

function getFilterKey(filtered) {
  return `${filtered.length}:${state.grain}:${state.filters.focusedPeriod}:${state.filters.focusedHead}`;
}

function render() {
  state.detailRowCap = 250;
  if (!state.records.length) {
    renderEmptyState();
    saveState(state);
    return;
  }

  syncFlowButtons();
  renderHeadChecklist();

  const filtered = filterRecords(state.records, state.filters, state.grain);
  state.visibleRows = filtered;
  renderBreadcrumbs();

  if (!filtered.length) {
    renderEmptyState("No rows match the current filters.");
    saveState(state);
    return;
  }

  const key = getFilterKey(filtered);
  if (key !== lastFilterKey) {
    cachedPeriodSummary = buildPeriodSummary(filtered, state.grain);
    cachedHeadSummary = buildHeadSummary(filtered);
    lastFilterKey = key;
  }
  const periodSummary = cachedPeriodSummary;
  const headSummary = cachedHeadSummary;

  const safeRender = (name, fn, target) => {
    try { fn(); } catch (error) {
      console.error(`[CFO Flight Deck] ${name} failed:`, error);
      if (target) target.innerHTML = `<div class="chart-empty">This section could not be rendered.</div>`;
    }
  };

  safeRender("kpis", () => renderKpis(periodSummary));
  safeRender("insights", () => renderInsights(periodSummary, headSummary, filtered), els.insightList);
  safeRender("focus", () => renderFocus(filtered, headSummary), els.focusStats);
  safeRender("trendChart", () => renderTrendChart(periodSummary), els.trendChart);
  safeRender("headChart", () => renderHeadChart(headSummary), els.headChart);
  safeRender("periodMatrix", () => renderPeriodMatrix(periodSummary), els.periodMatrix);
  safeRender("pressureList", () => renderPressureList(headSummary), els.pressureList);
  safeRender("detailTable", () => renderDetailTable(filtered));
  saveState(state);
  writeUrlState(state);
}

function syncFlowButtons() {
  flowButtons.forEach((button) => {
    button.classList.toggle("is-active", state.filters.flows.has(button.dataset.flowFilter));
  });
}

function resetAllFilters() {
  state.filters = {
    startDate: state.records[0] ? state.records[0].dateISO : "",
    endDate: state.records[state.records.length - 1] ? state.records[state.records.length - 1].dateISO : "",
    search: "",
    flows: new Set(["revenue", "outflow"]),
    selectedHeads: new Set(),
    headSearch: "",
    focusedPeriod: "",
    focusedHead: ""
  };
  els.startDate.value = state.filters.startDate;
  els.endDate.value = state.filters.endDate;
  els.searchInput.value = "";
  els.headSearch.value = "";
  render();
}

function wireEvents() {
  els.csvFile.addEventListener("change", onFileSelected);
  els.loadSampleBtn.addEventListener("click", loadSampleData);
  els.applyMappingBtn.addEventListener("click", applyCurrentMapping);
  els.exportVisibleBtn.addEventListener("click", exportVisibleRows);
  els.resetFiltersBtn.addEventListener("click", resetAllFilters);
  els.clearHeadFilterBtn.addEventListener("click", () => {
    state.filters.selectedHeads.clear();
    render();
  });

  grainButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.grain = button.dataset.grain;
      state.filters.focusedPeriod = "";
      state.filters.focusedHead = "";
      grainButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      render();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.target.tagName === "INPUT" || event.target.tagName === "SELECT" || event.target.tagName === "TEXTAREA") return;
    const grainMap = { "1": "daily", "2": "weekly", "3": "monthly" };
    const grain = grainMap[event.key];
    if (grain) {
      state.grain = grain;
      state.filters.focusedPeriod = "";
      state.filters.focusedHead = "";
      grainButtons.forEach((item) => item.classList.toggle("is-active", item.dataset.grain === grain));
      render();
    }
  });

  dateFormatSelect.addEventListener("change", () => {
    state.dateFormat = dateFormatSelect.value;
    if (state.rawRows.length) applyCurrentMapping();
  });

  currencySelect.addEventListener("change", () => {
    setCurrency(currencySelect.value);
    render();
  });

  flowButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const flow = button.dataset.flowFilter;
      if (state.filters.flows.has(flow) && state.filters.flows.size > 1) {
        state.filters.flows.delete(flow);
      } else {
        state.filters.flows.add(flow);
      }
      syncFlowButtons();
      render();
    });
  });

  const debouncedRender = debounce(() => render(), 150);

  [els.startDate, els.endDate, els.searchInput, els.headSearch].forEach((input) => {
    input.addEventListener("input", () => {
      state.filters.startDate = els.startDate.value;
      state.filters.endDate = els.endDate.value;
      state.filters.search = els.searchInput.value.trim().toLowerCase();
      state.filters.headSearch = els.headSearch.value.trim().toLowerCase();
      const inverted = state.filters.startDate && state.filters.endDate && state.filters.startDate > state.filters.endDate;
      els.dateRangeWarn.hidden = !inverted;
      if (inverted) {
        els.startDate.style.borderColor = "var(--danger)";
        els.endDate.style.borderColor = "var(--danger)";
      } else {
        els.startDate.style.borderColor = "";
        els.endDate.style.borderColor = "";
      }
      debouncedRender();
    });
  });

  document.body.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.stopPropagation();
  });

  document.body.addEventListener("drop", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      els.fileStatus.textContent = `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 50MB.`;
      return;
    }
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!VALID_EXTENSIONS.includes(ext) && !VALID_TYPES.includes(file.type)) {
      els.fileStatus.textContent = "Please drop a CSV file.";
      return;
    }
    file.text().then((text) => {
      ingestCsvText(text, file.name);
    }).catch(() => {
      els.fileStatus.textContent = "Could not read the dropped file.";
    });
  });
}

function restorePersistedState() {
  const saved = loadState();
  if (!saved) return;
  if (saved.grain) {
    state.grain = saved.grain;
    grainButtons.forEach((item) => item.classList.toggle("is-active", item.dataset.grain === saved.grain));
  }
  if (saved.dateFormat) {
    state.dateFormat = saved.dateFormat;
    dateFormatSelect.value = saved.dateFormat;
  }
  if (saved.filters) {
    state.filters.startDate = saved.filters.startDate || "";
    state.filters.endDate = saved.filters.endDate || "";
    state.filters.search = saved.filters.search || "";
    state.filters.flows = saved.filters.flows || new Set(["revenue", "outflow"]);
    state.filters.selectedHeads = saved.filters.selectedHeads || new Set();
    state.filters.headSearch = saved.filters.headSearch || "";
    state.filters.focusedPeriod = saved.filters.focusedPeriod || "";
    state.filters.focusedHead = saved.filters.focusedHead || "";
    els.startDate.value = state.filters.startDate;
    els.endDate.value = state.filters.endDate;
    els.searchInput.value = state.filters.search;
    els.headSearch.value = state.filters.headSearch;
  }
  if (saved.mapping) {
    state.mapping = saved.mapping;
  }
}

function restoreUrlState() {
  const urlState = readUrlState();
  if (urlState.grain) {
    state.grain = urlState.grain;
    grainButtons.forEach((item) => item.classList.toggle("is-active", item.dataset.grain === urlState.grain));
  }
  if (urlState.startDate) { state.filters.startDate = urlState.startDate; els.startDate.value = urlState.startDate; }
  if (urlState.endDate) { state.filters.endDate = urlState.endDate; els.endDate.value = urlState.endDate; }
  if (urlState.focusedPeriod) state.filters.focusedPeriod = urlState.focusedPeriod;
  if (urlState.focusedHead) state.filters.focusedHead = urlState.focusedHead;
  if (urlState.flows) state.filters.flows = new Set(urlState.flows);
}

function init() {
  registerRender(render);
  wireEvents();
  restorePersistedState();
  restoreUrlState();
  renderEmptyState();
}

init();
