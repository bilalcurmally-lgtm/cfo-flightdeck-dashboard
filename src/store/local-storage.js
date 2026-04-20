const STORAGE_KEY = "cfo-flight-deck-state";
export const STORAGE_VERSION = 4;

export function saveState(state) {
  try {
    const serializable = {
      version: STORAGE_VERSION,
      grain: state.grain,
      currency: state.currency,
      dateFormat: state.dateFormat,
      currentBankBalance: state.currentBankBalance,
      balanceAsOf: state.balanceAsOf,
      aiBrief: {
        enabled: Boolean(state.aiBrief?.enabled),
        endpointUrl: state.aiBrief?.endpointUrl || "",
        model: state.aiBrief?.model || "",
        apiKey: state.aiBrief?.apiKey || ""
      },
      cashForecast: {
        manualEvents: Array.isArray(state.cashForecast?.manualEvents) ? state.cashForecast.manualEvents : [],
        baselineWeeks: state.cashForecast?.baselineWeeks || 8
      },
      filters: {
        startDate: state.filters.startDate,
        endDate: state.filters.endDate,
        search: state.filters.search,
        flows: [...state.filters.flows],
        selectedHeads: [...state.filters.selectedHeads],
        headSearch: state.filters.headSearch,
        focusedPeriod: state.filters.focusedPeriod,
        focusedHead: state.filters.focusedHead
      },
      mapping: state.mapping
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    // localStorage may be unavailable or full
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.version === 1) {
      data.currentBankBalance = 0;
      data.balanceAsOf = "";
      data.version = 2;
    }
    if (data.version === 2) {
      data.aiBrief = defaultAiBriefSettings();
      data.version = 3;
    }
    if (data.version === 3) {
      data.cashForecast = defaultCashForecastSettings();
      data.version = 4;
    }
    if (data.version !== STORAGE_VERSION) return null;
    data.aiBrief = {
      ...defaultAiBriefSettings(),
      ...(data.aiBrief || {})
    };
    data.cashForecast = {
      ...defaultCashForecastSettings(),
      ...(data.cashForecast || {}),
      manualEvents: Array.isArray(data.cashForecast?.manualEvents) ? data.cashForecast.manualEvents : []
    };
    if (data.filters) {
      data.filters.flows = new Set(data.filters.flows || ["revenue", "outflow"]);
      data.filters.selectedHeads = new Set(data.filters.selectedHeads || []);
    }
    return data;
  } catch {
    return null;
  }
}

function defaultAiBriefSettings() {
  return {
    enabled: false,
    endpointUrl: "",
    model: "",
    apiKey: ""
  };
}

function defaultCashForecastSettings() {
  return {
    manualEvents: [],
    baselineWeeks: 8
  };
}
