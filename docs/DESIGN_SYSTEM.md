# Pixel Mentor - Design System & Component Guidelines

## 1. The 6-Colour Palette
Pixel Mentor utilizes an authentic 16-bit arcade / cyberpunk financial palette:

| Variable Name | Hex Code | Visual Name | Primary Usage |
| :--- | :--- | :--- | :--- |
| `--color-dark` | `#0c0f17` | Deep Obsidian | Canvas, viewport background, shadows |
| `--color-card` | `#161f30` | Terminal Slate | Card backgrounds, panels, dialogue backdrops |
| `--color-green` | `#10b981` | Emerald Pixel | Success, positive returns, compounding, CTAs |
| `--color-gold` | `#f59e0b` | Arcade Coin Gold | Coins, achievements, warnings, highlighted terms |
| `--color-cyan` | `#06b6d4` | Cyber Cyan | Projections, active tabs, secondary highlights |
| `--color-red` | `#ef4444` | Hazard Red | Scam warnings, panic sell warnings, over-budget |

---

## 2. Typography
- **Headings & Key Metrics**: `'Press Start 2P', monospace` (Authentic 8-bit/16-bit bitmap gaming font).
- **Body & Dialogue**: `'VT323', monospace` or `'Space Grotesk', sans-serif` for high legibility on numbers and Indian rupee currency values.

---

## 3. Pixel Component Specifications

1. **PixelButton**:
   - 3D beveled pixel border with inset lighting highlights and dark shadows.
   - Distinct `:active` physical depression transform (`translate(2px, 2px)`).
   - Variants: `primary`, `success`, `warning`, `danger`, `ghost`.
   - Sizes: `sm`, `md`, `lg`.

2. **PixelCard**:
   - Layered double border with inset 3-pixel bevel shadows.
   - Optional glowing border accents: `default`, `green`, `gold`, `cyan`, `red`.

3. **DialogueBox**:
   - RPG-style dialogue container with animated typewriter text effect.
   - Character portrait / name tag slot.
   - Flashing prompt cursor (`▼` or `|`).

4. **CoinCounter**:
   - Pixel coin SVG with animated bounce or shine.
   - Dynamic counter transition and click-to-inspect ledger balance.

5. **Modal**:
   - Retro arcade overlay backdrop with pixel-bordered dialog box.
   - Header with pixel title and close button (`X`).

6. **ProgressBar**:
   - Segmented or solid pixel meter with beveled frame.
   - Configurable color states (`green`, `gold`, `cyan`, `red`).

7. **Tooltip**:
   - Pixel-bordered floating balloon on hover.
   - Sharp corners, crisp high-contrast text.

8. **Mentor Avatar**:
   - 100% custom pixel art rendered in pure SVG/CSS (no external images).
   - Props: `mood = idle | happy | worried | thinking`.
   - Facial expressions, animated eye blinks, and wizard cloak accents change per mood.

