const VALID_GRAINS = new Set(["daily", "weekly", "monthly"]);

export function readUrlState() {
  const params = new URLSearchParams(window.location.search);
  const state = {};
  if (params.has("grain") && VALID_GRAINS.has(params.get("grain"))) state.grain = params.get("grain");
  if (params.has("focusedPeriod")) state.focusedPeriod = params.get("focusedPeriod");
  if (params.has("focusedHead")) state.focusedHead = params.get("focusedHead");
  if (params.has("startDate")) state.startDate = params.get("startDate");
  if (params.has("endDate")) state.endDate = params.get("endDate");
  if (params.has("flows")) {
    const flows = params.get("flows").split(",").filter(Boolean);
    if (flows.length) state.flows = flows;
  }
  return state;
}

export function writeUrlState(appState) {
  const params = new URLSearchParams();
  if (appState.grain) params.set("grain", appState.grain);
  if (appState.filters.focusedPeriod) params.set("focusedPeriod", appState.filters.focusedPeriod);
  if (appState.filters.focusedHead) params.set("focusedHead", appState.filters.focusedHead);
  if (appState.filters.startDate) params.set("startDate", appState.filters.startDate);
  if (appState.filters.endDate) params.set("endDate", appState.filters.endDate);
  if (appState.filters.flows.size) params.set("flows", [...appState.filters.flows].join(","));
  const qs = params.toString();
  const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState(null, "", url);
}
