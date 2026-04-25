---
repo_name: MissionControl
repo_visibility: private
source_type: github
branch: main
commit_sha: bf296f1508c4667d28970ed54c515d1fe8c849f4
source_path: docs/FRONTEND_GUIDELINES.md
imported_at: "2026-04-25T16:02:21.259Z"
source_url: "https://raw.githubusercontent.com/jaydubya818/MissionControl/main/docs/FRONTEND_GUIDELINES.md"
---

# Mission Control — Frontend Guidelines

_Last updated: 2026-02-28. This document reflects the current state of the codebase. All prior versions referencing inline styles, `src/styles/colors.js`, or "No Tailwind" are obsolete._

---

## Stack

| Layer | Tool |
|---|---|
| Framework | React 18 + TypeScript 5.3 |
| Build | Vite 5 |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (Radix UI primitives) |
| Animations | Framer Motion |
| Icons | Lucide React |
| Data | Convex (`useQuery` / `useMutation`) |
| D&D | @dnd-kit |

---

## Design Token System

All colors, radii, and typography are defined as **CSS variables** in `apps/mission-control-ui/src/index.css`. Never hardcode hex values.

### Core Tokens (dark theme — `:root`)

```
--background:  #0b1120   (page background)
--foreground:  #e2e8f0   (primary text)
--card:        #111827   (elevated card surface)
--muted:       #161f30   (muted surface)
--muted-foreground: #7a8799
--border:      #1e2d40
--input:       #1e2d40
--ring:        #10b981   (focus rings)

--primary:     #10b981   (emerald-green — main accent, CTAs, active states)
--primary-foreground: #ffffff

--secondary:   #1a2235
--secondary-foreground: #d1d9e6

--accent:      #1c2a3a   (hover surface for ghost elements)
--accent-foreground: #e2e8f0

--sidebar:     #090e1b
--sidebar-border: #1a2438
--sidebar-primary: #10b981

--success:     #10b981
--success-muted: #064e3b
--success-muted-foreground: #34d399

--destructive: #ef4444
```

### Radius

`--radius: 0.5rem`. Use `rounded-lg` (default), `rounded-xl` (modals), `rounded-full` (pills/badges), `rounded-md` (buttons/inputs).

### Typography

Font: **Inter** (via Google Fonts). Base size: `13px`, line-height `1.5`.

Use `text-foreground` for primary text, `text-muted-foreground` for secondary/metadata text. Never use arbitrary hex values.

---

## Component Library — shadcn/ui

Components live in `src/components/ui/`. Do **not** install other component libraries.

All shadcn components are styled via Tailwind utility classes that reference CSS variables. Changes to `:root` in `index.css` propagate automatically.

### Badge Variants

```tsx
<Badge variant="default" />    // primary bg + text
<Badge variant="success" />    // green pill — use for ACTIVE, DONE, STABLE, APPROVED
<Badge variant="warning" />    // amber pill — use for PAUSED, PENDING
<Badge variant="error" />      // red pill — use for FAILED, BLOCKED, CRITICAL
<Badge variant="muted" />      // muted surface — use for CANCELED, INFO states
<Badge variant="outline" />    // border only
<Badge variant="secondary" />  // secondary surface
```

### Button Sizes

Default height is `h-9`. Use `size="sm"` (`h-7`) for compact toolbar buttons, `size="lg"` (`h-10`) for primary CTAs in empty states.

### Card

`Card` wraps content with `bg-card border-border` and `--card-shadow`. Do not manually add `shadow-*` — the shadow is handled by the CSS variable.

### Page chrome and overlays

- **View-level screens**: Use `PageHeader` from `src/components/PageHeader.tsx` for title, description, and primary actions so page rhythm and scanning are consistent.
- **Modals and flyouts**: Use `Dialog` or `Sheet` from `src/components/ui/` for overlays so keyboard (Escape), focus trap, and accessibility stay consistent. Avoid custom fixed overlays with ad-hoc backdrop/close behavior.

---

## Status and Risk Colors

### Task Statuses

Defined in `src/components/StatusChip.tsx`. Use the `<StatusChip status="DONE" />` component rather than manually applying colors.

- INBOX / ASSIGNED / IN_PROGRESS / REVIEW → blue (`bg-blue-500/10 text-blue-400`)
- NEEDS_APPROVAL → red
- BLOCKED → orange
- DONE → **primary** (green)
- CANCELED → gray

### Risk Levels

Defined in `src/components/RiskChip.tsx`. Use `<RiskChip level="GREEN" />`.

- GREEN → **primary** (green)
- YELLOW → amber
- RED → red

### Do NOT create custom color classes for these states.

### Semantic palette (OpenClaw Studio parity)

Use a single semantic palette across Live Chat, approvals, and Registry:

