# Cashflow Bridge Design

## Decision

Replace the current Cashflow Lanes visual with a Ranked Cash Bridge.

The selected direction is a hybrid of:

- Option A, Ranked Balance Board: clean left/right ranked bars around a net center.
- Option C, CFO Waterfall Deck: labels and amounts inside each data mark.

## Goal

Show top cash inflow and cash outflow heads in a way that is loud, readable, and useful without depending on decorative lines.

The visual should make it immediately clear:

- Which heads are driving cash in.
- Which heads are pulling cash out.
- How large each head is relative to the visible slice.
- What the selected slice nets to.
- Which outflow heads are pressure/risk items.

## Layout

The component remains a standalone section above CEO Pulse.

Use a three-column composition:

- Left column: ranked Cash In bars.
- Center: net cash circle.
- Right column: ranked Cash Out bars.

Each bar contains:

- Account head label.
- Share of visible inflow or outflow.
- Signed amount.

The center circle contains only:

- `NET`
- Compact net total.
- Optional small context label such as `Visible slice`.

Do not place lane labels, amount labels, or decorative particles outside the data marks.

## Data Rules

Cash In bars come from top revenue heads.

Cash Out bars come from top outflow heads.

Bar width is proportional to the head share within its side:

- Revenue share = head revenue / total visible revenue.
- Outflow share = head outflow / total visible outflow.

The net circle uses:

- Sum of visible revenue heads minus sum of visible outflow heads.

Amounts must use the selected display currency formatting only. This remains a formatter, not a currency converter.

## Color Rules

Use cyan for cash in.

Use amber for normal cash out.

Use red only for true pressure/risk outflows, such as:

- High share of visible outflow.
- Known pressure signal from the existing insight/risk logic.

Do not make every outflow red.

## Interaction

Hovering a bar should show:

- Full account head.
- Exact amount.
- Share percentage.
- Direction: cash in or cash out.

Clicking a bar should filter/drill the dashboard by that account head, following existing dashboard filtering patterns.

The component should continue to work with search, period, currency, and view-mode changes.

## Motion

Motion should support data comprehension, not distract from it.

Use:

- Bars settling in by rank when the data changes.
- Subtle pulse or glow only on risk outflow bars.
- Smooth width transitions when filters or period changes update the slice.

Avoid:

- Moving particles.
- Endless decorative line animation.
- Curved lane physics.
- Any animation that makes small heads disappear.

## Accessibility

The component should be an accessible graphic with:

- A meaningful section label.
- Keyboard-reachable bars if they are clickable.
- Text fallback through visible labels and tooltips.
- Stable layout as amounts and labels change.

Long labels should truncate visually but remain available in hover/title text.

## Testing

Add or update tests to cover:

- Top revenue and outflow heads render as bars.
- Each bar includes label, share, and formatted amount.
- Net circle shows compact net total.
- Normal outflows are amber and risk outflows can become red.
- Bar click applies the expected account-head filter.
- Currency formatting changes visible amounts without changing values.

## Implementation Notes

The existing `renderFlowDiagram` function can become the new bridge renderer or be replaced by `renderCashflowBridge`, depending on which keeps the surrounding code cleaner.

The old SVG lane path logic should be removed once the bridge is implemented. The new component should not preserve lane underlays, particles, or path hover behavior.

The visual companion mockup for this decision lives under `.superpowers/brainstorm/cashflow-visual-20260420-220626/`.
