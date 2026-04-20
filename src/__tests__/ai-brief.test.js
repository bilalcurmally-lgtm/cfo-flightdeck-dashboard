import { describe, expect, it } from "vitest";
import { buildAiBriefPayload, requestAiBrief } from "../finance/ai-brief.js";

describe("buildAiBriefPayload", () => {
  it("builds a compact finance summary without row-level descriptions", () => {
    const payload = buildAiBriefPayload({
      grain: "monthly",
      filtered: [
        { flow: "revenue", amount: 1000, signedNet: 1000, description: "Customer name should not be sent" },
        { flow: "outflow", amount: 300, signedNet: -300, description: "Vendor name should not be sent" }
      ],
      periodSummary: [
        { period: "2026-01", revenue: 1000, outflow: 300, net: 700 }
      ],
      headSummary: [
        { head: "Subscriptions", revenue: 1000, outflow: 0 },
        { head: "Hosting", revenue: 0, outflow: 300 }
      ],
      cashHealth: {
        averageMonthlyRevenue: 1000,
        averageMonthlyOutflow: 300,
        monthlyNetBurn: -700,
        runwayMonths: Infinity,
        status: "growing"
      },
      dataQuality: {
        skippedRows: 2,
        unknownFlowLabels: ["refundish"]
      }
    });

    expect(payload.rowsVisible).toBe(2);
    expect(payload.totals.net).toBe(700);
    expect(payload.topHeads[0]).toEqual({ head: "Subscriptions", revenue: 1000, outflow: 0 });
    expect(JSON.stringify(payload)).not.toContain("Customer name should not be sent");
    expect(JSON.stringify(payload)).not.toContain("Vendor name should not be sent");
  });
});

describe("requestAiBrief", () => {
  it("posts an OpenAI-compatible chat request to the configured endpoint", async () => {
    const calls = [];
    const fetchImpl = async (url, options) => {
      calls.push({ url, options });
      return {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "Cash is growing and outflows are controlled." } }]
        })
      };
    };

    const brief = await requestAiBrief({
      endpointUrl: "https://example.test/chat/completions",
      model: "brief-model",
      apiKey: "secret",
      payload: { totals: { revenue: 1000 } },
      fetchImpl
    });

    expect(brief).toBe("Cash is growing and outflows are controlled.");
    expect(calls[0].url).toBe("https://example.test/chat/completions");
    expect(calls[0].options.headers.Authorization).toBe("Bearer secret");
    expect(JSON.parse(calls[0].options.body).model).toBe("brief-model");
  });
});
