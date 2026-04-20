import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";

const requiredIds = [
  "csvFile",
  "loadSampleBtn",
  "recentDatasetSelect",
  "loadRecentDatasetBtn",
  "fileStatus",
  "currentBankBalance",
  "balanceAsOf",
  "forecastEventDate",
  "forecastEventFlow",
  "forecastEventAmount",
  "forecastEventLabel",
  "addForecastEventBtn",
  "forecastEventsList",
  "cashForecastPanel",
  "currencySearchInput",
  "dateColumn",
  "amountColumn",
  "typeColumn",
  "headColumn",
  "parentColumn",
  "descriptionColumn",
  "dateFormatSelect",
  "revenueAliases",
  "outflowAliases",
  "applyMappingBtn",
  "exportVisibleBtn",
  "resetFiltersBtn",
  "clearHeadFilterBtn",
  "startDate",
  "endDate",
  "dateRangeWarn",
  "searchInput",
  "headSearch",
  "headChecklist",
  "breadcrumbs",
  "dataQualityList",
  "totalRevenue",
  "totalOutflow",
  "netCash",
  "efficiencyRatio",
  "revenueDelta",
  "outflowDelta",
  "netDelta",
  "efficiencyNote",
  "cashRunway",
  "runwayDelta",
  "saasControls",
  "insightList",
  "focusPanel",
  "focusStats",
  "trendChart",
  "headChart",
  "periodMatrix",
  "pressureList",
  "detailBody",
  "detailFooter",
  "heroStatus",
  "heroTitle",
  "heroSubtitle",
  "sysStatusLabel",
  "sysStatusMeta",
  "tickerRow",
  "topbarSearchInput",
  "topbarPeriodSelect",
  "flowDiagram",
  "toggleControlDrawer",
  "closeControlDrawer",
  "controlDrawer"
];

describe("design shell", () => {
  it("keeps every required render and control target in the DOM", () => {
    const html = readFileSync(resolve(process.cwd(), "index.html"), "utf8");
    const dom = new JSDOM(html);

    for (const id of requiredIds) {
      expect(dom.window.document.getElementById(id), id).toBeTruthy();
    }
  });

  it("does not duplicate JavaScript target IDs", () => {
    const html = readFileSync(resolve(process.cwd(), "index.html"), "utf8");
    const dom = new JSDOM(html);

    for (const id of requiredIds) {
      expect(dom.window.document.querySelectorAll(`#${id}`).length, id).toBe(1);
    }
  });

  it("labels display currency as formatting only, not conversion", () => {
    const html = readFileSync(resolve(process.cwd(), "index.html"), "utf8");
    const dom = new JSDOM(html);

    expect(dom.window.document.getElementById("currencySearchInput")).toBeTruthy();
    expect(dom.window.document.body.textContent).toContain("not a currency converter");
  });
});
