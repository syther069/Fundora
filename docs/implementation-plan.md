Reading the evaluation standards and all source files before touching anything. The referenced files (`UI.md` and `UX guide (3).txt`) are not in the workspace — they were not uploaded to this session. Let me check docs/ and the root: Good — the design standards are in `docs/design/`. Reading all of them in parallel along with every source component: Now read every component and the remaining CSS: Now read AdminPanel and the tailwind config: I now have a comprehensive picture of every file. Running the check first to get the baseline, then doing the full audit:I'm in Plan mode — can't run commands. The audit below is based entirely on direct code analysis against the design standards. Here is the full evidence-based report:

---

## Final Frontend Quality Audit — GrantFlow

### Baseline (from last confirmed check)
- Lint: 0 errors — confirmed last session
- TypeScript: 0 errors — confirmed last session
- Vite: running on port 5173 — confirmed last session
- **Browser testing: unavailable** (Plan mode, no execute access)

---

## Issues Found

### CRITICAL (C) — Broken or misleading behaviour

**C1. Token mismatch divergence across files**
`index.css` defines `--warm-surface` but `DESIGN_SYSTEM.md` specifies `--surface`. The CSS `.card` class uses `var(--warm-surface)` but the design standard calls for `var(--surface)`. Components mix both token names across files. This is not a visual breakage now, but any future CSS addition using `--surface` will silently fall back to browser defaults (transparent/white) rather than the intended card colour.

**C2. `--surface-raised` and `--surface-overlay` are missing from `index.css`**
`DESIGN_SYSTEM.md §2` specifies these tokens as required for form backgrounds and info panels. They are not defined anywhere in `index.css`. Every form input in `AdminPanel.tsx` uses inline `style={{ background: 'var(--surface-overlay)' }}` — which currently resolves to nothing and falls through to the browser default (white). The styled inputs will look fine in light mode but break semantically.

**C3. `StatusBadge` — no icon, violates DESIGN_SYSTEM.md §5.1 and ACCESSIBILITY_AND_UX_CHECKLIST.md §4.2**
The current `StatusBadge` uses a coloured dot `<span>` instead of a Lucide icon. `DESIGN_SYSTEM.md §5.1` explicitly states "Icon + label always (colour alone is not sufficient)". `ACCESSIBILITY_AND_UX_CHECKLIST.md §4.2` states "Every status badge has: An icon (10px Lucide icon), A text label, A colour fill." A dot is colour-only if a user has reduced colour vision — they cannot distinguish Open (indigo dot) from Active (teal dot) at small sizes without the icon glyph shape.

**C4. `AdminPanel` tabs — no `role="tablist"` / `role="tab"` / `aria-selected` — WCAG 2.1 failure**
`ACCESSIBILITY_AND_UX_CHECKLIST.md §3.2` requires `role="tablist"` on the container, `role="tab"` on each tab, `aria-selected`, `aria-controls`, and `tabIndex` managed (0 for active, -1 for inactive). `DESIGN_SYSTEM.md §5.6` requires Left/Right arrow key navigation. None of these are implemented. Screen readers will announce the tabs as plain buttons with no panel relationship.

**C5. `AdminPanel` tabs — no animated indicator, no `TransitionPanel`**
`DESIGN_SYSTEM.md §5.6` and `COMPONENT_REGISTRY.md §2.1` specify a Framer Motion `layoutId` slide indicator under active tab and `TransitionPanel` content transitions. Currently the tab change is an instant CSS `display` swap with no transition. This is a motion completeness issue, not a functionality issue.

**C6. No `<main id="main-content">` landmark or skip link**
`ACCESSIBILITY_AND_UX_CHECKLIST.md §2.3` requires a visually-hidden skip link as the first focusable element. `§3.1` requires `<main id="main-content">`. `App.tsx` uses `<main className="...">` without the `id`. This is a WCAG 2.4.1 failure.

**C7. `App.tsx` footer faucet hint references "sidebar" — no sidebar exists**
Line 392: `"Need test USDC? Use the Get test USDC button in the sidebar."` There is no sidebar. This is misleading copy — users will look for a sidebar that doesn't exist. Should say "Open the Admin panel" or remove the hint, or link to the actual faucet URL.

### HIGH (H) — Significant UX problems

