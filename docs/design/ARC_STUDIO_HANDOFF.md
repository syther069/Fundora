# GrantFlow — Arc Studio Implementation Plan
## Phase 3 Frontend Handoff

> Status: AWAITING APPROVAL before implementation begins

---

## IMPLEMENTATION ORDER

Phase 3 builds in this exact sequence. Each step is independently verifiable.
No step modifies contracts, hooks, context, or config (except step 2 which adds hooks only).

---

### STEP 1 — Design token foundation (index.css + tailwind.config.js)

Replace CSS variables with the full token set from DESIGN_SYSTEM.md.
Update Tailwind config with all colour tokens, font families, shadow utilities, animation keyframe.

Files: `src/index.css`, `tailwind.config.js`
Zero risk: purely additive, all class names change in step 3+.

---

### STEP 2 — New hook additions (hooks/useProofSpring.ts)

ADD the following hooks (do not touch existing hooks):
- `useExpireGrant()` — write hook for `expireGrant(grantId)`
- `usePausedState()` — read hook for `paused` boolean
- `usePause()` / `useUnpause()` — write hooks for `pause()` and `unpause()`
- `useMilestoneVoteCounts(grantId, milestoneIndex)` — read hook for `getMilestoneVoteCounts`
- `useAdminReassignBuilder()` — write hook for `adminReassignBuilder(grantId, newBuilder)`
- `useTransferAdmin()` — write hook for `transferAdmin(newAdmin)` (optional, P3)

All new hooks follow the exact same pattern as existing hooks in that file.

---

### STEP 3 — Motion-Primitives components

Create files under `src/components/ui/`:
- `animated-group.tsx` — from motion-primitives.com/docs/animated-group
- `text-effect.tsx` — from motion-primitives.com/docs/text-effect
- `in-view.tsx` — from motion-primitives.com/docs/in-view
- `transition-panel.tsx` — from motion-primitives.com/docs/transition-panel

These are open-source copy-paste components. No npm install needed.
They use only `framer-motion` and `react` which are already installed.

---

### STEP 4 — New utility components

Create:
- `src/components/GrantsToolbar.tsx` — search + status filter
- `src/components/DeadlineBadge.tsx` — deadline display chip
- `src/components/EmptyState.tsx` — reusable empty state
- `src/components/StatsStrip.tsx` — onchain stats display

---

### STEP 5 — Redesign existing components (in order)

1. `src/components/StatusBadge.tsx` — new token usage, Framer Motion pulse on change
2. `src/components/GrantSkeleton.tsx` — match new card exactly
3. `src/components/GrantCard.tsx` — status accent bar, t-amount USDC, DeadlineBadge, Framer Motion
4. `src/components/Header.tsx` — motion feedback, correct brand
5. `src/App.tsx` — AnimatePresence view transitions, TextEffect hero, AnimatedGroup grid, GrantsToolbar
6. `src/components/GrantDetail.tsx` — hero band, InView milestones, expireGrant button, tinted hero bg
7. `src/components/AdminPanel.tsx` — FULL REDESIGN per FRONTEND_ARCHITECTURE.md §3.4

---

### STEP 6 — Lint + typecheck + dev server verify

`bash /home/user/arc-studio-helpers/check.sh` — zero errors required.

---

## CONSTRAINTS THAT MUST NOT BE VIOLATED

1. Never touch: `src/hooks/useProofSpring.ts` (except to add, never modify existing)
2. Never touch: `src/context/GrantsContext.tsx`
3. Never touch: `src/contracts/proofSpring.ts`
4. Never touch: `src/config.ts`
5. Never touch: `contracts/` directory
6. Never use `window.confirm` — inline confirm only
7. Never push-transfer USDC — all withdrawals remain pull-based
8. Never add new npm packages without checking pre-installed list first
9. `framer-motion` is the only animation library — do not introduce others
10. All Framer Motion components must check `useReducedMotion()`

---

## PENDING EXTERNAL INPUTS (blocks nothing — continue working)

1. UX PDFs — when received, incorporate into form validation, error prevention, IA
2. Watermelon UI / 21st.dev component source — when pasted, integrate into component
3. Hackathon network requirement confirmation — needed before deployment, not before implementation
