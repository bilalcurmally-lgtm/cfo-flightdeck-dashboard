import { state } from "../store/state.js";
import { els } from "../store/elements.js";
import { formatCurrency } from "../config/currency.js";
import { signedPercent } from "../core/format.js";
import { compareLatestPeriods } from "../filter/filter.js";

export function renderKpis(periodSummary) {
  const totals = periodSummary.reduce((acc, item) => {
    acc.revenue += item.revenue;
    acc.outflow += item.outflow;
    acc.net += item.net;
    return acc;
  }, { revenue: 0, outflow: 0, net: 0 });

  els.totalRevenue.textContent = formatCurrency(totals.revenue);
  els.totalOutflow.textContent = formatCurrency(totals.outflow);
  els.netCash.textContent = formatCurrency(totals.net);
  els.netCash.className = totals.net >= 0 ? "metric-positive" : "metric-negative";
  els.efficiencyRatio.textContent = totals.outflow ? `${(totals.revenue / totals.outflow).toFixed(2)}x` : "∞";

  const comparison = compareLatestPeriods(periodSummary);
  els.revenueDelta.textContent = comparison ? `${signedPercent(comparison.revenueChange)} vs previous ${state.grain} period` : "Need at least two periods for comparison.";
  els.outflowDelta.textContent = comparison ? `${signedPercent(comparison.outflowChange)} vs previous ${state.grain} period` : "Need at least two periods for comparison.";
  els.netDelta.textContent = comparison ? `${signedPercent(comparison.netChange)} vs previous ${state.grain} period` : "Need at least two periods for comparison.";
  els.efficiencyNote.textContent = totals.outflow ? `${((totals.net / totals.outflow) * 100).toFixed(1)}% net per outflow dollar` : "No outflow in the selected slice.";
}
