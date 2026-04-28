import { describe, it, expect, beforeEach } from "vitest";
import { normalizeCurrencyCode, setCurrency, formatCurrency, shortCurrency } from "../config/currency.js";

beforeEach(() => {
  setCurrency("USD");
});

describe("formatCurrency", () => {
  it("formats USD with 2 decimal places", () => {
    expect(formatCurrency(1234.56)).toMatch(/1,234\.56/);
  });

  it("formats JPY with 0 decimal places", () => {
    setCurrency("JPY");
    expect(formatCurrency(1234.56)).toMatch(/1,235/);
    expect(formatCurrency(1234.56)).not.toMatch(/\./);
  });

  it("formats KRW with 0 decimal places", () => {
    setCurrency("KRW");
    expect(formatCurrency(5000.99)).not.toMatch(/\./);
  });

  it("returns em dash for non-finite values", () => {
    expect(formatCurrency(Infinity)).toBe("\u2014");
    expect(formatCurrency(NaN)).toBe("\u2014");
    expect(formatCurrency(-Infinity)).toBe("\u2014");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toMatch(/0/);
  });

  it("falls back to USD for stale or unsupported saved currency values", () => {
    setCurrency("not-real");
    expect(formatCurrency(1234.56)).toMatch(/\$|USD/);
    expect(normalizeCurrencyCode("not-real")).toBe("USD");
  });
});

describe("shortCurrency", () => {
  it("includes currency symbol for thousands", () => {
    const result = shortCurrency(1500);
    expect(result).toMatch(/\$|USD/);
    expect(result).toMatch(/1\.5K/);
  });

  it("includes currency symbol for millions", () => {
    const result = shortCurrency(2500000);
    expect(result).toMatch(/\$|USD/);
    expect(result).toMatch(/2\.5M/);
  });

  it("handles negative values", () => {
    const result = shortCurrency(-1500);
    expect(result).toMatch(/-/);
    expect(result).toMatch(/1\.5K/);
  });

  it("handles negative millions", () => {
    const result = shortCurrency(-3000000);
    expect(result).toMatch(/-/);
    expect(result).toMatch(/3\.0M/);
  });

  it("handles small values without K/M suffix", () => {
    const result = shortCurrency(500);
    expect(result).toMatch(/500/);
  });

  it("returns em dash for non-finite", () => {
    expect(shortCurrency(Infinity)).toBe("\u2014");
    expect(shortCurrency(NaN)).toBe("\u2014");
  });

  it("changes symbol when currency changes", () => {
    setCurrency("USD");
    const usd = shortCurrency(1000);
    setCurrency("JPY");
    const jpy = shortCurrency(1000);
    expect(usd).not.toBe(jpy);
  });
});
