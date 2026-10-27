# Fundora — Phase 2: Grants UI Redesign + Missing Feature Completion

## Source documents reviewed
- `docs/design/DESIGN_SYSTEM.md` — full token system, type scale, card anatomy
- `docs/design/FRONTEND_ARCHITECTURE.md` — page-by-page implementation spec
- `docs/design/ARC_STUDIO_HANDOFF.md` — 6-step build sequence
- `docs/design/MOTION_GUIDELINES.md` — 10 animation specs, reduced-motion rules
- `docs/design/COMPONENT_REGISTRY.md` — component inventory and external lib status
- `docs/design/ACCESSIBILITY_AND_UX_CHECKLIST.md` — interaction state and a11y requirements
- `docs/MEMORY.md` — project status, confirmed decisions, constraints
- `UI (2).md` — general UI/UX reference guide (used to inform review notes below)

---

## Current state assessment

### What already exists and is production-quality
- `src/index.css` — design tokens fully aligned with DESIGN_SYSTEM.md (warm-bg, brand, teal, amber, coral, shadows, border tokens)
- `tailwind.config.js` — token mapping already in place
- `Header.tsx` — redesigned with ConnectKit, passkey, chain badge, network toggle, Grants/Events nav (Phase 1)
- `App.tsx` — AnimatePresence view transitions, stats strip, role banner, wrong-chain banner, GrantsToolbar, GrantsContext-wired
- `GrantCard.tsx` — status accent bar, t-amount USDC, DeadlineBadge, hover lift, Framer Motion
- `GrantSkeleton.tsx` — matches GrantCard anatomy
- `GrantDetail.tsx` — hero band, InView-style structure, expireGrant button, funder refund, cross-chain modal, passkey support
- `GrantsToolbar.tsx`, `DeadlineBadge.tsx`, `EmptyState.tsx`, `StatusBadge.tsx` — all present
- `useFundora.ts` — includes `useExpireGrant`, `usePaused`, `usePause`, `useUnpause`, `useMilestoneVoteCounts`, `useAdminReassignBuilder`

### What still needs work (gaps confirmed by reading the files)
1. **AdminPanel.tsx (877 lines)** — imports from both `useAdminRegistry` and `useFundora`; has motion already; needs a full review against the 4-tab spec in FRONTEND_ARCHITECTURE.md §3.4
2. **Motion-Primitives components** — `src/components/ui/` does not exist yet; `AnimatedGroup`, `TextEffect`, `InView`, `TransitionPanel` are not installed
3. **`useFundora.ts` hook file** — named `useFundora` not `useProofSpring` (rename happened earlier). All new hooks from the plan exist. Confirm nothing is missing.
4. **`UI (2).md` guidance** — the referenced design principles (hierarchy, spacing grammar, numeric treatment, reduced motion, accessible states) need a systematic pass across all components to ensure compliance

---

## Contract review notes

No new contracts are required for Phase 2. The Fundora (v4 testnet), AdminRegistry, and FundoraEvents contracts are already deployed. Phase 2 is a pure frontend work phase.

However, one issue from the FRONTEND_ARCHITECTURE.md §4 should be noted:

> **Hackathon network flag (unverified):** The doc flags that the DoraHacks hackathon page could not be fetched to confirm whether Arc Testnet or Arc Mainnet is required for submission. Before any deployment-to-host step, the user must confirm this manually. All Phase 2 work targets Arc Testnet, which is safe.

---

## Phase 2 review — issues and required actions

### HIGH — must fix before considering Phase 2 done

| # | Area | Issue | Action |
|---|---|---|---|
| H1 | AdminPanel | 877-line component has not been reviewed against the 4-tab spec (Create / Reviewers / Settings / Manage). The Manage tab spec requires a Reassign Builder section and a proper Claim Funder Refund placement. | Full read + gap analysis against `FRONTEND_ARCHITECTURE.md §3.4` |
| H2 | Motion-Primitives | `src/components/ui/` does not exist. `AnimatedGroup` (grant card stagger), `TextEffect` (hero headline), `InView` (milestone scroll entry), `TransitionPanel` (admin tabs) are all missing. | Fetch source from motion-primitives.com public docs and install into `src/components/ui/` |
| H3 | Grant card stagger | Without `AnimatedGroup`, cards load without stagger entrance animation. This is the primary visual feel spec from MOTION_GUIDELINES.md §4.1. | Implement once AnimatedGroup is available |
| H4 | Admin tab transitions | Without `TransitionPanel`, the Admin Panel uses static tab switching. The `layoutId` sliding indicator and directional content transitions are not implemented. | Implement once TransitionPanel is available |
| H5 | Transaction states | ACCESSIBILITY_AND_UX_CHECKLIST.md §1.2 defines 6 transaction states that must all be visually distinct. Need to verify all write paths in AdminPanel and GrantDetail correctly distinguish "wallet prompt" vs "submitted" vs "confirmed". | Audit all `useWriteContract` + `useWaitForTransactionReceipt` usages |

### MEDIUM — important for quality and completeness

