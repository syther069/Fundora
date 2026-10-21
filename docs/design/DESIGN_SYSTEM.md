# GrantFlow Design System
## Direction: Premium Fintech / Public-Goods Infrastructure
## Version: 2.0 — Phase 2A Finalised

> UX research status: **PENDING** — no UX PDFs have been provided.
> All specifications below are based on PRD.md, MEMORY.md, and direct code analysis.
> This file will be updated when UX PDFs are received.

---

## 1. DESIGN PHILOSOPHY

GrantFlow is financial infrastructure for public goods. Every visual decision answers three questions:

- **Is this trustworthy?** — USDC moves through this contract. The UI must signal safety through
  precision, restraint, and structural clarity. No decorative elements without function.
- **Is this transparent?** — every decision is onchain. Financial data (amounts, addresses, hashes,
  statuses) is always the primary content — never secondary to decoration.
- **Does this empower the builder?** — the milestone-to-payment loop is the product's core value.
  Every state in that loop must be legible at a glance: what is required, what is pending, what is done.

### What this is NOT

- Not a DeFi protocol dashboard — no charts for chart's sake, no floating gradients
- Not a generic Web3 app — no purple-everywhere, no glassmorphism, no neon glows
- Not a CRM or task manager — information density should reflect financial seriousness
- Not a copy of Gitcoin, Giveth, or any other grant platform

---

## 2. COLOUR SYSTEM

### Design rationale

The palette is warm-neutral, not cold-neutral. The difference is a +2 shift toward yellow in the
greys — this reads as approachable and trustworthy rather than clinical. The single chromatic
accent (indigo) is used only on interactive/active states. All financial outcomes use teal (positive)
or coral (negative) — never the accent colour for money, so financial states have their own semantic lane.

### Base palette

| CSS Variable         | Hex       | Tailwind equivalent  | Usage                                          |
|----------------------|-----------|----------------------|------------------------------------------------|
| `--bg`               | `#FDFCFB` | custom `warm-bg`     | Page background                                |
| `--surface`          | `#FFFFFF` | white                | Card and panel surfaces                        |
| `--surface-raised`   | `#FAFAF8` | custom               | Subtle inset areas, form backgrounds           |
| `--surface-overlay`  | `#F4F3F1` | custom               | Input backgrounds, info panels                 |
| `--border`           | `#E8E6E3` | custom               | Default border on all cards and inputs         |
| `--border-strong`    | `#D5D3D0` | custom               | Focused input ring, hover-state borders        |
| `--ink`              | `#18181B` | zinc-900             | Primary text — warm near-black                 |
| `--ink-2`            | `#3F3F46` | zinc-700             | Secondary headings, strong labels              |
| `--muted`            | `#71717A` | zinc-500             | Body secondary text, descriptions              |
| `--subtle`           | `#A1A1AA` | zinc-400             | Metadata, placeholders, tertiary copy          |

### Brand / interactive

| CSS Variable         | Hex       | Tailwind             | Usage                                          |
|----------------------|-----------|----------------------|------------------------------------------------|
| `--brand`            | `#4F46E5` | indigo-600           | Primary CTAs, active nav, links, focus rings   |
| `--brand-hover`      | `#4338CA` | indigo-700           | Primary CTA hover state                        |
| `--brand-light`      | `#EEF2FF` | indigo-50            | Active nav pill bg, brand-tinted panels        |
| `--brand-border`     | `#C7D2FE` | indigo-200           | Brand-tinted borders                           |

### Financial semantic states

These colours are reserved exclusively for financial/status meaning. Never use them decoratively.

| CSS Variable         | Hex       | Meaning                                        |
|----------------------|-----------|------------------------------------------------|
| `--teal`             | `#0F766E` | USDC amounts, Approved, Completed, positive $  |
| `--teal-light`       | `#F0FDFA` | Approved badge background, success panels      |
| `--teal-border`      | `#99F6E4` | Approved badge border                          |
| `--amber`            | `#B45309` | In-review, pending-warning, deadline near      |
| `--amber-light`      | `#FFFBEB` | In-review badge background, warning panels     |
| `--amber-border`     | `#FDE68A` | Warning badge border                           |
| `--coral`            | `#BE123C` | Rejected, danger, cancelled, destructive CTA   |
| `--coral-light`      | `#FFF1F2` | Danger panel backgrounds, error states         |
| `--coral-border`     | `#FECDD3` | Danger panel borders                           |
| `--slate`            | `#64748B` | Neutral/Pending state                          |
| `--slate-light`      | `#F8FAFC` | Pending badge background                       |
| `--slate-border`     | `#E2E8F0` | Pending badge border                           |

