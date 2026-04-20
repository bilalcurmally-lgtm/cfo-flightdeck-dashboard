# CFO Cockpit Vite Design Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the current CFO Flight Deck UI to closely match the desktop-first Vite export while keeping the existing CSV, mapping, forecast, filter, persistence, export, and AI brief behavior intact.

**Architecture:** Treat `D:\projects\dashboard\vite-export` as the visual and motion source of truth, not as business logic. Port the shell, CSS tokens, chart styling, and motion patterns into the existing app; keep calculations in the tested modules under `D:\projects\dashboard\src`. Replace prototype `sample.json` and `src/utils/finance.js` with the current app state, render pipeline, and tests.

**Tech Stack:** Existing Vite app, vanilla ES modules, SVG charts, CSS animations, local CSV parsing, Web Worker-backed finance view, localStorage/IndexedDB persistence, Vitest/jsdom.

---

## Direction

We are adopting the Vite export because it finally has the SaaS cockpit feel we wanted: data is loud, readable, and spatially clear. The target is a desktop-first 1:1 visual pass based on:

- `D:\projects\dashboard\vite-export\src\styles.css`
- `D:\projects\dashboard\vite-export\src\App.jsx`
- `D:\projects\dashboard\vite-export\src\components\*.jsx`
- `D:\projects\dashboard\vite-export\review-vite-desktop-1280.png`

We are not adopting:

- `D:\projects\dashboard\vite-export\src\data\sample.json` as product data.
- `D:\projects\dashboard\vite-export\src\utils\finance.js` as product finance logic.
- Visual-only controls as finished behavior.
- A React rewrite as the first move.

Claude's remaining list is valid as a future backlog, not a blocker for this design integration:

- Replace sample data with real CSV/API loader: already exists in the current app and must be preserved.
- Scenario editor for Base/Bear/Bull: future enhancement; keep chips visual or wire only Base for now.
- AI brief generator: already exists as optional OpenAI-compatible endpoint flow; keep it.
- Dark/light theme toggle: future delight item.
- Export-to-PDF deck: future enhancement.

## File Structure

### Source Reference

- `D:\projects\dashboard\vite-export\src\styles.css`
  Visual tokens, layout primitives, shell styling, panel styling, ticker/pulse animations, and control styling.
- `D:\projects\dashboard\vite-export\src\components\FlowDiagram.jsx`
  Source for animated cashflow lanes.
- `D:\projects\dashboard\vite-export\src\components\ForecastChart.jsx`
  Source for the hero forecast visual language.
- `D:\projects\dashboard\vite-export\src\components\TrendChart.jsx`
  Source for bars/area/candles chart styling.
- `D:\projects\dashboard\vite-export\src\components\TopBar.jsx`
  Source for top command/status/ticker strip.
- `D:\projects\dashboard\vite-export\src\components\IconRail.jsx`
  Source for compact left rail.

### Current App Files To Modify

- `D:\projects\dashboard\index.html`
  Replace the current sidebar-heavy layout with the cockpit shell: icon rail, topbar, KPI row, forecast hero, trend/top-heads row, pulse/flow/pressure row, matrix, transactions, plus compact drawers for data/import/settings.
- `D:\projects\dashboard\styles.css`
  Replace current visual system with Vite export tokens and desktop layout. Keep existing functional classes only when needed by JS selectors.
- `D:\projects\dashboard\src\store\elements.js`
  Update selectors after markup changes. Keep element IDs stable where possible.
- `D:\projects\dashboard\src\main.js`
  Preserve app state, event listeners, rendering order, and persistence. Adjust render targets to the new markup.
- `D:\projects\dashboard\src\render\kpi.js`
  Render export-style KPI cards with count-up-ready values and sparklines.
- `D:\projects\dashboard\src\render\cash-forecast.js`
  Render the hero forecast chart with the export's line, confidence cone, event pin, and stats structure.
- `D:\projects\dashboard\src\render\chart.js`
  Adopt export chart styling for trend and head charts while preserving drilldown handlers and tooltips.
- `D:\projects\dashboard\src\render\insight.js`
  Render CEO Pulse cards in the export's compact signal-list style.
- `D:\projects\dashboard\src\render\matrix.js`
  Fit the period matrix into the new cockpit panel.
