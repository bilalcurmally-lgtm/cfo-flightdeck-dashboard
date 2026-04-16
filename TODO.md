# CFO Flight Deck — TODO

## P1 — Must do before next feature work

### TODO 2: Modularize app.js into ES modules + add Vite
- **What:** Split 931-line IIFE into ~12 ES module files, add Vite for dev/build
- **Why:** Monolithic IIFE blocks testability, tree-shaking, HMR, and collaborative development
- **Effort:** L
- **Depends on:** Nothing
- **Module structure:**
  ```
  src/
    csv/parse.js, csv/map.js
    filter/filter.js, filter/drill.js, filter/grain.js
    render/kpi.js, render/chart.js, render/matrix.js, render/insight.js, render/table.js, render/export.js
    store/local-storage.js, store/session-store.js, store/state.js
    core/date.js, core/amount.js, core/escape.js, core/format.js
    io/file.js, io/fetch.js
    config/currency.js, config/locale.js, config/aliases.js
    main.js
  ```

### TODO 3: Add Vitest + unit tests for pure functions
- **What:** Add vitest, write 40-50 unit tests covering parseCsv, parseDate, parseAmount, classifyFlow, matchColumn, escapeHtml, csvEscape, filterRecords, buildPeriodSummary, groupBy, percentChange, detectOutflowAnomaly
- **Why:** Zero tests currently. No way to verify correctness after changes.
- **Effort:** M
- **Depends on:** TODO 2 (ideally) — but can test pure functions extracted from current IIFE first
- **Priority tests (ship-at-2am set):**
  - parseCsv: BOM, CRLF, quoted fields, unclosed quotes, empty input
  - parseDate: ISO, D/M/Y, M/D/Y auto-detect, null, unparseable
  - parseAmount: symbols, parenthesized negatives, NaN, null
  - classifyFlow: revenue/outflow aliases, both-match precedence, fallback to sign
  - filterRecords: all filter combinations, empty result, start > end

### TODO 4: Error hardening — fix 7 CRITICAL GAPS
- **What:**
  1. try/catch around `loadSampleData` fetch + show error in fileStatus
  2. try/catch around `onFileSelected` file.text() + show error
  3. File size limit (50MB) + MIME/extension validation on upload
  4. Strip BOM in parseCsv before processing headers
  5. Wrap each sub-render in try/catch — degrade panel instead of crashing whole dashboard
  6. Guard formatCurrency/shortCurrency against NaN/Infinity — show "—"
  7. Guard humanPeriodLabel against invalid period strings — show raw string
- **Why:** 7 error paths have no handling. Silent failures and crashes.
- **Effort:** M (combined)
- **Depends on:** Nothing

### TODO 5: Date format auto-detection + user override
- **What:** Scan first 50 rows for disambiguating date values (>12 = day or month), add Date Format selector in Column Mapping panel
- **Why:** parseDate assumes D/M/Y — silently produces wrong dates for US-format CSVs (data corruption)
- **Effort:** M
- **Decided:** Auto-detect + user override (per review Issue 2 decision)
- **Depends on:** Nothing

## P2 — Should do soon

### TODO 6: localStorage persistence for state
- **What:** Save and restore mapping, aliases, grain, filter state to localStorage on change, restore on page load
- **Why:** User must re-map columns and re-set filters every page reload
- **Effort:** S
- **Depends on:** Nothing

### TODO 7: Currency/locale configuration
- **What:** Replace hardcoded USD with configurable currency + locale, add selector in sidebar
- **Why:** Dashboard is unusable for non-USD companies
- **Effort:** S
- **Depends on:** Nothing

### TODO 8: Render performance — debounce + memoize
- **What:** Add 150ms debounce on search/date inputs, memoize periodSummary/headSummary when filters unchanged, only rebuild headChecklist when records change
- **Why:** Every keystroke triggers full re-render with 7 DOM rebuilds
- **Effort:** S
- **Depends on:** Nothing

### TODO 9: URL state sync
- **What:** Read/write URL search params for grain, focusedPeriod, focusedHead, startDate, endDate, flows
- **Why:** No way to share or bookmark a specific dashboard state
- **Effort:** M
- **Depends on:** Nothing

### TODO 10: Vite + GitHub Pages deployment pipeline
- **What:** Add Vite for dev server (HMR) + build, add GitHub Actions workflow for CI (lint + test) + deploy to GitHub Pages on push to main
- **Why:** No deployment process. Python HTTP server is not production.
- **Effort:** M
- **Depends on:** TODO 2 (Vite), TODO 3 (tests for CI)
