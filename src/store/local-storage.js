const STORAGE_KEY = "cfo-flight-deck-state";

export function saveState(state) {
  try {
    const serializable = {
      grain: state.grain,
      dateFormat: state.dateFormat,
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
    if (data.filters) {
      data.filters.flows = new Set(data.filters.flows || ["revenue", "outflow"]);
      data.filters.selectedHeads = new Set(data.filters.selectedHeads || []);
    }
    return data;
  } catch {
    return null;
  }
}
