import { computeFinanceView } from "../finance/finance-view.js";

export function createFinanceWorkerClient({
  WorkerCtor = typeof Worker !== "undefined" ? Worker : null
} = {}) {
  if (!WorkerCtor) {
    return createSynchronousFinanceClient();
  }

  let worker;
  try {
    worker = new WorkerCtor(new URL("./finance.worker.js", import.meta.url), { type: "module" });
  } catch {
    return createSynchronousFinanceClient();
  }
  const pending = new Map();
  let nextRequestId = 1;

  worker.onmessage = (event) => {
    const { requestId, result, error } = event.data || {};
    const request = pending.get(requestId);
    if (!request) return;
    pending.delete(requestId);
    if (error) {
      request.reject(new Error(error));
      return;
    }
    request.resolve(result);
  };

  worker.onerror = (event) => {
    const message = event.message || "Finance worker failed.";
    for (const request of pending.values()) {
      request.reject(new Error(message));
    }
    pending.clear();
  };

  return {
    compute(payload) {
      const requestId = nextRequestId;
      nextRequestId += 1;
      return new Promise((resolve, reject) => {
        pending.set(requestId, { resolve, reject });
        worker.postMessage({ requestId, payload });
      });
    },
    dispose() {
      worker.terminate?.();
      pending.clear();
    }
  };
}

function createSynchronousFinanceClient() {
  return {
    compute(payload) {
      return Promise.resolve(computeFinanceView(payload));
    },
    dispose() {}
  };
}