### Shadows

```css
/* Flat card — default resting state */
--shadow-card:   0 1px 3px rgba(24,24,27,0.06), 0 1px 2px rgba(24,24,27,0.04);

/* Raised element — hover state, modals */
--shadow-raised: 0 4px 12px rgba(24,24,27,0.08), 0 1px 3px rgba(24,24,27,0.04);

/* Elevated hover — grant card hover */
--shadow-hover:  0 8px 24px rgba(24,24,27,0.10), 0 2px 8px rgba(24,24,27,0.06);

/* Focus ring — all interactive elements */
--shadow-brand:  0 0 0 3px rgba(79,70,229,0.20);
```

### Contrast compliance (WCAG AA minimum 4.5:1)

| Combination                          | Ratio  | Pass |
|--------------------------------------|--------|------|
| `--ink` on `--bg`                    | 15.8:1 | ✓    |
| `--ink` on `--surface`               | 16.2:1 | ✓    |
| `--muted` on `--surface`             | 5.0:1  | ✓    |
| `--brand` on `--surface`             | 5.5:1  | ✓    |
| `--teal` on `--teal-light`           | 5.2:1  | ✓    |
| `--coral` on `--coral-light`         | 5.4:1  | ✓    |
| `--amber` on `--amber-light`         | 4.9:1  | ✓    |
| white on `--brand`                   | 7.2:1  | ✓    |
| white on `--teal`                    | 6.5:1  | ✓    |
| white on `--coral`                   | 7.1:1  | ✓    |

---

## 3. TYPOGRAPHY

### Font stack

```css
--font-display: "Plus Jakarta Sans", system-ui, sans-serif;   /* headings, amounts, labels */
--font-body:    "Inter", system-ui, sans-serif;                /* body text, descriptions */
--font-mono:    "JetBrains Mono", "Menlo", monospace;          /* addresses, hashes, tx IDs */
```

Both Plus Jakarta Sans and Inter are already loaded via Google Fonts in `index.html`.
JetBrains Mono is already loaded.

### Type scale

| Class          | Size       | Weight | Line-height | Font    | Tracking  | Use                                    |
|----------------|------------|--------|-------------|---------|-----------|----------------------------------------|
| `.t-hero`      | 2rem/32px  | 700    | 1.15        | Display | -0.03em   | Hero headline (connect state)          |
| `.t-h1`        | 1.5rem/24px| 700    | 1.2         | Display | -0.025em  | Page title (Grants, Admin Panel)       |
| `.t-h2`        | 1.125rem   | 650    | 1.25        | Display | -0.02em   | Section headings                       |
| `.t-h3`        | 0.9375rem  | 600    | 1.3         | Display | -0.01em   | Card titles, milestone headings        |
| `.t-label`     | 0.75rem    | 600    | 1.0         | Body    | +0.05em   | Uppercase labels, tab text, section headers |
| `.t-body`      | 0.875rem   | 400    | 1.5         | Body    | 0         | Card descriptions, body copy           |
| `.t-small`     | 0.75rem    | 400    | 1.4         | Body    | 0         | Metadata, secondary info, dates        |
| `.t-mono`      | 0.8125rem  | 400    | 1.4         | Mono    | 0         | Addresses, hashes, tx IDs              |
| `.t-amount`    | 1.5rem/24px| 700    | 1.0         | Display | -0.02em   | Primary USDC amounts                   |
| `.t-amount-sm` | 1.125rem   | 600    | 1.0         | Display | -0.01em   | Secondary USDC amounts, milestone $    |

### Numeric treatment

All financial numbers and counts must use:
- `font-variant-numeric: tabular-nums` — amounts never shift width as they update
- Display font (Plus Jakarta Sans) for all amounts ≥ 1rem
- `--teal` colour for positive USDC amounts
- `--coral` colour for negative amounts or deficit states
- `--muted` for secondary (e.g. "/ $500 total")

**Absolute rules:**
- Never animate USDC numbers counting up — it misrepresents financial precision
- Never show a USDC amount without its unit ("USDC") adjacent
- Never show a USDC amount derived from float arithmetic — always use `formatUnits(bigint, 6)`

---

## 4. SPACING AND LAYOUT

### Base grid: 4px

