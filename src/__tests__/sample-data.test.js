import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseCsv } from "../csv/parse.js";

describe("bundled dynamic review sample", () => {
  it("contains enough varied weekly net movement to exercise the cockpit visuals", () => {
    const csv = readFileSync(resolve(process.cwd(), "sample-dynamic-review.csv"), "utf8");
    const rows = parseCsv(csv);
    const weeklyNet = rows.reduce((map, row) => {
      const date = new Date(`${row.Date}T00:00:00`);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - ((date.getDay() + 6) % 7));
      const key = weekStart.toISOString().slice(0, 10);
      map.set(key, (map.get(key) || 0) + Number(row.Amount || 0));
      return map;
    }, new Map());

    expect(rows.length).toBeGreaterThan(70);
    expect(rows.some((row) => row["Flow Type"] === "Revenue")).toBe(true);
    expect(rows.some((row) => row["Flow Type"] === "Outflow")).toBe(true);
    expect(new Set([...weeklyNet.values()]).size).toBeGreaterThan(6);
  });
});
