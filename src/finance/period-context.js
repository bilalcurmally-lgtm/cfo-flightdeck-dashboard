export function buildPeriodContext(periodSummary) {
  return periodSummary.map((item, index) => {
    const previous = periodSummary[index - 1];
    if (!previous) return { ...item, variance: null };

    return {
      ...item,
      variance: {
        revenueChange: percentChange(item.revenue, previous.revenue),
        outflowChange: percentChange(item.outflow, previous.outflow),
        netChange: percentChange(item.net, previous.net),
        efficiencyChange: efficiencyChange(item, previous)
      }
    };
  });
}

function efficiencyChange(current, previous) {
  if (!previous.outflow) return null;
  const currentEfficiency = current.outflow ? current.revenue / current.outflow : Infinity;
  const previousEfficiency = previous.revenue / previous.outflow;
  if (!Number.isFinite(currentEfficiency) || !Number.isFinite(previousEfficiency)) return null;
  return percentChange(currentEfficiency, previousEfficiency);
}

function percentChange(current, previous) {
  if (!previous) return current ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}