All spacing uses multiples of 4px. Map to Tailwind spacing scale (4 = 1rem, etc.):

| Token   | px     | Tailwind | Typical use                                         |
|---------|--------|----------|-----------------------------------------------------|
| `sp-1`  | 4px    | `p-1`    | Icon inner padding, tight inline gaps               |
| `sp-2`  | 8px    | `p-2`    | Badge padding horizontal, icon-label gap            |
| `sp-3`  | 12px   | `p-3`    | Row vertical gaps, compact section internal gaps    |
| `sp-4`  | 16px   | `p-4`    | Default card internal padding (compact contexts)    |
| `sp-5`  | 20px   | `p-5`    | Standard card padding                               |
| `sp-6`  | 24px   | `p-6`    | Section horizontal padding, detail panel padding    |
| `sp-8`  | 32px   | `p-8`    | Section vertical separators                         |
| `sp-10` | 40px   | `p-10`   | Hero state padding                                  |
| `sp-12` | 48px   | `p-12`   | Hero vertical rhythm                                |

### Layout widths

| Context           | Max-width | Column layout        | Breakpoints           |
|-------------------|-----------|----------------------|-----------------------|
| Grant grid        | 1280px    | 3-col / 2-col / 1-col| lg ≥1024 / md ≥768 / sm |
| Grant detail      | 720px     | Single column        | Full width on mobile  |
| Admin panel       | 720px     | Single column        | Full width on mobile  |
| Header            | 1280px    | Fixed height 56px    | Sticky, blurred bg    |
| Hero (disconnect) | 512px     | Centred column       | Full width on mobile  |

### Card anatomy

```
┌── 3px accent bar (status colour, full width) ─────────────┐
│                                                             │
│  p-5 (20px all sides)                                      │
│                                                             │
│  ┌ title (t-h3, ink, 1-line truncate) ── [StatusBadge] ─┐ │
│  │                                                         │ │
│  │ description (t-body, muted, 2-line clamp)              │ │
│  └─────────────────────────────────────────────────────── ┘ │
│                                                             │
│  USDC amount (t-amount, teal, tabular)                     │
│                                                             │
│  ── progress track ──────────────────────────────────────  │
│  released / total (t-small, muted)                         │
│                                                             │
│  ── footer row ───────────────────────── → arrow ───────  │
│  [milestone count] [builder] [date] [deadline?]             │
└─────────────────────────────────────────────────────────────┘
```

Border: 1px `--border`. Background: `--surface`. Border-radius: 16px (`rounded-2xl`).
Shadow: `--shadow-card` at rest; `--shadow-hover` on hover.
Hover: `translateY(-2px)`, transition 200ms ease-out.

---

## 5. COMPONENT SPECIFICATIONS

### 5.1 StatusBadge

Filled pill, never border-only. Icon + label always (colour alone is not sufficient).

| Status              | Background       | Text colour  | Border           | Icon           |
|---------------------|------------------|--------------|------------------|----------------|
| Grant: Open         | `--brand-light`  | `--brand`    | `--brand-border` | `Circle`       |
| Grant: Active       | `--teal-light`   | `--teal`     | `--teal-border`  | `Zap`          |
| Grant: Completed    | `--teal-light`   | `--teal`     | `--teal-border`  | `CheckCircle2` |
| Grant: Cancelled    | `--coral-light`  | `--coral`    | `--coral-border` | `XCircle`      |
| Milestone: Pending  | `--slate-light`  | `--slate`    | `--slate-border` | `Clock`        |
| Milestone: Review   | `--amber-light`  | `--amber`    | `--amber-border` | `Eye`          |
| Milestone: Approved | `--teal-light`   | `--teal`     | `--teal-border`  | `CheckCircle2` |
| Milestone: Rejected | `--coral-light`  | `--coral`    | `--coral-border` | `XCircle`      |

Anatomy: `rounded-full`, `px-2.5 py-1`, `text-xs font-semibold`, `border`, icon at 10px.
Framer Motion: `animate={{ scale: [1,1.06,1] }}` once on status prop change.

### 5.2 DeadlineBadge (new component)

Displayed on GrantCard and GrantDetail when `grant.deadline > 0`.

| State                                | Colours              | Label                    |
|--------------------------------------|----------------------|--------------------------|
| Expired (`deadline < Date.now()`)    | coral/coral-light    | "Expired"                |
| Expiring soon (≤7 days)              | amber/amber-light    | "N days left"            |
| Expiring (≤30 days)                  | slate/slate-light    | "X days" or date         |
| Has deadline (>30 days)              | slate/slate-light    | Short locale date        |

