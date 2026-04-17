export function parseDate(value, dateFormat = "dmy") {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const ymdMatch = String(value).match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (ymdMatch) {
    const [, y, m, d] = ymdMatch;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  const match = String(value).match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (!match) return null;
  const [, part1, part2, part3] = match;
  const year = part3.length === 2 ? Number(`20${part3}`) : Number(part3);
  if (dateFormat === "mdy") return new Date(year, Number(part1) - 1, Number(part2));
  return new Date(year, Number(part2) - 1, Number(part1));
}

export function toIsoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function startOfWeek(date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + offset);
  return copy;
}

export function detectDateFormat(rawRows, dateColumnName) {
  if (!dateColumnName) return "ymd";
  let dmyScore = 0;
  let mdyScore = 0;
  const sample = rawRows.slice(0, 50);
  for (const row of sample) {
    const value = String(row[dateColumnName] || "").trim();
    const match = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
    if (!match) continue;
    const [, part1, part2] = match;
    const p1 = Number(part1);
    const p2 = Number(part2);
    if (p1 > 12 && p2 <= 12) dmyScore += 1;
    else if (p2 > 12 && p1 <= 12) mdyScore += 1;
  }
  if (dmyScore > mdyScore) return "dmy";
  if (mdyScore > dmyScore) return "mdy";
  return "dmy";
}

export function humanPeriodLabel(period, grain) {
  if (grain === "monthly") {
    const [year, month] = period.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return Number.isNaN(date.getTime()) ? period : date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
  }
  const date = new Date(`${period}T00:00:00`);
  if (Number.isNaN(date.getTime())) return period;
  if (grain === "weekly") {
    const end = new Date(date);
    end.setDate(end.getDate() + 6);
    return `${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function grainKey(record, grain) {
  if (grain === "weekly") return record.periodWeekly;
  if (grain === "monthly") return record.periodMonthly;
  return record.periodDaily;
}
