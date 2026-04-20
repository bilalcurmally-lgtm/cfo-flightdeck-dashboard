import { describe, expect, it } from "vitest";
import { buildCashHealthSummary } from "../finance/cash-health.js";

function row(dateISO, flow, amount) {
  return {
    dateISO,
    flow,
    amount
  };
}

describe("buildCashHealthSummary", () => {
  it("flags zero balance as immediate attention while still calculating burn", () => {
    const summary = buildCashHealthSummary({
      rows: [
        row("2026-01-05", "revenue", 10000),
        row("2026-01-08", "outflow", 20000),
        row("2026-02-05", "revenue", 12000),
        row("2026-02-08", "outflow", 21000),
        row("2026-03-05", "revenue", 11000),
        row("2026-03-08", "outflow", 23000),
        row("2026-04-02", "revenue", 9000)
      ],
      currentBankBalance: 0
    });

    expect(summary.status).toBe("immediate");
    expect(summary.monthlyNetBurn).toBeCloseTo(10333.3333, 4);
    expect(summary.runwayMonths).toBe(0);
    expect(summary.hasEnoughHistory).toBe(true);
  });

  it("calculates runway from the last three full calendar months", () => {
    const summary = buildCashHealthSummary({
      rows: [
        row("2026-01-05", "revenue", 10000),
        row("2026-01-08", "outflow", 20000),
        row("2026-02-05", "revenue", 12000),
        row("2026-02-08", "outflow", 21000),
        row("2026-03-05", "revenue", 11000),
        row("2026-03-08", "outflow", 23000),
        row("2026-04-02", "revenue", 9000)
      ],
      currentBankBalance: 93000
    });

    expect(summary.monthsUsed).toEqual(["2026-01", "2026-02", "2026-03"]);
    expect(summary.averageMonthlyRevenue).toBe(11000);
    expect(summary.averageMonthlyOutflow).toBe(21333.333333333332);
    expect(summary.monthlyNetBurn).toBeCloseTo(10333.3333, 4);
    expect(summary.runwayMonths).toBeCloseTo(9, 4);
    expect(summary.status).toBe("warning");
  });

  it("marks cash-generating slices as infinite runway", () => {
    const summary = buildCashHealthSummary({
      rows: [
        row("2026-01-05", "revenue", 30000),
        row("2026-01-08", "outflow", 20000),
        row("2026-02-05", "revenue", 31000),
        row("2026-02-08", "outflow", 21000),
        row("2026-03-05", "revenue", 32000),
        row("2026-03-08", "outflow", 22000),
        row("2026-04-02", "revenue", 9000)
      ],
      currentBankBalance: 50000
    });

    expect(summary.monthlyNetBurn).toBe(-10000);
    expect(summary.runwayMonths).toBe(Infinity);
    expect(summary.status).toBe("growing");
  });

  it("requires at least two full months before reporting runway", () => {
    const summary = buildCashHealthSummary({
      rows: [
        row("2026-03-05", "revenue", 11000),
        row("2026-03-08", "outflow", 23000),
        row("2026-04-02", "revenue", 9000)
      ],
      currentBankBalance: 50000
    });

    expect(summary.hasEnoughHistory).toBe(false);
    expect(summary.status).toBe("insufficient-history");
    expect(summary.runwayMonths).toBeNull();
  });

  it("compares runway with the prior monthly window when available", () => {
    const summary = buildCashHealthSummary({
      rows: [
        row("2026-01-05", "revenue", 10000),
        row("2026-01-08", "outflow", 25000),
        row("2026-02-05", "revenue", 12000),
        row("2026-02-08", "outflow", 24000),
        row("2026-03-05", "revenue", 11000),
        row("2026-03-08", "outflow", 23000),
        row("2026-04-05", "revenue", 14000),
        row("2026-04-08", "outflow", 22000),
        row("2026-05-03", "revenue", 5000)
      ],
      currentBankBalance: 93000
    });

    expect(summary.monthsUsed).toEqual(["2026-02", "2026-03", "2026-04"]);
    expect(summary.previousRunwayMonths).toBeCloseTo(7.1538, 4);
    expect(summary.runwayDeltaMonths).toBeCloseTo(1.5649, 4);
  });
});
