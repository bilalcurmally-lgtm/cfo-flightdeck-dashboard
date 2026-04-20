import { els } from "../store/elements.js";
import { ingestCsvText } from "./file.js";
import sampleDynamicReviewCsv from "../../sample-dynamic-review.csv?raw";

export async function loadSampleData({ persist = false, statusPrefix = "Loaded demo sample" } = {}) {
  try {
    ingestCsvText(sampleDynamicReviewCsv, "sample-dynamic-review.csv", { persist });
    els.fileStatus.textContent = `${statusPrefix}: sample-dynamic-review.csv. Upload a CSV anytime to replace it.`;
    return true;
  } catch (error) {
    els.fileStatus.textContent = `Could not load sample data: ${error.message}`;
    return false;
  }
}
