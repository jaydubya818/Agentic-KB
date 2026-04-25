---
repo_name: MissionControl
repo_visibility: private
source_type: github
branch: main
commit_sha: bf296f1508c4667d28970ed54c515d1fe8c849f4
source_path: "docs/ui-style.md"
imported_at: "2026-04-25T16:02:21.279Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/MissionControl/main/docs/ui-style.md"
---

# Mission Control — Neon UI Design System

This document describes the neon supply-chain visual system: tokens, components, and usage patterns. Use it to keep the UI consistent across all routes.

## Design goals

- **Dark command center**: Navy/black base with soft gradients and vignette.
- **Glass panels**: Semi-transparent surfaces with subtle borders and blur.
- **Neon accents**: Green (primary/key metrics) and cyan (edges, secondary).
- **Motion**: Slow ambient animations (connection lines, hover glow); respect `prefers-reduced-motion`.

---

## Tokens (CSS variables)

Defined in `apps/mission-control-ui/src/index.css`.

### Neon palette

| Token | Usage |
|-------|--------|
| `--neon-green` | Primary accent, key metrics, selected/active states |
| `--neon-cyan` | Borders, secondary highlights, links |
| `--neon-magenta` | Danger/error sparingly |
| `--neon-green-dim` / `--neon-cyan-dim` | Low-opacity fills |

### Glass surfaces

| Token | Usage |
|-------|--------|
| `--glass-bg` | Panel background (semi-transparent) |
| `--glass-border` | Default panel border (cyan tint) |
| `--glass-border-green` | Active/hover border (green tint) |
| `--blur-panel` | Backdrop blur radius |

### Glow and focus

| Token | Usage |
|-------|--------|
| `--glow-green` | Box shadow for primary glow |
| `--glow-cyan` | Box shadow for secondary glow |
| `--glow-focus` | Focus ring (neon cyan) |

### Background

| Token | Usage |
|-------|--------|
| `--vignette` | Radial overlay for depth |
| `--bg-gradient-base` | Soft radial gradients (center/top/sides) |

---

## Utility classes

- **`.glass-panel`** — Rounded glass surface with border and blur; optional hover glow.
- **`.neon-border`** / **`.neon-border-green`** — Border only.
- **`.neon-glow`** / **`.neon-glow-cyan`** — Box shadow glow.
- **`.neon-focus`** — Use on focus-visible for neon ring.
- **`.neon-link`** — Cyan link with hover green and glow.
- **`.neon-empty-state`** — Container for empty states; use with `.neon-empty-state-icon`, `.neon-empty-state-title`, `.neon-empty-state-desc`.
- **`.neon-shimmer`** — Subtle opacity pulse for loading.
- **`.neon-stat-value`** — Tabular numbers, instrument-style.
- **`.neon-app-bg`** — App shell background (gradient + vignette).
- **`.network-connection-path`** — Animated stroke for SVG connection lines.

---

## Components

### Shared primitives (shadcn + neon)

- **Button**: Variants `default`, `outline`, `ghost`, `neon`, `neon-cyan` use glass border and/or glow.
- **Card**: Glass bg, border, blur; hover border and shadow.
- **Input**: Glass bg/border; focus ring and glow use neon-cyan.
- **Dialog / Sheet**: Overlay blur; content uses glass-bg and neon border.
- **Table**: Rows use glass border; hover uses neon-cyan-dim.
- **Badge**: Variants `neon-success`, `neon-cyan`, `neon-error`.
- **Tooltip**: Glass bg and border with cyan glow.
- **DropdownMenu**: Content uses glass-bg and glass-border.

### Neon-specific components

- **GlassPanel** — Div with glass styling and optional hover glow.
- **NeonCard** — Card with optional top accent bar (green/cyan).
- **NeonStat** — Label + value + optional subtitle; accent green/cyan/muted.
- **NeonBadge** — Badge with neon variants.
- **NeonDialog** — Re-export of Dialog (content already glass).
- **NeonTable** — Table wrapped in glass container.
- **NeonChartTheme** — Chart container class + Recharts style object (`NeonChartTheme.styles`, `NeonChartTheme.gradientColors`).
- **NeonChartContainer** — Wrapper div with theme container class.
- **NetworkConnections** — SVG curved paths between points; coordinates in 0–100 space; optional animation.

---

## Do

- Use CSS variables for all neon/glass colors.
- Use `PageHeader` for view chrome.
- Use `EmptyState` (neon-styled) for empty views.
- Use `NeonChartContainer` and `NeonChartTheme.styles` for Recharts.
- Keep focus rings visible (neon-focus or ring-[var(--neon-cyan)]).
- Respect `prefers-reduced-motion` (animations already gated in `index.css`).

## Don't

- Hardcode hex colors for surfaces or accents.
- Stack many blur layers in one viewport (performance).
- Use pure white text; use `--foreground` or muted variants.
- Skip focus-visible styling on interactive elements.

---

## Accessibility

- Contrast: Foreground and muted text meet readability on dark glass.
- Focus: All interactive elements use visible focus (neon ring or ring offset).
- Motion: `@media (prefers-reduced-motion: reduce)` disables/shortens animations globally.
- Touch: Minimum 44×44px targets via existing `@media (pointer: coarse)`.

---

## Performance

- Limit simultaneous blur layers (e.g. one glass panel per logical section).
- NetworkConnections uses a single SVG with simple paths; animation is CSS-based.
- Recharts is tree-shaken where only needed components are imported.
