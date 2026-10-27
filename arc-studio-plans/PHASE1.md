# Fundora — Phase 1: Hackathons & Contests Platform

## Contract Review Notes (Phase 1 changes already pushed to repo)

### Pre-Deploy Fixes Required

The following issues must be resolved in the contract source before mainnet deployment. They are ordered by priority.

#### AdminRegistry.sol

| # | Severity | Issue | Fix |
|---|---|---|---|
| 1 | **Medium** | No admin revocation — `isAdmin` can only ever be set `true`; compromised or bad-actor admins cannot be removed | Add `revokeAdmin(address)` (owner-only), sets `isAdmin[addr] = false`, emits `AdminRevoked` event |
| 2 | Medium | `getRegisteredAdmins()` returns an unbounded array — will hit gas limits at scale | Add `getRegisteredAdminsBatch(uint256 offset, uint256 limit)` paginated view |
| 3 | Low | `registeredAdmins` array is never cleaned on revocation — consumers must check `isAdmin` per entry | Add NatSpec note to `getRegisteredAdmins()` clarifying this |
| 4 | Low | `registrationFee` can be set to 0 post-deploy opening free registration | Confirm intentional; add NatSpec noting this is by design |

#### FundoraEvents.sol

| # | Severity | Issue | Fix |
|---|---|---|---|
| 5 | **Medium** | `closeSubmissions` — any wallet can call it after deadline passes, not just the organizer | Add a NatSpec comment making this permissionless-by-design explicit; or restrict to organizer/admin only |
| 6 | **Medium** | `PrizeClaimed` event missing `eventId` — frontend cannot show per-event claim receipts without off-chain indexing | Either add `eventId` to `PrizeClaimed` event, or switch to `pendingPrizeWithdrawals[eventId][winner]` + `claimPrize(eventId)` |
| 7 | **Medium** | No `updateSubmission` function — participants cannot fix a broken link after submitting | Add `updateSubmission(eventId, metadataUri, submissionHash)` callable only by original submitter while `EventStatus.Open` |
| 8 | Low | `submitEntry` missing `nonReentrant` — no external calls inside so not exploitable now, but inconsistent and a footgun if extended | Add `nonReentrant` modifier for consistency |
| 9 | Low | `judgingDeadline` stored but never enforced — organizer can finalize at any time | Add NatSpec clarifying finalisation is organizer-authority and deadline is advisory |
| 10 | Low | `totalEscrowFunded` never decremented on cancel/claim — misleading as a "live balance" | Rename to `totalEscrowReceived` or add NatSpec clarifying it tracks gross inflows only |
| 11 | Low | No `getSubmissionByAddress(eventId, address)` helper — frontend needs two calls to look up a submitter's entry | Add convenience view returning the `Submission` struct for a given submitter address |

---

### AdminRegistry.sol — general notes
- `IAdminRegistry` interface decouples it cleanly from `FundoraEvents`.
- `nonReentrant` on `registerAdmin` is correct — USDC transfer is inside the function.
- `safeTransferFrom` used throughout.
- `try/catch` in `FundoraEvents.isAuthorizedAdmin()` protects against a broken/zero registry address.

### FundoraEvents.sol — general notes
- Dual-modality enforced at `createEvent()`: `NativeEscrow` pulls USDC upfront; `ExternalListing` requires `totalPrizePool == 0` + non-empty URL.
- Pull-payment pattern correctly preserved (`pendingPrizeWithdrawals`, `pendingOrganizerRefunds`).
- `nonReentrant` on all fund-moving functions.
- Per-event reviewer isolation via `isEventReviewer[eventId][reviewer]` — correct.
- Score range 1–100 on contract; UI must display /100 (not 1–10 sliders).
- `MAX_WINNERS = 50` and `MAX_BATCH_SIZE = 50` caps prevent gas exhaustion.
- Batch view functions use 1-indexed storage (`offset + 1 + i`) — correct.

---

## Implementation Plan: Fundora Phase 1

### Summary
Replace the existing 1-to-1 microgrant UI with a dual-modality hackathon/contest platform. Phase 1 delivers the Public Event Directory and Event Detail page, backed by the new `AdminRegistry` + `FundoraEvents` contracts deployed on Arc Testnet.

### Architecture
- **Blockchain:** Arc Testnet (Chain ID 5042002) — USDC as gas token
- **Contracts:** `AdminRegistry.sol` (USDC-fee admin self-registration) + `FundoraEvents.sol` (multi-winner USDC escrow, per-event submissions, reviewer scoring, pull-claim prizes). Both already written and in the repo; need compile + deploy.
- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + wagmi v2 + ConnectKit + Framer Motion (all already installed)
- **Wallet:** ConnectKit (injected wallets) + existing passkey/modular wallet support preserved

### Files to Create / Modify

#### Contracts
1. `contracts/AdminRegistry.sol` — pull from remote into sandbox; apply pre-deploy fixes: `revokeAdmin()`, `getRegisteredAdminsBatch()`, NatSpec notes
2. `contracts/FundoraEvents.sol` — pull from remote into sandbox; apply pre-deploy fixes: `updateSubmission()`, `nonReentrant` on `submitEntry`, `eventId` in `PrizeClaimed`, `getSubmissionByAddress()`, NatSpec clarifications on `closeSubmissions`/`judgingDeadline`/`totalEscrowFunded`
3. `contracts/test/AdminRegistry.t.sol` — Foundry unit tests: register, fee payment, duplicate guard, `revokeAdmin`, paginated batch view, owner functions
4. `contracts/test/FundoraEvents.t.sol` — Foundry unit tests: create event, submit + update entry, review, finalize winners, claim prize (verify eventId in event), cancel + refund, permissionless close after deadline
5. `contracts/contract-metadata/AdminRegistry.json` — ABI + deployed address (generated post-deploy)
6. `contracts/contract-metadata/FundoraEvents.json` — ABI + deployed address (generated post-deploy)

