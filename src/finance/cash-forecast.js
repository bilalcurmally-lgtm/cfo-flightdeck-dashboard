import { startOfWeek, toIsoDate } from "../core/date.js";

export function buildCashForecast({
  records = [],
  currentBankBalance = 0,
  balanceAsOf = "",
  manualEvents = [],
  weeks = 13,
  baselineWeeks = 8
} = {}) {
  const startDate = startOfWeek(parseIsoDate(balanceAsOf) || new Date());
  const baseline = buildBaseline(records, startDate, baselineWeeks);
  const events = normalizeManualEvents(manualEvents);
  let runningCash = Number(currentBankBalance) || 0;
  const buckets = [];
  let minimumCash = runningCash;
  let minimumCashWeek = toIsoDate(startDate);
  let cashOutDate = null;

  for (let index = 0; index < weeks; index += 1) {
    const weekStartDate = addDays(startDate, index * 7);
    const nextWeekDate = addDays(weekStartDate, 7);
    const weekStart = toIsoDate(weekStartDate);
    const baselineWeek = baseline.weeklyPattern[index % Math.max(1, baseline.weeklyPattern.length)] || {
      inflow: baseline.averageWeeklyInflow,
      outflow: baseline.averageWeeklyOutflow
    };
    const matchingEvents = events.filter((event) => {
      const eventDate = parseIsoDate(event.date);
      return eventDate && eventDate >= weekStartDate && eventDate < nextWeekDate;
    });
    const manualInflow = matchingEvents
      .filter((event) => event.flow === "cash in")
      .reduce((sum, event) => sum + event.amount, 0);
    const manualOutflow = matchingEvents
      .filter((event) => event.flow === "cash out")
      .reduce((sum, event) => sum + event.amount, 0);

    runningCash += baselineWeek.inflow - baselineWeek.outflow + manualInflow - manualOutflow;
    if (runningCash < minimumCash) {
      minimumCash = runningCash;
      minimumCashWeek = weekStart;
    }
    if (!cashOutDate && runningCash < 0) {
      cashOutDate = weekStart;
    }

    buckets.push({
      weekStart,
      expectedInflow: baselineWeek.inflow,
      expectedOutflow: baselineWeek.outflow,
      manualInflow,
      manualOutflow,
      endingCash: runningCash,
      events: matchingEvents
    });
  }

  return {
    startingCash: Number(currentBankBalance) || 0,
    startWeek: toIsoDate(startDate),
    weeks: buckets,
    minimumCash,
    minimumCashWeek,
    cashOutDate,
    endingCash: runningCash,
    averageWeeklyInflow: baseline.averageWeeklyInflow,
    averageWeeklyOutflow: baseline.averageWeeklyOutflow,
    baselineWeeksUsed: baseline.weeksUsed,
    baselineWeeks,
    hasLimitedHistory: baseline.weeksUsed < Math.min(4, baselineWeeks)
  };
}

function buildBaseline(records, forecastStartDate, baselineWeeks) {
  const completed = records
    .filter((record) => record.date instanceof Date && record.date < forecastStartDate)
    .reduce((map, record) => {
      const weekStart = toIsoDate(startOfWeek(record.date));
      const bucket = map.get(weekStart) || { inflow: 0, outflow: 0 };
      if (record.flow === "revenue") bucket.inflow += record.amount;
      if (record.flow === "outflow") bucket.outflow += record.amount;
      map.set(weekStart, bucket);
      return map;
    }, new Map());

  const latestWeeks = Array.from(completed.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-baselineWeeks)
    .map(([, bucket]) => bucket);

  if (!latestWeeks.length) {
    return {
      averageWeeklyInflow: 0,
      averageWeeklyOutflow: 0,
      weeklyPattern: [],
      weeksUsed: 0
    };
  }

  return {
    averageWeeklyInflow: latestWeeks.reduce((sum, item) => sum + item.inflow, 0) / latestWeeks.length,
    averageWeeklyOutflow: latestWeeks.reduce((sum, item) => sum + item.outflow, 0) / latestWeeks.length,
    weeklyPattern: latestWeeks,
    weeksUsed: latestWeeks.length
  };
}

export function normalizeManualEvents(events = []) {
  return events.map((event) => ({
    id: event.id || createEventId(),
    date: event.date || "",
    flow: event.flow === "cash out" ? "cash out" : "cash in",
    amount: Math.max(0, Number(event.amount) || 0),
    label: String(event.label || "").trim()
  })).filter((event) => event.date && event.amount > 0);
}

export function createEventId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `forecast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function parseIsoDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}
