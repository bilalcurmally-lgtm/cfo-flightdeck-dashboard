# CFO Flight Deck

Local, interactive finance dashboard for CEO-level review of revenue and cash outflows from a CSV export.

## What it does

- Loads a CSV from your machine whenever you want to inspect fresh data
- Auto-detects common column names and lets you remap them manually
- Aggregates by daily, weekly, or monthly periods
- Filters by date, flow type, search text, and account heads
- Supports click-through drilldown from trend chart, head chart, and period matrix
- Shows a transaction drillthrough table for the exact active slice

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

## Run locally

From this folder:

```powershell
./start-dashboard.ps1
```

Then open [http://localhost:4173](http://localhost:4173).

You can also use any static file server you like.

## Sample file

`sample-finance.csv` is included so you can test the dashboard immediately.
