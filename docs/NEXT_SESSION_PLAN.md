# CFO Flight Deck Next Session Plan

Last updated: 2026-04-19

This note captures the design/product decisions from the redesign review so the next session can continue without relying on chat history.

## Current Direction

The app should feel like a loud, readable CFO cockpit, not a configuration panel. The main dashboard is for operating the business. The settings drawer is backstage.

Main dashboard should show:

- KPI strip
- 13-week cash forecast
- trends
- cashflow lanes
- CEO Pulse
- SaaS/operating signals
- data quality status
- active filters and drill context
- period matrix
- transactions

Settings drawer should keep:

- CSV load and recent dataset restore
- column mapping
- forecast assumptions/manual events
- currency/display
- advanced filters
- future/optional integration settings only when needed

## Agreed Layout Changes

1. Keep the 13-week cash forecast as a major hero section.
2. Put **Trend by Period** before Cashflow.
3. Put **Cashflow Lanes** as its own full-width standalone section below Trends.
4. Put **CEO Pulse** below Cashflow, with more horizontal room and cleaner stacked insight rows.
5. Move **SaaS Controls** out of settings and rename it to **SaaS Signals** or **Operating Signals**.
6. Move **Data Quality** out of settings into the main dashboard as a compact trust/status strip.
7. Move **Active Filters & Drill** out of settings and show it near the top as chips/context.
8. Show **Focus Breakdown** only when a period/head drilldown is active.
9. Redesign **Period Matrix** so it uses the full width instead of leaving dead space on the right.
10. Remove the large **Cockpit Guide** from the main dashboard. Replace it with a small help item.

## Sidebar Order

Recommended rail order:

1. Cockpit
2. Forecast
3. Trends
4. Cashflow
5. CEO Pulse
6. Matrix
7. Transactions
8. Settings
9. Help, if we add a small help/about item

## Known Bug To Fix First

Cashflow Lanes currently shows "This section could not be rendered" in the browser. Fix this before layout work.

Likely area:

- `src/render/flow-diagram.js`
- SVG/title rendering
- any thrown exception caught by `safeRender("flowDiagram", ...)`

Expected behavior after fix:

- lanes render visibly
- revenue lanes flow left to center
- outflow lanes flow center to right
- every lane has hover text with head name, amount, percentage share, and direction
- click on a lane can eventually filter by that head

## Period Matrix Redesign

The current matrix table is too narrow and leaves most of the panel empty. Replace it with a richer full-width analysis layout.

Proposed structure:

- full-width period rows
- embedded revenue/outflow/net bars
- visible delta columns
- efficiency/runway context where useful
- selected-period inspector on the right or top-right
- daily grain should group or chunk rows so it does not become a spreadsheet wall

The matrix should feel like a finance heatmap, not a raw table.

## CEO Pulse Redesign

The current CEO Pulse reads like a log. It should read like an executive signal board.

Proposed grouping:

- Critical
- Watch
- Positive
- Context

Each insight row should include:

- short title
- one-line explanation
- amount/period/head metadata
- severity color only when useful

## SaaS Signals

Do not keep this in settings. It is dashboard intelligence, not a control surface.

Rename candidates:

- SaaS Signals
- Operating Signals
- Business Signals

Signals to surface:

- recurring revenue signal
- burn multiple
- average monthly revenue
- average monthly outflow
- outflow concentration
- latest period net

## Data Quality

Data quality should be visible because it changes trust in every number.

Recommended compact strip:

`Data quality: 114 mapped · 1 skipped · dmy · unknown flow: adjustment`

Behavior:

- quiet/neutral if clean
- amber/red if rows are skipped or unknown flow labels exist
- clickable detail can open settings drawer or a dedicated detail panel

## Active Filters And Drill Context

Show active filters near the top as chips.

Examples:

- grain: monthly
- dates: 2026-01-02 to 2026-12-08
- flows: revenue, outflow
- focused period/head when drilled

Focus Breakdown should appear only when the user has clicked into a period or head.

## Help Item

Remove the full Cockpit Guide from the main page.

Replace with a small help item that can explain:

- CSV files are processed locally
- how mapping works
- how drilldowns work
- what the major panels mean
- what data quality warnings mean

This should not take prime dashboard space.

## AI Brief Decision

Remove AI Brief from the live UI for now.

Reason:

- The product promise is privacy/local-first.
- External AI would send sensitive aggregate financial data to a provider.
- Even aggregate revenue, burn, runway, and top heads are business-sensitive.
- Nobody has asked for this yet.

Future path if users ask for it:

1. **Local CFO Summary**
   - rule-based
   - generated in-browser from existing tested modules
   - no external calls
   - keeps the privacy promise

2. **External AI Brief**
   - optional only
   - explicit opt-in
   - clear privacy warning
   - sends aggregate metrics only, never raw transaction descriptions
   - hidden behind an advanced integration setting

Backlog wording:

> Future idea: Local CFO Summary first. External AI Brief only if reviewers ask for it, with explicit consent and privacy wording.

## Deployment And Privacy Plan

Target deployment:

- Vercel free plan
- custom domain may eventually be via Porkbun
- app-level password gate preferred because Vercel Password Protection is not available on the free plan

Privacy model to preserve:

> Hosted app shell is public/protected. CSV data is processed locally in the reviewer browser. No CSV is uploaded.

Add this wording to the app/help/docs before sharing externally:

> CSV files are processed locally in your browser. No transaction data is uploaded by this app.

Recommended gate:

- simple app-level password screen
- password stored as a Vercel environment variable at build/deploy time or checked by a tiny serverless route if we add one
- no user accounts
- no database
- session cookie or local session unlocks the app
- good enough for sharing with a few trusted reviewers

Important: do not rely on obscure URLs as privacy.

## External Review Plan

Potential reviewers:

- boss/current internal user
- investment banking friend in Dubai
- ACCA-certified accountant in office

Goal:

- let them scrutinize usefulness, financial correctness, missing workflows, and readability
- collect feature requests before adding advanced features like AI Brief

## Next Session Task Order

1. Fix Cashflow Lanes render bug.
2. Remove AI Brief from main UI and settings, then park it in future ideas.
3. Remove Cockpit Guide from main dashboard and add a small Help item.
4. Move SaaS Signals, Data Quality, Active Filters, and contextual Focus Breakdown into the main dashboard.
5. Reorder sidebar to match the agreed story.
6. Make Cashflow Lanes standalone and full-width below Trends.
7. Redesign CEO Pulse into a wider signal board.
8. Redesign Period Matrix to use full width with better columns/rows.
9. Add app-level password gate for Vercel sharing.
10. Add privacy wording before deployment.
11. Re-run tests/build/browser smoke.

