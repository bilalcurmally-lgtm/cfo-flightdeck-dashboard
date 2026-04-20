# CFO Flight Deck 1.0.1

Share this build with the accountant tester instead of the April 17 build.

## What To Test

- Load the bundled sample and confirm the new dashboard layout feels easier to scan.
- Check the new SaaS Controls section for recurring revenue signal, burn multiple, outflow concentration, and latest period net.
- Review the Trend by Period chart and Top Heads chart. They should be larger, easier to read, and should not need horizontal scrollbars.
- Try Daily, Weekly, and Monthly view modes.
- Click a period bar or account head and confirm the whole dashboard narrows to that exact slice.
- Enter a bank balance and balance date, then confirm Cash Runway updates.
- Add one manual Forecast Assumptions event, then confirm the 13-Week Cash Forecast and CEO Pulse forecast insight update.
- Export visible rows after filtering and confirm the CSV matches the active slice.

## New Since The Previous Test Build

- Added Cash Runway based on current bank balance.
- Added a 13-week base-case cash forecast using current balance, recent weekly run-rate, and manual future cash events.
- Added Forecast Assumptions for dated cash-in/cash-out events with local persistence.
- Added bank balance and balance date inputs.
- Added a SaaS Controls panel for revenue quality and burn signals.
- Added recurring revenue detection for rows labelled as subscription, recurring, enterprise, SMB, license, SaaS, MRR, or ARR.
- Added CEO Pulse and Data Quality notes for forecast pressure and insufficient historical weeks.
- Improved Data Quality reporting for loaded, mapped, skipped, and locally saved rows.
- Improved chart sizing and default monthly view so the two main visual graphs are full-width and legible.
- Added local recent dataset restore.
- Added visible-row CSV export.
- Added URL and local storage persistence for common dashboard state.
- Added a more cockpit-like left control rail and operating-view header.

## Suggested Message To Send

Hi, I made a new CFO Flight Deck test build. Please use this one instead of the version from yesterday because it adds the cash runway, 13-week cash forecast, SaaS controls, larger charts, data-quality checks, recent dataset restore, and visible-row export.

Start with the bundled sample file, then try one anonymized CSV if you are comfortable. The app runs locally, but please do not use sensitive client data yet.

Installer: `CFO Flight Deck Setup 1.0.1.exe`

Test guide: `ACCOUNTANT_TEST_GUIDE.md`

## Privacy Note

This is still a local beta build. Use anonymized or sample data first. Recent datasets are saved on the tester's machine so the app can restore the last file.