- `D:\projects\dashboard\src\render\table.js`
  Fit transaction drilldown into the export's dense table styling.
- `D:\projects\dashboard\src\render\data-quality.js`
  Move data quality into a compact signal/status panel or settings drawer.
- `D:\projects\dashboard\src\render\saas.js`
  Either remove old SaaS control rendering or repurpose it as compact cockpit controls.

### New Files To Create

- `D:\projects\dashboard\src\render\flow-diagram.js`
  Vanilla SVG renderer for animated cashflow lanes using real `headSummary` data.
- `D:\projects\dashboard\src\render\ticker.js`
  Topbar ticker/status rendering using real aggregate dashboard values.
- `D:\projects\dashboard\src\render\motion.js`
  Small helpers for number count-up, reduced-motion checks, and draw-in class toggles.
- `D:\projects\dashboard\src\__tests__\design-shell.test.js`
  Regression tests for the new shell targets and render smoke path.

---

## Task 1: Preserve Baseline Behavior Before Visual Changes

**Files:**
- Modify: `D:\projects\dashboard\src\__tests__\integration\app.test.js`
- Create: `D:\projects\dashboard\src\__tests__\design-shell.test.js`

- [ ] **Step 1: Add a smoke test for required shell targets**

Add a jsdom test that loads `index.html` and verifies every ID used by `src/store/elements.js` exists. This catches visual rewrites that break behavior by deleting an element.

```js
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
  "aiBriefEnabled",
  "aiBriefEndpointUrl",
  "aiBriefModel",
  "aiBriefApiKey",
  "generateAiBriefBtn",
  "aiBriefBody",
  "aiBriefStatus",
  "forecastEventDate",
  "forecastEventFlow",
  "forecastEventAmount",
  "forecastEventLabel",
  "addForecastEventBtn",
  "forecastEventsList",
  "cashForecastPanel",
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
  "focusStats",
  "trendChart",
  "headChart",
  "periodMatrix",
  "pressureList",
  "detailBody",
  "detailFooter",
  "heroStatus",
  "heroTitle",
  "heroSubtitle"
];

describe("design shell", () => {
  it("keeps every required render and control target in the DOM", () => {
    const html = readFileSync(resolve(process.cwd(), "index.html"), "utf8");
    const dom = new JSDOM(html);

    for (const id of requiredIds) {
      expect(dom.window.document.getElementById(id), id).toBeTruthy();
    }
  });
});
```

- [ ] **Step 2: Run the shell smoke test**

Run:

```powershell
npx vitest run src/__tests__/design-shell.test.js
```

Expected result: PASS before any markup changes.

- [ ] **Step 3: Run the existing suite**

Run:

```powershell
npm test
```

Expected result: PASS. Record the current passing count in the implementation notes.

---

## Task 2: Port The Visual Tokens And Desktop Shell

**Files:**
- Modify: `D:\projects\dashboard\styles.css`
- Modify: `D:\projects\dashboard\index.html`
- Reference: `D:\projects\dashboard\vite-export\src\styles.css`
- Reference: `D:\projects\dashboard\vite-export\review-vite-desktop-1280.png`

- [ ] **Step 1: Replace the root design tokens**

Move the export's cockpit tokens into `styles.css`, preserving existing app-specific state classes after the token block.

```css
:root {
  --bg: #070910;
  --bg-1: #0b0e18;
  --bg-2: #101524;
  --line: rgba(140, 170, 220, 0.10);
  --line-strong: rgba(140, 170, 220, 0.18);
  --fg: #e7ecf5;
  --fg-2: #9aa7bd;
  --fg-3: #5b6681;
  --accent: oklch(0.80 0.14 210);
  --accent-2: oklch(0.72 0.17 305);
  --good: oklch(0.78 0.15 160);
  --warn: oklch(0.82 0.14 70);
  --bad: oklch(0.70 0.19 25);
  --mono: "Geist Mono", ui-monospace, Menlo, monospace;
  --sans: "Inter Tight", system-ui, sans-serif;
  color-scheme: dark;
}
```

- [ ] **Step 2: Update font imports**

In `index.html`, replace Outfit/JetBrains Mono with the export's font pair:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

- [ ] **Step 3: Create the shell skeleton**

Restructure `index.html` so the first-level app shell matches:

