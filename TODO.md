# CFO Flight Deck — TODO

## Open

### P2 — High value, not urgent

### Delight items

- **DELIGHT 1** — **Copy KPIs button** (S)
  Add a clipboard action that copies revenue / outflow / net / efficiency ratio as a markdown table.

- **DELIGHT 2** — **Keyboard shortcut `R` to reset filters** (XS)
  Add `R` to the keyboard handler in `main.js`, guarded so it does not fire while focused on an input/select/textarea.

- **DELIGHT 3** — **Theme toggle** (M)
  Add a dark/light/system setting. The design is now dark-first, so light mode should be deliberate rather than a simple inversion.

- **DELIGHT 5** — **Drill-context insight card** (S)
  When `state.filters.focusedPeriod` is set, prepend an insight explaining how that period compares with the selected average.

## Done

- **TODO A** — Integration test suite for CSV → mapping → render smoke path, missing required mapping, all-rows-skipped state, and URL/localStorage round-trip.
- **TODO C** — IndexedDB recent dataset persistence with restore-on-load and a recent dataset selector.
- **TODO E** — localStorage schema versioning.
- **TODO F** — HTTP non-OK handling for sample fetch.
- **TODO G** — URL grain validation.
- **TODO J** — Data-quality panel showing loaded rows, mapped rows, skipped rows, detected date format, missing optional fields, unknown flow labels, and local persistence status.
- **DELIGHT 4** — SVG chart hover tooltips.
- **Design pass** — Modern sci-fi SaaS shell based on the provided references, visible currency selector, dashboard-first layout, data-quality panel, and responsive polish.
- **TODO 2** — Modularized `app.js` into ES modules under `src/`, added Vite build.
- **TODO 3** — Unit test suite across core parser, mapper, formatter, amount, date, filters, and currency behavior.
- **TODO 4** — Error hardening gaps fixed, including BOM strip, try/catch handling, file validation, and non-finite value guards.
- **TODO 5** — Date format auto-detection + user override in column mapping panel.
- **TODO 6** — localStorage persistence for mapping, aliases, grain, filters, and now schema version.
- **TODO 7** — 25 currencies including PKR, with zero-decimal currency support.
- **TODO 8** — 150ms debounce on inputs, memoized summaries, delegated event handling.
- **TODO 9** — URL state sync for filter state.
- **TODO 10** — Vite + GitHub Pages CI/CD via GitHub Actions.
- **TODO L** — Central cash-health summary model with tested average monthly revenue, average monthly outflow, monthly net burn, runway months, runway status, and prior-window runway delta.
- **TODO M** — Visible cash-health metrics in Cash Runway KPI, CEO Pulse, and SaaS Controls, including average monthly revenue/outflow and immediate-attention zero-balance state.
- **TODO N** — Runway trend context versus the prior comparable monthly window.
- **TODO O** — Period-over-period context for Efficiency Ratio and Cash Runway plus visible variance columns in Period Matrix.
- **TODO P** — Top-head share visibility in the Top Heads chart labels and tooltips.
- **TODO Q** — CEO Pulse promotion for data-quality warnings, recurring revenue signal, outflow concentration, and one-time item warnings.
- **TODO R** — Large one-time transaction detection surfaced as CEO Pulse warning cards.
- **TODO S** — Dashboard-wide feature visibility audit pass with a visible Cockpit Guide covering local CSV loading, auto mapping, aliases, chart drilldowns, saved state, and visible-row export.
- **TODO H** — Accountant test packet with checklist, structured feedback form, privacy warning, cash-health checks, export checks, and missing-feature prompts.
- **TODO I** — External testing decision documented: Windows installer for accountant Windows testing, GitHub Pages preview for Mac/stakeholder review, anonymized/sample CSVs only.
- **TODO K** — Left sidebar clipping fix for narrow desktop widths by stacking recent dataset controls, wrapping status text, and constraining Load Data inputs.
- **TODO B** — Web Worker-backed finance view for filtering, period summary, head summary, and cash-health calculation, with tested synchronous fallback for browsers/tests without Worker support.
- **TODO D** — Optional CFO Brief panel with locally stored endpoint/model/API-key settings, off by default, sending only aggregate dashboard signals to an OpenAI-compatible endpoint when the user clicks Generate brief.
- **Founder Cockpit Forecast** — 13-week base-case cash forecast from current balance, recent weekly run-rate, and manually entered future cash events, with forecast insight, data-quality history note, local persistence, and chart legibility improvements.
