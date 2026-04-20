import { filterRecords, buildHeadSummary, buildPeriodSummary } from "../filter/filter.js";
import { buildCashHealthSummary } from "./cash-health.js";

export function normalizeWorkerFilters(filters = {}) {
  return {
    startDate: filters.startDate || "",
    endDate: filters.endDate || "",
    search: filters.search || "",
    flows: toSet(filters.flows, ["revenue", "outflow"]),
    selectedHeads: toSet(filters.selectedHeads),
    headSearch: filters.headSearch || "",
    focusedPeriod: filters.focusedPeriod || "",
    focusedHead: filters.focusedHead || ""
  };
}

export function serializeFinanceFilters(filters = {}) {
  return {
    startDate: filters.startDate || "",
    endDate: filters.endDate || "",
    search: filters.search || "",
    flows: Array.from(filters.flows || ["revenue", "outflow"]),
    selectedHeads: Array.from(filters.selectedHeads || []),
    headSearch: filters.headSearch || "",
    focusedPeriod: filters.focusedPeriod || "",
    focusedHead: filters.focusedHead || ""
  };
}

export function computeFinanceView({
  records = [],
  filters = {},
  grain = "daily",
  currentBankBalance = 0
} = {}) {
  const normalizedFilters = normalizeWorkerFilters(filters);
  const filtered = filterRecords(records, normalizedFilters, grain);
  const periodSummary = buildPeriodSummary(filtered, grain);
  const headSummary = buildHeadSummary(filtered);
  const cashHealth = buildCashHealthSummary({
    rows: filtered,
    currentBankBalance
  });

  return {
    filtered,
    periodSummary,
    headSummary,
    cashHealth
  };
}

function toSet(value, fallback = []) {
  if (value instanceof Set) return new Set(value);
  if (Array.isArray(value)) return new Set(value);
  return new Set(fallback);
}
