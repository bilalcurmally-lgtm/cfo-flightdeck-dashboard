import { describe, expect, it } from "vitest";
import { buildPeriodContext } from "../finance/period-context.js";

describe("buildPeriodContext", () => {
  it("adds prior-period deltas for revenue, outflow, net, and efficiency", () => {
    const rows = buildPeriodContext([
      { period: "2026-01", revenue: 100, outflow: 50, net: 50 },
      { period: "2026-02", revenue: 150, outflow: 40, net: 110 }
    ]);

    expect(rows[0].variance).toBeNull();
    expect(rows[1].variance.revenueChange).toBe(50);
    expect(rows[1].variance.outflowChange).toBe(-20);
    expect(rows[1].variance.netChange).toBe(120);
    expect(rows[1].variance.efficiencyChange).toBe(87.5);
  });

  it("handles zero previous values without division errors", () => {
    const rows = buildPeriodContext([
      { period: "2026-01", revenue: 0, outflow: 0, net: 0 },
      { period: "2026-02", revenue: 100, outflow: 50, net: 50 }
    ]);

    expect(rows[1].variance.revenueChange).toBe(100);
    expect(rows[1].variance.outflowChange).toBe(100);
    expect(rows[1].variance.netChange).toBe(100);
    expect(rows[1].variance.efficiencyChange).toBeNull();
  });
});
