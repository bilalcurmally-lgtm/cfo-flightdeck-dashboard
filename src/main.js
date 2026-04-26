import { state } from "./store/state.js";
import { els, dateFormatSelect, grainButtons, flowButtons, currencySelect, currencySearchInput } from "./store/elements.js";
import { registerRender } from "./store/renderer.js";
import { onFileSelected, ingestRows, applyCurrentMapping } from "./io/file.js";
import { loadSampleData } from "./io/fetch.js";
import { computeFinanceView, serializeFinanceFilters } from "./finance/finance-view.js";
import { createFinanceWorkerClient } from "./worker/finance-worker-client.js";
import { buildCashForecast, createEventId, normalizeManualEvents } from "./finance/cash-forecast.js";

import { renderBreadcrumbs } from "./filter/drill.js";
import { renderKpis } from "./render/kpi.js";
import { renderSaasControls } from "./render/saas.js";
import { renderTrendChart, renderHeadChart } from "./render/chart.js";
import { renderPeriodMatrix } from "./render/matrix.js";
import { renderInsights, renderFocus, renderPressureList } from "./render/insight.js";
import { renderDetailTable, renderHeadChecklist, renderEmptyState } from "./render/table.js";
import { renderCashForecast, renderForecastEvents } from "./render/cash-forecast.js";
import { renderDataQuality } from "./render/data-quality.js";
import { buildTickerItems, mountTicker } from "./render/ticker.js";
import { renderFlowDiagram } from "./render/flow-diagram.js";
import { exportVisibleRows } from "./render/export.js";
import { saveState, loadState } from "./store/local-storage.js";
import { setCurrency } from "./config/currency.js";
import { debounce } from "./core/debounce.js";
import { readUrlState, writeUrlState } from "./store/url-state.js";
import { MAX_FILE_SIZE, VALID_EXTENSIONS, VALID_TYPES } from "./io/constants.js";
import { getDatasetCatalog, loadDataset } from "./store/dataset-store.js";
import { escapeHtml } from "./core/escape.js";
import { initAppGate } from "./auth/gate.js";
import { getCurrencyOptions } from "./config/currency-options.js";

state.detailRowCap = 250;

const financeWorkerClient = createFinanceWorkerClient();
let renderSequence = 0;

async function render() {
  const sequence = renderSequence + 1;
  renderSequence = sequence;
  state.detailRowCap = 250;
  if (!state.records.length) {
    state.visibleRows = [];
    state.cashForecast.latest = null;
    renderEmptyState();
    renderDataQuality();
    renderForecastPanels();
    saveState(state);
    return;
  }

  syncFlowButtons();
  renderHeadChecklist();

  const payload = {
    records: state.records,
    filters: serializeFinanceFilters(state.filters),
    grain: state.grain,
    currentBankBalance: state.currentBankBalance
  };

  let view;
  try {
    view = await financeWorkerClient.compute(payload);
  } catch (error) {
    console.warn("[CFO Flight Deck] Finance worker unavailable; using main-thread calculation.", error);
    view = computeFinanceView(payload);
  }

  if (sequence !== renderSequence) return;

  const filtered = view.filtered;
  state.visibleRows = filtered;
  renderBreadcrumbs();

  if (!filtered.length) {
    renderEmptyState("No rows match the current filters.");
    renderDataQuality();
    saveState(state);
    return;
  }

  const periodSummary = view.periodSummary;
  const headSummary = view.headSummary;
  const cashHealth = view.cashHealth;
  const cashForecast = buildCashForecast({
    records: state.records,
    currentBankBalance: state.currentBankBalance,
    balanceAsOf: state.balanceAsOf,
    manualEvents: state.cashForecast.manualEvents,
    baselineWeeks: state.cashForecast.baselineWeeks
  });
  state.cashForecast.latest = cashForecast;

  const safeRender = (name, fn, target) => {
    try { fn(); } catch (error) {
      console.error(`[CFO Flight Deck] ${name} failed:`, error);
      if (target) target.innerHTML = `<div class="chart-empty">This section could not be rendered.</div>`;
    }
  };

  safeRender("kpis", () => renderKpis(periodSummary, cashHealth));
  safeRender("ticker", () => {
    const items = buildTickerItems({ periodSummary, cashHealth, currency: state.currency });
    mountTicker(els.tickerRow, items);
    if (els.sysStatusLabel) els.sysStatusLabel.textContent = "Systems nominal";
    if (els.sysStatusMeta) els.sysStatusMeta.textContent = `Flight Deck · ${state.records.length.toLocaleString()} rows loaded`;
  });
  safeRender("saasControls", () => renderSaasControls(periodSummary, headSummary, filtered, cashHealth), els.saasControls);
  safeRender("cashForecast", () => renderCashForecast(cashForecast, els.cashForecastPanel), els.cashForecastPanel);
  safeRender("forecastEvents", renderForecastPanels, els.forecastEventsList);
  safeRender("insights", () => renderInsights(periodSummary, headSummary, filtered, cashHealth, cashForecast), els.insightList);
  safeRender("flowDiagram", () => renderFlowDiagram(headSummary, els.flowDiagram, state.currency), els.flowDiagram);
  safeRender("focus", () => renderFocus(filtered, headSummary), els.focusStats);
  safeRender("trendChart", () => renderTrendChart(periodSummary), els.trendChart);
  safeRender("headChart", () => renderHeadChart(headSummary), els.headChart);
  safeRender("periodMatrix", () => renderPeriodMatrix(periodSummary), els.periodMatrix);
  safeRender("pressureList", () => renderPressureList(headSummary), els.pressureList);
  safeRender("detailTable", () => renderDetailTable(filtered));
  safeRender("dataQuality", renderDataQuality, els.dataQualityList);
  saveState(state);
  writeUrlState(state);
}

