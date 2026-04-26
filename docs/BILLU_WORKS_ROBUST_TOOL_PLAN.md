# Billu.Works Finance Tool Blend Plan

Last updated: 2026-04-26

Goal: turn the current CFO Flight Deck into a stronger Billu.Works finance utility without losing the working dashboard, privacy promise, accountant-review flow, or deployability.

## Product Thesis

Build a privacy-first finance dashboard for small operators: freelancers, consultants, solo founders, agencies, and small companies that want to understand cash without uploading private bank exports into an AI product.

Core promise:

- Works from local CSV first, Excel later.
- No account required for the free tool.
- No transaction data uploaded by default.
- No AI pushed into the main workflow.
- Clear formulas and auditable calculations.
- Useful enough for a solo pro, but credible enough for accountant review.

## Checkpoint Rules

Before blending in features from any fork/reference repo, freeze the current working app as the baseline.

1. **Finish current local fixes**
   - Currency selector/search fix.
   - Reference repo notes in `docs/FUTURE_IDEAS.md`.
   - Verify with `npm test` and `npm run build`.

2. **Create a checkpoint branch/tag**
   - Branch suggestion: `codex/billu-works-finance-baseline`.
   - Optional tag after commit: `baseline-before-reference-blend-2026-04-26`.
   - Purpose: a known-good restore point before larger architecture/product changes.

3. **Fork/reference repo handling**
   - Fork `Sagargupta16/Financial-Dashboard` under our own GitHub account/org for study.
   - Do not merge its history into this repo.
   - Do not copy large code blocks directly unless license and fit are reviewed.
   - Treat it as an external reference for features, formulas, and architecture patterns.

4. **No-loss rule**
   Every new feature must preserve:
   - local CSV processing
   - current KPI strip
   - cash runway and 13-week forecast
   - data-quality warnings
   - accountant review/export workflow
   - privacy copy
   - Vercel build
   - test suite

## Phase 0: Stabilize Current Tool

Outcome: current dashboard is stable enough to become the Billu.Works baseline.

Tasks:

- Commit the currency fix.
- Keep the “display formatting only, not converter” wording unless we later add real exchange rates.
- Add/keep a clear privacy statement in the app and docs.
- Confirm hosted Vercel behavior after deploy.
- Run a browser smoke test for:
  - sample data load
  - CSV import
  - mapping failure
  - currency search
  - forecast event
  - export visible rows

Exit criteria:

- `npm test` passes.
- `npm run build` passes.
- Browser smoke path passes.
- Working baseline branch/tag exists.

## Phase 1: Finance Model Hardening

Outcome: formulas become explicit, tested, and easier to defend.

Adapt from reference repo:

- Centralized calculation discipline.
- Formula documentation.
- Stronger import validation.

Tasks:

- Add `docs/FINANCE_FORMULAS.md`.
- Document:
  - revenue
  - outflow
  - net cash
  - efficiency ratio
  - average monthly revenue
  - average monthly outflow
  - monthly net burn
  - runway months
  - top-head concentration
  - anomaly thresholds
  - 13-week forecast assumptions
- Add tests for formula edge cases:
  - refunds
  - zero revenue
  - zero outflow
  - negative net cash
  - empty periods
  - one-time large transactions
  - partial months

Do not add UI complexity in this phase.

Exit criteria:

- Every major displayed finance metric has a documented formula and test coverage.

## Phase 2: Import Power-Up

Outcome: the tool accepts more real-world files without becoming fragile.

Adapt from reference repo:

- Excel import.
- Better account/category handling.

Tasks:

- Add `.xlsx` and `.xls` import using a real parser.
- Extend mapping to support optional fields:
  - account/bank/wallet
  - category/head
  - subcategory/subhead
  - counterparty/vendor/customer
  - transfer reference
- Improve data-quality panel to show:
  - missing optional fields
  - duplicate rows
  - suspected transfers
  - unmapped categories
  - suspicious signs or amount direction

Exit criteria:

