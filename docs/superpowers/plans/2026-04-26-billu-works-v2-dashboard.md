# Billu.Works V2 Dashboard Plan

Date: 2026-04-26

## Decision

Use the current `cfo-flightdeck-dashboard` repo as the old/stable dashboard that updates the existing Vercel deployment. Use `https://github.com/bilalcurmally-lgtm/cfo-flightdeck-dashboard-2-.git` as the new V2 dashboard workspace.

Local layout:

- Old dashboard: `D:\projects\dashboard`
- New V2 dashboard clone: `D:\projects\dashboard\v2`

The old repo ignores `v2/` so commits for the current Vercel dashboard do not accidentally include the new workspace.

## Baseline To Preserve

The V2 build must not lose:

- local CSV processing
- privacy-first/no-upload product promise
- no-AI-by-default positioning
- current KPI strip
- cash runway
- 13-week forecast
- data-quality warnings
- accountant review/export workflow
- Vercel deployability
- tests/build gates

## Reference Repo Strategy

Reference repo: `https://github.com/Sagargupta16/Financial-Dashboard`

Use it for ideas and architecture cues only:

- formula documentation
- centralized calculation discipline
- Excel import
- running balance
- account balance view
- transfer tracking
- category/subcategory drilldowns
- chart export
- stronger import validation

Do not merge its Git history into either dashboard repo. Do not copy large code blocks unless license and fit are checked.

## Branch And Repo Flow

Old dashboard:

1. Commit current currency fix and planning docs.
2. Push the current branch so Vercel can update if it tracks this branch.
3. Keep old dashboard stable for reviewers.

V2 dashboard:

1. Initialize the empty V2 repo with a README and roadmap.
2. Build from a clean product plan, not a rushed app merge.
3. Bring over proven old-dashboard modules intentionally.
4. Add reference-inspired features behind tests.

## V2 Phases

1. Product shell and privacy promise.
2. Formula docs and finance test hardening.
3. CSV baseline import from the current dashboard.
4. Excel import and richer mapping.
5. Transfer detection and running balance.
6. Account/category/subcategory analysis.
7. Billu.Works public tool packaging.
8. SEO pages and careful monetization.

## First V2 Files

Seed the V2 repo with:

- `README.md`
- `docs/BILLU_WORKS_V2_ROADMAP.md`

Then decide whether to scaffold the app as vanilla Vite first or move to a typed React/Vite structure.
