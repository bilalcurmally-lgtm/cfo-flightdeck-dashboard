import { grainKey } from "../core/date.js";
import { groupBy } from "../core/format.js";

export function filterRecords(records, filters, grain) {
  return records.filter((record) => {
    const withinStart = !filters.startDate || record.dateISO >= filters.startDate;
    const withinEnd = !filters.endDate || record.dateISO <= filters.endDate;
    const matchesSearch = !filters.search || [
      record.head,
      record.parent,
      record.description,
      record.flow
    ].join(" ").toLowerCase().includes(filters.search);
    const matchesFlow = filters.flows.has(record.flow);
    const matchesHeads = !filters.selectedHeads.size || filters.selectedHeads.has(record.head);
    const periodKey = grainKey(record, grain);
    const matchesPeriod = !filters.focusedPeriod || periodKey === filters.focusedPeriod;
    const matchesFocusedHead = !filters.focusedHead || record.head === filters.focusedHead;
    return withinStart && withinEnd && matchesSearch && matchesFlow && matchesHeads && matchesPeriod && matchesFocusedHead;
  });
}

export function buildPeriodSummary(records, grain) {
  return Array.from(groupBy(records, (record) => grainKey(record, grain)), ([period, rows]) => ({
    period,
    revenue: rows.filter((row) => row.flow === "revenue").reduce((sum, row) => sum + row.amount, 0),
    outflow: rows.filter((row) => row.flow === "outflow").reduce((sum, row) => sum + row.amount, 0),
    net: rows.reduce((sum, row) => sum + row.signedNet, 0)
  })).sort((a, b) => a.period.localeCompare(b.period));
}

export function buildHeadSummary(records) {
  return Array.from(groupBy(records, (record) => record.head), ([head, rows]) => ({
    head,
    revenue: rows.filter((row) => row.flow === "revenue").reduce((sum, row) => sum + row.amount, 0),
    outflow: rows.filter((row) => row.flow === "outflow").reduce((sum, row) => sum + row.amount, 0),
    parent: rows[0].parent
  })).sort((a, b) => (b.revenue + b.outflow) - (a.revenue + a.outflow));
}

export function compareLatestPeriods(periodSummary) {
  if (periodSummary.length < 2) return null;
  const current = periodSummary[periodSummary.length - 1];
  const previous = periodSummary[periodSummary.length - 2];
  return {
    revenueChange: percentChange(current.revenue, previous.revenue),
    outflowChange: percentChange(current.outflow, previous.outflow),
    netChange: percentChange(current.net, previous.net)
  };
}

export function detectOutflowAnomaly(periodSummary) {
  if (periodSummary.length < 3) return null;
  const avgOutflow = periodSummary.reduce((sum, item) => sum + item.outflow, 0) / periodSummary.length;
  const biggest = [...periodSummary].sort((a, b) => b.outflow - a.outflow)[0];
  if (!avgOutflow || biggest.outflow < avgOutflow * 1.5) return null;
  return {
    period: biggest.period,
    outflow: biggest.outflow,
    multiple: biggest.outflow / avgOutflow,
    severity: biggest.outflow > avgOutflow * 2 ? "critical" : "warning"
  };
}

function percentChange(current, previous) {
  if (!previous) return current ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}