**H1. `--brand` values diverge: `index.css` has `#6366f1` but `DESIGN_SYSTEM.md` specifies `#4F46E5`**
`index.css` line 8: `--brand: #6366f1` (indigo-500). `DESIGN_SYSTEM.md §2`: `--brand: #4F46E5` (indigo-600). The contrast table in DESIGN_SYSTEM.md is calculated for indigo-600 (`#4F46E5`) on white: 5.5:1 (WCAG AA pass). indigo-500 (`#6366f1`) on white is approximately 4.5:1 — borderline. All CTA buttons use `--brand` as background with white text. The verified-passing value is `#4F46E5`.

**H2. `--teal` value diverges: `index.css` has `#0d9488` but DESIGN_SYSTEM.md specifies `#0F766E`**
`index.css` line 22: `#0d9488` (teal-600). `DESIGN_SYSTEM.md §2`: `#0F766E` (teal-700). The contrast table is calculated for teal-700 on `--teal-light`: 5.2:1 pass. teal-600 on teal-light is approximately 4.3:1 — fails WCAG AA for normal text. All "Approved" and "Completed" badges, all USDC amount labels, and the Active badge use `--teal` as text colour on `--teal-light` background. This is a contrast failure for normal-weight text under 18px.

**H3. `--amber` value diverges: `index.css` has `#d97706` but DESIGN_SYSTEM.md specifies `#B45309`**
Same pattern: amber-500 vs amber-700. The verified contrast ratio in DESIGN_SYSTEM.md is for `#B45309`. `#d97706` (amber-500) on `--amber-light` fails the 4.5:1 threshold for small text.

**H4. `--coral` value diverges: `index.css` has `#e11d48` but DESIGN_SYSTEM.md specifies `#BE123C`**
Same — rose-600 vs rose-700. The verified contrast ratio is for `#BE123C`.

**H5. No `<article>` wrapper + `aria-label` on `MilestoneCard` — ACCESSIBILITY_AND_UX_CHECKLIST.md §3.2**
MilestoneCard is rendered as a `<div>` without `role` or semantic meaning. The checklist explicitly requires `<article aria-label="Milestone {N}: {title}"`. Screen readers cannot navigate between milestones as discrete content units.

**H6. `type="text"` on all `AdminPanel` inputs — no `inputMode` for numeric amounts**
USDC amount inputs in `AdminPanel` should have `inputMode="decimal"` to open the numeric keyboard on mobile. Without it, mobile users get the full text keyboard for amount entry.

**H7. `DeadlineBadge` component — specified but not created**
`DESIGN_SYSTEM.md §5.2` and `COMPONENT_REGISTRY.md §2.2` specify a `DeadlineBadge` component. The contract now stores `grant.deadline` (uint40). No component exists to display it. Grants with deadlines will show no deadline information at all.

**H8. `GrantsToolbar` — search + filter specified but not built**
`COMPONENT_REGISTRY.md §2.2` specifies a `GrantsToolbar` with client-side search and status filter. With the contract now able to hold many grants, no filtering exists. Usability degrades sharply beyond 10 grants.

**H9. `useExpireGrant`, `usePaused`, `usePause`, `useUnpause` hooks — specified but missing**
`COMPONENT_REGISTRY.md §2.3` lists 6 new hooks as P1/P2. None are in `useProofSpring.ts`. Admin cannot pause the contract or trigger grant expiry from the UI even though those contract functions exist.

**H10. Progress bar height mismatch**
`DESIGN_SYSTEM.md §5.5` specifies `height: 8px` (h-2 = 8px). `index.css` `.progress-track` has `height: 6px`. Minor but is a spec deviation.

**H11. Wrong chain state not surfaced before user acts**
`ACCESSIBILITY_AND_UX_CHECKLIST.md §1.1` requires a wrong-chain banner to appear "before the user tries to act, not after." The current implementation calls `withChain()` reactively inside each action handler. There is no proactive banner visible to a user on the wrong chain looking at the grants list.

**H12. Contract pause state not surfaced in UI**
`ACCESSIBILITY_AND_UX_CHECKLIST.md §1.1` requires "Contract paused — pause state surfaced in UI so users know why actions fail." There is no `usePaused` hook or UI element. If the admin pauses the contract, every action silently reverts with a `Paused()` error decoded only in a toast.

