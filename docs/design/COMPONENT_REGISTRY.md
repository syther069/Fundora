# GrantFlow Component Registry
## Phase 2A — Complete Inventory

---

## PART 1: EXTERNAL COMPONENTS — STATUS MATRIX

### 1.1 Motion-Primitives (motion-primitives.com) — APPROVED, NO PASTE NEEDED

Open-source, MIT licence. Built on Framer Motion + Tailwind CSS. Copy-paste, not an npm package.
Framer Motion is already installed. These will be fetched from their public documentation during implementation.

| Component        | Source URL                                        | Install path                                   | Status            | Used for                            |
|------------------|---------------------------------------------------|------------------------------------------------|-------------------|-------------------------------------|
| `AnimatedGroup`  | motion-primitives.com/docs/animated-group         | `src/components/ui/animated-group.tsx`         | APPROVED — no paste needed | Grant card grid stagger      |
| `TextEffect`     | motion-primitives.com/docs/text-effect            | `src/components/ui/text-effect.tsx`            | APPROVED — no paste needed | Hero headline animation      |
| `InView`         | motion-primitives.com/docs/in-view                | `src/components/ui/in-view.tsx`                | APPROVED — no paste needed | Milestone card scroll entry  |
| `TransitionPanel`| motion-primitives.com/docs/transition-panel       | `src/components/ui/transition-panel.tsx`       | APPROVED — no paste needed | Admin tab content transition |

---

### 1.2 Watermelon UI (ui.watermelon.sh) — NEEDS YOUR INPUT

The site requires inspection. Automated extraction was blocked.

**Potentially useful components I want to evaluate:**
1. Any tooltip/popover for address truncation hover-reveal
2. Any command-palette or search input for the GrantsToolbar
3. Any data table for the AdminPanel manage tab

**Action required:** Please visit https://ui.watermelon.sh/components
- Tell me which components are listed
- Confirm whether source is visible without login
- OR paste source for any specific component you want

I will continue with all other work while waiting.

---

### 1.3 21st.dev — PASTE REQUIRED

Authentication required. Cannot access source without credentials.

**What I would use if available:**
- A high-quality animated button with loading state
- A data display card with number formatting

**Action required:** If you want any 21st.dev component, tell me the name and paste its source.
Do not need 21st MCP credentials for now — source paste is sufficient.

---

### 1.4 Skiper UI (skiper-ui.com) — PASTE REQUIRED

Login-gated. Could not extract source.

**Components I was interested in:**
- Animated number ticker (for stats strip USDC total)
- Gradient mesh background for hero section

**Action required:** Visit https://skiper-ui.com/components and paste source for any
you want to use. I will integrate while working on other components.

**Note on animated number ticker:** The "USDC countup" pattern is explicitly prohibited by
MOTION_GUIDELINES.md §5 ("Never animate USDC numbers counting up"). A number ticker for
the stats strip (total grants count, not a USDC amount) is acceptable.

---

### 1.5 Feralui Gradients (feralui.dev/gradients) — REFERENCE ONLY

Used as CSS gradient reference for the hero section background.
Will adapt as CSS — no source paste needed, no component install.

---

### 1.6 Pryzm Design (pryzm.design/studio) — DESIGN REFERENCE ONLY

Visual design tool. Not a component source. Used for design inspiration only.

---

## PART 2: INTERNAL COMPONENTS — COMPLETE INVENTORY

### 2.1 Already implemented — needs Phase 3 upgrade

| Component         | File                              | Previous state        | Phase 3 work                                              |
|-------------------|-----------------------------------|-----------------------|-----------------------------------------------------------|
| `Header`          | `src/components/Header.tsx`       | Redesigned (Phase 2)  | Apply new token system; add motion on wallet connect; ensure a11y |
| `StatusBadge`     | `src/components/StatusBadge.tsx`  | Redesigned (Phase 2)  | Framer Motion key-change pulse; new token names from DESIGN_SYSTEM |
| `GrantCard`       | `src/components/GrantCard.tsx`    | Redesigned (Phase 2)  | Accent bar per spec; t-amount USDC; DeadlineBadge; Framer Motion |
| `GrantSkeleton`   | `src/components/GrantSkeleton.tsx`| Redesigned (Phase 2)  | Match new GrantCard anatomy exactly (accent bar + amount area) |
| `GrantDetail`     | `src/components/GrantDetail.tsx`  | Redesigned (Phase 2)  | Status-tinted hero band; InView milestones; expireGrant button; correct tokens |
| `App`             | `src/App.tsx`                     | Redesigned (Phase 2)  | AnimatePresence view transitions; TextEffect hero; GrantsToolbar; StatsStrip |
| `AdminPanel`      | `src/components/AdminPanel.tsx`   | NOT redesigned        | FULL REDESIGN: tab bar, TransitionPanel, all 4 tabs per spec |

### 2.2 New components to create

