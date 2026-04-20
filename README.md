# CFO Flight Deck

Local, interactive finance dashboard for CEO-level review of revenue and cash outflows from a CSV export.

## What it does

- Loads a CSV from your machine whenever you want to inspect fresh data
- Auto-detects common column names and lets you remap them manually
- Aggregates by daily, weekly, or monthly periods
- Filters by date, flow type, search text, and account heads
- Supports click-through drilldown from trend chart, head chart, and period matrix
- Shows a transaction drillthrough table for the exact active slice
- Builds a 13-week base-case cash forecast from current balance, recent weekly run-rate, and manual future cash in/out events
- Surfaces forecast health in CEO Pulse and Data Quality so missing history or upcoming cash pressure is visible

## Expected CSV shape

The app is flexible, but it works best when your file has columns similar to:

- `Date`
- `Amount`
- `Flow Type` with values like `Revenue` or `Outflow`
- `Account Head`
- `Parent Head`
- `Description`

If `Flow Type` is missing, the app assumes:

- Positive amounts are revenue
- Negative amounts are cash outflows

Forecast assumptions are entered separately in the sidebar. Manual future events include a date, cash in/cash out direction, amount, and label, and are stored locally with the rest of the dashboard state.

## Run locally

From this folder:

```powershell
./start-dashboard.ps1
```

Then open [http://localhost:4173](http://localhost:4173).

You can also use any static file server you like.

## Sample file

`sample-accountant-review.csv` is the main review sample. It includes realistic revenue and outflow categories, anomalies, one unknown flow label, and a couple of bad rows so the data-quality panel can be checked.

`sample-finance.csv` is still included as a smaller smoke-test sample.

## Desktop installer

This project can also be built as a Windows desktop app with Electron:

```powershell
npm run desktop:build
```

The installer is emitted under `release/` as `CFO Flight Deck Setup <version>.exe`.

Use `ACCOUNTANT_TEST_GUIDE.md` when sending the app to an accountant for beta feedback.

## External testing decision

Use the Windows installer for accountant testing on Windows. Use the GitHub Pages web preview for Mac or quick stakeholder review:

[https://bilalcurmally-lgtm.github.io/cfo-flightdeck-dashboard/](https://bilalcurmally-lgtm.github.io/cfo-flightdeck-dashboard/)

The web preview is for bundled sample data and anonymized CSVs only. The CSV is read locally in the browser, but the page itself is public, so do not use sensitive client exports until a private deployment path is agreed.