| # | Area | Issue | Action |
|---|---|---|---|
| M1 | AdminPanel tabs | Current AdminPanel may not have the 4-tab layout (Create / Reviewers / Settings / Manage). Need to verify the Manage tab includes: cancellable grants list with inline confirm, Reassign Builder section, Claim Funder Refund. | Read AdminPanel.tsx in full and diff against spec |
| M2 | `UI (2).md` numeric guidance | All USDC amount displays must use tabular-nums, Display font (Plus Jakarta Sans), no float arithmetic. Need a pass to confirm this is consistent across GrantCard, GrantDetail, AdminPanel, and the new Events components. | Audit `formatUnits` usage + font class usage |
| M3 | `UI (2).md` spacing grammar | The guide requires related gaps smaller than section gaps (spacing hierarchy). A quick visual pass is needed on the grant grid, detail view, and admin panel to confirm the 4px grid rhythm is consistent. | Visual review at each breakpoint |
| M4 | InView milestone entrance | `GrantDetail.tsx` milestone cards should use `InView` from Motion-Primitives for scroll-triggered entrance per MOTION_GUIDELINES.md §4.7. Currently entrance animation is either absent or uses a plain `motion.div`. | Wire InView once component is installed |
| M5 | Contract paused state | ACCESSIBILITY_AND_UX_CHECKLIST.md §1.1 requires the contract paused state to be surfaced in the UI before users try to act. Need to verify a paused banner appears when `usePaused()` returns true. | Check App.tsx or GrantDetail.tsx for paused handling |
| M6 | Wrong-chain banner timing | The checklist requires the wrong-chain banner to appear *before* the user tries to act. App.tsx has this at the top level, but GrantDetail also has an inline per-action warning. Confirm the top-level banner is always visible. | Read App.tsx WrongChainBanner position |
| M7 | Focus management on view transitions | ACCESSIBILITY_AND_UX_CHECKLIST.md §2.1 requires focus to move to the first heading on view transition. Currently AnimatePresence transitions are wired but `autoFocus` or `useEffect` focus management may be absent. | Add `useEffect` focus refs to detail view heading and back-to-list target |

### LOW — polish and completeness

| # | Area | Issue | Action |
|---|---|---|---|
| L1 | TextEffect hero | The disconnected hero state should use Motion-Primitives `TextEffect` with per-word fade-in-blur per the spec. Currently uses a static heading. | Wire TextEffect once installed |
| L2 | StatusBadge key-change pulse | MOTION_GUIDELINES.md §4.4 requires a `key={status}` on the motion.span inside StatusBadge so the badge pulses on status change. Confirm this is implemented. | Read StatusBadge.tsx |
| L3 | Stats strip "total funded" | The stats strip in App.tsx shows grants/active/completed/total USDC. This matches the spec. Confirm it uses bigint arithmetic (no float). | Quick grep |
| L4 | Evidence Enter-key guard | ACCESSIBILITY_AND_UX_CHECKLIST.md §2.4 requires the evidence input not to submit on Enter (accidental submit risk). Must use explicit button only. | Check GrantDetail.tsx evidence textarea |
| L5 | Cancel confirm Escape key | The inline cancel confirm dialog should close on Escape (equivalent to "Keep Grant"). | Check GrantDetail.tsx cancel section |
| L6 | Skip link | A visually-hidden skip link (`href="#main-content"`) must be the first focusable element. App.tsx has this — confirm it is present and correct. | Confirmed present in App.tsx |
| L7 | GrantsToolbar count per status | The spec requires count per status pill (e.g. "Active (3)"). Confirm GrantsToolbar shows this. | Read GrantsToolbar.tsx |
| L8 | Deadline badge urgent colour | Deadline within 7 days should show amber. Expired should show coral. Confirm DeadlineBadge implements this. | Read DeadlineBadge.tsx |

---

## Implementation Plan: Phase 2

### Summary
Complete the Fundora grants UI redesign by installing the four Motion-Primitives components, wiring all animation specs, auditing the AdminPanel against the 4-tab spec, and closing all outstanding a11y/UX checklist items. No new contracts. No new npm packages. Pure frontend polish and completeness pass.

### Architecture
- **Blockchain:** Arc Testnet (no change)
- **Contracts:** No changes. All contract addresses unchanged.
- **Frontend:** React 18 + Vite + TypeScript + Tailwind + wagmi v2 + Framer Motion. Adding `src/components/ui/` for copy-paste Motion-Primitives components.
- **Wallet:** ConnectKit + existing passkey support (no change)

### Files to Create / Modify

#### New — Motion-Primitives components (copy-paste from public docs, no npm)
1. `src/components/ui/animated-group.tsx` — staggered list entrance for grant card grid
2. `src/components/ui/text-effect.tsx` — per-word fade-in-blur for disconnected hero headline
3. `src/components/ui/in-view.tsx` — scroll-triggered entrance for milestone cards in GrantDetail
4. `src/components/ui/transition-panel.tsx` — directional content transition for AdminPanel tabs

