# Fundora — Phase 3: Creation & Submission Engine

## Files inspected

| File | Notes |
|------|-------|
| `AGENTS.md` | Project memory, deployed addresses, constraints |
| `docs/PRD.md` | Product scope and functional requirements |
| `docs/design/DESIGN_SYSTEM.md` | Colour tokens, typography, shadow system |
| `docs/design/FRONTEND_ARCHITECTURE.md` | Page-by-page spec, tier classification |
| `docs/design/ARC_STUDIO_HANDOFF.md` | Build sequence, constraints |
| `contracts/FundoraEvents.sol` | Full source — 570 lines |
| `src/contracts/fundoraEvents.ts` | ABI file and address exports |
| `src/hooks/useFundoraEvents.ts` | All existing event hooks |
| `src/context/EventsContext.tsx` | Mock-data context, filter/sort, `addSubmission`, `addEvent` |
| `src/types/events.ts` | Frontend `Event`, `Submission`, `Track`, `PrizeTier` types |
| `src/data/mockEvents.ts` | 5 mock events used by context |
| `src/App.tsx` | All 8 views wired, organizer console has `alert()` placeholder |
| `src/components/events/ParticipantSubmitWizard.tsx` | 4-step modal, mock submit (no onchain call) |
| `src/components/events/EventDetailView.tsx` | 5-tab detail view, opens wizard via prop |
| `src/components/events/SubmissionReceiptModal.tsx` | Post-submit receipt modal |
| `src/components/events/EventPublishedModal.tsx` | Post-create published modal |
| `src/utils/metadataStorage.ts` | Draft save/load, `generateSubmissionHash`, `formatMetadataUri` |

---

## Contract verification against plan claims

### `createEvent` ✓ (verified)
- Any connected wallet can call it — not admin-gated.
- **NativeEscrow**: pulls `totalPrizePool` USDC from `msg.sender` atomically in the same transaction. The organizer must `approve(FundoraEvents, amount)` first, making it a **two-step wallet interaction**: approve → createEvent.
- **ExternalListing**: `totalPrizePool` must be exactly `0`, `externalUrl` must be non-empty. Reverts `ExternalEventNoEscrow` if pool > 0. No USDC transferred.
- Deadlines: `submissionDeadline > block.timestamp` and `judgingDeadline >= submissionDeadline` are enforced onchain.

### `submitEntry` ✓ (verified, with one mismatch)
- One submission per wallet per event (`AlreadySubmitted` revert). No editing supported.
- `metadataUri` is stored **fully onchain** as a `string` — not hashed. `submissionHash` is a separate `bytes32` computed by the caller.
- **Mismatch:** `useUpdateSubmission()` in `useFundoraEvents.ts` calls `updateSubmission` which **does not exist in the deployed contract**. This hook is dead code and must not be used.
- External events: the contract does not guard `submitEntry` by `eventType`. The UI must block submission on external events.

### Reviewer management ✓ (verified)
- `addReviewer` / `removeReviewer` callable by organizer or any authorized admin.
- `submitReview(eventId, submissionId, score, notesHash)` — score 1–100 (not 0–10), notesHash is `bytes32`.
- One review per reviewer per submission. No update.

### Event status / deadline ✓ (verified)
- No automatic status transition from deadline. Organizer calls `closeSubmissions()`.
- Onchain statuses: `Open(0)`, `SubmissionsClosed(1)`, `Finalized(2)`, `Cancelled(3)`.
- Frontend `Event` type statuses (`'upcoming'|'active'|'judging'|'completed'`) are mock-derived labels.

### Prize finalization, claims, refunds, cancellation ✓ (verified)
- `finalizeWinners` only for NativeEscrow events. Queues `pendingPrizeWithdrawals`.
- Unallocated pool at finalization is queued as `pendingOrganizerRefunds`.
- `cancelEvent` queues `totalPrizePool - allocatedPrizePool` as organizer refund.
- Both `claimPrize()` and `claimOrganizerRefund()` are pure pull-pattern (no args).