```html
<div class="shell">
  <aside class="rail" aria-label="Dashboard sections">...</aside>
  <div class="workspace">
    <header class="topbar">...</header>
    <main class="main">...</main>
  </div>
</div>
```

Keep all existing required IDs from Task 1 somewhere in the DOM. Move setup-heavy controls into compact drawers or lower-priority panels; do not delete them.

- [ ] **Step 4: Verify DOM targets survived**

Run:

```powershell
npx vitest run src/__tests__/design-shell.test.js
```

Expected result: PASS.

---

## Task 3: Wire The Export-Style Topbar And Ticker To Real Data

**Files:**
- Create: `D:\projects\dashboard\src\render\ticker.js`
- Modify: `D:\projects\dashboard\src\main.js`
- Modify: `D:\projects\dashboard\src\store\elements.js`
- Modify: `D:\projects\dashboard\index.html`

- [ ] **Step 1: Add topbar render targets**

Add these IDs in the topbar markup:

```html
<div id="sysStatusLabel" class="lbl">Systems nominal</div>
<div id="sysStatusMeta" class="mono">Flight Deck · Waiting for data</div>
<div id="tickerRow" class="ticker-row"></div>
<input id="topbarSearchInput" type="search" placeholder="Search heads, periods, memos...">
<select id="topbarPeriodSelect"></select>
```

- [ ] **Step 2: Export topbar elements**

Update `src/store/elements.js`:

```js
sysStatusLabel: document.getElementById("sysStatusLabel"),
sysStatusMeta: document.getElementById("sysStatusMeta"),
tickerRow: document.getElementById("tickerRow"),
topbarSearchInput: document.getElementById("topbarSearchInput"),
topbarPeriodSelect: document.getElementById("topbarPeriodSelect"),
```

- [ ] **Step 3: Implement ticker renderer**

Create `src/render/ticker.js`:

```js
import { formatCurrency } from "../core/format.js";

export function renderTicker({ periodSummary = [], cashHealth, currency }) {
  const latest = periodSummary[periodSummary.length - 1];
  const revenue = latest?.revenue || 0;
  const outflow = latest?.outflow || 0;
  const net = revenue - outflow;
  const runway = cashHealth?.runwayMonths;

  return [
    { label: "Revenue", value: formatCurrency(revenue, currency), delta: net >= 0 ? "▲" : "▼", kind: net >= 0 ? "up" : "dn" },
    { label: "Outflow", value: formatCurrency(outflow, currency), delta: outflow > revenue ? "▲" : "▼", kind: outflow > revenue ? "dn" : "up" },
    { label: "Net", value: formatCurrency(net, currency), delta: net >= 0 ? "▲" : "▼", kind: net >= 0 ? "up" : "dn" },
    { label: "Runway", value: Number.isFinite(runway) ? `${runway.toFixed(1)} mo` : "n/a", delta: "◆", kind: "up" }
  ];
}

export function mountTicker(target, items) {
  if (!target) return;
  const doubled = [...items, ...items];
  target.innerHTML = doubled.map((item) => `
    <span class="tk-item">
      <span>${item.label}</span>
      <b>${item.value}</b>
      <span class="${item.kind}">${item.delta}</span>
    </span>
  `).join("");
}
```

- [ ] **Step 4: Connect search inputs**

In `src/main.js`, make `topbarSearchInput` update the same state as `searchInput`. Keep the old `searchInput` as the advanced drawer control.

- [ ] **Step 5: Test**

Run:

```powershell
npm test
npm run build
```

Expected result: PASS.

---

## Task 4: Convert KPI Row To Export-Style Cards

**Files:**
- Modify: `D:\projects\dashboard\index.html`
- Modify: `D:\projects\dashboard\src\render\kpi.js`
- Create: `D:\projects\dashboard\src\render\motion.js`

- [ ] **Step 1: Match KPI markup**

Use export-style card targets:

