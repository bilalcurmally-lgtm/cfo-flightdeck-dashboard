# Design System Specification: The Obsidian Command

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Sovereign Intelligence."** 

This system is designed to transform complex financial data into an authoritative, editorial experience. It moves away from the "flatness" of standard SaaS dashboards, opting instead for a multi-layered, cinematic environment. By utilizing deep atmospheric depth, high-contrast typography pairings (Editorial Serif meets Technical Sans), and glowing glass-morphism, we create a UI that feels less like a webpage and more like a high-density tactical display. 

The interface breaks the traditional grid through intentional asymmetry—utilizing varying card heights, overlapping translucent layers, and breathing room that suggests a premium, curated experience.

---

## 2. Colors
Our palette is rooted in the "Deep Obsidian" spectrum, punctuated by neon-gas accents that represent vital data flows.

### Palette Strategy
*   **The "No-Line" Rule:** Explicitly prohibit the use of 1px solid neutral borders for sectioning. Structural boundaries must be defined solely by background shifts (e.g., a `surface-container-highest` card resting on a `surface` background).
*   **Signature Textures:** Use subtle linear gradients on primary containers, transitioning from `primary` (#5ddda1) to `primary_container` (#08a56e) at a 135-degree angle to provide a metallic, premium sheen.
*   **Atmospheric Glow:** Backgrounds should utilize a radial gradient of `surface_container_lowest` (#0b0e11) at the edges, bleeding into a faint, off-center glow of `on_secondary_container` (#00616d) at 5% opacity to simulate screen depth.

### Key Tokens
*   **Background:** `#111417` (Surface Base)
*   **Primary (Action):** `#5ddda1` (Deep Emerald)
*   **Secondary (Positive/Data):** `#bdf4ff` (Electric Cyan)
*   **Tertiary (Warning/Outflow):** `#ffb950` (Neon Amber)
*   **Error:** `#ffb4ab`

---

## 3. Typography
The system employs a "Technical Editorial" pairing. **Newsreader** provides the authoritative, human-led narrative, while **Work Sans** delivers the cold, hard precision of financial data.

*   **Display & Headlines (Newsreader):** Used for high-level summaries and section titles. The serif nature suggests longevity and trust.
    *   *Display-LG:* 3.5rem / Tracking -2%
*   **Titles & Body (Work Sans):** Used for navigation, labels, and paragraph text. The geometric clarity ensures legibility in high-density data environments.
    *   *Title-MD:* 1.125rem / Medium Weight
*   **Data Points (Monospace Fallback):** For numerical values, use a monospaced variant of Work Sans to ensure tabular alignment and a "high-tech" feel.

---

## 4. Elevation & Depth
Depth in this system is achieved through **Tonal Layering** and optical physics, not drop shadows.

*   **The Layering Principle:** Stacking follows a strict hierarchy. Place a `surface_container_low` card on a `surface` base. If a sub-element is needed within that card, use `surface_container_highest`. This creates natural lift through value shifts.
*   **Glassmorphism & The "Ghost Border":** 
    *   Floating sidebars or overlays must use `backdrop-filter: blur(24px)`.
    *   Borders are strictly 1px "Ghost Borders." Use `outline_variant` (#3d4a41) at 20% opacity.
    *   For active states, the border transitions to a 1px vibrant accent (Cyan or Emerald) with a `box-shadow` of 0 0 12px of that same color at 15% opacity to create a "neon tube" effect.
*   **Ambient Shadows:** If a card must float (e.g., a Modal), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);`. Never use pure black shadows; always tint them with the background hue.

---

## 5. Components

### Buttons
*   **Primary:** Deep Emerald gradient fill. No border. Text color: `on_primary`. 20px corner radius.
*   **Secondary:** Glass-morphic. `surface_variant` at 40% opacity with a 1px Cyan Ghost Border.
*   **Tertiary:** Text-only with an underline that appears on hover, utilizing the `primary_fixed` token.

### Data Visualization (Signature Component)
*   **Chart Lines:** Must utilize a `filter: drop-shadow(0 0 4px color)`. Fills under lines should be 10% opacity gradients of the line color.
*   **Gauges:** Semi-circular tracks using `surface_container_highest` with the active segment glowing in `secondary_container`.

### Input Fields
*   **Default:** `surface_container_lowest` fill, 20px radius, 1px Ghost Border.
*   **Focus:** Border glows `primary` (#5ddda1), background shifts 5% lighter.

### Cards
*   **Strict Rule:** Forbid divider lines. Use 24px - 32px of vertical white space to separate content chunks within a card. Headers within cards should use `Newsreader` Headline-SM.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical layouts where one column is significantly wider than others to create an "Editorial" feel.
*   **Do** allow background atmospheric glows to overlap slightly behind glass containers.
*   **Do** use high-contrast sizing (e.g., a very large Display-LG number next to a very small Label-SM) to create visual drama.

### Don't
*   **Don't** use solid white (#FFFFFF) for text. Use `on_surface` (#e1e2e7) to prevent eye strain and maintain the dark-mode atmosphere.
*   **Don't** use standard 4px or 8px corners. All containers must maintain the **20px (xl)** roundness to feel integrated with the glass aesthetic.
*   **Don't** use 100% opaque borders. It breaks the "Sovereign Intelligence" illusion of light and transparency.