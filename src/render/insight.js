import { state } from "../store/state.js";
import { els } from "../store/elements.js";
import { escapeHtml } from "../core/escape.js";
import { humanPeriodLabel } from "../core/date.js";
import { groupBy, shareOf } from "../core/format.js";
import { detectOutflowAnomaly } from "../filter/filter.js";
import { formatCurrency } from "../config/currency.js";
import { detectLargeTransactions } from "../finance/anomaly.js";
import { staggerChildren } from "./motion.js";

export function renderInsights(periodSummary, headSummary, filtered, cashHealth, cashForecast) {
  const items = [];
  const topRevenueHead = [...headSummary].sort((a, b) => b.revenue - a.revenue)[0];
  const topOutflowHead = [...headSummary].sort((a, b) => b.outflow - a.outflow)[0];
  const worstPeriod = [...periodSummary].sort((a, b) => a.net - b.net)[0];
  const bestPeriod = [...periodSummary].sort((a, b) => b.net - a.net)[0];
  const outflowTotal = headSummary.reduce((sum, item) => sum + item.outflow, 0);
  const topThreeOutflows = [...headSummary].sort((a, b) => b.outflow - a.outflow).slice(0, 3).reduce((sum, item) => sum + item.outflow, 0);
  const concentration = outflowTotal ? (topThreeOutflows / outflowTotal) * 100 : 0;
  const anomaly = detectOutflowAnomaly(periodSummary);
  const largeTransactions = detectLargeTransactions(filtered);
  const recurringRevenue = filtered
    .filter((row) => row.flow === "revenue" && isRecurringRow(row))
    .reduce((sum, row) => sum + row.amount, 0);
  const revenueTotal = headSummary.reduce((sum, item) => sum + item.revenue, 0);
  const recurringShare = revenueTotal ? (recurringRevenue / revenueTotal) * 100 : 0;

  if (state.dataQuality.skippedRows > 0 || state.dataQuality.unknownFlowLabels.length > 0) {
    const unknown = state.dataQuality.unknownFlowLabels.length
      ? ` Unknown flow labels: ${state.dataQuality.unknownFlowLabels.join(", ")}.`
      : "";
    items.push({
      level: "warning",
      title: "Data quality needs review",
      body: `${state.dataQuality.skippedRows.toLocaleString()} rows were skipped.${unknown}`
    });
  }
  if (cashForecast) {
    items.push(cashForecastInsight(cashForecast));
  }
  if (recurringRevenue > 0 && revenueTotal > 0) {
    items.push({
      level: recurringShare >= 50 ? "normal" : "warning",
      title: `Recurring revenue signal is ${recurringShare.toFixed(0)}%`,
      body: `${formatCurrency(recurringRevenue)} of selected revenue is tagged as subscription, recurring, SaaS, MRR, ARR, license, enterprise, or SMB.`
    });
  }
  if (topRevenueHead && topRevenueHead.revenue > 0) {
    items.push({
      level: "normal",
      title: `Revenue is led by ${topRevenueHead.head}`,
      body: `${formatCurrency(topRevenueHead.revenue)} contributed from this head, ${shareOf(topRevenueHead.revenue, headSummary.reduce((sum, item) => sum + item.revenue, 0))} of selected revenue.`
    });
  }
  if (topOutflowHead && topOutflowHead.outflow > 0) {
    items.push({
      level: topOutflowHead.outflow > outflowTotal * 0.35 ? "warning" : "normal",
      title: `${topOutflowHead.head} is your biggest cash pull`,
      body: `${formatCurrency(topOutflowHead.outflow)} left through this head, ${shareOf(topOutflowHead.outflow, outflowTotal)} of total outflows.`
    });
  }
  if (bestPeriod) {
    items.push({
      level: bestPeriod.net >= 0 ? "normal" : "warning",
      title: `Best ${state.grain} period: ${humanPeriodLabel(bestPeriod.period, state.grain)}`,
      body: `Net cash reached ${formatCurrency(bestPeriod.net)} on revenue of ${formatCurrency(bestPeriod.revenue)}.`
    });
  }
  if (worstPeriod) {
    items.push({
      level: worstPeriod.net < 0 ? "critical" : "normal",
      title: `Weakest ${state.grain} period: ${humanPeriodLabel(worstPeriod.period, state.grain)}`,
      body: `Net cash landed at ${formatCurrency(worstPeriod.net)} with outflows of ${formatCurrency(worstPeriod.outflow)}.`
    });
  }
  if (anomaly) {
    items.push({
      level: anomaly.severity,
      title: `Outflow spike detected in ${humanPeriodLabel(anomaly.period, state.grain)}`,
      body: `${formatCurrency(anomaly.outflow)} of outflows, ${anomaly.multiple.toFixed(1)}x the average selected period. Click the trend chart to inspect it.`
    });
  }
  largeTransactions.forEach((transaction) => {
    items.push({
      level: "warning",
      title: `Large ${transaction.flow} item: ${transaction.head}`,
      body: `${formatCurrency(transaction.amount)} on ${transaction.dateISO}, ${transaction.multiple.toFixed(1)}x the median visible transaction. ${transaction.description}`
    });
  });
  if (outflowTotal > 0) {
    items.push({
      level: concentration > 65 ? "warning" : "normal",
      title: "Outflows are concentrated",
      body: `Top three heads account for ${concentration.toFixed(1)}% of cash outflows in the current slice.`
    });
  }

  if (cashHealth?.hasEnoughHistory) {
    items.unshift(cashHealthInsight(cashHealth));
  }

  if (!items.length && filtered.length) {
    items.push({
      level: "normal",
      title: "Slice is loaded",
      body: `${filtered.length.toLocaleString()} rows are visible. Start drilling into a period or head for deeper insight.`
    });
  }

  const groups = [
    ["Critical", items.filter((item) => item.level === "critical")],
    ["Watch", items.filter((item) => item.level === "warning")],
    ["Positive", items.filter((item) => item.level === "normal" && isPositiveSignal(item))],
    ["Context", items.filter((item) => item.level === "normal" && !isPositiveSignal(item))]
  ].filter(([, groupItems]) => groupItems.length);

  els.insightList.innerHTML = groups.map(([group, groupItems]) => `
    <section class="insight-group">
      <h4>${escapeHtml(group)}</h4>
      <div>
        ${groupItems.map((item) => `
          <article class="insight-item ${item.level}">
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.body)}</span>
          </article>
        `).join("")}
      </div>
    </section>
  `).join("");
  staggerChildren(els.insightList, ".insight-item");
}