```html
<section class="kpi-row" aria-label="Key finance metrics">
  <article class="panel kpi">
    <div class="k-top"><span class="lbl">Total Revenue</span><span id="revenueDelta" class="delta"></span></div>
    <div id="totalRevenue" class="k-val tnum"></div>
    <div id="revenueSpark" class="spark"></div>
  </article>
  <article class="panel kpi">
    <div class="k-top"><span class="lbl">Total Outflow</span><span id="outflowDelta" class="delta"></span></div>
    <div id="totalOutflow" class="k-val tnum"></div>
    <div id="outflowSpark" class="spark"></div>
  </article>
  <article class="panel kpi">
    <div class="k-top"><span class="lbl">Net Cash</span><span id="netDelta" class="delta"></span></div>
    <div id="netCash" class="k-val tnum"></div>
    <div id="netSpark" class="spark"></div>
  </article>
  <article class="panel kpi">
    <div class="k-top"><span class="lbl">Efficiency Ratio</span></div>
    <div id="efficiencyRatio" class="k-val tnum"></div>
    <div id="efficiencyNote" class="lbl"></div>
  </article>
  <article class="panel kpi">
    <div class="k-top"><span class="lbl">Cash Runway</span><span id="runwayDelta" class="delta"></span></div>
    <div id="cashRunway" class="k-val tnum"></div>
  </article>
</section>
```

- [ ] **Step 2: Add motion helper**

Create `src/render/motion.js`:

```js
export function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
}

export function setAnimatedText(element, value) {
  if (!element) return;
  element.textContent = value;
  if (!prefersReducedMotion()) {
    element.classList.remove("is-updating");
    void element.offsetWidth;
    element.classList.add("is-updating");
  }
}
```

- [ ] **Step 3: Use real finance values only**

Update `renderKpis` so every value still comes from `periodSummary`, `cashHealth`, and current currency formatting. Do not import anything from `vite-export\src\utils\finance.js`.

- [ ] **Step 4: Test**

Run:

```powershell
npm test
npm run build
```

Expected result: PASS.

---

## Task 5: Make Forecast The Hero Instrument

**Files:**
- Modify: `D:\projects\dashboard\index.html`
- Modify: `D:\projects\dashboard\src\render\cash-forecast.js`
- Reference: `D:\projects\dashboard\vite-export\src\components\ForecastChart.jsx`

- [ ] **Step 1: Move forecast panel directly under KPI row**

Set `cashForecastPanel` inside an export-style hero panel:

```html
<section class="panel hero">
  <div class="panel-hd">
    <h3><span class="accent-mark">◈</span>13-Week Cash Forecast <span class="tag">Hero · Flight Path</span></h3>
    <div class="r"><span>Base case</span><span class="chip on">Base</span><span class="chip">Bear</span><span class="chip">Bull</span></div>
  </div>
  <div id="cashForecastPanel"></div>
  <div id="forecastEventsList" class="hero-stats"></div>
</section>
```

- [ ] **Step 2: Preserve existing forecast input controls**

Keep `forecastEventDate`, `forecastEventFlow`, `forecastEventAmount`, `forecastEventLabel`, and `addForecastEventBtn` in a settings drawer or assumptions panel. The hero chart should display the result, not become the editor.

- [ ] **Step 3: Port visual chart styling**

Use the export's forecast approach: actual line, dashed forecast line, confidence cone, event pins, hover tooltip, and four hero stats. Feed it from `buildCashForecast` in `src/finance/cash-forecast.js`.

- [ ] **Step 4: Test forecast unit and build**

Run:

```powershell
npx vitest run src/__tests__/cash-forecast.test.js
npm run build
```

Expected result: PASS.

---

## Task 6: Add Animated Cashflow Lanes With Real Head Data

**Files:**
- Create: `D:\projects\dashboard\src\render\flow-diagram.js`
- Modify: `D:\projects\dashboard\index.html`
- Modify: `D:\projects\dashboard\src\main.js`
- Reference: `D:\projects\dashboard\vite-export\src\components\FlowDiagram.jsx`

- [ ] **Step 1: Add a flow panel target**

Add this panel in the main cockpit row:

```html
<article class="panel">
  <div class="panel-hd">
    <h3>Cashflow Lanes <span class="tag">Live Flow</span></h3>
  </div>
  <div id="flowDiagram" class="panel-bd"></div>
</article>
```

- [ ] **Step 2: Add element selector**

Update `src/store/elements.js`:

```js
flowDiagram: document.getElementById("flowDiagram"),
```

- [ ] **Step 3: Implement real-data SVG lanes**

Create `src/render/flow-diagram.js` using `headSummary`. Revenue lanes enter from the left, outflow lanes leave to the right. Lane width is based on share of total value. Lane speed is slower for larger flows and faster for smaller flows.

