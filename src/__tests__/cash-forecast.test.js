import { describe, expect, it } from "vitest";
import { buildCashForecast } from "../finance/cash-forecast.js";

function row(dateISO, flow, amount) {
  const date = new Date(`${dateISO}T00:00:00`);
  return {
    date,
    dateISO,
    flow,
    amount,
    signedNet: flow === "revenue" ? amount : -amount
  };
}

describe("buildCashForecast", () => {
  it("builds 13 weekly buckets from the balance date", () => {
    const forecast = buildCashForecast({
      records: [
        row("2026-01-05", "revenue", 1000),
        row("2026-01-06", "outflow", 600),
        row("2026-01-12", "revenue", 1200),
        row("2026-01-13", "outflow", 700)
      ],
      currentBankBalance: 10000,
      balanceAsOf: "2026-01-20"
    });

    expect(forecast.weeks).toHaveLength(13);
    expect(forecast.weeks[0].weekStart).toBe("2026-01-19");
    expect(forecast.startingCash).toBe(10000);
  });

  it("averages the last completed weeks with data", () => {
    const forecast = buildCashForecast({
      records: [
        row("2025-12-29", "revenue", 1000),
        row("2025-12-30", "outflow", 400),
        row("2026-01-05", "revenue", 2000),
        row("2026-01-06", "outflow", 800),
        row("2026-01-12", "revenue", 3000),
        row("2026-01-13", "outflow", 1200)
      ],
      currentBankBalance: 5000,
      balanceAsOf: "2026-01-20",
      baselineWeeks: 2
    });

    expect(forecast.averageWeeklyInflow).toBe(2500);
    expect(forecast.averageWeeklyOutflow).toBe(1000);
    expect(forecast.baselineWeeksUsed).toBe(2);
    expect(forecast.hasLimitedHistory).toBe(false);
  });

  it("uses the recent weekly rhythm so forecast net bars can vary from CSV data", () => {
    const forecast = buildCashForecast({
      records: [
        row("2026-01-05", "revenue", 1000),
        row("2026-01-06", "outflow", 500),
        row("2026-01-12", "revenue", 5000),
        row("2026-01-13", "outflow", 1000),
        row("2026-01-19", "revenue", 1500),
        row("2026-01-20", "outflow", 2500)
      ],
      currentBankBalance: 10000,
      balanceAsOf: "2026-01-26",
      baselineWeeks: 3
    });

    expect(forecast.weeks.slice(0, 3).map((week) => week.expectedInflow)).toEqual([1000, 5000, 1500]);
    expect(forecast.weeks.slice(0, 3).map((week) => week.expectedOutflow)).toEqual([500, 1000, 2500]);
    expect(new Set(forecast.weeks.slice(0, 3).map((week) => week.expectedInflow - week.expectedOutflow)).size).toBeGreaterThan(1);
  });

  it("applies manual cash events to the matching forecast week", () => {
    const forecast = buildCashForecast({
      records: [
        row("2026-01-05", "revenue", 1000),
        row("2026-01-06", "outflow", 600)
      ],
      currentBankBalance: 1000,
      balanceAsOf: "2026-01-12",
      manualEvents: [
        { id: "evt-1", date: "2026-01-14", flow: "cash in", amount: 500, label: "Customer prepay" },
        { id: "evt-2", date: "2026-01-21", flow: "cash out", amount: 300, label: "Tax payment" }
      ]
    });

    expect(forecast.weeks[0].manualInflow).toBe(500);
    expect(forecast.weeks[0].manualOutflow).toBe(0);
    expect(forecast.weeks[1].manualInflow).toBe(0);
    expect(forecast.weeks[1].manualOutflow).toBe(300);
  });

  it("detects when projected cash crosses below zero", () => {
    const forecast = buildCashForecast({
      records: [
        row("2026-01-05", "revenue", 100),
        row("2026-01-06", "outflow", 500)
      ],
      currentBankBalance: 300,
      balanceAsOf: "2026-01-12"
    });

    expect(forecast.cashOutDate).toBe("2026-01-12");
    expect(forecast.minimumCash).toBeLessThan(0);
  });

  it("handles missing history without crashing", () => {
    const forecast = buildCashForecast({
      records: [],
      currentBankBalance: 1200,
      balanceAsOf: "2026-01-12"
    });

    expect(forecast.averageWeeklyInflow).toBe(0);
    expect(forecast.averageWeeklyOutflow).toBe(0);
    expect(forecast.hasLimitedHistory).toBe(true);
    expect(forecast.endingCash).toBe(1200);
  });
});
