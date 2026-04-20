export function buildAiBriefPayload({
  grain = "daily",
  filtered = [],
  periodSummary = [],
  headSummary = [],
  cashHealth = null,
  dataQuality = {}
} = {}) {
  const totals = filtered.reduce((acc, row) => {
    if (row.flow === "revenue") acc.revenue += row.amount;
    if (row.flow === "outflow") acc.outflow += row.amount;
    acc.net += row.signedNet || (row.flow === "revenue" ? row.amount : -row.amount);
    return acc;
  }, { revenue: 0, outflow: 0, net: 0 });

  return {
    grain,
    rowsVisible: filtered.length,
    totals,
    latestPeriods: periodSummary.slice(-6).map(({ period, revenue, outflow, net }) => ({ period, revenue, outflow, net })),
    topHeads: headSummary.slice(0, 6).map(({ head, revenue, outflow }) => ({ head, revenue, outflow })),
    cashHealth: cashHealth ? sanitizeCashHealth(cashHealth) : null,
    dataQuality: {
      skippedRows: dataQuality.skippedRows || 0,
      unknownFlowLabels: Array.isArray(dataQuality.unknownFlowLabels) ? dataQuality.unknownFlowLabels.slice(0, 8) : []
    }
  };
}

export async function requestAiBrief({
  endpointUrl,
  model,
  apiKey = "",
  payload,
  fetchImpl = fetch
}) {
  if (!endpointUrl) throw new Error("AI brief endpoint URL is required.");
  if (!model) throw new Error("AI brief model is required.");

  const headers = {
    "Content-Type": "application/json"
  };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  const response = await fetchImpl(endpointUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 180,
      messages: [
        {
          role: "system",
          content: "You are a concise CFO analyst. Write one plain-English paragraph for a small business owner. Mention cash health, burn/runway, revenue quality, and the biggest risk if present. Do not invent data."
        },
        {
          role: "user",
          content: JSON.stringify(payload)
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`AI brief request failed (${response.status})`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || data?.output_text || data?.text;
  if (!text) throw new Error("AI brief response did not include text.");
  return String(text).trim();
}

function sanitizeCashHealth(cashHealth) {
  return {
    averageMonthlyRevenue: cashHealth.averageMonthlyRevenue,
    averageMonthlyOutflow: cashHealth.averageMonthlyOutflow,
    monthlyNetBurn: cashHealth.monthlyNetBurn,
    runwayMonths: cashHealth.runwayMonths === Infinity ? "Infinity" : cashHealth.runwayMonths,
    status: cashHealth.status,
    runwayDeltaMonths: cashHealth.runwayDeltaMonths,
    monthsUsed: cashHealth.monthsUsed
  };
}
