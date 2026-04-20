import { describe, expect, it } from "vitest";
import { createFinanceWorkerClient } from "../worker/finance-worker-client.js";

function record(overrides) {
  return {
    id: overrides.id || `row-${Math.random()}`,
    dateISO: overrides.dateISO,
    periodDaily: overrides.dateISO,
    periodWeekly: overrides.periodWeekly || overrides.dateISO,
    periodMonthly: overrides.dateISO.slice(0, 7),
    head: overrides.head,
    parent: "Operations",
    description: "",
    flow: overrides.flow,
    amount: overrides.amount,
    signedNet: overrides.flow === "revenue" ? overrides.amount : -overrides.amount
  };
}

describe("createFinanceWorkerClient", () => {
  it("uses the synchronous calculation when Worker is not available", async () => {
    const client = createFinanceWorkerClient({ WorkerCtor: null });
    const view = await client.compute({
      records: [
        record({ dateISO: "2026-01-05", head: "Sales", flow: "revenue", amount: 100 }),
        record({ dateISO: "2026-01-08", head: "Rent", flow: "outflow", amount: 40 })
      ],
      grain: "monthly",
      currentBankBalance: 1000,
      filters: {
        flows: ["revenue", "outflow"],
        selectedHeads: []
      }
    });

    expect(view.filtered).toHaveLength(2);
    expect(view.periodSummary[0].period).toBe("2026-01");
    expect(view.headSummary.map((item) => item.head)).toContain("Sales");
  });

  it("resolves worker responses by request id", async () => {
    class FakeWorker {
      postMessage(message) {
        queueMicrotask(() => {
          this.onmessage({
            data: {
              requestId: message.requestId,
              result: { filtered: ["worker-result"] }
            }
          });
        });
      }
    }

    const client = createFinanceWorkerClient({ WorkerCtor: FakeWorker });
    await expect(client.compute({ records: [] })).resolves.toEqual({ filtered: ["worker-result"] });
  });

  it("falls back when the browser rejects module worker construction", async () => {
    class ThrowingWorker {
      constructor() {
        throw new Error("Module workers are blocked");
      }
    }

    const client = createFinanceWorkerClient({ WorkerCtor: ThrowingWorker });
    const view = await client.compute({
      records: [record({ dateISO: "2026-01-05", head: "Sales", flow: "revenue", amount: 100 })],
      grain: "monthly",
      filters: {
        flows: ["revenue"],
        selectedHeads: []
      }
    });

    expect(view.filtered).toHaveLength(1);
    expect(view.periodSummary[0].period).toBe("2026-01");
  });
});