function isPositiveSignal(item) {
  return /positive|growing|best|recurring|led by|stays positive/i.test(item.title);
}

function cashForecastInsight(cashForecast) {
  if (cashForecast.cashOutDate) {
    return {
      level: "critical",
      title: `13-week forecast crosses below zero`,
      body: `Projected cash turns negative in the week of ${cashForecast.cashOutDate}. Ending cash is ${formatCurrency(cashForecast.endingCash)} after manual events and recent run-rate.`
    };
  }

  const weeklyNetBurn = cashForecast.averageWeeklyOutflow - cashForecast.averageWeeklyInflow;
  const threeMonthBurn = weeklyNetBurn > 0 ? weeklyNetBurn * 13 : 0;
  if (threeMonthBurn > 0 && cashForecast.minimumCash < threeMonthBurn) {
    return {
      level: "warning",
      title: "13-week forecast is tight",
      body: `Lowest projected cash is ${formatCurrency(cashForecast.minimumCash)} in the week of ${cashForecast.minimumCashWeek}, below roughly three months of current net burn.`
    };
  }

  return {
    level: cashForecast.hasLimitedHistory ? "warning" : "normal",
    title: "13-week forecast stays positive",
    body: `Projected ending cash is ${formatCurrency(cashForecast.endingCash)}. Baseline uses ${cashForecast.baselineWeeksUsed} completed historical weeks plus manual events.`
  };
}