### ABI/import discrepancy — FOUND (must fix)
- `useFundoraEvents.ts` imports `FUNDORA_EVENTS_ADDRESS` from `contracts/fundoraEvents.ts`, but that file only exports `FUNDORA_EVENTS_ADDRESS_TESTNET`, `FUNDORA_EVENTS_ADDRESS_MAINNET`, and `getFundoraEventsAddress()`. There is no `FUNDORA_EVENTS_ADDRESS` named export. This causes a broken import.
- The ABI in `fundoraEvents.ts` is missing: `getEvent`, `getSubmission`, `getSubmissionsBatch`, `getEventsBatch`, `eventCount`, `isEventReviewer`, `closeSubmissions`, `finalizeWinners`, `cancelEvent`, `submitReview`. The hooks reference these via `useContractWrite('functionName')` pattern which bypasses TS but fails at runtime.
- `useSubmissionByAddress` calls `getSubmissionByAddress` — **does not exist in the contract**. Must use `userSubmissionId` + `getSubmission` in two reads.

### Current Phase 3 work state
- **`ParticipantSubmitWizard`** is fully built (35KB, 4 steps, draft save/restore, validation, team management) but submits to **mock context only** — no `useSubmitEntry` call, no onchain tx. Step 3: must wire real `useSubmitEntry`.
- **`EventDetailView`** is fully built (5 tabs: Overview, Tracks, Rubric, Showcase, Winners) — opens wizard via callback.
- **Organizer console** in `App.tsx` view 5 shows static mock stats and an `alert()` placeholder for "Create New Event". The `OrganizerCreateWizard` does not exist yet.
- **`EventsContext`** uses mock data (`MOCK_EVENTS`, `MOCK_SUBMISSIONS`). Adding real onchain events requires either wiring the existing hooks or augmenting the context. Phase 3 keeps mock data as fallback and adds real read via hooks.

---

## What Phase 3 must build

### Gap 1 — Wire `submitEntry` onchain in `ParticipantSubmitWizard`
The wizard already captures all required fields. Step 4 submit path needs to call `useSubmitEntry(eventId, metadataUri, submissionHash)` instead of the mock delay. Requires: wallet connected, event is NativeEscrow, deadline not passed, not already submitted (pre-check via `useUserSubmissionId`), contract not paused.

### Gap 2 — Duplicate-submission guard in `EventDetailView`
Before the user opens the wizard, check `useUserSubmissionId(eventId, address)`. If > 0, fetch and show their existing submission receipt instead of the wizard. One-entry restriction must be explained before they start.

### Gap 3 — External event routing
`EventDetailView` for `ExternalListing` events must replace the submit CTA with a link to `event.externalUrl`. No Fundora wizard for external events.

### Gap 4 — Organizer Create Wizard (`OrganizerCreateWizard.tsx`)
New multi-step form component. Steps:
1. Choose event type (NativeEscrow vs ExternalListing)
2. Event details (title, description, category, tags)
3. Schedule (submissionDeadline, judgingDeadline — date pickers using native `<input type="date">`)
4. Prize configuration — for NativeEscrow: tracks and prize tiers (total must equal escrowed amount). For ExternalListing: no prize input.
5. Reviewer setup (add reviewer addresses)
6. Review & publish — show USDC balance check and allowance for NativeEscrow; two-step CTA (Approve USDC → Create Event). Show explorer link on success.
Draft save/restore via `saveEventCreateDraft` / `loadEventCreateDraft` (already in `metadataStorage.ts`).

### Gap 5 — Fix ABI and address exports in `contracts/fundoraEvents.ts`
Add missing ABI entries (`getEvent`, `getEventsBatch`, `getSubmission`, `getSubmissionsBatch`, `eventCount`, `isEventReviewer`, `closeSubmissions`, `finalizeWinners`, `cancelEvent`, `submitReview`, `addReviewer`, `removeReviewer`, `paused`) and add `FUNDORA_EVENTS_ADDRESS` export that resolves via `getFundoraEventsAddress()` using the active chain. Also add `OnchainEventInfo` and `OnchainSubmission` TypeScript types matching the contract structs.

