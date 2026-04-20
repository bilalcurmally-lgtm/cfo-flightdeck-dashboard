import { els } from "../store/elements.js";
import { ingestCsvText } from "./file.js";
import sampleDynamicReviewCsv from "../../sample-dynamic-review.csv?raw";

export async function loadSampleData() {
  try {
    ingestCsvText(sampleDynamicReviewCsv, "sample-dynamic-review.csv");
  } catch (error) {
    els.fileStatus.textContent = `Could not load sample data: ${error.message}`;
  }
}
