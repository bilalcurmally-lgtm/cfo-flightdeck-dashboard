import { describe, expect, it } from "vitest";
import { detectLargeTransactions } from "../finance/anomaly.js";

function row(description, amount, flow = "outflow") {
  return { description, amount, flow, head: "Payroll", dateISO: "2026-01-01" };
}

describe("detectLargeTransactions", () => {
  it("flags transactions that are at least three times the median amount", () => {
    const result = detectLargeTransactions([
      row("Small 1", 100),
      row("Small 2", 120),
      row("Small 3", 130),
      row("Large", 600)
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].description).toBe("Large");
    expect(result[0].multiple).toBeCloseTo(4.8, 4);
  });

  it("returns no flags when there is not enough transaction history", () => {
    expect(detectLargeTransactions([row("Only", 600)])).toEqual([]);
  });
});