### MEDIUM (M) — Polish and completeness gaps

**M1. `font-jakarta` Tailwind utility used but not defined**
`Header.tsx` line 60 uses `className="font-jakarta font-bold..."`. `tailwind.config.js` defines the font family under the key `jakarta` (making the utility `font-jakarta`). This is correct — but it's worth confirming the Tailwind prefix matches. Verified: `fontFamily: { jakarta: [...] }` → Tailwind utility `font-jakarta`. ✓ Correct.

**M2. `animate-fade-in` used in `App.tsx` but not defined in Tailwind config**
`App.tsx` line 362: `className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in"`. `tailwind.config.js` defines the animation as `'fade-in': 'fade-in 0.25s ease forwards'` under the `animation` key — but the Tailwind utility is `animate-fade-in` (the key prefix). Verified: key is `'fade-in'` → utility is `animate-[fade-in]` or if using arbitrary values. Actually with the config structure `animation: { 'fade-in': '...' }`, the generated class is `animate-fade-in`. ✓ This should work.

**M3. `GrantDetail` hero band uses `STATUS_BAND` hardcoded hex values instead of CSS variables**
Lines 62–67 in `GrantDetail.tsx` define `STATUS_BAND` with raw hex codes. If the design token values change, these won't update. Should reference `var(--brand)`, `var(--teal)`, `var(--coral)` via a CSS variable reference — or at minimum be centralised in one place.

**M4. View transitions use `setTimeout(80ms)` not Framer Motion `AnimatePresence`**
`MOTION_GUIDELINES.md §4.2` specifies `<AnimatePresence mode="wait">` with x-slide transitions for view changes. The current implementation uses a raw `setTimeout` opacity hack. No spatial cue is provided when navigating from grants → detail or back.

**M5. `AdminPanel` tab scrollbar fade uses `var(--warm-surface)` but should use `var(--surface)`**
`index.css` `.tab-scroll-container::after` uses `var(--warm-surface)`. The design system token name is `--surface`. Minor token inconsistency.

**M6. `GrantSkeleton` accent bar is static grey — should match the shimmer animation**
`COMPONENT_REGISTRY.md §2.1` notes the skeleton should match the new card anatomy "exactly (accent bar + amount area)". The skeleton should show a shimmer on the accent bar area as well.

**M7. Focus ring CSS class `btn-focus` uses `outline` but design spec requires `box-shadow`**
`index.css` lines 192–197: `.btn-focus:focus-visible { outline: 2px solid var(--focus) }`. `ACCESSIBILITY_AND_UX_CHECKLIST.md §2.2` and `DESIGN_SYSTEM.md §5.3` both specify `focus-visible: box-shadow: var(--shadow-brand)` (0 0 0 3px rgba(79,70,229,0.20)). The outline approach works but the box-shadow approach from the spec is softer, respects border-radius, and is more visually consistent.

**M8. `GrantCard` description truncation: `line-clamp-2` vs spec's "2-line clamp" — ✓ matches**
Verified: `DESIGN_SYSTEM.md §4` card anatomy says "description (t-body, muted, 2-line clamp)". `GrantCard.tsx` uses `line-clamp-2`. ✓

**M9. `StatsStrip` "Total USDC" uses float arithmetic**
`App.tsx` line 97: `grants.reduce((s, g) => s + parseFloat(formatUnits(g.totalAmount, 6)), 0)`. `DESIGN_SYSTEM.md §3`: "Never show a USDC amount derived from float arithmetic — always use `formatUnits(bigint, 6)`". The correct approach: sum the raw bigints first, then format once.

**M10. `GrantCard` amount display uses `total.toFixed(2)` float**
Line 44–46: `parseFloat(formatUnits(...))` then `toFixed(2)`. Same violation as M9 — should use `formatUnits(grant.totalAmount, 6)` directly without parseFloat.

### LOW (L) — Minor inconsistencies

**L1. `index.css` defines `--warm-surface-2: #fdf8f0` and `--warm-bg-2: #fdf8f0` — identical duplicates**
Both lines 16 and 17 define the same value. Components use both names. One should be removed.

**L2. Header `h-16` (64px) but spec says 56px**
`DESIGN_SYSTEM.md §4` layout table: "Header: Fixed height 56px". `Header.tsx` uses `h-16` = 64px. Minor — 8px off.