### Gap 6 — Fix `useSubmissionByAddress` hook
Replace `getSubmissionByAddress` (non-existent) with two-step: `useUserSubmissionId(eventId, address)` → if result > 0, `useSubmission(eventId, submissionId)`.

### Gap 7 — Participant hub real data
Wire `usePendingPrizeWithdrawals(address)` in the participant view to show real claimable balance. Wire `useClaimPrize()` for the claim button. Wire `useUserSubmissionId` for each active event to list submissions.

### Gap 8 — Organizer console real data
Wire `usePendingOrganizerRefunds(address)` for refund display. Wire `useClaimOrganizerRefund()`. Show events created by the connected wallet (filter from context or via onchain reads). Wire `useCloseSubmissions`, `useFinalizeWinners`, `useCancelEvent` for event management actions.

### Gap 9 — `useSubmitReview` hook (missing from hooks file)
Add `useSubmitReview` hook in `useFundoraEvents.ts` calling `submitReview(eventId, submissionId, score, notesHash)`.

---

## Implementation Plan: Phase 3

### Summary
Wire the existing submission wizard to the onchain `submitEntry` function, build the organizer event-creation wizard with USDC approval + `createEvent` flow, fix the broken ABI/import in `fundoraEvents.ts`, add duplicate-submission guards and external-event routing, and connect real contract data to the participant and organizer hubs. No contract changes. No new npm packages.

