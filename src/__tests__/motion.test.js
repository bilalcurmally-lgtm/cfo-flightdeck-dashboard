import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { setAnimatedText, staggerChildren } from "../render/motion.js";
import { renderFlowDiagram } from "../render/flow-diagram.js";
import { renderCashForecast } from "../render/cash-forecast.js";
import { setCurrency } from "../config/currency.js";

describe("motion helpers", () => {
  it("sets text and marks the element as updating", () => {
    const dom = new JSDOM(`<div id="value">Old</div>`);
    const element = dom.window.document.getElementById("value");

    setAnimatedText(element, "New");

    expect(element.textContent).toBe("New");
    expect(element.classList.contains("is-updating")).toBe(true);
  });

  it("stages children with motion indexes", () => {
    const dom = new JSDOM(`<section><article></article><article></article></section>`);
    const section = dom.window.document.querySelector("section");

    staggerChildren(section, "article");

    const articles = [...section.querySelectorAll("article")];
    expect(articles.map((item) => item.classList.contains("motion-enter"))).toEqual([true, true]);
    expect(articles.map((item) => item.style.getPropertyValue("--motion-index"))).toEqual(["0", "1"]);
  });

  it("renders cashflow bridge bars with hover titles and currency context", () => {
    const dom = new JSDOM(`<div id="flow"></div>`);
    const target = dom.window.document.getElementById("flow");
    setCurrency("USD");

    expect(() => renderFlowDiagram([
      { head: "Enterprise Subscription", revenue: 120000, outflow: 0 },
      { head: "Payroll", revenue: 0, outflow: 42000 }
    ], target, "USD")).not.toThrow();

    expect(target.querySelector(".cashflow-bridge")).toBeTruthy();
    expect(target.querySelectorAll(".cashflow-bridge-bar")).toHaveLength(2);
    expect(target.textContent).toContain("Enterprise Subscription");
    expect(target.textContent).toContain("Payroll");
    expect(target.textContent).toContain("$120,000.00");
    expect(target.textContent).toContain("$42,000.00");

    const enterpriseBar = target.querySelector('[data-head="Enterprise Subscription"]');
    const payrollBar = target.querySelector('[data-head="Payroll"]');

    expect(enterpriseBar.getAttribute("title")).toContain("Enterprise Subscription: cash in $120,000.00");
    expect(enterpriseBar.getAttribute("title")).toContain("100.0% of visible revenue");
    expect(payrollBar.getAttribute("title")).toContain("Payroll: cash out $42,000.00");
    expect(payrollBar.getAttribute("title")).toContain("100.0% of visible outflow");
  });

  it("keeps cashflow bridge calm instead of running decorative path loops", () => {
    const dom = new JSDOM(`<div id="flow"></div>`);
    const target = dom.window.document.getElementById("flow");
    setCurrency("PKR");

    renderFlowDiagram([
      { head: "Enterprise Subscription", revenue: 120000, outflow: 0 },
      { head: "Payroll", revenue: 0, outflow: 42000 }
    ], target, "USD");

    expect(target.querySelector(".cashflow-bridge-note")).toBeTruthy();
    expect(target.querySelectorAll("path animate").length).toBe(0);
    expect(target.querySelectorAll("animateMotion").length).toBe(0);
    expect(target.textContent).toContain("Hover any bar");
  });

  it("explains forecast dots, bars, and manual events with a legend", () => {
    const dom = new JSDOM(`<div id="forecast"></div>`);
    const target = dom.window.document.getElementById("forecast");

    renderCashForecast({
      startingCash: 1000,
      endingCash: 1250,
      minimumCash: 950,
      minimumCashWeek: "2026-01-05",
      averageWeeklyInflow: 500,
      averageWeeklyOutflow: 250,
      cashOutDate: "",
      hasLimitedHistory: false,
      weeks: [
        {
          weekStart: "2026-01-05",
          endingCash: 1250,
          expectedInflow: 500,
          expectedOutflow: 250,
          manualInflow: 0,
          manualOutflow: 0,
          events: []
        },
        {
          weekStart: "2026-01-12",
          endingCash: 900,
          expectedInflow: 100,
          expectedOutflow: 300,
          manualInflow: 0,
          manualOutflow: 150,
          events: [{ label: "Tax", flow: "cash out", amount: 150 }]
        }
      ]
    }, target);

    expect(target.querySelector(".forecast-legend")).toBeTruthy();
    expect(target.querySelector(".forecast-net-band")).toBeTruthy();
    expect(target.querySelector(".forecast-pin")).toBeTruthy();
    expect(target.textContent).toContain("Weekly net bar");
    expect(target.textContent).toContain("Manual event");
  });

  it("keeps the ending-cash line above the weekly net bar band", () => {
    const dom = new JSDOM(`<div id="forecast"></div>`);
    const target = dom.window.document.getElementById("forecast");

    renderCashForecast({
      startingCash: 1000,
      endingCash: 1250,
      minimumCash: 950,
      minimumCashWeek: "2026-01-05",
      averageWeeklyInflow: 500,
      averageWeeklyOutflow: 250,
      cashOutDate: "",
      hasLimitedHistory: false,
      weeks: Array.from({ length: 13 }, (_, index) => ({
        weekStart: `2026-01-${String(index + 1).padStart(2, "0")}`,
        endingCash: 1000 + index * 200,
        expectedInflow: 500,
        expectedOutflow: 250,
        manualInflow: 0,
        manualOutflow: 0,
        events: []
      }))
    }, target);

    const bandY = Number(target.querySelector(".forecast-net-band line").getAttribute("y1"));
    const pointYs = [...target.querySelectorAll(".forecast-point circle")]
      .map((circle) => Number(circle.getAttribute("cy")));

    expect(Math.max(...pointYs)).toBeLessThan(bandY - 24);
  });

  it("renders the net total in the center bridge circle", () => {
    const dom = new JSDOM(`<div id="flow"></div>`);
    const target = dom.window.document.getElementById("flow");
    setCurrency("USD");

    renderFlowDiagram([
      { head: "Enterprise Subscription", revenue: 120000, outflow: 0 },
      { head: "Payroll", revenue: 0, outflow: 42000 }
    ], target, "USD");

    const netCore = target.querySelector(".cashflow-net-core");
    const netTotal = target.querySelector(".cashflow-net-total");

    expect(netCore).toBeTruthy();
    expect(netTotal).toBeTruthy();
    expect(netTotal.textContent).toContain("$78.0K");
  });

  it("keeps the net amount compact inside the cashflow bridge node", () => {
    const dom = new JSDOM(`<div id="flow"></div>`);
    const target = dom.window.document.getElementById("flow");
    setCurrency("PKR");

    renderFlowDiagram([
      { head: "Enterprise Subscription", revenue: 987654321, outflow: 0 },
      { head: "Payroll", revenue: 0, outflow: 123456789 }
    ], target, "PKR");

    const nodeValue = target.querySelector(".cashflow-net-total");

    expect(nodeValue).toBeTruthy();
    const visibleLabel = nodeValue.textContent.trim();

    expect(visibleLabel.length).toBeLessThanOrEqual(12);
    expect(target.textContent).toContain("PKR");
  });

  it("removes curved lane paths and renders ranked bridge bars instead", () => {
    const dom = new JSDOM(`<div id="flow"></div>`);
    const target = dom.window.document.getElementById("flow");
    setCurrency("USD");

    renderFlowDiagram([
      { head: "Enterprise Subscription", revenue: 100000, outflow: 0 },
      { head: "Partner Channel", revenue: 70000, outflow: 0 },
      { head: "SMB Subscription", revenue: 50000, outflow: 0 },
      { head: "Implementation Fees", revenue: 30000, outflow: 0 },
      { head: "Usage Overage", revenue: 20000, outflow: 0 },
      { head: "Payroll", revenue: 0, outflow: 90000 },
      { head: "Marketing", revenue: 0, outflow: 70000 },
      { head: "Contractors", revenue: 0, outflow: 50000 },
      { head: "Cloud Hosting", revenue: 0, outflow: 30000 },
      { head: "Travel", revenue: 0, outflow: 20000 }
    ], target, "USD");

    const bars = [...target.querySelectorAll(".cashflow-bridge-bar")];
    const inflowBars = bars.filter((bar) => bar.dataset.flow === "cash in");
    const outflowBars = bars.filter((bar) => bar.dataset.flow === "cash out");

    expect(target.querySelectorAll(".flow-lane")).toHaveLength(0);
    expect(target.querySelectorAll(".flow-particle")).toHaveLength(0);
    expect(target.querySelectorAll(".flow-lane-underlay")).toHaveLength(0);
    expect(bars).toHaveLength(10);
    expect(inflowBars.map((bar) => bar.dataset.head)).toEqual([
      "Enterprise Subscription",
      "Partner Channel",
      "SMB Subscription",
      "Implementation Fees",
      "Usage Overage"
    ]);
    expect(outflowBars.map((bar) => bar.dataset.head)).toEqual([
      "Payroll",
      "Marketing",
      "Contractors",
      "Cloud Hosting",
      "Travel"
    ]);
  });

  it("keeps full bar data available in title text when labels truncate", () => {
    const dom = new JSDOM(`<div id="flow"></div>`);
    const target = dom.window.document.getElementById("flow");
    setCurrency("USD");

    renderFlowDiagram([
      { head: "Implementation Fees For Long Enterprise Rollout", revenue: 11000, outflow: 0 },
      { head: "Contractors For Deep Month End Review", revenue: 0, outflow: 9000 }
    ], target, "USD");

    const label = target.querySelector(".cashflow-bridge-bar-label");
    const bar = target.querySelector('[data-head="Implementation Fees For Long Enterprise Rollout"]');

    expect(label.textContent).toContain("Implementation Fees For Long Enterprise Rollout");
    expect(bar.getAttribute("title")).toBe("Implementation Fees For Long Enterprise Rollout: cash in $11,000.00 (100.0% of visible revenue)");
  });
});