function renderForecastPanels() {
  renderForecastEvents(state.cashForecast.manualEvents, els.forecastEventsList);
  renderCashForecast(state.cashForecast.latest, els.cashForecastPanel);
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
  els.topbarSearchInput.value = "";
  els.topbarPeriodSelect.value = "All periods";
  els.headSearch.value = "";
  render();
}

function wireEvents() {
  els.csvFile.addEventListener("change", onFileSelected);
  els.currentBankBalance.addEventListener("input", () => {
    state.currentBankBalance = parseFloat(els.currentBankBalance.value) || 0;
    debouncedRender();
  });
  els.balanceAsOf.addEventListener("change", () => {
    state.balanceAsOf = els.balanceAsOf.value;
    debouncedRender();
  });
  els.addForecastEventBtn.addEventListener("click", addForecastEvent);
  els.forecastEventsList.addEventListener("click", (event) => {
    const id = event.target.dataset.deleteForecastEvent;
    if (!id) return;
    state.cashForecast.manualEvents = state.cashForecast.manualEvents.filter((item) => item.id !== id);
    render();
  });
  els.loadSampleBtn.addEventListener("click", loadSampleData);
  els.loadRecentDatasetBtn.addEventListener("click", async () => {
    const id = els.recentDatasetSelect.value;
    if (!id) return;
    const rows = await loadDataset(id);
    const selected = els.recentDatasetSelect.selectedOptions[0];
    if (!rows) {
      els.fileStatus.textContent = "Could not restore that dataset.";
      return;
    }
    ingestRows(rows, selected?.dataset.fileName || "restored dataset", { persist: false, resetFilters: true });
    state.dataQuality.persistedDataset = true;
    render();
  });
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
    applyCurrency(currencySelect.value);
    syncCurrencySearchLabel();
  });

  currencySearchInput.addEventListener("input", () => {
    const matches = filterCurrencyOptions(currencySearchInput.value);
    const exact = findCurrencyMatch(currencySearchInput.value, matches);
    if (exact) applyCurrency(exact.value);
  });

  currencySearchInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const matches = filterCurrencyOptions(currencySearchInput.value);
    const match = findCurrencyMatch(currencySearchInput.value, matches) || matches[0];
    if (!match) return;
    applyCurrency(match.value);
    syncCurrencySearchLabel();
  });

  currencySearchInput.addEventListener("blur", () => {
    const matches = filterCurrencyOptions(currencySearchInput.value);
    const match = findCurrencyMatch(currencySearchInput.value, matches) || (matches.length === 1 ? matches[0] : null);
    if (match) applyCurrency(match.value);
    syncCurrencySearchLabel();
  });

  window.addEventListener("datasets:changed", refreshRecentDatasetControls);

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
      if (input === els.searchInput) {
        els.topbarSearchInput.value = els.searchInput.value;
      }
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

  els.topbarSearchInput.addEventListener("input", () => {
    state.filters.search = els.topbarSearchInput.value.trim().toLowerCase();
    if (els.searchInput) els.searchInput.value = els.topbarSearchInput.value;
    debouncedRender();
  });

  els.topbarPeriodSelect.addEventListener("change", () => {
    const preset = els.topbarPeriodSelect.value;
    const today = new Date();
    const year = today.getFullYear();

    switch (preset) {
      case "Q1 26":
        state.filters.startDate = "2026-01-01";
        state.filters.endDate = "2026-03-31";
        break;
      case "Q4 25":
        state.filters.startDate = "2025-10-01";
        state.filters.endDate = "2025-12-31";
        break;
      case "Last 30D":
        const start = new Date(today);
        start.setDate(start.getDate() - 30);
        state.filters.startDate = start.toISOString().slice(0, 10);
        state.filters.endDate = today.toISOString().slice(0, 10);
        break;
      case "YTD":
        state.filters.startDate = `${year}-01-01`;
        state.filters.endDate = today.toISOString().slice(0, 10);
        break;
      default:
        state.filters.startDate = state.records[0] ? state.records[0].dateISO : "";
        state.filters.endDate = state.records[state.records.length - 1] ? state.records[state.records.length - 1].dateISO : "";
    }
    els.startDate.value = state.filters.startDate;
    els.endDate.value = state.filters.endDate;
    debouncedRender();
  });

  const setControlDrawerOpen = (isOpen) => {
    els.controlDrawer.classList.toggle("is-open", isOpen);
    els.controlDrawer.setAttribute("aria-hidden", String(!isOpen));
    els.toggleControlDrawer.setAttribute("aria-expanded", String(isOpen));
    els.railSettings?.classList.toggle("active", isOpen);
  };
  const toggleControlDrawer = () => {
    setControlDrawerOpen(!els.controlDrawer.classList.contains("is-open"));
  };

  els.toggleControlDrawer.addEventListener("click", toggleControlDrawer);
  els.railSettings?.addEventListener("click", toggleControlDrawer);
  els.closeControlDrawer?.addEventListener("click", () => setControlDrawerOpen(false));

  document.querySelectorAll("[data-scroll-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.scrollTarget);
      if (!target) return;
      document.querySelectorAll("[data-scroll-target]").forEach((item) => {
        item.classList.toggle("active", item === button);
      });
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && els.controlDrawer.classList.contains("is-open")) {
      setControlDrawerOpen(false);
    }
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

