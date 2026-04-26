# Future Ideas

These are intentionally parked until reviewers ask for them or the product need becomes obvious.

## Local CFO Summary

Generate a CFO-style summary in-browser from the tested finance modules.

- No AI provider.
- No external network call.
- No transaction data leaves the browser.
- Good first version: revenue concentration, largest outflow pressure, runway status, data-quality warnings, and active drill context.

## External AI Brief

Optional enhanced narrative using a configured AI endpoint.

- Explicit opt-in only.
- Clear warning that aggregate financial signals are sent externally.
- Send aggregate KPIs, period totals, cash health, data quality, and top heads only.
- Never send raw transaction descriptions, memo text, or row-level CSV data.
- Hide this behind an advanced integration setting if real users ask for it.

## Real Scenarios

Replace the removed visual-only Base/Bear/Bull chips with a real scenario editor.

- User can create named scenarios.
- Manual events and assumptions attach to a scenario.
- Forecast compares scenario ending cash, cash-out week, and net runway.

## Reference: Sagargupta16/Financial-Dashboard

Source: https://github.com/Sagargupta16/Financial-Dashboard

Use this repo as a product and architecture reference, not as a direct code transplant. It is aimed more at personal finance and Money Manager exports, while CFO Flight Deck is a business cash cockpit for accountant-reviewed CSVs.

### Highest-value ideas to adapt

- **Single calculation layer**: Keep strengthening `src/finance` and pure calculation modules so every KPI, chart, insight, and export uses the same source of truth.
- **Formula reference docs**: Add a finance-formula reference for our metrics: revenue, outflow, net cash, efficiency ratio, monthly net burn, runway, concentration, anomaly thresholds, and forecast assumptions.
- **Running balance**: Add a transaction-table running cash balance once accountants confirm the correct opening balance and transfer treatment.
- **Account balance view**: Show current/derived balances by bank account or payment channel when source exports include account fields.
- **Transfer tracking**: Detect internal transfers separately so revenue/outflow totals are not distorted by bank-to-bank movement.
- **Savings/burn velocity equivalent**: For us this becomes burn velocity: latest 30 days outflow versus historical baseline, with a warning band.
- **Category concentration metric**: Promote top outflow head concentration into a permanent KPI or insight, not only a chart label.
- **Time navigation**: Improve monthly/yearly/all-time drill controls for top heads, trends, and subcategory views.
- **Subcategory analysis**: Add a second-level drill when accountant mappings include parent/head/subhead or vendor/category fields.
- **Chart export**: Let reviewers export key charts as PNG for email, board decks, or accountant notes.
- **Excel import**: Add `.xlsx` / `.xls` support after CSV flows are stable, using a real parser instead of asking users to convert manually.
- **Budget vs actual**: Add a lightweight budget/target overlay for revenue, outflow heads, and runway once real targets exist.
- **Reusable UI primitives**: If/when we move deeper into React, use a small component system for tabs, selects, dialogs, and tables instead of hand-coded one-offs.
- **Developer quality gates**: Consider Biome or similar formatting/linting once the current vanilla/Vite app stops shifting rapidly.

### Finance ideas worth parking for later

- **Investment performance**: Only useful if the company has treasury/investment activity; otherwise it is personal-finance noise.
- **Tax planning**: Potentially useful, but must be localized to the company jurisdiction and accountant-approved. Do not copy Indian personal tax slab logic into this product.
- **Reimbursements/cashback/lifestyle analytics**: Not core for CFO Flight Deck unless the business data specifically includes employee reimbursements, card rebates, or expense-policy review.
- **Food/transport/personal spending insights**: Skip for this product. It is the wrong mental model for a company cash cockpit.
- **AI-style recommendations**: Useful only if grounded in tested local aggregate signals. Avoid generic advice cards that sound smart but cannot be defended.

### Architecture lessons to borrow carefully

- **Feature-first folders**: Our app is already modular, but future larger areas should be grouped by feature: import/export, finance calculations, forecast, insights, transactions, and settings.
- **Typed domain model**: A TypeScript migration could help once the data model settles: transaction record, mapped row, period summary, head summary, cash-health result, forecast result, and data-quality report.
- **Pure functions first**: Finance requirements should enter as tested functions before they enter charts.
- **Documentation near formulas**: Each non-obvious metric should have a definition, source fields, exclusions, and test cases.
- **Import validation**: Expand data-quality checks before adding new analytics. Bad mapping should block confident-looking outputs.

### Things not to copy

- Personal-finance assumptions as defaults.
- INR-only or country-specific financial logic.
- Large dependency changes only for visual parity.
- Complex charting libraries unless our current SVG approach becomes a real limitation.
- AI/insight copy that is not tied to auditable calculations.

