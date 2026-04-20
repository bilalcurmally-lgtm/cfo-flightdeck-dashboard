import { state } from "../store/state.js";
import { els, mappingSelects, dateFormatSelect, aliasInputs } from "../store/elements.js";
import { render } from "../store/renderer.js";
import { parseCsv } from "../csv/parse.js";
import { matchColumn, mapRowToRecord } from "../csv/map.js";
import { detectDateFormat } from "../core/date.js";
import { escapeHtml } from "../core/escape.js";
import { getRevenueAliases, getOutflowAliases } from "../config/aliases.js";
import { renderEmptyState } from "../render/table.js";
import { MAX_FILE_SIZE, VALID_EXTENSIONS, VALID_TYPES } from "./constants.js";
import { saveDataset } from "../store/dataset-store.js";

export async function onFileSelected(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > MAX_FILE_SIZE) {
    els.fileStatus.textContent = `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 50MB.`;
    return;
  }
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!VALID_EXTENSIONS.includes(ext) && !VALID_TYPES.includes(file.type)) {
    els.fileStatus.textContent = "Please upload a CSV file.";
    return;
  }
  try {
    const text = await file.text();
    ingestCsvText(text, file.name);
  } catch (error) {
    els.fileStatus.textContent = `Could not read file: ${error.message}`;
  }
  event.target.value = "";
}

export function ingestCsvText(text, fileName) {
  const rows = parseCsv(text);
  ingestRows(rows, fileName, { persist: true });
}

export function ingestRows(rows, fileName, { persist = false } = {}) {
  if (!rows.length) {
    state.rawRows = [];
    state.records = [];
    state.columns = [];
    state.dataQuality = {
      ...state.dataQuality,
      fileName: fileName || "",
      loadedRows: 0,
      mappedRows: 0,
      skippedRows: 0,
      skippedBadDateOrAmount: 0,
      detectedDateFormat: "auto",
      unmappedOptionalColumns: [],
      unknownFlowLabels: [],
      persistedDataset: false
    };
    renderEmptyState("The CSV is empty or could not be parsed.");
    return;
  }

  state.rawRows = rows;
  state.columns = Object.keys(rows[0]);
  state.dataQuality = {
    ...state.dataQuality,
    fileName: fileName || "dataset.csv",
    loadedRows: rows.length,
    mappedRows: 0,
    skippedRows: 0,
    skippedBadDateOrAmount: 0,
    detectedDateFormat: "auto",
    unmappedOptionalColumns: [],
    unknownFlowLabels: [],
    persistedDataset: false
  };
  state.dateFormat = "auto";
  dateFormatSelect.value = "auto";
  setMappingDefaults();
  populateMappingControls();
  els.fileStatus.textContent = `Loaded ${fileName} with ${rows.length.toLocaleString()} rows. Mapping applied automatically.`;
  applyCurrentMapping();

  if (persist) {
    saveDataset(fileName, rows).then(() => {
      state.dataQuality.persistedDataset = true;
      window.dispatchEvent(new CustomEvent("datasets:changed"));
      render();
    }).catch(() => {
      state.dataQuality.persistedDataset = false;
    });
  }
}

export function applyCurrentMapping() {
  try {
    applyCurrentMappingInner();
  } catch (error) {
    console.error("[CFO Flight Deck] applyCurrentMapping failed:", error);
    els.fileStatus.textContent = `Mapping error: ${error.message}`;
    state.records = [];
    state.visibleRows = [];
    renderEmptyState(`An error occurred while applying the mapping: ${error.message}`);
  }
}

function applyCurrentMappingInner() {
  state.mapping = Object.fromEntries(
    Object.entries(mappingSelects).map(([key, select]) => [key, select.value])
  );

  const required = ["date", "amount", "head"];
  const missing = required.filter((key) => !state.mapping[key]);
  if (missing.length) {
    renderEmptyState(`Map the required columns first: ${missing.join(", ")}.`);
    return;
  }

  if (state.dateFormat === "auto") {
    const detected = detectDateFormat(state.rawRows, state.mapping.date);
    dateFormatSelect.value = detected;
    state.dateFormat = detected;
  }

  const revenueTokens = getRevenueAliases(aliasInputs.revenue);
  const outflowTokens = getOutflowAliases(aliasInputs.outflow);

  const unknownFlowLabels = new Set();
  if (state.mapping.type) {
    state.rawRows.forEach((row) => {
      const typeValue = String(row[state.mapping.type] || "").trim().toLowerCase();
      if (!typeValue) return;
      const knownRevenue = revenueTokens.some((token) => typeValue.includes(token));
      const knownOutflow = outflowTokens.some((token) => typeValue.includes(token));
      if (!knownRevenue && !knownOutflow) unknownFlowLabels.add(typeValue);
    });
  }

  let skipped = 0;
  const records = state.rawRows.map((row, index) => {
    const record = mapRowToRecord(row, index, state.mapping, revenueTokens, outflowTokens, state.dateFormat);
    if (!record) skipped += 1;
    return record;
  }).filter(Boolean);
  state.records = records.sort((a, b) => a.date - b.date);
  state.dataQuality = {
    ...state.dataQuality,
    loadedRows: state.rawRows.length,
    mappedRows: records.length,
    skippedRows: skipped,
    skippedBadDateOrAmount: skipped,
    detectedDateFormat: state.dateFormat,
    unmappedOptionalColumns: ["type", "parent", "description"].filter((key) => !state.mapping[key]),
    unknownFlowLabels: [...unknownFlowLabels].slice(0, 6)
  };

  if (!state.records.length) {
    renderEmptyState("No valid records were produced from the selected mapping.");
    return;
  }

  if (skipped) {
    els.fileStatus.textContent = `Mapped ${records.length.toLocaleString()} rows. ${skipped.toLocaleString()} rows skipped (bad date or amount).`;
  }

  const [firstDate, lastDate] = [state.records[0].dateISO, state.records[state.records.length - 1].dateISO];
  if (!els.startDate.value) els.startDate.value = firstDate;
  if (!els.endDate.value) els.endDate.value = lastDate;
  state.filters.startDate = els.startDate.value;
  state.filters.endDate = els.endDate.value;
  state.filters.focusedPeriod = "";
  state.filters.focusedHead = "";
  render();
}

function setMappingDefaults() {
  const columns = state.columns;
  const lower = columns.map((name) => name.toLowerCase());
  state.mapping = {
    date: matchColumn(columns, lower, ["date", "posting date", "transaction date", "entry date"]),
    amount: matchColumn(columns, lower, ["amount", "value", "total", "net amount", "signed amount"]),
    type: matchColumn(columns, lower, ["type", "flow", "flow type", "direction", "transaction type"]),
    head: matchColumn(columns, lower, ["account head", "head", "account", "gl account", "category", "account name"]),
    parent: matchColumn(columns, lower, ["parent", "parent head", "group", "major head", "class", "department"]),
    description: matchColumn(columns, lower, ["description", "memo", "narration", "details", "notes"])
  };
}

function populateMappingControls() {
  const options = ['<option value="">None</option>'].concat(
    state.columns.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)
  ).join("");

  Object.entries(mappingSelects).forEach(([key, select]) => {
    select.innerHTML = options;
    select.value = state.mapping[key] || "";
  });
}
