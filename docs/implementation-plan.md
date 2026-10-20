Switching to Build mode is required to write any code. Let me read the current state of all files before planning the implementation sequence. Good. I now have a complete picture. This session is in Plan mode — I cannot write files here. You need to **switch to Build mode** using the mode selector at the top of the workbench. Once you do, I'll execute everything immediately.

Here is the precise, ready-to-execute implementation plan:

---

## Complete implementation plan — ready for Build mode

### Files to create (3 new shared components)

**`src/components/TxStatus.tsx`**
Reusable transaction state display + `TxButton` component. Covers `isPending` (wallet prompt) → `isConfirming` (on-chain) → `isConfirmed` (receipt). Never shows success before receipt. Never shows explorer link without a real hash.

**`src/components/InlineError.tsx`**
Field-level and section-level error display. `role="alert"` for screen readers. Two variants: `field` (small, below input) and `section` (full-width danger panel). Uses `parseOnchainError` output — never exposes raw errors.

**`src/components/EmptyState.tsx`**
Icon + title + body + optional action button. Standardises all empty states. `role="status"` for accessibility.

---

### Files to edit (no logic changes to any hook, contract, or validation)

**`src/components/StatusBadge.tsx`** — already correct, no changes needed.

**`src/components/GrantSkeleton.tsx`** — already matches card anatomy, no changes needed.

**`src/components/GrantCard.tsx`** — already uses design system classes, no changes needed.

**`src/components/Header.tsx`** — already correct, no changes needed.

**`src/App.tsx`** — add `GrantsToolbar` (search + status filter tabs), use `EmptyState` for zero-grants and no-search-results states. No logic changes.

**`src/components/GrantDetail.tsx`** (955 lines) — the main target:
- Switch `STATUS_BAND` hex literals to design tokens
- Apply `TxStatus` below every action button (fund, apply, claim, cancel)
- Apply persistent teal confirmation panel after `applySuccess` (not just toast)
- Apply persistent confirmed panel after `claimSuccess` showing amount + explorer link
- Fund: move the 2-step stepper row below the button as a proper progress row
- Milestone cards: evidence character counter from 0 chars; URL format warning; `CheckCircle2` badge on card header when `submitConfirmed`; vote success inline state

**`src/components/AdminPanel.tsx`** (691 lines) — full design pass:
- Add `role="tablist"` / `role="tab"` / `aria-selected` / `aria-controls` on tab bar
- Wrong-chain banner at top, proactive
- Create tab: title counter (100 char soft limit), description counter (500), total USDC summary row
- Milestone rows: `gf-card` styling
- All inputs use `gf-input` / `gf-textarea`
- All buttons use `TxButton` / `gf-btn-*`
- `TxStatus` below every submit button
- Reviewers tab: clear input on confirmed success
- Settings tab: `TxStatus` after update
- Cancel tab: `EmptyState` for zero cancellable grants

---

### Nothing that changes
- All contract addresses, ABIs, chain IDs
- All wagmi hooks and their arguments
- All `parseOnchainError` calls
- All localStorage evidence caching
- All `withChain` / `switchChain` logic
- All validation (`parseUsdcAmount`, `canCreate`, `isAddress`)
- All `useEffect` dependency arrays
- `src/config.ts`, `src/contracts/proofSpring.ts`, `src/context/GrantsContext.tsx`, `src/hooks/useProofSpring.ts`

---

**Switch to Build mode, then say "go" and I'll execute the full implementation.**