### Architecture
- **Blockchain:** Arc Testnet (`0xc9c7033f4736f8b6e213ea7617596c3fd7bb154a` — FundoraEvents v1)
- **Contracts:** No changes. No deployments.
- **Frontend:** React 18 + Vite + TypeScript + Tailwind + wagmi v2. All new files in `src/components/events/` and `src/hooks/`.
- **Wallet:** ConnectKit (injected) + existing passkey support. The `ParticipantSubmitWizard` already reads `usePasskeyContext()` — onchain write must go through the connected EOA (passkey gasless path TBD).
- **Storage:** `localStorage` for submission and event-create drafts (already implemented in `metadataStorage.ts`).

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/events/OrganizerCreateWizard.tsx` | 6-step organizer event creation flow with USDC approve + createEvent |

### Files to Modify

| File | Change |
|------|--------|
| `src/contracts/fundoraEvents.ts` | Add missing ABI entries, add `FUNDORA_EVENTS_ADDRESS` export, add `OnchainEventInfo`/`OnchainSubmission` types |
| `src/hooks/useFundoraEvents.ts` | Fix broken import, add `useSubmitReview`, fix `useSubmissionByAddress` (two-step), add `useEventPaused` |
| `src/components/events/ParticipantSubmitWizard.tsx` | Wire `useSubmitEntry` in step 4; add already-submitted guard prop; block submit for external events |
| `src/components/events/EventDetailView.tsx` | Add duplicate-submission check; external event routing for submit CTA; pass `existingSubmissionId` to wizard |
| `src/App.tsx` | Replace organizer console `alert()` with `OrganizerCreateWizard` modal; wire participant hub real data (prize withdrawals, claim button); add `addEvent` to context on wizard success |
| `src/components/events/SubmissionReceiptModal.tsx` | Add `txHash` and `submissionId` fields (from onchain response) to receipt display |

### Build Sequence

1. **Fix `contracts/fundoraEvents.ts`** — add all missing ABI items, `FUNDORA_EVENTS_ADDRESS` named export, TypeScript struct types. This unblocks everything else.
2. **Fix `useFundoraEvents.ts`** — fix import, fix `useSubmissionByAddress`, add `useSubmitReview`, add `useEventPaused`.
3. **Wire `ParticipantSubmitWizard` onchain** — replace mock submit with `useSubmitEntry` call; add `alreadySubmittedId` prop; block external events; show tx states (wallet prompt / confirming / confirmed / error).
4. **Fix `EventDetailView`** — duplicate-submission pre-check; external-event routing; pass `alreadySubmittedId` to wizard.
5. **Build `OrganizerCreateWizard.tsx`** — 6-step wizard, draft save/restore, `useCreateEvent` + ERC-20 approve flow, reviewer management, post-publish modal.
6. **Wire organizer console in `App.tsx`** — replace `alert()` with wizard modal, add real `usePendingOrganizerRefunds` + `useClaimOrganizerRefund` data.
7. **Wire participant hub in `App.tsx`** — `usePendingPrizeWithdrawals` + `useClaimPrize`, real submissions list.
8. **Lint + typecheck** — zero errors (`bash /home/user/arc-studio-helpers/check.sh`).
9. **Commit and push** to `syther069/Fundora` main.

### Done When
- [ ] `contracts/fundoraEvents.ts` exports `FUNDORA_EVENTS_ADDRESS`, all ABI entries, `OnchainEventInfo`, `OnchainSubmission` types
- [ ] `useFundoraEvents.ts` imports cleanly; `useSubmissionByAddress` uses two-step read; `useSubmitReview` hook added
- [ ] `ParticipantSubmitWizard` calls `useSubmitEntry` onchain; shows wallet prompt / confirming / confirmed / error states; blocks external events
- [ ] `EventDetailView` shows existing receipt instead of wizard if wallet already submitted; shows external-event CTA for external listings
- [ ] `OrganizerCreateWizard` built with 6 steps; USDC approve + createEvent two-step confirmed; draft save/restore works; post-publish modal shown
- [ ] Organizer console shows real `usePendingOrganizerRefunds` balance with claim button
- [ ] Participant hub shows real `usePendingPrizeWithdrawals` balance with claim button
- [ ] Zero TypeScript errors (`tsc --noEmit`)
- [ ] Zero lint errors in `src/` (`bash /home/user/arc-studio-helpers/check.sh`)

---

## Constraints (unchanged from Phase 2)

1. Never change existing hook function signatures or return types in `useFundoraEvents.ts` — add only.
2. Never touch `src/context/GrantsContext.tsx`.
3. Never touch `src/contracts/fundora.ts` or `src/contracts/adminRegistry.ts`.
4. Never use `window.confirm` — inline confirm only.
5. No new npm packages without checking pre-installed list first.
6. `framer-motion` only — no other animation libraries.
7. No react-router-dom — view-state navigation only.
8. No date-fns / dayjs — use native `Intl.DateTimeFormat` and `<input type="date">`.
9. No mainnet transactions, no contract deployments.
10. All USDC amounts use bigint arithmetic; `formatUnits` only at render time.

---

## Deferred (out of Phase 3 scope)

- Reviewer scoring UI (requires `submitReview` — hook added but no full UI built this phase)
- `finalizeWinners` organizer UI (complex multi-address allocation — Phase 4)
- Real onchain event list replacing mock context (requires full context refactor — Phase 4)
- `updateSubmission` (does not exist in deployed contract — cannot implement without redeployment)
- Gasless passkey path for `submitEntry` (passkey integration exists for grants; extension to events needs approval)
- Pagination of submissions (not needed at current scale)

---

## Missing files that could not be accessed

| File referenced | Status |
|----------------|--------|
| `docs/design/MOTION_GUIDELINES.md` | Present and readable |
| `docs/design/COMPONENT_REGISTRY.md` | Present and readable |
| `docs/design/ACCESSIBILITY_AND_UX_CHECKLIST.md` | Present and readable |
| `docs/MEMORY.md` | Present and readable |
| Design Quality Codex PDF | **Not found** in repository — referenced in plan brief but no PDF file exists in `docs/` |
| UX guide PDF | **Not found** — same, referenced as pending in `DESIGN_SYSTEM.md` |
| `UI (2).md` | Not found in current branch (was present in a prior session) |

## Ready to build?
