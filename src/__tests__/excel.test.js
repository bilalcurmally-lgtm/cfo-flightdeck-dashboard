import { describe, expect, it } from "vitest";
import { excelRowsToRows } from "../io/excel.js";

describe("excelRowsToRows", () => {
  it("turns worksheet rows into imported objects", () => {
    const rows = excelRowsToRows([
      ["", ""],
      ["Date", "Amount", "Account Head"],
      [new Date("2026-04-20T00:00:00.000Z"), 1200, "Sales"],
      ["2026-04-21", -450, "Payroll"]
    ]);

    expect(rows).toEqual([
      { Date: "2026-04-20", Amount: "1200", "Account Head": "Sales" },
      { Date: "2026-04-21", Amount: "-450", "Account Head": "Payroll" }
    ]);
  });

  it("skips blank body rows and names blank headers", () => {
    const rows = excelRowsToRows([
      ["Date", "", "Amount"],
      ["", "", ""],
      ["2026-04-22", "memo", "300"]
    ]);

    expect(rows).toEqual([
      { Date: "2026-04-22", column_2: "memo", Amount: "300" }
    ]);
  });
});
