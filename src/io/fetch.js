import { els } from "../store/elements.js";
import { ingestCsvText } from "./file.js";

export async function loadSampleData() {
  try {
    const response = await fetch("./sample-finance.csv");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    ingestCsvText(text, "sample-finance.csv");
  } catch (error) {
    els.fileStatus.textContent = `Could not load sample data: ${error.message}`;
  }
}