#### Modify — existing components
5. `src/App.tsx` — wire `AnimatedGroup` around grant card grid; wire `TextEffect` in HeroConnect
6. `src/components/AdminPanel.tsx` — full read + gap analysis; add 4-tab layout with `TransitionPanel` and `layoutId` tab indicator if missing; add Manage tab (reassign builder + cancellable grants list + claim refund placement); verify all 6 transaction states per checklist
7. `src/components/GrantDetail.tsx` — wire `InView` around milestone cards; verify Escape on cancel confirm; verify Enter on evidence input does not submit; verify 6 tx states
8. `src/components/StatusBadge.tsx` — add `key={status}` on motion.span for badge pulse on status change
9. `src/hooks/useFundora.ts` — verify all 6 new hooks exist (`useExpireGrant`, `usePaused`, `usePause`, `useUnpause`, `useMilestoneVoteCounts`, `useAdminReassignBuilder`). Add `useTransferAdmin` if missing (P3 but easy to add).

#### Possible new — focus management utility
10. Focus management on view transitions (may need `useEffect` + `ref` in App.tsx or a small focus-trap utility)

### Build Sequence

1. **Read AdminPanel.tsx in full** — produce a gap list against the 4-tab spec before writing anything
2. **Fetch and install Motion-Primitives** — animated-group, text-effect, in-view, transition-panel into `src/components/ui/`
3. **Wire AnimatedGroup** in App.tsx grant card grid (stagger 60ms, cap at 8 items)
4. **Wire TextEffect** in App.tsx HeroConnect headline
5. **AdminPanel redesign** — apply 4-tab layout with layoutId indicator and TransitionPanel; add Manage tab sections; verify all 6 tx states
6. **Wire InView** in GrantDetail.tsx around milestone cards
7. **Wire TransitionPanel** in AdminPanel for tab content
8. **StatusBadge** — add key-change pulse
9. **Focus management** — add `useEffect` focus refs to detail view h1 and back-button area
10. **Escape/Enter guards** — cancel confirm Escape, evidence input Enter guard
11. **Paused state banner** — confirm or add pause banner in App.tsx or GrantDetail
12. **Lint + typecheck** — zero errors required (`bash /home/user/arc-studio-helpers/check.sh`)

### Done When
- [ ] `src/components/ui/` exists with all 4 Motion-Primitives components installed and linting clean
- [ ] Grant card grid uses `AnimatedGroup` stagger entrance (60ms stagger, 8-item cap, reduced-motion compliant)
- [ ] Disconnected hero uses `TextEffect` per-word animation
- [ ] Milestone cards in GrantDetail use `InView` scroll-triggered entrance
- [ ] AdminPanel has 4-tab layout (Create / Reviewers / Settings / Manage) with `layoutId` sliding indicator and `TransitionPanel` content transitions
- [ ] AdminPanel Manage tab includes: cancellable grants list with inline confirm, Reassign Builder section, Claim Funder Refund placement
- [ ] All 6 transaction states visually distinct in AdminPanel and GrantDetail (idle / wallet prompt / submitted / confirmed / user cancel / chain fail)
- [ ] `StatusBadge` pulses on status change via `key={status}` on motion.span
- [ ] Contract paused state surfaced in UI (banner visible before user tries to act)
- [ ] Focus moves to first heading on view transitions (grants → detail → back)
- [ ] Evidence input does not submit on Enter; cancel confirm closes on Escape
- [ ] All USDC amounts use `tabular-nums` + Display font + `formatUnits(bigint, 6)` — no float arithmetic
- [ ] `useReducedMotion()` respected on every animated component
- [ ] Zero TypeScript errors (`tsc --noEmit`)
- [ ] Zero lint errors (`bunx oxlint src/`)

---

## Constraints that must not be violated

1. Never change existing hook function signatures or return types in `useFundora.ts` — add only
2. Never touch `src/context/GrantsContext.tsx` logic
3. Never touch `src/contracts/fundora.ts` / `src/contracts/adminRegistry.ts` / `src/contracts/fundoraEvents.ts`
4. Never use `window.confirm` — inline confirm only
5. Never push-transfer USDC — all withdrawals remain pull-based
6. Never add GSAP, react-spring, or any second animation library — framer-motion only
7. Never add react-router-dom — view-state navigation only
8. Never add date-fns or dayjs — use native `Intl.DateTimeFormat`
9. Motion-Primitives components are copy-paste into `src/components/ui/` — not npm packages
10. Evidence Enter-key must not submit (accidental submit risk)

---

## Open questions for the user before build begins

| Question | Why it matters |
|---|---|
| **Hackathon network requirement** — Arc Testnet or Mainnet required for submission? | If mainnet is required, deployment must use `FUNDORA_ADDRESS` on Arc Mainnet (already deployed at `0x371b4b6894882082e706cd84b781bf749472a602`) and requires a full warning review |
| **AdminPanel current state** — does the existing AdminPanel already have a 4-tab layout with Manage tab? | Need to read the full 877 lines to determine how much of the redesign is already done vs still needed |
| **Watermelon UI, 21st.dev, Skiper UI** — any components from these external sources to integrate? | These were flagged in COMPONENT_REGISTRY.md as "paste required". If you want any, paste the source and it will be integrated during AdminPanel redesign |

## Ready to build?
