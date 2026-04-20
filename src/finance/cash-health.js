export function buildCashHealthSummary({ rows = [], currentBankBalance = 0, windowSize = 3 } = {}) {
  const monthly = buildMonthlyGroups(rows);
  const fullMonths = monthly.length > 1 ? monthly.slice(0, -1) : [];
  const targetMonths = fullMonths.slice(-windowSize);
  const hasEnoughHistory = targetMonths.length >= 2;

  const base = {
    currentBankBalance,
    hasEnoughHistory,
    monthsUsed: targetMonths.map(([month]) => month),
    averageMonthlyRevenue: 0,
    averageMonthlyOutflow: 0,
    monthlyNetBurn: 0,
    runwayMonths: null,
    previousRunwayMonths: null,
    runwayDeltaMonths: null,
    status: hasEnoughHistory ? "unknown" : "insufficient-history"
  };

  if (!hasEnoughHistory) return base;

  const current = calculateWindow(targetMonths, currentBankBalance);
  const previousWindow = fullMonths.slice(-windowSize - 1, -1);
  const previous = previousWindow.length >= 2
    ? calculateWindow(previousWindow.slice(-windowSize), currentBankBalance)
    : null;

  const status = statusFor(currentBankBalance, current.monthlyNetBurn, current.runwayMonths);
  const previousRunwayMonths = Number.isFinite(previous?.runwayMonths) ? previous.runwayMonths : null;
  const runwayDeltaMonths = Number.isFinite(current.runwayMonths) && Number.isFinite(previousRunwayMonths)
    ? current.runwayMonths - previousRunwayMonths
    : null;

  return {
    ...base,
    ...current,
    previousRunwayMonths,
    runwayDeltaMonths,
    status
  };
}

function buildMonthlyGroups(rows) {
  const groups = new Map();
  rows.forEach((row) => {
    if (!row.dateISO) return;
    const month = row.dateISO.slice(0, 7);
    if (!groups.has(month)) groups.set(month, { revenue: 0, outflow: 0 });
    const group = groups.get(month);
    if (row.flow === "revenue") group.revenue += row.amount || 0;
    if (row.flow === "outflow") group.outflow += row.amount || 0;
  });

  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
}

function calculateWindow(months, currentBankBalance) {
  const total = months.reduce((acc, [, month]) => {
    acc.revenue += month.revenue;
    acc.outflow += month.outflow;
    return acc;
  }, { revenue: 0, outflow: 0 });
  const averageMonthlyRevenue = total.revenue / months.length;
  const averageMonthlyOutflow = total.outflow / months.length;
  const monthlyNetBurn = averageMonthlyOutflow - averageMonthlyRevenue;
  const runwayMonths = monthlyNetBurn <= 0
    ? Infinity
    : currentBankBalance / monthlyNetBurn;

  return {
    monthsUsed: months.map(([month]) => month),
    averageMonthlyRevenue,
    averageMonthlyOutflow,
    monthlyNetBurn,
    runwayMonths
  };
}

function statusFor(currentBankBalance, monthlyNetBurn, runwayMonths) {
  if (currentBankBalance <= 0) return "immediate";
  if (monthlyNetBurn <= 0) return "growing";
  if (!Number.isFinite(runwayMonths)) return "growing";
  if (runwayMonths < 6) return "critical";
  if (runwayMonths <= 12) return "warning";
  return "healthy";
}