**L3. Card border-radius `rounded-2xl` = 1rem in Tailwind but spec says 16px**
1rem = 16px. ✓ Matches.

**L4. `GrantDetail.tsx` imports `@/onchain-facts` and `@/onchain-money`**
These are Arc Studio helper modules. `AGENTS.md` for this cloned repo notes "this project has no injected onchain helper modules" and "do not import them." These imports exist in the currently committed code. They may work in the sandbox but will fail in a production build outside of Arc Studio.

---

## Fixes Required

The following must be fixed before deployment. Grouped by whether approval is needed:

### Fixes I can implement immediately (no approval needed)

| # | Fix | Files |
|---|-----|-------|
| F1 | Correct `--brand` to `#4F46E5`, `--teal` to `#0F766E`, `--amber` to `#B45309`, `--coral` to `#BE123C` in `index.css` and Tailwind config | `src/index.css`, `tailwind.config.js` |
| F2 | Add `--surface`, `--surface-raised`, `--surface-overlay`, `--border-strong`, `--shadow-brand` to `index.css` | `src/index.css` |
| F3 | Replace dot with Lucide icon in `StatusBadge` per spec (Circle/Zap/CheckCircle2/XCircle/Clock/Eye) | `src/components/StatusBadge.tsx` |
| F4 | Add `id="main-content"` to `<main>` and add skip link as first DOM element in `App.tsx` | `src/App.tsx` |
| F5 | Fix misleading faucet copy in footer (remove "sidebar" reference) | `src/App.tsx` |
| F6 | Fix `StatsStrip` and `GrantCard` to use bigint arithmetic for USDC totals | `src/App.tsx`, `src/components/GrantCard.tsx` |
| F7 | Add `role="tablist"`, `role="tab"`, `aria-selected`, `tabIndex` management to `AdminPanel` tabs | `src/components/AdminPanel.tsx` |
| F8 | Add `inputMode="decimal"` to USDC amount inputs in `AdminPanel` | `src/components/AdminPanel.tsx` |
| F9 | Fix `.progress-track` height to 8px per spec | `src/index.css` |
| F10 | Add `<article aria-label="Milestone N: title">` wrapper to MilestoneCard in GrantDetail | `src/components/GrantDetail.tsx` |
| F11 | Remove duplicate `--warm-surface-2` token | `src/index.css` |

### Fixes that need your approval before implementing

| # | Change | Why approval needed |
|---|--------|---------------------|
| A1 | Add `DeadlineBadge` component and wire to GrantCard + GrantDetail | New component + UI surface change |
| A2 | Add `GrantsToolbar` (search + status filter) above the grants grid | New component, changes App layout |
| A3 | Add `usePaused`, `usePause`, `useUnpause`, `useExpireGrant` hooks + UI in AdminPanel | New admin functionality, contract interactions |
| A4 | Implement Framer Motion `AnimatePresence` view transitions (replace setTimeout hack) | Animation system change, needs framer-motion added |
| A5 | Implement `TransitionPanel` + `layoutId` tab indicator in AdminPanel | Motion-Primitives dependency copy |
| A6 | Replace `@/onchain-facts` and `@/onchain-money` imports with self-contained constants for production build | Affects contract address resolution logic |
| A7 | Wrong-chain banner — show proactively in the grants list, not reactively per-action | Layout change |

---

## Summary

| Severity | Count | Status |
|---|---|---|
| Critical | 7 | F3, F4, F6, F7 fixable now; C5/C7 partially fixable |
| High | 12 | F1, F2, F8, F9, F10 fixable now; H7–H9, H11–H12 need approval |
| Medium | 10 | F6, F11 fixable now; M3–M6, M9 partially fixable |
| Low | 4 | F9, F11 fixable now |

**Checks I can confirm:** Lint 0 errors, TypeScript 0 errors, Vite running — all confirmed from last Build mode execution.

**Checks requiring browser:** actual render of StatusBadge contrast, touch target sizes, keyboard navigation flow, focus ring visibility, mobile overflow. These are **unverified** and require manual testing or switching to Build mode to run Lighthouse/axe.

---

Say "fix F1–F11" and I'll switch to Build mode and implement all 11 code fixes immediately. Say which A-items you want and I'll include them.
