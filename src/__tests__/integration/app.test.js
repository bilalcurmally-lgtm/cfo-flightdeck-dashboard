// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { STORAGE_VERSION } from "../../store/local-storage.js";

const root = path.resolve(".");
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const sampleCsv = fs.readFileSync(path.join(root, "sample-finance.csv"), "utf8");

function mountDom() {
  document.documentElement.innerHTML = indexHtml;
}

async function loadApp() {
  vi.resetModules();
  mountDom();
  vi.stubGlobal("ResizeObserver", class {
    observe() {}
    disconnect() {}
  });
  await import("../../main.js");
  await Promise.resolve();
  await Promise.resolve();
  return import("../../io/file.js");
}

describe("app integration", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState(null, "", "/");
  });

  it("renders KPIs and data quality from the bundled sample CSV", async () => {
    const { ingestCsvText } = await loadApp();

    ingestCsvText(sampleCsv, "sample-finance.csv");
    await Promise.resolve();

    expect(document.getElementById("totalRevenue").textContent).not.toBe("-");
    expect(document.getElementById("totalOutflow").textContent).not.toBe("-");
    expect(document.getElementById("detailBody").textContent).toContain("Enterprise Subscription");
    expect(document.getElementById("dataQualityList").textContent).toContain("Rows loaded");
    expect(document.getElementById("dataQualityList").textContent).toContain("43");
  });

  it("surfaces missing required mapping instead of rendering misleading totals", async () => {
    const { ingestCsvText } = await loadApp();

    ingestCsvText("Amount,Account Head\n100,Sales", "missing-date.csv");

    expect(document.getElementById("totalRevenue").textContent).toBe("-");
    expect(document.getElementById("detailBody").textContent).toContain("Map the required columns first");
  });

  it("surfaces all-rows-skipped mapping failures", async () => {
    const { ingestCsvText } = await loadApp();

    ingestCsvText("Date,Amount,Account Head\nnot-a-date,abc,Sales", "bad-rows.csv");

    expect(document.getElementById("totalRevenue").textContent).toBe("-");
    expect(document.getElementById("detailBody").textContent).toContain("No valid records were produced");
    expect(document.getElementById("dataQualityList").textContent).toContain("Rows skipped");
  });

  it("surfaces core cockpit capabilities in visible product copy", async () => {
    await loadApp();

    const text = document.body.textContent;
    expect(text).toContain("Help");
    expect(text).toContain("Local CSV");
    expect(text).toContain("No transaction data is uploaded by this app.");
    expect(text).toContain("Auto mapping");
    expect(text).toContain("Chart drilldowns");
    expect(text).toContain("Operating Signals");
    expect(text).toContain("Data Quality");
    expect(text).toContain("Forecast Assumptions");
    expect(text).toContain("13-Week Cash Forecast");
    expect(text).not.toContain("AI Brief");
  });

  it("updates the 13-week forecast when a manual cash-out is added", async () => {
    const { ingestCsvText } = await loadApp();

    ingestCsvText(sampleCsv, "sample-finance.csv");
    document.getElementById("currentBankBalance").value = "100000";
    document.getElementById("currentBankBalance").dispatchEvent(new Event("input", { bubbles: true }));
    document.getElementById("balanceAsOf").value = "2026-04-20";
    document.getElementById("balanceAsOf").dispatchEvent(new Event("change", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 180));

    const before = document.getElementById("cashForecastPanel").textContent;
    document.getElementById("forecastEventDate").value = "2026-04-24";
    document.getElementById("forecastEventFlow").value = "cash out";
    document.getElementById("forecastEventAmount").value = "50000";
    document.getElementById("forecastEventLabel").value = "Tax payment";
    document.getElementById("addForecastEventBtn").click();
    await Promise.resolve();
    await Promise.resolve();

    const after = document.getElementById("cashForecastPanel").textContent;
    expect(after).toContain("Tax payment");
    expect(after).not.toBe(before);
    expect(document.getElementById("insightList").textContent).toContain("13-week forecast");
  });

  it("round-trips filter state through URL and localStorage", async () => {
    const { ingestCsvText } = await loadApp();

    ingestCsvText(sampleCsv, "sample-finance.csv");
    document.getElementById("searchInput").value = "payroll";
    document.getElementById("searchInput").dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 180));

    expect(window.location.search).toContain("startDate=2026-01-02");
    const saved = JSON.parse(localStorage.getItem("cfo-flight-deck-state"));
    expect(saved.version).toBe(STORAGE_VERSION);
    expect(saved.filters.search).toBe("payroll");
  });
});