```js
import { formatCurrency } from "../core/format.js";

export function renderFlowDiagram(headSummary = [], target, currency) {
  if (!target) return;

  const revenue = headSummary
    .filter((item) => item.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
  const outflow = headSummary
    .filter((item) => item.outflow > 0)
    .sort((a, b) => b.outflow - a.outflow)
    .slice(0, 5);

  const revenueTotal = revenue.reduce((sum, item) => sum + item.revenue, 0);
  const outflowTotal = outflow.reduce((sum, item) => sum + item.outflow, 0);
  const net = revenueTotal - outflowTotal;

  target.innerHTML = `
    <svg class="flow-diagram" viewBox="0 0 420 210" width="100%" role="img" aria-label="Cashflow lanes">
      <defs>
        <radialGradient id="coreGrad" cx="50%" cy="50%">
          <stop offset="0%" stop-color="oklch(0.80 0.14 210)" stop-opacity="0.8" />
          <stop offset="60%" stop-color="oklch(0.80 0.14 210)" stop-opacity="0.2" />
          <stop offset="100%" stop-color="oklch(0.80 0.14 210)" stop-opacity="0" />
        </radialGradient>
      </defs>
      <circle cx="210" cy="105" r="38" fill="url(#coreGrad)" />
      <circle cx="210" cy="105" r="18" fill="rgba(11,14,24,0.9)" stroke="var(--accent)" stroke-width="1" />
      <text x="210" y="103" text-anchor="middle" fill="var(--fg-3)" font-size="8" font-family="var(--mono)" letter-spacing="0.15em">NET</text>
      <text x="210" y="114" text-anchor="middle" fill="var(--fg)" font-size="10" font-family="var(--mono)">${formatCurrency(net, currency)}</text>
      ${renderLaneGroup(revenue, revenueTotal, "revenue")}
      ${renderLaneGroup(outflow, outflowTotal, "outflow")}
    </svg>
  `;
}

function renderLaneGroup(items, total, type) {
  const cx = 210;
  const cy = 105;
  const left = type === "revenue";
  const stroke = left ? "var(--accent)" : "var(--warn)";
  const x = left ? 50 : 370;
  const textAnchor = left ? "end" : "start";
  const labelX = left ? x - 6 : x + 6;

  return items.map((item, index) => {
    const value = left ? item.revenue : item.outflow;
    const y = 20 + 170 * ((index + 0.5) / items.length);
    const width = Math.max(2, Math.min(6, (value / Math.max(total, 1)) * 20));
    const duration = Math.max(2.4, 4.8 - width * 0.25).toFixed(1);
    const path = left
      ? `M${x},${y} Q${cx - 30},${y} ${cx - 18},${cy}`
      : `M${cx + 18},${cy} Q${cx + 30},${y} ${x},${y}`;

    return `
      <g>
        <text x="${labelX}" y="${y + 3}" text-anchor="${textAnchor}" fill="var(--fg-2)" font-size="10" font-family="var(--mono)">${escapeSvg(item.head)}</text>
        <path d="${path}" stroke="${stroke}" stroke-width="${width}" fill="none" opacity="${left ? "0.5" : "0.55"}" pathLength="1">
          <animate attributeName="stroke-dasharray" values="0 .18; .18 .82; 0 .18" dur="${duration}s" repeatCount="indefinite" />
          <animate attributeName="stroke-dashoffset" values="1;0" dur="${duration}s" repeatCount="indefinite" />
        </path>
      </g>
    `;
  }).join("");
}

function escapeSvg(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
```

- [ ] **Step 4: Respect reduced motion**

Add CSS:

```css
@media (prefers-reduced-motion: reduce) {
  .flow-diagram animate {
    display: none;
  }
}
```

- [ ] **Step 5: Test**

Run:

```powershell
npm test
npm run build
```

Expected result: PASS.

---

## Task 7: Port Remaining Cockpit Panels

