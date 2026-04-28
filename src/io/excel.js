import readXlsxFile, { readSheet } from "read-excel-file/browser";

export async function parseExcel(input) {
  const rows = await readSheet(input);
  return excelRowsToRows(rows);
}

export async function parseExcelWorkbook(input) {
  const sheets = await readXlsxFile(input);
  return sheets.map((sheet, index) => ({
    name: sheet.sheet || `Sheet ${index + 1}`,
    rows: excelRowsToRows(sheet.data),
    rawRowCount: sheet.data.length
  }));
}

export function excelRowsToRows(rows) {
  const headerIndex = rows.findIndex((row) =>
    row.some((value) => String(value ?? "").trim() !== "")
  );
  if (headerIndex < 0) return [];

  const headers = rows[headerIndex].map((value, index) => {
    const header = String(value ?? "").trim();
    return header || `column_${index + 1}`;
  });

  return rows
    .slice(headerIndex + 1)
    .filter((row) => row.some((value) => String(value ?? "").trim() !== ""))
    .map((row) =>
      Object.fromEntries(
        headers.map((header, index) => [header, normalizeExcelCell(row[index])])
      )
    );
}

function normalizeExcelCell(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (value === null || value === undefined) return "";
  return String(value).trim();
}
