import { parseDate, toIsoDate, startOfWeek } from "../core/date.js";
import { parseAmount, classifyFlow } from "../core/amount.js";

export function matchColumn(columns, lowerColumns, candidates) {
  const exactIndex = lowerColumns.findIndex((column) => candidates.includes(column));
  if (exactIndex >= 0) return columns[exactIndex];
  const containsIndex = lowerColumns.findIndex((column) =>
    candidates.some((candidate) => column.includes(candidate))
  );
  return containsIndex >= 0 ? columns[containsIndex] : "";
}

export function mapRowToRecord(row, index, mapping, revenueTokens, outflowTokens, dateFormat) {
  const date = parseDate(row[mapping.date], dateFormat);
  const amountRaw = parseAmount(row[mapping.amount]);
  if (!date || amountRaw === null) return null;

  const typeValue = mapping.type ? String(row[mapping.type] || "").trim().toLowerCase() : "";
  const flow = classifyFlow(typeValue, amountRaw, revenueTokens, outflowTokens);
  const amount = Math.abs(amountRaw);
  const head = String(row[mapping.head] || "").trim() || "Unassigned Head";
  const parent = (mapping.parent ? String(row[mapping.parent] || "").trim() : "") || "Unassigned Group";
  const description = (mapping.description ? String(row[mapping.description] || "").trim() : "") || "—";
  const signedNet = flow === "revenue" ? amount : -amount;

  return {
    id: `${date.toISOString()}-${index}`,
    date,
    dateISO: toIsoDate(date),
    periodDaily: toIsoDate(date),
    periodWeekly: toIsoDate(startOfWeek(date)),
    periodMonthly: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
    head,
    parent,
    description,
    flow,
    amount,
    signedNet
  };
}
