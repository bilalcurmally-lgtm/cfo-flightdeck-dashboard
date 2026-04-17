import { state } from "../store/state.js";
import { csvEscape } from "../core/escape.js";

export function exportVisibleRows() {
  if (!state.visibleRows.length) return;
  const header = ["date", "flow", "head", "parent", "description", "amount"];
  const lines = [header.join(",")].concat(
    state.visibleRows.map((row) => [
      row.dateISO,
      row.flow,
      csvEscape(row.head),
      csvEscape(row.parent),
      csvEscape(row.description),
      row.flow === "revenue" ? row.amount : -row.amount
    ].join(","))
  );
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `visible-finance-slice-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
