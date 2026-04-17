import { describe, it, expect } from "vitest";
import { parseAmount, classifyFlow } from "../core/amount.js";

describe("parseAmount", () => {
  it("parses a plain number string", () => {
    expect(parseAmount("1500")).toBe(1500);
  });

  it("parses a number with currency symbols", () => {
    expect(parseAmount("$1,500")).toBe(1500);
    expect(parseAmount("€2000")).toBe(2000);
    expect(parseAmount("£3000")).toBe(3000);
  });

  it("parses parenthesized negatives", () => {
    expect(parseAmount("(500)")).toBe(-500);
  });

  it("returns null for NaN input", () => {
    expect(parseAmount("abc")).toBeNull();
  });

  it("returns null for null input", () => {
    expect(parseAmount(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(parseAmount(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseAmount("")).toBeNull();
  });

  it("parses negative numbers", () => {
    expect(parseAmount("-200")).toBe(-200);
  });

  it("parses decimal numbers", () => {
    expect(parseAmount("99.50")).toBe(99.5);
  });

  it("handles zero", () => {
    expect(parseAmount("0")).toBe(0);
  });
});

describe("classifyFlow", () => {
  const revenueTokens = ["revenue", "inflow", "sales"];
  const outflowTokens = ["outflow", "expense", "payment"];

  it("classifies revenue by alias match", () => {
    expect(classifyFlow("revenue", 100, revenueTokens, outflowTokens)).toBe("revenue");
    expect(classifyFlow("sales income", 100, revenueTokens, outflowTokens)).toBe("revenue");
  });

  it("classifies outflow by alias match", () => {
    expect(classifyFlow("outflow", 100, revenueTokens, outflowTokens)).toBe("outflow");
    expect(classifyFlow("expense item", 100, revenueTokens, outflowTokens)).toBe("outflow");
  });

  it("falls back to sign when no type value", () => {
    expect(classifyFlow("", 100, revenueTokens, outflowTokens)).toBe("revenue");
    expect(classifyFlow("", -100, revenueTokens, outflowTokens)).toBe("outflow");
  });

  it("falls back to sign when no alias matches", () => {
    expect(classifyFlow("unknown", 100, revenueTokens, outflowTokens)).toBe("revenue");
    expect(classifyFlow("unknown", -100, revenueTokens, outflowTokens)).toBe("outflow");
  });

  it("revenue tokens take precedence over outflow when both match", () => {
    const revBoth = ["revenue", "cash"];
    const outBoth = ["outflow", "cash"];
    expect(classifyFlow("cash flow", 100, revBoth, outBoth)).toBe("revenue");
  });

  it("zero amount with no type defaults to revenue", () => {
    expect(classifyFlow("", 0, revenueTokens, outflowTokens)).toBe("revenue");
  });
});