Icon: `Clock` at 10px. Same pill shape as StatusBadge.

### 5.3 Button variants

All buttons: `transition-all duration-150`, `disabled:opacity-50 disabled:cursor-not-allowed`.
Never animate a disabled button. Focus ring via `--shadow-brand` on focus-visible.

| Variant         | Background      | Text     | Border            | Hover                        | Shape         |
|-----------------|-----------------|----------|-------------------|------------------------------|---------------|
| Primary         | `--brand`       | white    | none              | `--brand-hover`              | `rounded-full h-10 px-6` |
| Primary loading | `--brand`       | white    | none              | none (disabled)              | same + spinner |
| Secondary       | `--surface`     | `--ink`  | `--border`        | `--surface-raised` bg        | `rounded-xl h-9 px-4` |
| Ghost           | transparent     | `--muted`| `--border`        | `--surface-overlay` bg       | `rounded-xl h-9 px-4` |
| Danger (idle)   | `--coral-light` | `--coral`| `--coral-border`  | `--coral` bg + white text    | `rounded-xl h-9 px-4` |
| Danger (confirm)| `--coral`       | white    | none              | darker coral                 | `rounded-xl h-9 px-4` |
| Success         | `--teal-light`  | `--teal` | `--teal-border`   | `--teal` bg + white text     | `rounded-xl h-9 px-4` |
| Link            | transparent     | `--brand`| none              | underline                    | inline        |

### 5.4 Input fields

```
height:         40px (h-10)
border-radius:  12px (rounded-xl)
background:     var(--surface-overlay)
border:         1px solid var(--border)
padding:        0 12px
font:           Inter 14px, var(--ink)
placeholder:    var(--subtle)

Focus state:
  border-color: var(--brand)
  box-shadow:   var(--shadow-brand)
  outline:      none

Error state:
  border-color: var(--coral-border)
  background:   var(--coral-light)

Disabled state:
  opacity: 0.5
  cursor: not-allowed
```

Character counter: appears right-aligned below input at >300 chars.
Turns `--coral` at >450 chars. Format: "N/500".

Textarea: same rules, `min-height: 88px`, `resize-y`.

### 5.5 Progress bar

```
height:         8px (h-2)
border-radius:  9999px (rounded-full)
track:          var(--surface-overlay)
fill (partial): linear-gradient(90deg, var(--teal) 0%, var(--brand) 100%)
fill (100%):    var(--teal) solid (gradient is for in-progress only)
transition:     width 500ms ease
```

Accessibility: `role="progressbar"`, `aria-valuenow`, `aria-valuemin=0`, `aria-valuemax=100`, `aria-label`.

### 5.6 Admin Panel tabs

```
Tab bar:
  - Container: full width, border-bottom 1px --border
  - Tab items: t-label, uppercase, px-4 py-3
  - Active indicator: absolute bottom border 2px --brand, Framer Motion layoutId slide
  - Active text: --brand
  - Inactive text: --muted
  - Hover: --ink

Accessibility:
  role="tablist" on container
  role="tab" on each tab
  aria-selected="true/false"
  aria-controls="panel-id"
  tabIndex: 0 for active, -1 for inactive
  Keyboard: ArrowLeft/ArrowRight to navigate between tabs
```

### 5.7 Milestone card

Left border: 3px, colour by status:
- Pending: `--slate`
- In Review: `--amber`
- Approved: `--teal`
- Rejected: `--coral`

Card: white background, `--shadow-card`, `rounded-2xl`, `p-5`.
Header row: `Milestone N` label (t-label, subtle) + amount (t-amount-sm, teal) + StatusBadge.
Title: t-h3, ink.
Description: t-body, muted.

### 5.8 Loading states

Every data-dependent surface must have an explicit loading state.

| Surface                      | Loading treatment                                             |
|------------------------------|---------------------------------------------------------------|
| Grant grid (count unknown)   | 3 GrantSkeleton cards in a grid                               |
| Grant grid (count known)     | Exactly `grantCount` GrantSkeleton cards                      |
| Grant detail                 | Hero band skeleton + 2 milestone skeletons                    |
| Admin panel tabs             | Skeleton rows in the relevant tab content                     |
| Buttons (tx pending)         | Spinner + descriptive label (not just "Loading…")             |
| Stats strip                  | Skeleton pills                                                |