**Files:**
- Modify: `D:\projects\dashboard\src\render\chart.js`
- Modify: `D:\projects\dashboard\src\render\insight.js`
- Modify: `D:\projects\dashboard\src\render\matrix.js`
- Modify: `D:\projects\dashboard\src\render\table.js`
- Modify: `D:\projects\dashboard\src\render\data-quality.js`
- Modify: `D:\projects\dashboard\index.html`
- Reference: `D:\projects\dashboard\vite-export\src\components\TopHeads.jsx`
- Reference: `D:\projects\dashboard\vite-export\src\components\PulsePanel.jsx`
- Reference: `D:\projects\dashboard\vite-export\src\components\PressurePanel.jsx`
- Reference: `D:\projects\dashboard\vite-export\src\components\MatrixPanel.jsx`
- Reference: `D:\projects\dashboard\vite-export\src\components\TransactionsPanel.jsx`

- [ ] **Step 1: Trend and Top Heads**

Use the export's `row-2` structure:

```html
<section class="row-2">
  <article class="panel">
    <div class="panel-hd"><h3>Trend by Period <span class="tag">Live Slice</span></h3></div>
    <div id="trendChart" class="panel-bd"></div>
  </article>
  <article class="panel">
    <div class="panel-hd"><h3>Top Heads</h3></div>
    <div id="headChart" class="panel-bd"></div>
  </article>
</section>
```

Keep existing chart click/drill behavior from `src/render/chart.js`.

- [ ] **Step 2: Pulse, Lanes, Pressure**

Use the export's `row-3` structure:

```html
<section class="row-3">
  <article class="panel"><div class="panel-hd"><h3>CEO Pulse</h3></div><div id="insightList" class="panel-bd"></div></article>
  <article class="panel"><div class="panel-hd"><h3>Cashflow Lanes</h3></div><div id="flowDiagram" class="panel-bd"></div></article>
  <article class="panel"><div class="panel-hd"><h3>Outflow Pressure</h3></div><div id="pressureList" class="panel-bd pressure"></div></article>
</section>
```

- [ ] **Step 3: Matrix and Transactions**

Keep full-width matrix and transaction panels below the cockpit rows. Preserve current row click and export behavior.

- [ ] **Step 4: Test drilldowns**

Run the integration test:

```powershell
npx vitest run src/__tests__/integration/app.test.js
```

Expected result: PASS.

---

## Task 8: Visual QA Against The Export

**Files:**
- Read: `D:\projects\dashboard\vite-export\review-vite-desktop-1280.png`
- Create: `D:\projects\dashboard\screenshots\cockpit-integration-desktop-1280.png`
- Modify: whichever CSS/render file causes visible drift.

- [ ] **Step 1: Start the current app**

Run:

```powershell
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Expected result: preview server starts.

- [ ] **Step 2: Capture desktop screenshot**

Capture `http://127.0.0.1:4173/` at 1280x800 as:

```text
D:\projects\dashboard\screenshots\cockpit-integration-desktop-1280.png
```

- [ ] **Step 3: Compare to export**

Compare against:

```text
D:\projects\dashboard\vite-export\review-vite-desktop-1280.png
```

Acceptance criteria:

- Left rail, topbar, KPI row, forecast hero, trend/top-heads row, pulse/lane/pressure row, matrix, and transaction table are present.
- The first desktop viewport reads as a cockpit, not a setup sidebar.
- Numbers are large and readable.
- Main panel density matches the export within reasonable product-data constraints.
- Cashflow lanes animate.
- No layout break at 1280x800 desktop.

- [ ] **Step 4: Run final verification**

Run:

```powershell
npm test
npm run build
```

Expected result: PASS.

---

## Deferred Backlog

These are good ideas, but they should not block the 1:1 design integration:

- Base/Bear/Bull scenario editor connected to manual assumptions.
- Dark/light/system theme toggle.
- Export-to-PDF of the deck.
- More advanced animation pass after real data is wired: lane particles, trend transition morphs, insight enter/exit, and selected-slice glow.
- Optional API-backed loader if CSV-only stops being enough.

## Self-Review

Spec coverage:

- Uses `vite-export` as the source of truth.
- Keeps the existing tested finance pipeline.
- Calls out `finance.js` and `sample.json` as reference-only.
- Preserves current product features.
- Includes cashflow lane animation and planned enhancements.
- Defers Claude's remaining feature list appropriately.

Placeholder scan:

- No `TBD`, `TODO`, or unspecified implementation steps remain.

Type/path consistency:

- Current file paths match the repository structure.
- New render targets are explicitly added to `index.html` and `src/store/elements.js`.
- The flow renderer consumes `headSummary`, matching the existing `computeFinanceView` return value.

