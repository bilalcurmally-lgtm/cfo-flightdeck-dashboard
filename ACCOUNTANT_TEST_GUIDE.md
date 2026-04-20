# CFO Flight Deck — Accountant Test Guide

## Goal

Check whether CFO Flight Deck helps a finance/accounting reviewer inspect a CSV export faster than a spreadsheet alone.

Use the bundled `sample-accountant-review.csv` first. It includes realistic revenue, outflow, categories, anomalies, one unknown flow label, and a couple of bad rows so the data-quality panel can be checked.

## Privacy Note

The desktop app runs locally and stores recent datasets in the laptop browser/WebView storage. For first testing, use anonymized or sample data. Do not use sensitive client exports until the tester is comfortable with the installation and storage behavior.

## Test Script

1. Open CFO Flight Deck.
2. Click **Load bundled sample**.
3. Confirm the **Data Quality** panel shows:
   - Rows loaded
   - Rows mapped
   - Rows skipped
   - Date format
   - Unknown flow labels
   - Saved locally
4. Switch currency in **Display** and confirm KPIs, charts, matrix, and transaction rows update.
5. Switch Daily, Weekly, and Monthly view modes.
6. Click a tall period bar in **Trend by Period** and confirm the table narrows to that period.
7. Click a head in **Top Heads** and confirm the dashboard narrows to that account head.
8. Use Search for `payroll`, `hosting`, and `subscription`.
9. Export visible rows and open the downloaded CSV.
10. Reload the app and confirm the recent dataset restores without choosing the CSV again.
11. Enter a realistic test bank balance and confirm **Cash Runway**, **SaaS Controls**, and **CEO Pulse** update.
12. Add one dated **Forecast Assumptions** cash-out event and confirm **13-Week Cash Forecast** and **CEO Pulse** update.
13. Review the **Cockpit Guide** and confirm the listed capabilities are easy to find in the product.

## Feedback Form

Copy this section into your reply and answer in plain language.

### Quick Verdict

- Would you use this for a real finance review if privacy/storage was approved?
- What is the most useful thing already here?
- What is the first thing you would fix before showing this to another accountant?
- Does this feel like a finance cockpit, or still like a nicer CSV viewer?

### Data Trust

- Do the totals look understandable and trustworthy?
- What would make you distrust the numbers?
- Is the Data Quality panel enough to catch mapping mistakes?
- Are skipped rows, unknown flow labels, and date-format detection clear enough?

### Accounting Language

- Are these terms right: revenue, cash outflow, net cash, efficiency ratio, parent head, account head?
- What would you rename?
- Would your exports use different column names?
- Do you normally receive one signed Amount column, or separate Debit/Credit columns?

### Cash Health

- Is Cash Runway useful?
- Is the 13-week cash forecast useful?
- Is monthly net burn explained clearly enough?
- Should average monthly revenue and average monthly outflow be shown differently?
- What assumptions would you expect the app to state before trusting runway or forecast?

### SaaS / Business Signals

- Are Recurring Signal, Burn Multiple, Outflow Concentration, and Latest Period Net useful?
- What SaaS or small-business metrics are missing?
- Are large one-time item warnings helpful or noisy?

### Drilldowns And Export

- Is it obvious that chart bars and matrix rows are clickable?
- Is the active filter/drilldown state clear?
- Is reset easy enough?
- Does exported visible-row CSV match the filtered view?
- Would you prefer CSV, Excel, PDF, or all three?

### Missing Features

Mark anything you would expect:

- Separate Debit/Credit column support
- Vendor/customer grouping
- Opening and closing balances
- Bank reconciliation
- Tax categories
- GST/VAT/sales tax view
- Aging reports
- Forecast scenario comparison
- Anomaly explanations
- Client-ready PDF/Excel report
- Print view
- Other:

### Bugs Or Cut-Off UI

- Did anything look cut off, crowded, or unreadable?
- What screen size or window size were you using?
- Please include screenshots if possible.

## Questions For The Accountant

1. Do the totals look understandable and trustworthy?
2. Are the terms right: revenue, cash outflow, net cash, efficiency ratio, parent head, account head?
3. Would your real export have different column names?
4. Do you normally get one signed Amount column, or separate Debit/Credit columns?
5. What would make you distrust the dashboard?
6. Which drilldown or report would you expect next?
7. Is the data-quality panel enough to catch mapping mistakes?
8. Would you send an exported filtered CSV to a client or founder?

## Known Gaps To Watch For

- Separate Debit/Credit columns are not supported yet.
- Multi-currency rows inside one CSV are not detected; currency is currently a display setting.
- The app does not yet detect opening/closing balances.
- The app does not yet group vendors or customers separately from account heads.
- Recent datasets stay on the local machine until browser/WebView storage is cleared.
