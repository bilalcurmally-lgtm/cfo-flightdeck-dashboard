# Cashflow Bridge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Cashflow Lanes visual with the approved Ranked Cash Bridge.

**Architecture:** Keep the existing `flowSection` and `renderFlowDiagram` entry point so the rest of the dashboard does not need a structural rewrite. Replace the SVG lane paths with an HTML/SVG-lite bridge layout made from semantic buttons/bars, with CSS handling truncation, motion, and risk styling.

**Tech Stack:** Vanilla JavaScript renderer, existing dashboard state/filter patterns, Vitest/JSDOM tests, Vite build.

---

### Task 1: Renderer Contract

**Files:**
- Modify: `D:/projects/dashboard/src/__tests__/motion.test.js`
- Modify: `D:/projects/dashboard/src/render/flow-diagram.js`

- [ ] **Step 1: Write failing tests**

Add tests proving the new bridge renders:

- `.cashflow-bridge`
- `.cashflow-bridge-bar`
- visible labels, shares, and signed formatted amounts
- `.cashflow-net-total`
- no `.flow-lane`, `.flow-particle`, or SVG path-based lane rendering
- title text for full hover data when labels truncate

- [ ] **Step 2: Run focused tests and confirm failure**

Run:

```powershell
npm test -- src/__tests__/motion.test.js
```

Expected: fails because current renderer still emits `.flow-lane` SVG paths and not the new bridge classes.

- [ ] **Step 3: Replace renderer markup**

Update `renderFlowDiagram` to emit ranked Cash In and Cash Out bridge columns with a center net circle.

- [ ] **Step 4: Run focused tests and confirm pass**

Run:

```powershell
npm test -- src/__tests__/motion.test.js
```

Expected: all focused renderer tests pass.

### Task 2: Visual Styling

**Files:**
- Modify: `D:/projects/dashboard/styles.css`

- [ ] **Step 1: Add bridge CSS**

Add styles for:

- `.cashflow-bridge`
- `.cashflow-bridge-side`
- `.cashflow-bridge-bar`
- `.cashflow-bridge-bar-label`
- `.cashflow-bridge-bar-amount`
- `.cashflow-net-core`
- risk state for outflow bars

- [ ] **Step 2: Preserve truncation and hover fallback**

Labels should use ellipsis visually while titles keep full data.

- [ ] **Step 3: Browser-check the component**

Use the current Vite preview URL and dynamic sample to verify the bridge is readable.

### Task 3: Interaction

**Files:**
- Modify: `D:/projects/dashboard/src/render/flow-diagram.js`
- Modify: tests if an existing integration test covers flow drilldown hooks

- [ ] **Step 1: Preserve clickable drill target metadata**

Each bar should include `data-head`, `data-flow`, and a button role so `main.js` can wire click behavior if already delegated.

- [ ] **Step 2: Confirm hover titles**

Each bar should include a `title` attribute with full head, direction, exact amount, and share.

### Task 4: Verification

**Files:**
- No production files beyond renderer/styles/tests.

- [ ] **Step 1: Run full tests**

```powershell
npm test
```

- [ ] **Step 2: Run build**

```powershell
npm run build
```

- [ ] **Step 3: Capture browser screenshot**

Use Playwright against:

```text
http://127.0.0.1:5174/cfo-flightdeck-dashboard/
```

Expected: Cashflow Bridge appears in the old flow section, labels and amounts are readable, net total sits in center, no old curved lane paths.

## Self-Review

Spec coverage:

- Ranked left/right bars: Task 1 and Task 2.
- Labels, shares, amounts: Task 1.
- Net total center circle: Task 1 and Task 2.
- Truncation plus hover fallback: Task 1 and Task 2.
- Risk coloring: Task 1 and Task 2.
- Motion and old lane removal: Task 1 and Task 2.
- Verification: Task 4.

No placeholder requirements remain.