#### Frontend — ABIs & Config
7. `src/contracts/adminRegistry.ts` — ABI constant + `ADMIN_REGISTRY_ADDRESS` for Arc Testnet
8. `src/contracts/fundoraEvents.ts` — ABI constant + `FUNDORA_EVENTS_ADDRESS` for Arc Testnet

#### Frontend — Hooks
9. `src/hooks/useAdminRegistry.ts` — `useIsAdmin(address)`, `useAdminProfile(address)`, `useRegisterAdmin()`
10. `src/hooks/useFundoraEvents.ts` — `useEventsBatch(offset, limit)`, `useEvent(eventId)`, `useCreateEvent()`, `useSubmitEntry()`, `useClaimPrize()`, `usePendingPrizeWithdrawals(address)`

#### Frontend — Context
11. `src/context/EventsContext.tsx` — fetches paginated event list, caches it, exposes filter/sort state

#### Frontend — Components
12. `src/components/EventCard.tsx` — event card with "Verified Escrow" (teal) vs "External Listing" (slate) badge, USDC prize pool, live countdown, category tag
13. `src/components/EventSkeleton.tsx` — shimmer skeleton matching exact EventCard dimensions
14. `src/components/EventsDirectory.tsx` — filterable grid: category tabs (All / Hackathons / Contests / External), status pills (Active / In Judging / Completed / Upcoming), sort controls (Prize Pool / Deadline / Recent)
15. `src/components/EventHero.tsx` — banner, title, host badge, total USDC prize pool display, live countdown timer, primary CTA ("Submit Entry" or "View on External Site")
16. `src/components/EventTabs.tsx` — tab bar with keyboard navigation (Overview, Tracks & Prizes, Judging Rubric, Submissions, Winners)
17. `src/components/PrizeTierList.tsx` — prize tier breakdown: 1st / 2nd / 3rd place + track bounties with USDC amounts
18. `src/components/SubmissionsShowcase.tsx` — searchable public gallery of submitted entries with submitter address, metadata link, average score
19. `src/components/WinnersPodium.tsx` — post-finalization celebratory podium with winner addresses and prize amounts, Arc Explorer links
20. `src/components/EventDetail.tsx` — assembles EventHero + EventTabs + tab panel content (PrizeTierList, SubmissionsShowcase, WinnersPodium)
21. `src/components/Header.tsx` — update nav: "Explore Events" link, keep existing wallet connect buttons, network badge

#### Frontend — Routing
22. `src/App.tsx` — add routes `/` → EventsDirectory, `/events/:id` → EventDetail. Keep existing `/grants` routes intact (no regression).

### Build Sequence
1. Pull `AdminRegistry.sol` + `FundoraEvents.sol` into sandbox via git pull
2. Apply all pre-deploy contract fixes (see table above): `revokeAdmin`, `getRegisteredAdminsBatch`, `updateSubmission`, `nonReentrant` on `submitEntry`, `eventId` in `PrizeClaimed`, `getSubmissionByAddress`, NatSpec notes
3. Run `forge build` — confirm zero errors
4. Write unit tests (`AdminRegistry.t.sol`, `FundoraEvents.t.sol`) covering all fixes, run `forge test`
5. Deploy `AdminRegistry` to Arc Testnet, then deploy `FundoraEvents` pointing at the AdminRegistry address
6. Update `AGENTS.md` with new contract addresses
7. Write `src/contracts/adminRegistry.ts` + `src/contracts/fundoraEvents.ts` with deployed addresses
8. Write `useAdminRegistry` + `useFundoraEvents` hooks (include `useUpdateSubmission`, `useGetSubmissionByAddress`)
9. Write `EventsContext` (list fetch + filter/sort state)
10. Build `EventCard` + `EventSkeleton` + `EventsDirectory`
11. Build `EventHero` + `EventTabs` + `PrizeTierList` + `SubmissionsShowcase` + `WinnersPodium`
12. Assemble `EventDetail` page
13. Update `Header` nav + `App.tsx` routing
14. Wire all screen states: loading (skeletons), empty (CTA cards), error (toasts + inline), success (dwell animation + Explorer link)

### Done When
- [ ] All pre-deploy contract fixes applied and reviewed (11 items in table above)
- [ ] `AdminRegistry` + `FundoraEvents` compiled with zero errors (`forge build`)
- [ ] Unit tests pass for all new functions including `revokeAdmin`, `updateSubmission`, `claimPrize` eventId emission (`forge test`)
- [ ] Both contracts deployed to Arc Testnet
- [ ] `AGENTS.md` updated with both new contract addresses and tx hashes
- [ ] Public Event Directory loads events from chain with working filter tabs and status pills
- [ ] "Verified Escrow" (teal) vs "External Listing" (slate) badges render correctly
- [ ] Event Detail page renders all 5 tabs with correct on-chain data
- [ ] Live countdown timers work on event cards and the event hero
- [ ] All 4 screen states handled: shimmer skeletons on load, empty states with CTAs, error toasts with plain-English messages, success feedback with Explorer links
- [ ] Score display aligned to /100 (matching contract range 1–100)
- [ ] Existing `/grants` routes and all wagmi/passkey wallet flows are fully preserved (no regressions)
- [ ] Zero TypeScript errors (`tsc --noEmit`)
