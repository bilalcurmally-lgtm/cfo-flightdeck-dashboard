export const els = {
  csvFile: document.getElementById("csvFile"),
  loadSampleBtn: document.getElementById("loadSampleBtn"),
  fileStatus: document.getElementById("fileStatus"),
  applyMappingBtn: document.getElementById("applyMappingBtn"),
  exportVisibleBtn: document.getElementById("exportVisibleBtn"),
  resetFiltersBtn: document.getElementById("resetFiltersBtn"),
  clearHeadFilterBtn: document.getElementById("clearHeadFilterBtn"),
  startDate: document.getElementById("startDate"),
  endDate: document.getElementById("endDate"),
  dateRangeWarn: document.getElementById("dateRangeWarn"),
  searchInput: document.getElementById("searchInput"),
  headSearch: document.getElementById("headSearch"),
  headChecklist: document.getElementById("headChecklist"),
  breadcrumbs: document.getElementById("breadcrumbs"),
  totalRevenue: document.getElementById("totalRevenue"),
  totalOutflow: document.getElementById("totalOutflow"),
  netCash: document.getElementById("netCash"),
  efficiencyRatio: document.getElementById("efficiencyRatio"),
  revenueDelta: document.getElementById("revenueDelta"),
  outflowDelta: document.getElementById("outflowDelta"),
  netDelta: document.getElementById("netDelta"),
  efficiencyNote: document.getElementById("efficiencyNote"),
  insightList: document.getElementById("insightList"),
  focusStats: document.getElementById("focusStats"),
  trendChart: document.getElementById("trendChart"),
  headChart: document.getElementById("headChart"),
  periodMatrix: document.getElementById("periodMatrix"),
  pressureList: document.getElementById("pressureList"),
  detailBody: document.getElementById("detailBody"),
  detailFooter: document.getElementById("detailFooter")
};

export const mappingSelects = {
  date: document.getElementById("dateColumn"),
  amount: document.getElementById("amountColumn"),
  type: document.getElementById("typeColumn"),
  head: document.getElementById("headColumn"),
  parent: document.getElementById("parentColumn"),
  description: document.getElementById("descriptionColumn")
};

export const dateFormatSelect = document.getElementById("dateFormatSelect");

export const aliasInputs = {
  revenue: document.getElementById("revenueAliases"),
  outflow: document.getElementById("outflowAliases")
};

export const grainButtons = Array.from(document.querySelectorAll("[data-grain]"));
export const flowButtons = Array.from(document.querySelectorAll("[data-flow-filter]"));
export const currencySelect = document.getElementById("currencySelect");
