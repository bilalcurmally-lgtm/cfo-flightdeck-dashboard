import { describe, it, expect } from "vitest";
import { parseDate, toIsoDate, startOfWeek, detectDateFormat, humanPeriodLabel, grainKey } from "../core/date.js";

describe("parseDate", () => {
  it("parses ISO date strings", () => {
    const d = parseDate("2024-03-15");
    expect(d).toBeInstanceOf(Date);
    expect(d.getFullYear()).toBe(2024);
    expect(d.getMonth()).toBe(2);
    expect(d.getDate()).toBe(15);
  });

  it("parses D/M/Y format by default", () => {
    const d = parseDate("15/3/2024");
    expect(d.getFullYear()).toBe(2024);
    expect(d.getMonth()).toBe(2);
    expect(d.getDate()).toBe(15);
  });

  it("parses M/D/Y format when specified", () => {
    const d = parseDate("3/15/2024", "mdy");
    expect(d.getFullYear()).toBe(2024);
    expect(d.getMonth()).toBe(2);
    expect(d.getDate()).toBe(15);
  });

  it("parses two-digit years as 20XX", () => {
    const d = parseDate("15/3/24", "dmy");
    expect(d.getFullYear()).toBe(2024);
  });

  it("returns null for null input", () => {
    expect(parseDate(null)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseDate("")).toBeNull();
  });

  it("returns null for unparseable string", () => {
    expect(parseDate("not-a-date")).toBeNull();
  });

  it("parses YMD format when specified", () => {
    const d = parseDate("2024/3/15", "ymd");
    expect(d.getFullYear()).toBe(2024);
    expect(d.getMonth()).toBe(2);
    expect(d.getDate()).toBe(15);
  });

  it("parses 4-digit YMD date strings", () => {
    const d = parseDate("2024-03-15", "ymd");
    expect(d.getFullYear()).toBe(2024);
    expect(d.getMonth()).toBe(2);
    expect(d.getDate()).toBe(15);
  });

  it("handles dash separator in date parts", () => {
    const d = parseDate("15-3-2024");
    expect(d).toBeInstanceOf(Date);
    expect(d.getMonth()).toBe(2);
    expect(d.getDate()).toBe(15);
  });

  it("strips time from ISO datetime strings", () => {
    const d = parseDate("2024-03-15T10:30:00");
    expect(d.getFullYear()).toBe(2024);
    expect(d.getHours()).toBe(0);
  });
});

describe("toIsoDate", () => {
  it("formats a date as YYYY-MM-DD", () => {
    const d = new Date(2024, 0, 5);
    expect(toIsoDate(d)).toBe("2024-01-05");
  });

  it("pads single-digit months and days", () => {
    const d = new Date(2024, 8, 1);
    expect(toIsoDate(d)).toBe("2024-09-01");
  });
});

describe("startOfWeek", () => {
  it("returns Monday for a Wednesday date", () => {
    const wed = new Date(2024, 2, 13);
    const mon = startOfWeek(wed);
    expect(mon.getDay()).toBe(1);
    expect(mon.getDate()).toBe(11);
  });

  it("returns previous Monday for a Sunday date", () => {
    const sun = new Date(2024, 2, 17);
    const mon = startOfWeek(sun);
    expect(mon.getDay()).toBe(1);
    expect(mon.getDate()).toBe(11);
  });

  it("returns itself for a Monday date", () => {
    const mon = new Date(2024, 2, 11);
    const result = startOfWeek(mon);
    expect(result.getDate()).toBe(11);
  });
});

describe("detectDateFormat", () => {
  it("returns dmy when day values exceed 12 in first position", () => {
    const rows = [
      { Date: "15/3/2024" }, { Date: "20/5/2024" }, { Date: "18/6/2024" }
    ];
    expect(detectDateFormat(rows, "Date")).toBe("dmy");
  });

  it("returns mdy when month values exceed 12 in second position", () => {
    const rows = [
      { Date: "3/15/2024" }, { Date: "5/20/2024" }, { Date: "6/18/2024" }
    ];
    expect(detectDateFormat(rows, "Date")).toBe("mdy");
  });

  it("defaults to dmy when ambiguous", () => {
    const rows = [
      { Date: "5/3/2024" }, { Date: "2/8/2024" }
    ];
    expect(detectDateFormat(rows, "Date")).toBe("dmy");
  });

  it("returns ymd when no date column is given", () => {
    expect(detectDateFormat([], "")).toBe("ymd");
  });
});

describe("humanPeriodLabel", () => {
  it("returns short month + year for monthly grain", () => {
    const label = humanPeriodLabel("2024-03", "monthly");
    expect(label).toContain("Mar");
    expect(label).toContain("2024");
  });

  it("returns a date range for weekly grain", () => {
    const label = humanPeriodLabel("2024-03-11", "weekly");
    expect(label).toContain("-");
  });

  it("returns a formatted date for daily grain", () => {
    const label = humanPeriodLabel("2024-03-15", "daily");
    expect(label).toBeTruthy();
    expect(label).not.toBe("2024-03-15");
  });

  it("returns the raw period string for invalid dates", () => {
    expect(humanPeriodLabel("not-a-date", "daily")).toBe("not-a-date");
  });
});

describe("grainKey", () => {
  const record = {
    periodDaily: "2024-03-15",
    periodWeekly: "2024-03-11",
    periodMonthly: "2024-03"
  };

  it("returns periodDaily for daily grain", () => {
    expect(grainKey(record, "daily")).toBe("2024-03-15");
  });

  it("returns periodWeekly for weekly grain", () => {
    expect(grainKey(record, "weekly")).toBe("2024-03-11");
  });

  it("returns periodMonthly for monthly grain", () => {
    expect(grainKey(record, "monthly")).toBe("2024-03");
  });
});
