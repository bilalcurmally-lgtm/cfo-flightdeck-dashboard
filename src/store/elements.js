export const els = {
  csvFile: document.getElementById("csvFile"),
  loadSampleBtn: document.getElementById("loadSampleBtn"),
  recentDatasetSelect: document.getElementById("recentDatasetSelect"),
  loadRecentDatasetBtn: document.getElementById("loadRecentDatasetBtn"),
  fileStatus: document.getElementById("fileStatus"),
  currentBankBalance: document.getElementById("currentBankBalance"),
  balanceAsOf: document.getElementById("balanceAsOf"),
  forecastEventDate: document.getElementById("forecastEventDate"),
  forecastEventFlow: document.getElementById("forecastEventFlow"),
  forecastEventAmount: document.getElementById("forecastEventAmount"),
  forecastEventLabel: document.getElementById("forecastEventLabel"),
  addForecastEventBtn: document.getElementById("addForecastEventBtn"),
  forecastEventsList: document.getElementById("forecastEventsList"),
  cashForecastPanel: document.getElementById("cashForecastPanel"),
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
  dataQualityList: document.getElementById("dataQualityList"),
  totalRevenue: document.getElementById("totalRevenue"),
  totalOutflow: document.getElementById("totalOutflow"),
  netCash: document.getElementById("netCash"),
  efficiencyRatio: document.getElementById("efficiencyRatio"),
  revenueDelta: document.getElementById("revenueDelta"),
  outflowDelta: document.getElementById("outflowDelta"),
  netDelta: document.getElementById("netDelta"),
  efficiencyNote: document.getElementById("efficiencyNote"),
  cashRunway: document.getElementById("cashRunway"),
  runwayDelta: document.getElementById("runwayDelta"),
  saasControls: document.getElementById("saasControls"),
  insightList: document.getElementById("insightList"),
  focusPanel: document.getElementById("focusPanel"),
  focusStats: document.getElementById("focusStats"),
  trendChart: document.getElementById("trendChart"),
  headChart: document.getElementById("headChart"),
  periodMatrix: document.getElementById("periodMatrix"),
  pressureList: document.getElementById("pressureList"),
  detailBody: document.getElementById("detailBody"),
  detailFooter: document.getElementById("detailFooter"),
  heroStatus: document.getElementById("heroStatus"),
  heroTitle: document.getElementById("heroTitle"),
  heroSubtitle: document.getElementById("heroSubtitle"),
  sysStatusLabel: document.getElementById("sysStatusLabel"),
  sysStatusMeta: document.getElementById("sysStatusMeta"),
  tickerRow: document.getElementById("tickerRow"),
  topbarSearchInput: document.getElementById("topbarSearchInput"),
  topbarPeriodSelect: document.getElementById("topbarPeriodSelect"),
  flowDiagram: document.getElementById("flowDiagram"),
  railSettings: document.getElementById("railSettings"),
  toggleControlDrawer: document.getElementById("toggleControlDrawer"),
  closeControlDrawer: document.getElementById("closeControlDrawer"),
  controlDrawer: document.getElementById("controlDrawer")
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
export const currencySearchInput = document.getElementById("currencySearchInput");
