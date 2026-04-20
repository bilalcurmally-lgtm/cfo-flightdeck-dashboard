import { state } from "../store/state.js";
import { els } from "../store/elements.js";
import { escapeHtml } from "../core/escape.js";

function valueOrDash(value) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "None";
  return value || "—";
}

export function renderDataQuality() {
  const quality = state.dataQuality;
  const items = [
    ["Dataset", quality.fileName || "No dataset loaded"],
    ["Rows loaded", quality.loadedRows ? quality.loadedRows.toLocaleString() : "0"],
    ["Rows mapped", quality.mappedRows ? quality.mappedRows.toLocaleString() : "0"],
    ["Rows skipped", quality.skippedRows ? quality.skippedRows.toLocaleString() : "0"],
    ["Date format", valueOrDash(quality.detectedDateFormat)],
    ["Optional fields missing", valueOrDash(quality.unmappedOptionalColumns)],
    ["Unknown flow labels", valueOrDash(quality.unknownFlowLabels)],
    ["Saved locally", quality.persistedDataset ? "Yes" : "No"],
    ["Forecast history", forecastHistoryStatus()]
  ];

  els.dataQualityList.innerHTML = items.map(([label, value]) => `
    <div class="data-quality-item">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `).join("");
}

function forecastHistoryStatus() {
  const forecast = state.cashForecast?.latest;
  if (!forecast) return "Not available";
  if (forecast.baselineWeeksUsed === 0) return "No completed historical weeks";
  if (forecast.hasLimitedHistory) return `${forecast.baselineWeeksUsed} weeks used; limited history`;
  return `${forecast.baselineWeeksUsed} weeks used`;
}
