import { describe, it, expect } from "vitest";
import { capitalize, truncate, tidyValue, signedPercent, percentChange, shareOf, groupBy } from "../core/format.js";

describe("capitalize", () => {
  it("capitalizes the first letter", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("leaves already-capitalized strings unchanged", () => {
    expect(capitalize("Hello")).toBe("Hello");
  });

  it("only capitalizes the first character", () => {
    expect(capitalize("hello world")).toBe("Hello world");
  });

  it("handles single character", () => {
    expect(capitalize("a")).toBe("A");
  });
});

describe("truncate", () => {
  it("truncates long strings and adds ellipsis", () => {
    expect(truncate("hello world", 8)).toBe("hello w...");
  });

  it("returns short strings unchanged", () => {
    expect(truncate("hi", 10)).toBe("hi");
  });

  it("returns exact-length strings unchanged", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });
});

describe("tidyValue", () => {
  it("returns trimmed value when present", () => {
    expect(tidyValue("  hello  ", "fallback")).toBe("hello");
  });

  it("returns fallback for empty string", () => {
    expect(tidyValue("", "fallback")).toBe("fallback");
  });

  it("returns fallback for null", () => {
    expect(tidyValue(null, "fallback")).toBe("fallback");
  });

  it("returns fallback for undefined", () => {
    expect(tidyValue(undefined, "fallback")).toBe("fallback");
  });
});

describe("signedPercent", () => {
  it("adds plus sign for positive values", () => {
    expect(signedPercent(5.0)).toBe("+5.0%");
  });

  it("does not add plus sign for zero", () => {
    expect(signedPercent(0)).toBe("0.0%");
  });

  it("adds minus sign for negative values", () => {
    expect(signedPercent(-3.2)).toBe("-3.2%");
  });
});

describe("percentChange", () => {
  it("calculates positive change", () => {
    expect(percentChange(150, 100)).toBe(50);
  });

  it("calculates negative change", () => {
    expect(percentChange(50, 100)).toBe(-50);
  });

  it("returns 100 when previous is zero and current is non-zero", () => {
    expect(percentChange(50, 0)).toBe(100);
  });

  it("returns 0 when both are zero", () => {
    expect(percentChange(0, 0)).toBe(0);
  });
});

describe("shareOf", () => {
  it("calculates percentage share", () => {
    expect(shareOf(25, 100)).toBe("25.0%");
  });

  it("returns 0.0% when total is zero", () => {
    expect(shareOf(50, 0)).toBe("0.0%");
  });

  it("handles partial shares", () => {
    expect(shareOf(1, 3)).toBe("33.3%");
  });
});

describe("groupBy", () => {
  it("groups items by key function", () => {
    const items = [
      { type: "a", val: 1 },
      { type: "b", val: 2 },
      { type: "a", val: 3 }
    ];
    const grouped = groupBy(items, (item) => item.type);
    expect(grouped.get("a")).toEqual([{ type: "a", val: 1 }, { type: "a", val: 3 }]);
    expect(grouped.get("b")).toEqual([{ type: "b", val: 2 }]);
  });

  it("returns empty map for empty array", () => {
    const grouped = groupBy([], (item) => item);
    expect(grouped.size).toBe(0);
  });

  it("returns a Map instance", () => {
    const grouped = groupBy([1], (x) => x);
    expect(grouped).toBeInstanceOf(Map);
  });
});
