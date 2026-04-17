import { describe, it, expect } from "vitest";
import { parseCsv } from "../csv/parse.js";

describe("parseCsv", () => {
  it("parses a simple CSV with headers", () => {
    const text = "Name,Age,City\nAlice,30,NYC\nBob,25,LA";
    const rows = parseCsv(text);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ Name: "Alice", Age: "30", City: "NYC" });
    expect(rows[1]).toEqual({ Name: "Bob", Age: "25", City: "LA" });
  });

  it("strips BOM at the start", () => {
    const bom = "\uFEFF";
    const text = `${bom}A,B\n1,2`;
    const rows = parseCsv(text);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({ A: "1", B: "2" });
  });

  it("handles CRLF line endings", () => {
    const text = "A,B\r\n1,2\r\n3,4";
    const rows = parseCsv(text);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ A: "1", B: "2" });
  });

  it("handles quoted fields with commas inside", () => {
    const text = 'Name,Desc\nAlice,"hello, world"\nBob,"foo, bar"';
    const rows = parseCsv(text);
    expect(rows).toHaveLength(2);
    expect(rows[0].Desc).toBe("hello, world");
    expect(rows[1].Desc).toBe("foo, bar");
  });

  it("handles escaped double quotes inside quoted fields", () => {
    const text = 'A,B\n"he said ""hi""",value';
    const rows = parseCsv(text);
    expect(rows).toHaveLength(1);
    expect(rows[0].A).toBe('he said "hi"');
  });

  it("handles unclosed quotes gracefully", () => {
    const text = 'A,B\n"unclosed,value';
    const rows = parseCsv(text);
    expect(rows).toHaveLength(1);
    expect(rows[0].A).toBe("unclosed,value");
  });

  it("returns empty array for empty input", () => {
    expect(parseCsv("")).toEqual([]);
  });

  it("returns rows when input has whitespace rows mixed with data", () => {
    const text = "A\n1\n   \n2";
    const rows = parseCsv(text);
    expect(rows.length).toBeGreaterThanOrEqual(1);
  });

  it("trims header and cell values", () => {
    const text = " A , B \n 1 , 2 ";
    const rows = parseCsv(text);
    expect(rows[0]).toEqual({ A: "1", B: "2" });
  });

  it("skips blank header row and treats first non-blank row as header", () => {
    const text = ",,\nA,B,C\n1,2,3";
    const rows = parseCsv(text);
    expect(rows).toHaveLength(1);
    expect(rows[0].A).toBe("1");
  });

  it("handles CR-only line endings", () => {
    const text = "A,B\r1,2\r3,4";
    const rows = parseCsv(text);
    expect(rows).toHaveLength(2);
  });

  it("handles rows with fewer columns than headers", () => {
    const text = "A,B,C\n1";
    const rows = parseCsv(text);
    expect(rows).toHaveLength(1);
    expect(rows[0].A).toBe("1");
    expect(rows[0].B).toBe("");
    expect(rows[0].C).toBe("");
  });

  it("handles quoted fields spanning newlines", () => {
    const text = 'A,B\n"line1\nline2",value';
    const rows = parseCsv(text);
    expect(rows).toHaveLength(1);
    expect(rows[0].A).toBe("line1\nline2");
  });
});
