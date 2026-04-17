# Design System Strategy: Technical-Luxe Command

## 1. Overview & Creative North Star
### The Creative North Star: "The Sovereign Analyst"
This design system is built for high-stakes environments where data density meets executive refinement. It rejects the "flatness" of modern SaaS in favor of a **Sovereign Analyst** aesthetic—a digital environment that feels like a private flight deck or a bespoke financial periodical. 

To break the "template" look, the system utilizes **Intentional Asymmetry** and **Tonal Depth**. We prioritize information-rich layouts that use overlapping glass panels and variable typographic scales to guide the eye. This isn't just a dashboard; it’s a high-fidelity instrument designed for clarity, authority, and immersive focus.

---

## 2. Colors & Surface Architecture

### The Palette
The core of the system is built on **Obsidian (#0c0e12)**. We use high-vibrancy "electric" accents to denote data vitality against a somber, premium backdrop.

*   **Primary (Cyan):** `#99f7ff` — Used for active states and critical inflows.
*   **Secondary (Emerald):** `#00fd87` — Used for positive growth and health metrics.
*   **Tertiary (Amber):** `#ffc965` — Used for warnings and cautionary data.
*   **Error (Coral):** `#ff716c` — High-vibrancy alert for outflows and critical errors.

### The "No-Line" Rule
Standard 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined through **Background Color Shifts** or **Tonal Transitions**. Use `surface-container-low` for large regions and `surface-container-high` for interactive modules.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers of frosted glass.
*   **Base:** `surface` (#0c0e12)
*   **Sectioning:** `surface-container-low` (#111318)
*   **Interactive Cards:** `surface-container-highest` (#23262c)
*   **Floating Modals:** Use Glassmorphism (see below).

### The "Glass & Gradient" Rule
To achieve "Technical-Luxe," all floating elements must use **Glassmorphism**: 
*   **Fill:** `surface-variant` at 40-60% opacity.
*   **Effect:** `backdrop-filter: blur(20px)`.
*   **Signature Texture:** Use a subtle linear gradient on primary CTAs transitioning from `primary` (#99f7ff) to `primary-container` (#00f1fe) at a 45-degree angle.

---

## 3. Typography
The system uses a high-contrast pairing to balance authoritative editorial style with technical precision.

*   **Display & Headlines (Newsreader):** Use for high-level summaries and section titles. The serif nature conveys history and trustworthiness. 
    *   *Styling:* Tighten tracking by -2% for a "periodical" feel.
*   **Titles & Body (Work Sans):** Use for secondary headers and general UI labels.
*   **Data & Labels (Inter):** The "Workhorse." Use for technical data, small labels, and table values.
    *   *Styling:* Set `label-sm` to uppercase with +5% letter-spacing for a "military-spec" aesthetic.

---

## 4. Elevation & Depth

### The Layering Principle
Depth is achieved through **Tonal Layering** rather than structural lines. Place a `surface-container-lowest` card on a `surface-container-low` section to create a soft, natural recess.

### Ambient Shadows
For floating elements, shadows must be "Atmospheric":
*   **Color:** Use a tinted version of `surface-container-lowest` (black with a hint of blue).
*   **Setting:** Blur: 40px, Spread: -10px, Opacity: 40%. It should feel like an ambient occlusion, not a drop shadow.

### The "Ghost Border"
When accessibility requires containment, use a **Ghost Border**: 
*   **Value:** `outline-variant` (#46484d) at 10-15% opacity. 
*   **Interaction:** On hover/active, the ghost border should transition to a 20% opacity `primary` or `secondary` glow.

---

## 5. Components

### Buttons
*   **Primary:** Gradient fill (Primary to Primary-Container), white text (`on-primary`), 20px (`xl`) corner radius. Apply a 4px outer glow of the primary color at 20% opacity.
*   **Tertiary (Ghost):** No fill. Ghost Border (10% opacity white). Text is `primary`.

### Input Fields
*   **Style:** `surface-container-highest` fill with a bottom-only 1px ghost border. 
*   **State:** On focus, the bottom border glows `primary` (#99f7ff) with a subtle 2px blur.

### Cards & Data Lists
*   **Forbid Dividers:** Do not use horizontal lines between list items. Use 12px-16px of vertical whitespace or alternating `surface-container` shifts.
*   **Radii:** All containers must adhere to the `xl` (1.5rem / 20px) scale to soften the technical density.

### Data Visualization (Signature Component)
*   **The "Pulse" Line:** Charts should use `primary` or `secondary` colors with a 10% opacity "area fill" gradient beneath the line.
*   **Glow Points:** Critical data nodes should have a `box-shadow` glow matching their accent color to represent "live" data.

---

## 6. Do’s and Don'ts

### Do
*   **DO** use varying font weights in data sets (e.g., Bold for the integer, Regular for the decimal).
*   **DO** overlap glass panels slightly to show the `backdrop-blur` in action.
*   **DO** use "Electric" accents sparingly—only for actionable data or status indicators.
*   **DO** utilize the `surface-container` tiers to create a "nested" look for complex widgets.

### Don’t
*   **DON'T** use pure white (#ffffff) for body text; use `on-surface` (#f6f6fc) to reduce eye strain.
*   **DON'T** use standard 4px or 8px border radii. If it’s not `xl` (20px) or `full`, it doesn't belong in this system.
*   **DON'T** use 100% opaque borders. High-contrast lines break the "luxe" immersion.
*   **DON'T** clutter the UI. If a piece of data isn't critical, hide it behind a hover-state tooltip.