| Component           | File                                     | Purpose                                                  | Dependencies           |
|---------------------|------------------------------------------|----------------------------------------------------------|------------------------|
| `GrantsToolbar`     | `src/components/GrantsToolbar.tsx`       | Client-side search + status filter for grant grid        | lucide-react, clsx     |
| `DeadlineBadge`     | `src/components/DeadlineBadge.tsx`       | Deadline countdown chip on cards and detail              | lucide-react           |
| `EmptyState`        | `src/components/EmptyState.tsx`          | Reusable empty state: icon + title + body + optional CTA | lucide-react           |
| `StatsStrip`        | `src/components/StatsStrip.tsx`          | Compact onchain stats: grant count, total funded         | src/hooks, framer-motion|

### 2.3 New hook additions (src/hooks/useProofSpring.ts — ADD ONLY)

| Hook                       | Contract function              | Read/Write | Priority |
|----------------------------|-------------------------------|------------|----------|
| `useExpireGrant`           | `expireGrant(grantId)`        | Write      | P1       |
| `usePaused`                | `paused` (public state var)   | Read       | P2       |
| `usePause`                 | `pause()`                     | Write      | P2       |
| `useUnpause`               | `unpause()`                   | Write      | P2       |
| `useMilestoneVoteCounts`   | `getMilestoneVoteCounts(grantId, milestoneIndex)` | Read | P2 |
| `useAdminReassignBuilder`  | `adminReassignBuilder(grantId, newBuilder)` | Write | P2 |
| `useTransferAdmin`         | `transferAdmin(newAdmin)`     | Write      | P3       |

**Constraint:** Never modify existing hook implementations — only add new exports at the end of the file.

---

## PART 3: DEPENDENCY AUDIT

### 3.1 Already installed — do NOT add again

```
framer-motion@11      ✓  (animation — fully covers all needs)
lucide-react          ✓  (icons — only icon source permitted)
clsx                  ✓  (conditional classNames)
tailwind-merge        ✓  (merge Tailwind classes safely — use in all components)
sonner                ✓  (toast notifications)
react                 ✓
react-dom             ✓
wagmi@2               ✓
viem@2                ✓
connectkit            ✓
@tanstack/react-query ✓
```

### 3.2 Motion-Primitives — copy-paste, not npm

Motion-Primitives components are NOT npm packages. Do not run `npx motion-primitives@latest add`.
Copy the component source into `src/components/ui/` directly from the public documentation.

### 3.3 Do NOT add

| Package                  | Reason not to add                                         |
|--------------------------|-----------------------------------------------------------|
| GSAP / anime.js / react-spring | Duplicate animation — framer-motion covers everything |
| shadcn/ui (full install) | Pulls in Radix UI, conflicts with existing patterns       |
| Any full UI kit          | Installs a foreign design system we are not using         |
| react-router-dom         | The app uses view-state navigation — no URL routing needed without explicit approval |
| date-fns / dayjs         | Deadline formatting can be done with native Intl.DateTimeFormat |

---

## PART 4: COMPONENT SPECIFICATION SUMMARY

Quick reference for Phase 3 implementation in order:

```
Step 1: index.css + tailwind.config.js (tokens)
Step 2: src/hooks/useProofSpring.ts (add 6 new hooks)
Step 3: src/components/ui/ (4 Motion-Primitives components)
Step 4: src/components/EmptyState.tsx (new)
        src/components/DeadlineBadge.tsx (new)
        src/components/StatsStrip.tsx (new)
        src/components/GrantsToolbar.tsx (new)
Step 5: src/components/StatusBadge.tsx (update tokens + motion)
        src/components/GrantSkeleton.tsx (match new card anatomy)
        src/components/GrantCard.tsx (accent bar, t-amount, DeadlineBadge, motion)
        src/components/Header.tsx (tokens + motion)
        src/App.tsx (AnimatePresence, TextEffect hero, GrantsToolbar, StatsStrip)
        src/components/GrantDetail.tsx (hero band, InView, expireGrant button)
        src/components/AdminPanel.tsx (FULL REDESIGN — tabs, forms, all 4 panels)
Step 6: bash /home/user/arc-studio-helpers/check.sh (zero errors required)
```

---

## PART 5: WHAT I NEED FROM YOU BEFORE OR DURING IMPLEMENTATION

Nothing blocks Step 1–6 implementation. All externally-sourced items below can be integrated as they arrive:

| Item | When needed | What to provide |
|------|------------|-----------------|
| Watermelon UI components | Step 4–5 (if any) | Browse the site, tell me which ones you want, paste source |
| 21st.dev components | Step 4–5 (if any) | Paste the source for any specific component |
| Skiper UI components | Step 5 (hero bg, ticker) | Paste the source for any you want |
| UX PDFs | Before final review | Upload — I will extract guidance and update the checklist |
| Hackathon network confirmation | Before deployment | Read DoraHacks rules — testnet vs mainnet |