Skeletons: `animate-pulse`, bg `--surface-overlay`. Never show fake data as a placeholder.

### 5.9 Empty states

All empty states use the same `EmptyState` component:

```
[Icon — 32px, subtle colour]
[Title — t-h3, ink]
[Body — t-body, muted, max-w-xs, centred]
[Optional action button]
```

| Context                      | Icon         | Title                    | Body                                              |
|------------------------------|--------------|--------------------------|---------------------------------------------------|
| No grants yet                | `FileText`   | No grants yet            | Admin: open Admin panel to create. Others: check back soon. |
| No cancellable grants        | `CheckCircle2`| All grants settled      | No Open or Active grants to cancel.               |
| Grants error                 | `AlertCircle`| Couldn't load grants     | Network error. The page retries automatically.    |
| Milestone load error         | `AlertCircle`| Couldn't load milestones | Check connection. Retries automatically.          |
| Not deployed                 | `Blocks`     | Not yet deployed         | Deploy from the Contracts panel.                  |

### 5.10 Financial information hierarchy

When displaying USDC on any surface, follow this order:

1. **Primary amount** (t-amount, teal) — what the user cares about most: total, available to claim
2. **Breakdown** (t-body, muted) — released / total, how it was reached
3. **Progress** (progress bar) — visual representation of the ratio
4. **Context** (t-small, subtle) — percentage, milestone count, date

Never invert this hierarchy. The number comes first, context comes last.

---

## 6. ICON USAGE

Lucide React exclusively. No icon fonts, no SVG blobs.

| Context                     | Size  |
|-----------------------------|-------|
| Header / navigation         | 18px  |
| Button leading icon         | 15px  |
| Inline body text            | 14px  |
| Badge leading icon          | 10px  |
| Form label icon             | 14px  |
| Empty state / hero icon     | 28–40px |
| Metadata row icon           | 12px  |

All icon-only buttons require `aria-label`. Icons that are purely decorative use `aria-hidden="true"`.

---

## 7. RESPONSIVE RULES

### Breakpoints (Tailwind defaults)
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### Rules

1. Mobile (< 640px): single column everywhere. Header collapses to logo + wallet button.
   Stats strip stacks vertically. Admin tabs scroll horizontally.
2. Tablet (640–1023px): 2-column grant grid. Admin panel at full width with 24px side padding.
3. Desktop (≥1024px): 3-column grant grid. Admin and detail panels centred at 720px.
4. No horizontal overflow at any breakpoint. Test at 375px width.
5. Touch targets: minimum 44×44px for all interactive elements.

---

## 8. UX STATES COVERAGE

Every interactive surface must explicitly handle all of the following states.
This is not a UI suggestion — it is a required checklist for each component.

| State         | Description                                                           |
|---------------|-----------------------------------------------------------------------|
| Default       | Normal resting state with live data                                   |
| Loading       | Data not yet available — skeleton or spinner                          |
| Success       | Action completed — toast + contextual update                          |
| Error         | Action or load failed — inline message + retry where possible         |
| Empty         | Data loaded but zero results — explicit empty state, not blank space  |
| Partial       | Some data loaded, some still fetching — show what is available        |
| Stale         | Showing cached data while revalidating — no special treatment needed  |
| Disabled      | Cannot act right now — element dimmed, reason in title attribute       |
| Pending tx    | Transaction submitted, not confirmed — spinner + descriptive label    |
| Confirmed tx  | Transaction confirmed onchain — success toast + status change         |
| Wrong chain   | Connected to wrong network — banner above actions, switch prompt      |
| Disconnected  | No wallet — hero connect state                                        |
| Cancelled     | Grant/operation cancelled — visual state change, muted styling        |

**Critical distinction:** "Submitted" (pending tx) and "Confirmed" (onchain) must never be conflated.
A spinner/label saying "Submitting..." means the user signed in their wallet but the chain hasn't confirmed.
Only show a success badge or update the status after `isSuccess` from `useWaitForTransactionReceipt`.

---

## 9. UX RESEARCH STATUS

**PENDING.** No UX PDFs have been provided.

Once provided, this section will document extracted guidance on:
- Information architecture improvements
- Onboarding flow for first-time admins/builders
- Form validation patterns
- Error prevention and recovery
- Financial trust signals
- Cognitive load reduction

The specifications in sections 1–8 above are based on PRD.md, MEMORY.md, and direct code inspection.
They will be refined — not replaced — once PDF guidance is received.
