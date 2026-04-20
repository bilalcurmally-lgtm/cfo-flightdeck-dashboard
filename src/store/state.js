export const state = {
  rawRows: [],
  records: [],
  visibleRows: [],
  columns: [],
  grain: "monthly",
  currency: "USD",
  dateFormat: "auto",
  currentBankBalance: 0,
  balanceAsOf: "",
  aiBrief: {
    enabled: false,
    endpointUrl: "",
    model: "",
    apiKey: "",
    text: "",
    status: "idle",
    error: ""
  },
  cashForecast: {
    manualEvents: [],
    baselineWeeks: 8,
    latest: null
  },
  filters: {
    startDate: "",
    endDate: "",
    search: "",
    flows: new Set(["revenue", "outflow"]),
    selectedHeads: new Set(),
    headSearch: "",
    focusedPeriod: "",
    focusedHead: ""
  },
  mapping: {
    date: "",
    amount: "",
    type: "",
    head: "",
    parent: "",
    description: ""
  },
  dataQuality: {
    fileName: "",
    loadedRows: 0,
    mappedRows: 0,
    skippedRows: 0,
    skippedBadDateOrAmount: 0,
    detectedDateFormat: "auto",
    unmappedOptionalColumns: [],
    unknownFlowLabels: [],
    persistedDataset: false
  }
};
