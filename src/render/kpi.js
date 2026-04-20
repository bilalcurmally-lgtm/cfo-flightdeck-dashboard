import { state } from "../store/state.js";
import { els } from "../store/elements.js";
import { formatCurrency } from "../config/currency.js";
import { compareLatestPeriods } from "../filter/filter.js";
import { markUpdated, setAnimatedText } from "./motion.js";

export function renderKpis(periodSummary, cashHealth) {
  const totals = periodSummary.reduce((acc, item) => {
    acc.revenue += item.revenue;
    acc.outflow += item.outflow;
    acc.net += item.net;
    return acc;
  }, { revenue: 0, outflow: 0, net: 0 });

  setAnimatedText(els.totalRevenue, formatCurrency(totals.revenue));
  setAnimatedText(els.totalOutflow, formatCurrency(totals.outflow));
  els.netCash.className = `k-val tnum ${totals.net >= 0 ? "metric-positive" : "metric-negative"}`;
  setAnimatedText(els.netCash, formatCurrency(totals.net));
  setAnimatedText(els.efficiencyRatio, totals.outflow ? `${(totals.revenue / totals.outflow).toFixed(2)}x` : "∞");

  const comparison = compareLatestPeriods(periodSummary);

  function formatDelta(change, inverseColors = false) {
    if (!comparison) return null;
    if (!change) return { text: "0.0%", kind: "neu" };
    const kind = (change > 0) === inverseColors ? "neg" : "pos";
    return { text: `${change > 0 ? "▲" : "▼"} ${Math.abs(change).toFixed(1)}%`, kind };
  }

  const revD = formatDelta(comparison?.revenueChange);
  const outD = formatDelta(comparison?.outflowChange, true);
  const netD = formatDelta(comparison?.netChange);

  els.revenueDelta.textContent = revD ? revD.text : "";
  els.revenueDelta.className = revD ? `delta ${revD.kind}` : "delta";
  markUpdated(els.revenueDelta, "delta-updating");
  els.outflowDelta.textContent = outD ? outD.text : "";
  els.outflowDelta.className = outD ? `delta ${outD.kind}` : "delta";
  markUpdated(els.outflowDelta, "delta-updating");
  els.netDelta.textContent = netD ? netD.text : "";
  els.netDelta.className = netD ? `delta ${netD.kind}` : "delta";
  markUpdated(els.netDelta, "delta-updating");
  els.efficiencyNote.textContent = totals.outflow ? `${((totals.net / totals.outflow) * 100).toFixed(1)}% net per outflow dollar` : "No outflow in the selected slice.";

  let runwayText = "-";
  const runwaySummary = cashHealthSummaryText(cashHealth);
  els.cashRunway.style.color = "";
  els.cashRunway.className = "k-val tnum";
  els.runwayDelta.className = "delta neu";

  if (cashHealth?.hasEnoughHistory) {
    if (cashHealth.status === "immediate") {
      runwayText = "0.0 mo";
      els.cashRunway.style.color = "var(--danger)";
      els.cashRunway.className = "k-val tnum metric-negative";
      els.runwayDelta.className = "delta neg";
    } else if (cashHealth.status === "growing") {
      runwayText = "∞";
      els.cashRunway.className = "k-val tnum metric-positive";
      els.runwayDelta.className = "delta pos";
    } else {
      runwayText = `${cashHealth.runwayMonths.toFixed(1)} mo`;
      if (cashHealth.status === "healthy") els.cashRunway.style.color = "var(--green)";
      else if (cashHealth.status === "warning") els.cashRunway.style.color = "var(--amber)";
      else els.cashRunway.style.color = "var(--danger)";
      els.runwayDelta.className = cashHealth.status === "warning" ? "delta neg" : "delta pos";
    }
  }

  setAnimatedText(els.cashRunway, runwayText);
  els.runwayDelta.textContent = runwayBadgeText(cashHealth);
  els.runwayDelta.title = state.balanceAsOf && runwayText !== "-"
    ? `${runwaySummary} (As of ${state.balanceAsOf})`
    : runwaySummary;
  markUpdated(els.runwayDelta, "delta-updating");

  // Hero Context (Finance Acumen)
  const dateRange = (state.filters.startDate && state.filters.endDate)
    ? `${state.filters.startDate} – ${state.filters.endDate}`
    : "Active History";

  const headCount = new Set(state.visibleRows.map(r => r.head)).size;
  const netText = totals.net >= 0 ? "Positive Net" : "Net Outflow";

  if (els.heroTitle) els.heroTitle.textContent = `Financial Performance: ${dateRange}`;
  if (els.heroSubtitle) els.heroSubtitle.textContent = `Analyzing ${state.visibleRows.length.toLocaleString()} transactions across ${headCount} accounts. ${netText}: ${formatCurrency(Math.abs(totals.net))}.`;
  if (els.heroStatus) els.heroStatus.innerHTML = `<span class="status-dot"></span> Live Operating View \u2014 ${state.grain.toUpperCase()} Grain`;
}

function runwayBadgeText(cashHealth) {
  if (!cashHealth?.hasEnoughHistory) return "Limited";
  if (cashHealth.status === "immediate") return "Immediate";
  if (cashHealth.status === "growing") return "Growing";
  if (cashHealth.status === "healthy") return "Healthy";
  if (cashHealth.status === "warning") return "Watch";
  return "Critical";
}

function cashHealthSummaryText(cashHealth) {
  if (!cashHealth?.hasEnoughHistory) return "Insufficient history (need 2+ full months).";
  const avgRevenue = formatCurrency(cashHealth.averageMonthlyRevenue);
  const avgOutflow = formatCurrency(cashHealth.averageMonthlyOutflow);
  if (cashHealth.status === "immediate") {
    return `Immediate attention. Monthly net burn: ${formatCurrency(cashHealth.monthlyNetBurn)}`;
  }
  if (cashHealth.status === "growing") {
    return `Cash generating. Avg rev ${avgRevenue}, avg outflow ${avgOutflow}.`;
  }
  const delta = Number.isFinite(cashHealth.runwayDeltaMonths)
    ? ` · ${cashHealth.runwayDeltaMonths >= 0 ? "+" : ""}${cashHealth.runwayDeltaMonths.toFixed(1)} mo vs prior window`
    : "";
  return `Monthly net burn: ${formatCurrency(cashHealth.monthlyNetBurn)} · Avg rev ${avgRevenue}${delta}`;
}