function syncCurrencySearchLabel() {
  if (!currencySearchInput || !currencySelect) return;
  const selected = currencySelect.selectedOptions[0];
  currencySearchInput.value = selected ? selected.textContent.trim() : currencySelect.value;
  filterCurrencyOptions("");
}

function applyCurrency(code) {
  if (!code || code === state.currency) return;
  state.currency = code;
  currencySelect.value = code;
  setCurrency(code);
  render();
}

function populateCurrencyOptions() {
  if (!currencySelect) return;
  const selected = state.currency || currencySelect.value || "USD";
  currencySelect.innerHTML = getCurrencyOptions()
    .map((option) => `<option value="${escapeHtml(option.code)}" data-search="${escapeHtml(option.search)}">${escapeHtml(option.label)}</option>`)
    .join("");
  currencySelect.value = selected;
  if (!currencySelect.value) currencySelect.value = "USD";
}

function filterCurrencyOptions(query) {
  if (!currencySelect) return [];
  const normalized = query.trim().toLowerCase();
  return [...currencySelect.options].filter((option) => {
    const haystack = `${option.value} ${option.textContent} ${option.dataset.search || ""}`.toLowerCase();
    const matches = !normalized || haystack.includes(normalized);
    option.hidden = !matches;
    return matches;
  });
}