- CSV behavior remains unchanged.
- Excel files can be loaded and mapped.
- Data-quality warnings explain import uncertainty before charts render confidently.

## Phase 3: Business Cash Features

Outcome: blend the best reference features into our business-cash cockpit.

Adapt:

- Running balance.
- Account balances.
- Transfer tracking.
- Subcategory drilldowns.
- Better time navigation.

Tasks:

- Add running balance in transaction table when opening balance is known.
- Add account balance view when account field exists.
- Detect internal transfers and exclude them from revenue/outflow totals by default.
- Add drilldown path:
  - period
  - head/category
  - subhead/subcategory
  - transaction rows
- Add better period controls:
  - this month
  - last month
  - last 30/90 days
  - YTD
  - all time
  - custom range

Exit criteria:

- Internal transfers do not inflate revenue/outflow totals.
- Running balance is hidden or clearly marked unavailable when opening balance is missing.
- Drilldowns preserve the current dashboard flow.

## Phase 4: Solo Pro / Public Tool Packaging

Outcome: make it usable as a Billu.Works public/free tool.

Tasks:

- Create Billu.Works route/product framing:
  - “Private Cash Flow Dashboard”
  - “Burn Rate Calculator”
  - “Runway Calculator”
  - “Bank CSV Analyzer”
- Add an in-app mode selector if needed:
  - Solo/Freelancer
  - Small Business
  - Founder/CFO
- Keep one shared calculation engine.
- Add sample datasets for each mode.
- Add chart/table export:
  - PNG for charts
  - CSV for visible rows
  - markdown summary for KPIs
- Add lightweight help pages:
  - local-first privacy
  - how to export bank CSV
  - how formulas work
  - what the tool does not do

Exit criteria:

- A first-time visitor understands the tool in under 30 seconds.
- The actual dashboard remains the first useful screen, not a marketing page.
- Privacy promise is visible before upload/import.

## Phase 5: SEO And Monetization Layer

Outcome: drive traffic without harming trust.

SEO pages to build around the tool:

- `/tools/cash-flow-dashboard`
- `/tools/runway-calculator`
- `/tools/burn-rate-calculator`
- `/tools/bank-csv-analyzer`
- `/guides/how-to-analyze-a-business-bank-csv`
- `/guides/freelancer-cash-flow-dashboard`
- `/privacy/local-first-finance-tools`

Monetization rules:

- Ads can live on guide pages.
- Keep ads out of the upload/import and dashboard workspace unless they are very restrained.
- Add privacy/cookie disclosures before using ad networks.
- Prefer useful affiliate links later:
  - bookkeeping tools
  - invoicing tools
  - accountant services
  - company finance templates

Exit criteria:

- Public pages are indexable.
- Dashboard privacy is not compromised.
- Ads do not make the tool feel untrustworthy.

## Phase 6: Optional Pro Layer

Only after free usage proves demand.

Possible paid features:

- Saved local workspaces.
- Branded PDF report export.
- Multi-file merge.
- Budget vs actual.
- Scenario comparison.
- Accountant review packet.
- White-label dashboard for small firms.

Avoid early:

- User accounts.
- Server-side storage of transaction data.
- Bank integrations.
- AI summaries as the main feature.

## Implementation Guardrails

- Add features behind tested pure functions first.
- Keep UI changes small and reversible.
- One feature branch per major feature.
- Every phase must preserve tests/build.
- Use browser smoke checks for anything user-facing.
- Update docs before or with each finance behavior change.
- Do not make the app depend on the reference fork at runtime.

## Suggested Branch Sequence

1. `codex/billu-works-finance-baseline`
2. `codex/formula-docs-and-tests`
3. `codex/excel-import-mapping`
4. `codex/transfer-running-balance`
5. `codex/public-tool-packaging`
6. `codex/seo-pages`

## First Next Actions

1. Commit current currency fix and reference notes.
2. Create baseline branch/tag.
3. Add `docs/FINANCE_FORMULAS.md` skeleton.
4. Decide first blend feature: Excel import or transfer/running balance.
5. Build that first feature in isolation with tests.
