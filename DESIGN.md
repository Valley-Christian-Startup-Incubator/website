# Design

## Theme

Light, bright, optimistic "builder" energy. Saffron-led committed color strategy on a near-white / lavender-mist base with near-black ink. Flat color blocking — **no gradients anywhere**. Confident, friendly, anti-slop.

## Color

OKLCH source of truth; hex shown for reference. Palette from the user-supplied set.

| Role | Token | Hex | Notes |
|---|---|---|---|
| Body base | `--bg` | `#EFE9F4` | Lavender Mist — warm-cool off-white |
| Surface / cards | `--surface` | `#FFFFFF` | Pure white panels |
| Ink (text) | `--ink` | `#16131C` | Near-black, ~15:1 on base |
| Ink muted | `--ink-muted` | `#4A4458` | ≥4.5:1 on base — body-safe muted |
| Brand | `--saffron` | `#FF9505` | Deep Saffron — dominant brand color |
| Accent sky | `--sky` | `#08B2E3` | Bright Sky |
| Accent green | `--green` | `#99F7AB` | Light Green (fills, not text) |
| Accent yellow | `--banana` | `#F7EF81` | Banana Cream (highlights, fills) |
| Line | `--line` | `#16131C` @ ~12% | Hairline borders, often solid ink at low alpha |

Contrast rules: black ink on saffron/sky/green/banana for large UI; never light gray body text on tint. Accent greens/yellows are FILL colors (behind black text), not text colors.

## Typography

- **Display:** Bricolage Grotesque (700/800) — idiosyncratic, friendly, optical character. Headings, hero.
- **Body:** Hanken Grotesk (400/500/600) — clean, warm, highly readable.
- **Mono:** JetBrains Mono — code blocks only (registry.json, terminal).
- Pairing is contrast-on-character-axis; both off the reflex-reject list.
- Fluid `clamp()` headings, max ≤ 6rem, letter-spacing ≥ -0.03em. `text-wrap: balance` on h1–h3.

## Motion

- Earned, per-section reveals (not uniform fade-on-scroll). Content visible by default; reveals enhance.
- Three.js hero retained but re-colored to flat saffron/sky/ink dust on light — no additive-gradient glow.
- Ease-out curves only. Full `prefers-reduced-motion` fallback.

## Components

- **Buttons:** solid saffron fill, black ink, hard or slightly-rounded; sky/outline secondary. No gradient fills.
- **Steps:** numbered registration walkthrough is the centerpiece — solid color number chips, full borders (never side-stripes).
- **Code panels:** dark ink panel as the one intentional dark moment, mono text.
- Avoid: glass cards by default, identical card grids, gradient text, eyebrow labels on every section.
