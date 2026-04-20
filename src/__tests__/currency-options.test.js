import { describe, expect, it } from "vitest";
import { getCurrencyOptions } from "../config/currency-options.js";

describe("currency options", () => {
  it("includes a broad world currency list instead of only the hand-picked shortlist", () => {
    const options = getCurrencyOptions();
    const codes = new Set(options.map((option) => option.code));

    expect(options.length).toBeGreaterThan(100);
    expect(codes.has("AED")).toBe(true);
    expect(codes.has("PKR")).toBe(true);
    expect(codes.has("XOF")).toBe(true);
    expect(codes.has("PEN")).toBe(true);
  });
});
