import { describe, expect, it } from "vitest";
import { computeFinanceView, normalizeWorkerFilters } from "../finance/finance-view.js";

function record(overrides) {
  return {
    id: overrides.id || `row-${Math.random()}`,
    date: new Date(`${overrides.dateISO}T00:00:00`),
    dateISO: overrides.dateISO,
    periodDaily: overrides.dateISO,
    periodWeekly: overrides.periodWeekly || overrides.dateISO,
    periodMonthly: overrides.dateISO.slice(0, 7),
    head: overrides.head,
    parent: overrides.parent || "Operations",
    description: overrides.description || "",
    flow: overrides.flow,
    amount: overrides.amount,
    signedNet: overrides.flow === "revenue" ? overrides.amount : -overrides.amount
  };
}

describe("normalizeWorkerFilters", () => {
  it("turns serialized filter arrays back into Sets", () => {
    const filters = normalizeWorkerFilters({
      flows: ["revenue"],
      selectedHeads: ["Subscriptions"],
      search: "annual"
    });

    expect(filters.flows).toBeInstanceOf(Set);
    expect(filters.flows.has("revenue")).toBe(true);
    expect(filters.selectedHeads).toBeInstanceOf(Set);
    expect(filters.selectedHeads.has("Subscriptions")).toBe(true);
    expect(filters.search).toBe("annual");
  });
});

describe("computeFinanceView", () => {
  it("returns filtered rows, summaries, and cash health from serialized worker payloads", () => {
    const records = [
      record({ id: "jan-rev", dateISO: "2026-01-05", head: "Subscriptions", flow: "revenue", amount: 10000, description: "annual plan" }),
      record({ id: "jan-out", dateISO: "2026-01-08", head: "Payroll", flow: "outflow", amount: 16000 }),
      record({ id: "feb-rev", dateISO: "2026-02-05", head: "Subscriptions", flow: "revenue", amount: 12000, description: "annual plan" }),
      record({ id: "feb-out", dateISO: "2026-02-08", head: "Payroll", flow: "outflow", amount: 18000 }),
      record({ id: "mar-rev", dateISO: "2026-03-05", head: "Subscriptions", flow: "revenue", amount: 11000, description: "annual plan" }),
      record({ id: "mar-out", dateISO: "2026-03-08", head: "Payroll", flow: "outflow", amount: 20000 }),
      record({ id: "apr-rev", dateISO: "2026-04-03", head: "Subscriptions", flow: "revenue", amount: 9000, description: "annual plan" })
    ];

    const view = computeFinanceView({
      records,
      grain: "monthly",
      currentBankBalance: 60000,
      filters: {
        startDate: "2026-01-01",
        endDate: "2026-04-30",
        search: "",
        flows: ["revenue", "outflow"],
        selectedHeads: [],
        focusedPeriod: "",
        focusedHead: ""
      }
    });

    expect(view.filtered).toHaveLength(7);
    expect(view.periodSummary.map((item) => item.period)).toEqual(["2026-01", "2026-02", "2026-03", "2026-04"]);
    expect(view.headSummary[0].head).toBe("Payroll");
    expect(view.cashHealth.monthsUsed).toEqual(["2026-01", "2026-02", "2026-03"]);
    expect(view.cashHealth.monthlyNetBurn).toBeCloseTo(7000, 4);
    expect(view.cashHealth.runwayMonths).toBeCloseTo(8.5714, 4);
  });
});
