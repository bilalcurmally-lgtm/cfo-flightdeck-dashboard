import { els } from "../store/elements.js";
import { escapeHtml } from "../core/escape.js";
import { shareOf } from "../core/format.js";
import { formatCurrency } from "../config/currency.js";

const recurringKeywords = ["subscription", "recurring", "enterprise", "smb", "license", "saas", "mrr", "arr"];

export function renderSaasControls(periodSummary, headSummary, filtered, cashHealth) {
  const totals = periodSummary.reduce((acc, item) => {
    acc.revenue += item.revenue;
    acc.outflow += item.outflow;
    acc.net += item.net;
    return acc;
  }, { revenue: 0, outflow: 0, net: 0 });

  const recurringRevenue = filtered
    .filter((row) => row.flow === "revenue" && isRecurringRow(row))
    .reduce((sum, row) => sum + row.amount, 0);
  const recurringShare = totals.revenue ? (recurringRevenue / totals.revenue) * 100 : 0;

  const burn = Math.max(totals.outflow - totals.revenue, 0);
  const burnMultiple = totals.revenue ? burn / totals.revenue : 0;
  const outflowTotal = headSummary.reduce((sum, item) => sum + item.outflow, 0);
  const topThreeOutflows = [...headSummary]
    .sort((a, b) => b.outflow - a.outflow)
    .slice(0, 3)
    .reduce((sum, item) => sum + item.outflow, 0);
  const concentration = outflowTotal ? (topThreeOutflows / outflowTotal) * 100 : 0;
  const latest = periodSummary[periodSummary.length - 1];

  const controls = [
    {
      label: "Recurring signal",
      value: totals.revenue ? `${recurringShare.toFixed(0)}%` : "-",
      note: recurringRevenue > 0
        ? `${formatCurrency(recurringRevenue)} tagged as repeatable revenue`
        : "Add recurring, subscription, MRR, ARR, or license labels to classify"
    },
    {
      label: "Burn multiple",
      value: totals.revenue ? `${burnMultiple.toFixed(2)}x` : "-",
      note: burn > 0
        ? `${formatCurrency(burn)} net burn against selected revenue`
        : "Cash-generating in the active slice"
    },
    {
      label: "Avg monthly revenue",
      value: cashHealth?.hasEnoughHistory ? formatCurrency(cashHealth.averageMonthlyRevenue) : "-",
      note: cashHealth?.hasEnoughHistory ? `Based on ${cashHealth.monthsUsed.join(", ")}` : "Need at least 2 full months"
    },
    {
      label: "Avg monthly outflow",
      value: cashHealth?.hasEnoughHistory ? formatCurrency(cashHealth.averageMonthlyOutflow) : "-",
      note: cashHealth?.hasEnoughHistory ? `Net burn ${formatCurrency(cashHealth.monthlyNetBurn)}/mo` : "Need at least 2 full months"
    },
    {
      label: "Outflow concentration",
      value: outflowTotal ? `${concentration.toFixed(0)}%` : "-",
      note: outflowTotal ? "Share of outflows held by the top three heads" : "No outflow pressure in view"
    },
    {
      label: "Latest period net",
      value: latest ? formatCurrency(latest.net) : "-",
      note: latest ? `${formatCurrency(latest.revenue)} revenue vs ${formatCurrency(latest.outflow)} outflow` : "No period data"
    }
  ];

  els.saasControls.innerHTML = controls.map((item) => `
    <article class="saas-control">
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.value)}</strong>
      <small>${escapeHtml(item.note)}</small>
    </article>
  `).join("");
}

function isRecurringRow(row) {
  const haystack = `${row.head} ${row.parent} ${row.description}`.toLowerCase();
  return recurringKeywords.some((keyword) => haystack.includes(keyword));
}
