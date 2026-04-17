import { describe, it, expect } from "vitest";
import { matchColumn, mapRowToRecord } from "../csv/map.js";

describe("matchColumn", () => {
  const columns = ["Date", "Amount", "Flow Type", "Account Head"];
  const lower = columns.map((c) => c.toLowerCase());

  it("finds an exact match", () => {
    expect(matchColumn(columns, lower, ["date"])).toBe("Date");
  });

  it("finds a match by alternative candidate", () => {
    expect(matchColumn(columns, lower, ["posting date", "transaction date", "date"])).toBe("Date");
  });

  it("finds a partial match when no exact match exists", () => {
    expect(matchColumn(columns, lower, ["flow", "direction"])).toBe("Flow Type");
  });

  it("returns empty string when no match at all", () => {
    expect(matchColumn(columns, lower, ["nonexistent"])).toBe("");
  });

  it("returns empty string for empty columns", () => {
    expect(matchColumn([], [], ["date"])).toBe("");
  });
});

describe("mapRowToRecord", () => {
  const mapping = {
    date: "Date",
    amount: "Amount",
    type: "Type",
    head: "Head",
    parent: "Parent",
    description: "Desc"
  };
  const revTokens = ["revenue"];
  const outTokens = ["outflow"];

  it("maps a valid row to a record", () => {
    const row = { Date: "15/3/2024", Amount: "100", Type: "revenue", Head: "Sales", Parent: "Income", Desc: "A sale" };
    const record = mapRowToRecord(row, 0, mapping, revTokens, outTokens, "dmy");
    expect(record).not.toBeNull();
    expect(record.flow).toBe("revenue");
    expect(record.amount).toBe(100);
    expect(record.head).toBe("Sales");
  });

  it("returns null for row with unparseable date", () => {
    const row = { Date: "not-a-date", Amount: "100", Type: "", Head: "X" };
    expect(mapRowToRecord(row, 0, mapping, revTokens, outTokens, "dmy")).toBeNull();
  });

  it("returns null for row with null amount", () => {
    const row = { Date: "15/3/2024", Amount: "abc", Type: "", Head: "X" };
    expect(mapRowToRecord(row, 0, mapping, revTokens, outTokens, "dmy")).toBeNull();
  });

  it("classifies negative amount as outflow when no type", () => {
    const row = { Date: "15/3/2024", Amount: "-50", Type: "", Head: "Expense", Parent: "", Desc: "" };
    const record = mapRowToRecord(row, 0, mapping, revTokens, outTokens, "dmy");
    expect(record.flow).toBe("outflow");
    expect(record.amount).toBe(50);
    expect(record.signedNet).toBe(-50);
  });

  it("applies fallback for missing head", () => {
    const row = { Date: "15/3/2024", Amount: "100", Type: "", Head: "" };
    const record = mapRowToRecord(row, 0, mapping, revTokens, outTokens, "dmy");
    expect(record.head).toBe("Unassigned Head");
  });

  it("applies fallback for missing parent", () => {
    const row = { Date: "15/3/2024", Amount: "100", Type: "", Head: "X", Parent: "" };
    const record = mapRowToRecord(row, 0, mapping, revTokens, outTokens, "dmy");
    expect(record.parent).toBe("Unassigned Group");
  });

  it("applies fallback for missing description", () => {
    const row = { Date: "15/3/2024", Amount: "100", Type: "", Head: "X" };
    const record = mapRowToRecord(row, 0, mapping, revTokens, outTokens, "dmy");
    expect(record.description).toBe("—");
  });

  it("generates period keys correctly", () => {
    const row = { Date: "2024-03-15", Amount: "100", Type: "", Head: "X" };
    const record = mapRowToRecord(row, 0, mapping, revTokens, outTokens, "dmy");
    expect(record.periodDaily).toBe("2024-03-15");
    expect(record.periodMonthly).toBe("2024-03");
  });
});
