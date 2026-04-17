import { describe, it, expect } from "vitest";
import { filterRecords, buildPeriodSummary, buildHeadSummary, compareLatestPeriods, detectOutflowAnomaly } from "../filter/filter.js";

function makeRecord(overrides) {
  return {
    id: `test-${Math.random()}`,
    date: new Date(2024, 2, 15),
    dateISO: "2024-03-15",
    periodDaily: "2024-03-15",
    periodWeekly: "2024-03-11",
    periodMonthly: "2024-03",
    head: "Sales",
    parent: "Income",
    description: "A sale",
    flow: "revenue",
    amount: 100,
    signedNet: 100,
    ...overrides
  };
}

const baseFilters = {
  startDate: "",
  endDate: "",
  search: "",
  flows: new Set(["revenue", "outflow"]),
  selectedHeads: new Set(),
  headSearch: "",
  focusedPeriod: "",
  focusedHead: ""
};

describe("filterRecords", () => {
  const records = [
    makeRecord({ dateISO: "2024-03-10", periodDaily: "2024-03-10", flow: "revenue", amount: 100, signedNet: 100, head: "Sales", parent: "Income", description: "March sale" }),
    makeRecord({ dateISO: "2024-03-15", periodDaily: "2024-03-15", flow: "outflow", amount: 50, signedNet: -50, head: "Rent", parent: "Expenses", description: "Office rent" }),
    makeRecord({ dateISO: "2024-04-01", periodDaily: "2024-04-01", flow: "revenue", amount: 200, signedNet: 200, head: "Consulting", parent: "Income", description: "April consulting" })
  ];

  it("returns all records with empty filters", () => {
    expect(filterRecords(records, baseFilters, "daily")).toHaveLength(3);
  });

  it("filters by start date", () => {
    const filters = { ...baseFilters, startDate: "2024-03-16" };
    expect(filterRecords(records, filters, "daily")).toHaveLength(1);
  });

  it("filters by end date", () => {
    const filters = { ...baseFilters, endDate: "2024-03-10" };
    expect(filterRecords(records, filters, "daily")).toHaveLength(1);
  });

  it("filters by date range", () => {
    const filters = { ...baseFilters, startDate: "2024-03-10", endDate: "2024-03-15" };
    expect(filterRecords(records, filters, "daily")).toHaveLength(2);
  });

  it("filters by flow type", () => {
    const filters = { ...baseFilters, flows: new Set(["revenue"]) };
    expect(filterRecords(records, filters, "daily")).toHaveLength(2);
  });

  it("filters by search text", () => {
    const filters = { ...baseFilters, search: "rent" };
    expect(filterRecords(records, filters, "daily")).toHaveLength(1);
  });

  it("filters by selected heads", () => {
    const filters = { ...baseFilters, selectedHeads: new Set(["Sales"]) };
    expect(filterRecords(records, filters, "daily")).toHaveLength(1);
  });

  it("filters by focused period", () => {
    const filters = { ...baseFilters, focusedPeriod: "2024-03-15" };
    expect(filterRecords(records, filters, "daily")).toHaveLength(1);
  });

  it("filters by focused head", () => {
    const filters = { ...baseFilters, focusedHead: "Rent" };
    expect(filterRecords(records, filters, "daily")).toHaveLength(1);
  });

  it("returns empty array when start > end", () => {
    const filters = { ...baseFilters, startDate: "2024-04-01", endDate: "2024-03-01" };
    expect(filterRecords(records, filters, "daily")).toHaveLength(0);
  });

  it("combines multiple filters", () => {
    const filters = { ...baseFilters, flows: new Set(["revenue"]), startDate: "2024-03-01", endDate: "2024-03-31" };
    const result = filterRecords(records, filters, "daily");
    expect(result).toHaveLength(1);
    expect(result[0].head).toBe("Sales");
  });

  it("handles empty records array", () => {
    expect(filterRecords([], baseFilters, "daily")).toEqual([]);
  });
});