function cashHealthInsight(cashHealth) {
  if (cashHealth.status === "immediate") {
    return {
      level: "critical",
      title: "Cash balance needs attention",
      body: `Current bank balance is ${formatCurrency(cashHealth.currentBankBalance)} with monthly net burn of ${formatCurrency(cashHealth.monthlyNetBurn)}. Enter a realistic balance to calculate runway.`
    };
  }
  if (cashHealth.status === "growing") {
    return {
      level: "normal",
      title: "Cash position is growing",
      body: `Average monthly revenue is ${formatCurrency(cashHealth.averageMonthlyRevenue)} against ${formatCurrency(cashHealth.averageMonthlyOutflow)} of average outflow. Runway is effectively unlimited at current burn.`
    };
  }
  const delta = Number.isFinite(cashHealth.runwayDeltaMonths)
    ? ` Runway ${cashHealth.runwayDeltaMonths >= 0 ? "improved" : "worsened"} by ${Math.abs(cashHealth.runwayDeltaMonths).toFixed(1)} months versus the prior window.`
    : "";
  return {
    level: cashHealth.status === "critical" ? "critical" : (cashHealth.status === "warning" ? "warning" : "normal"),
    title: `Cash runway is ${cashHealth.runwayMonths.toFixed(1)} months`,
    body: `Monthly net burn is ${formatCurrency(cashHealth.monthlyNetBurn)} based on ${cashHealth.monthsUsed.join(", ")}.${delta}${cashHealth.runwayMonths < 9 ? " Review the largest outflow heads." : ""}`
  };
}

function isRecurringRow(row) {
  const haystack = `${row.head} ${row.parent} ${row.description}`.toLowerCase();
  return ["subscription", "recurring", "enterprise", "smb", "license", "saas", "mrr", "arr"].some((keyword) => haystack.includes(keyword));
}

export function renderFocus(filtered, headSummary) {
  const hasFocusedSlice = Boolean(state.filters.focusedPeriod || state.filters.focusedHead || state.filters.selectedHeads.size);
  if (els.focusPanel) els.focusPanel.hidden = !hasFocusedSlice;
  if (!hasFocusedSlice) {
    els.focusStats.innerHTML = "";
    return;
  }

  const parentSummary = Array.from(groupBy(filtered, (record) => record.parent), ([parent, rows]) => ({
    parent,
    revenue: rows.filter((row) => row.flow === "revenue").reduce((sum, row) => sum + row.amount, 0),
    outflow: rows.filter((row) => row.flow === "outflow").reduce((sum, row) => sum + row.amount, 0)
  })).sort((a, b) => (b.revenue + b.outflow) - (a.revenue + a.outflow)).slice(0, 4);

  const headCount = new Set(filtered.map((row) => row.head)).size;
  const parentCount = new Set(filtered.map((row) => row.parent)).size;
  const largestParent = parentSummary[0];
  const largestHead = headSummary[0];
  const items = [
    { title: "Visible rows", body: `${filtered.length.toLocaleString()} transactions in play.` },
    { title: "Heads in slice", body: `${headCount.toLocaleString()} account heads across ${parentCount.toLocaleString()} parent groups.` }
  ];
  if (largestParent) items.push({ title: `Largest parent group: ${largestParent.parent}`, body: `Revenue ${formatCurrency(largestParent.revenue)}, outflow ${formatCurrency(largestParent.outflow)}.` });
  if (largestHead) items.push({ title: `Most active head: ${largestHead.head}`, body: `Revenue ${formatCurrency(largestHead.revenue)}, outflow ${formatCurrency(largestHead.outflow)}.` });

  els.focusStats.innerHTML = items.map((item) => `
    <article class="focus-item">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.body)}</span>
    </article>
  `).join("");
  staggerChildren(els.focusStats, ".focus-item");
}

export function renderPressureList(headSummary) {
  const topPressure = [...headSummary].filter((item) => item.outflow > 0).sort((a, b) => b.outflow - a.outflow).slice(0, 6);
  if (!topPressure.length) {
    els.pressureList.innerHTML = `<div class="chart-empty">No outflows in this slice.</div>`;
    return;
  }

  const totalOutflow = topPressure.reduce((sum, item) => sum + item.outflow, 0);
  const totalGlobalOutflow = headSummary.reduce((sum, item) => sum + item.outflow, 0);

  els.pressureList.innerHTML = topPressure.map((item) => {
    const share = totalGlobalOutflow ? item.outflow / totalGlobalOutflow : 0;
    const isWarning = item.outflow > totalOutflow * 0.3;
    return `
    <article class="pressure-item ${isWarning ? "warning" : ""}">
      <strong>${escapeHtml(item.head)}</strong>
      <div>${formatCurrency(item.outflow)} outflow, ${shareOf(item.outflow, totalGlobalOutflow)} of total selected outflows.</div>
      <div class="pressure-meter" aria-hidden="true"><span style="--pressure-share:${Math.max(0.04, Math.min(1, share)).toFixed(3)}"></span></div>
    </article>
  `;
  }).join("");
  staggerChildren(els.pressureList, ".pressure-item");
}