- **Status**: green (success/active), amber (warning/paused), red (error/blocked) — use Badge variants `success`, `warning`, `error` or equivalent CSS vars.
- **Action**: primary (emerald) for main CTAs and active states.
- **Danger**: destructive (red) for delete, quarantine, deny.

Document any new status or action colors here so they stay consistent.

---

## CSS Utility Classes

`index.css` provides purpose-built utility classes for the Loop Risk Monitor visual language:

```
.status-pill               base pill container
.status-pill-success       green pill (STABLE, ALL CLEAR)
.status-pill-warning       amber pill
.status-pill-error         red pill
.status-pill-neutral       gray pill

.panel-header              section header bar (icon + title + border)
.panel-header-icon         circular icon in panel headers

.list-row                  list item (icon + title + meta + chevron)
.list-row-icon             icon container in list rows
.list-row-icon-success / -warning / -error / -neutral

.panel-footer              footer bar (muted text + border)

.view-header               page-level header (title + actions)
.view-title / .view-subtitle

.empty-state               centered empty state container
.empty-state-icon / .empty-state-title / .empty-state-desc

.skeleton-shimmer          loading skeleton animation
.status-dot-pulse          live status dot pulse animation

.badge-glow-green          subtle green glow ring on important success badges
.badge-glow-red            subtle red glow ring on critical badges

.nav-active-glow           drop shadow on active nav icons
.kanban-col-header         kanban column header uppercase style
.stat-value                tabular-nums for metric numbers
```

---

## App Shell Layout

```
┌── AppTopBar (h-11, bg-sidebar) ──────────────────────────────┐
│   [ProjectSwitcher] [SearchBar]    [Mission]    [Actions]    │
├── CommandNav (h-12) ──────────────────────────────────────────┤
│   MC   Home  Ops  Agents  Chat  Content  Comms  KB  Code  QC │
├── Sidebar (SIDEBAR_WIDTH=260 or SIDEBAR_COLLAPSED=48) ────────┤
│   Agents list + quick actions                                 │
├── main (flex-1 overflow-auto) ────────────────────────────────┤
│   ┌ PageHeader (px-5 py-3.5 border-b) ─────────────────────┐ │
│   │  [Icon]  Title  [StatusPill]        [Actions]          │ │
│   └──────────────────────────────────────────────────────── ┘ │
│   [view content]                                              │
└───────────────────────────────────────────────────────────────┘
```

### ModalLayer

All modals, drawers, and flyouts are mounted in `src/ModalLayer.tsx`. State is managed by `src/hooks/useModalState.ts`.

- Modals use `<Dialog>` + `DialogContent className="bg-card border-border rounded-xl"`
- Drawers use `<Sheet>` + `SheetContent className="bg-card border-border"`
- Overlays use `bg-black/70 backdrop-blur-[2px]`

---

## Conventions

### Do
- Use Tailwind utility classes and CSS variables.
- Use `cn()` from `@/lib/utils` for conditional class composition.
- Use `<StatusChip>` and `<RiskChip>` for task/risk status display.
- Use `<Badge variant="success|warning|error|muted">` for pill labels.
- Use `<PageHeader>` with `icon`, `status`, and `actions` props for every view.
- Use `text-muted-foreground` for secondary/metadata text.
- Use `border-border` for all dividers.

### Do Not
- Hardcode hex colors (no `#10b981`, `#0b1120`, etc.).
- Use `bg-emerald-*` — use `bg-primary/10`, `text-primary`, `bg-primary` instead.
- Use inline `style={{ color: '...' }}` — use Tailwind classes.
- Import MUI, Chakra, styled-components, or emotion.
- Add new shadcn components without running `npx shadcn@latest add`.
- Use `shadow-sm`, `shadow-md` — let `--card-shadow` handle card elevation.

### Hardcoded Colors Still Permitted
- Task-state semantic blues: `bg-blue-500/10 text-blue-400` for ASSIGNED/IN_PROGRESS/REVIEW/INBOX status chips — these are intentional semantic differentiation.
- Amber: `bg-amber-500/10 text-amber-400` for WARNING, PAUSED, COMMENT_STORM loop type.
- Red: `bg-red-500/10 text-red-400` for FAILED, BLOCKED, CRITICAL.
- Orange: `bg-orange-500/10 text-orange-400` for BLOCKED loop type.

---

## Theming

Default theme is **dark**. Light theme available via `data-theme="light"` on `<html>`. Toggle managed in `AppTopBar.tsx`. All components respond automatically via CSS variables.

---

## Accessibility

- All interactive elements have `focus-visible:ring-2 focus-visible:ring-ring`.
- Touch targets minimum `44×44px` via `@media (pointer: coarse)` in `index.css`.
- Use `aria-label` on icon-only buttons.
- Reduced-motion users: all animations disabled via `prefers-reduced-motion` in `index.css`.
- Semantic HTML: `<header>`, `<main>`, `<aside>`, `<nav>`, `role="tablist"` on tab bars.
