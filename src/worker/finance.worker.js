import { computeFinanceView } from "../finance/finance-view.js";

self.onmessage = (event) => {
  const { requestId, payload } = event.data || {};
  try {
    self.postMessage({
      requestId,
      result: computeFinanceView(payload)
    });
  } catch (error) {
    self.postMessage({
      requestId,
      error: error?.message || "Finance calculation failed."
    });
  }
};