describe("buildPeriodSummary", () => {
  it("groups records by period and sums amounts", () => {
    const records = [
      makeRecord({ flow: "revenue", amount: 100, signedNet: 100, periodDaily: "2024-03-15" }),
      makeRecord({ flow: "outflow", amount: 30, signedNet: -30, periodDaily: "2024-03-15" }),
      makeRecord({ flow: "revenue", amount: 200, signedNet: 200, periodDaily: "2024-03-16" })
    ];
    const summary = buildPeriodSummary(records, "daily");
    expect(summary).toHaveLength(2);
    expect(summary[0].period).toBe("2024-03-15");
    expect(summary[0].revenue).toBe(100);
    expect(summary[0].outflow).toBe(30);
    expect(summary[0].net).toBe(70);
  });

  it("sorts periods chronologically", () => {
    const records = [
      makeRecord({ periodDaily: "2024-03-16" }),
      makeRecord({ periodDaily: "2024-03-15" })
    ];
    const summary = buildPeriodSummary(records, "daily");
    expect(summary[0].period).toBe("2024-03-15");
  });
});

describe("buildHeadSummary", () => {
  it("groups records by head and sums amounts", () => {
    const records = [
      makeRecord({ head: "Sales", flow: "revenue", amount: 100, signedNet: 100, parent: "Income" }),
      makeRecord({ head: "Sales", flow: "outflow", amount: 20, signedNet: -20, parent: "Income" }),
      makeRecord({ head: "Rent", flow: "outflow", amount: 50, signedNet: -50, parent: "Expenses" })
    ];
    const summary = buildHeadSummary(records);
    expect(summary).toHaveLength(2);
    const sales = summary.find((s) => s.head === "Sales");
    expect(sales.revenue).toBe(100);
    expect(sales.outflow).toBe(20);
    expect(sales.parent).toBe("Income");
  });

  it("sorts by total activity descending", () => {
    const records = [
      makeRecord({ head: "Small", flow: "revenue", amount: 10, signedNet: 10 }),
      makeRecord({ head: "Big", flow: "revenue", amount: 500, signedNet: 500 })
    ];
    const summary = buildHeadSummary(records);
    expect(summary[0].head).toBe("Big");
  });
});

describe("compareLatestPeriods", () => {
  it("returns null for fewer than two periods", () => {
    expect(compareLatestPeriods([])).toBeNull();
    expect(compareLatestPeriods([{ revenue: 100, outflow: 50, net: 50 }])).toBeNull();
  });

  it("compares the last two periods", () => {
    const summary = [
      { revenue: 100, outflow: 50, net: 50 },
      { revenue: 150, outflow: 60, net: 90 }
    ];
    const result = compareLatestPeriods(summary);
    expect(result.revenueChange).toBe(50);
    expect(result.outflowChange).toBe(20);
  });
});

describe("detectOutflowAnomaly", () => {
  it("returns null for fewer than three periods", () => {
    expect(detectOutflowAnomaly([])).toBeNull();
    expect(detectOutflowAnomaly([{ outflow: 100 }, { outflow: 200 }])).toBeNull();
  });

  it("returns null when no period exceeds 1.5x average", () => {
    const summary = [
      { period: "p1", outflow: 100 },
      { period: "p2", outflow: 110 },
      { period: "p3", outflow: 105 }
    ];
    expect(detectOutflowAnomaly(summary)).toBeNull();
  });

  it("detects anomaly when a period exceeds 1.5x average", () => {
    const summary = [
      { period: "p1", outflow: 100 },
      { period: "p2", outflow: 100 },
      { period: "p3", outflow: 300 }
    ];
    const anomaly = detectOutflowAnomaly(summary);
    expect(anomaly).not.toBeNull();
    expect(anomaly.period).toBe("p3");
    expect(anomaly.multiple).toBeGreaterThan(1.5);
  });

  it("classifies severity as critical when exceeding 2x average", () => {
    const summary = [
      { period: "p1", outflow: 100 },
      { period: "p2", outflow: 100 },
      { period: "p3", outflow: 500 }
    ];
    const anomaly = detectOutflowAnomaly(summary);
    expect(anomaly.severity).toBe("critical");
  });

  it("classifies severity as warning when between 1.5x and 2x", () => {
    const summary = [
      { period: "p1", outflow: 100 },
      { period: "p2", outflow: 100 },
      { period: "p3", outflow: 250 }
    ];
    const anomaly = detectOutflowAnomaly(summary);
    expect(anomaly.severity).toBe("warning");
  });
});