function findCurrencyMatch(query, options = []) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;
  return options.find((option) => {
    const code = option.value.toLowerCase();
    const label = option.textContent.trim().toLowerCase();
    return normalized === code || label.startsWith(`${code} -`) && label.includes(normalized);
  }) || null;
}

function restorePersistedState() {
  const saved = loadState();
  if (!saved) return;
  if (saved.currentBankBalance !== undefined) {
    state.currentBankBalance = saved.currentBankBalance;
    els.currentBankBalance.value = saved.currentBankBalance || "";
  }
  if (saved.balanceAsOf !== undefined) {
    state.balanceAsOf = saved.balanceAsOf;
    els.balanceAsOf.value = saved.balanceAsOf || "";
  }
  if (saved.aiBrief) {
    state.aiBrief = {
      ...state.aiBrief,
      ...saved.aiBrief,
      text: "",
      status: "idle",
      error: ""
    };
  }
  if (saved.cashForecast) {
    state.cashForecast = {
      ...state.cashForecast,
      ...saved.cashForecast,
      manualEvents: normalizeManualEvents(saved.cashForecast.manualEvents || []),
      latest: null
    };
    renderForecastPanels();
  }
  if (saved.currency) {
    state.currency = saved.currency;
    currencySelect.value = saved.currency;
    setCurrency(saved.currency);
  }
  syncCurrencySearchLabel();
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
    els.topbarSearchInput.value = state.filters.search;
    els.headSearch.value = state.filters.headSearch;
  }
  if (saved.mapping) {
    state.mapping = saved.mapping;
  }
}

function addForecastEvent() {
  const event = normalizeManualEvents([{
    id: createEventId(),
    date: els.forecastEventDate.value,
    flow: els.forecastEventFlow.value,
    amount: els.forecastEventAmount.value,
    label: els.forecastEventLabel.value
  }])[0];

  if (!event) {
    els.forecastEventAmount.style.borderColor = "var(--danger)";
    return;
  }

  els.forecastEventAmount.style.borderColor = "";
  state.cashForecast.manualEvents = [...state.cashForecast.manualEvents, event]
    .sort((a, b) => a.date.localeCompare(b.date));
  els.forecastEventDate.value = "";
  els.forecastEventAmount.value = "";
  els.forecastEventLabel.value = "";
  render();
}

async function refreshRecentDatasetControls() {
  const catalog = await getDatasetCatalog();
  if (!catalog.length) {
    els.recentDatasetSelect.innerHTML = '<option value="">No saved datasets</option>';
    els.loadRecentDatasetBtn.disabled = true;
    return catalog;
  }

  els.recentDatasetSelect.innerHTML = catalog.map((item) => {
    const label = `${item.fileName} (${item.rowCount.toLocaleString()} rows)`;
    return `<option value="${escapeHtml(item.id)}" data-file-name="${escapeHtml(item.fileName)}">${escapeHtml(label)}</option>`;
  }).join("");
  els.loadRecentDatasetBtn.disabled = false;
  return catalog;
}

async function restoreLatestDataset() {
  const catalog = await refreshRecentDatasetControls();
  const latest = catalog[0];
  if (!latest) return false;
  const rows = await loadDataset(latest.id);
  if (!rows) return false;
  ingestRows(rows, latest.fileName, { persist: false, resetFilters: false });
  state.dataQuality.persistedDataset = true;
  render();
  return true;
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

async function init() {
  initAppGate();
  populateCurrencyOptions();
  registerRender(render);
  wireEvents();
  syncCurrencySearchLabel();
  restorePersistedState();
  restoreUrlState();
  const restoredDataset = await restoreLatestDataset();
  if (!restoredDataset) {
    await loadSampleData({ persist: false, statusPrefix: "Loaded first-run demo sample" });
  }
}

init();
