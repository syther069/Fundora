# Product Requirements Document (PRD)
## GrantFlow — Milestone-Gated USDC Microgrants Platform

---

## 1. Product Overview

- **Product Name:** GrantFlow
- **Product Summary:** GrantFlow is a fully onchain USDC microgrants platform built on Arc Testnet. It enables grant administrators to create milestone-based grants, fund them with USDC, and release payments automatically when reviewers verify completed work. Builders submit evidence per milestone; reviewers vote to approve or reject; payments are queued as pull-withdrawals and claimed by builders directly.
- **Problem Statement:** Traditional grant platforms rely on centralised intermediaries to hold funds and approve disbursements. This creates trust gaps, payment delays, blocklist risks, and no verifiable audit trail. DAOs, protocols, and open-source foundations have no transparent, self-executing tool to fund contributors milestone by milestone without a middleman.
- **Product Vision:** A trustless, transparent, and gas-efficient grant infrastructure where every funding decision is recorded onchain, every payment is pull-based and blocklist-safe, and every stakeholder — admin, builder, reviewer — has a clear, role-gated interface.
- **Primary Goals:**
  - Fully onchain grant lifecycle: create → fund → apply → submit → review → pay
  - Pull-payment pattern for both builders (claimPayment) and funders (claimFunderRefund) — immune to USDC blocklist
  - Evidence hash stored onchain, full URI in event log — cheap and auditable
  - O(1) completion check, packed structs, batch RPC fetch — gas and RPC efficient
  - Role-gated UI: admin, builder, reviewer, observer each see only relevant actions

---

## 2. Target Users

- **Primary Users:** Grant administrators (DAOs, protocols, foundations), builders (developers, designers, researchers), reviewers (community members, domain experts)

- **User Personas:**

  | Persona | Role | Goals | Frustrations |
  |---|---|---|---|
  | Alex | Grant Admin / DAO Treasurer | Create and fund grants, manage reviewers, cancel stalled grants, reclaim unspent USDC | No transparent tool for milestone-based disbursement; manual Gnosis Safe transactions per milestone |
  | Priya | Builder / Grantee | Apply for grants, submit evidence per milestone, withdraw USDC when work is approved | Waiting weeks for manual approvals; no visibility on reviewer vote count |
  | Marcus | Reviewer / Community Verifier | Vote to approve or reject milestone evidence, track vote status | No dedicated interface; no record of past votes |

- **Pain Points:**
  - No trustless milestone payment mechanism for onchain grants
  - Push-payment patterns brick when builder address is USDC blocklisted
  - No onchain audit trail for reviewer decisions
  - Builders have no visibility on how many approvals their milestone has received
  - Grant admins cannot reclaim unspent USDC if a builder goes dark

- **Core Use Cases:**
  1. Admin creates a grant with N milestones and funds it with USDC
  2. Builder applies, completes work, submits evidence (URL or IPFS CID)
  3. Reviewers vote; when threshold met, payment queued to builder
  4. Builder claims USDC; admin can cancel stalled grants and reclaim refund
  5. Admin can reassign a builder who abandons the grant

---

## 3. Goals and Non-Goals

### Goals
- Fully onchain grant lifecycle with no off-chain backend
- Pull-payment for builders AND funders (no push transfer risk)
- Per-milestone USDC disbursement with reviewer quorum
- Evidence committed as keccak256 hash onchain; full URI emitted in event log
- Role detection from contract state (isReviewer, builder address, admin address)
- Emergency pause (admin-only) blocking all state-mutating calls
- Optional grant deadline with permissionless expiry trigger
- Admin can reassign builder (resets in-review milestones)
- Batch grant fetching (getGrantsBatch) to minimise RPC calls
- Event-based UI invalidation (no fixed-poll waste)
- localStorage evidence URI cache for builders
- 23 Foundry unit tests covering all critical paths

### Non-Goals
- Mainnet deployment (testnet only for now)
- Multi-token grants (USDC only)
- Cross-chain USDC bridging
- KYC or identity verification
- Off-chain storage (IPFS pinning, Arweave, database)
- Subgraph or event indexer
- Governance token or DAO voting
- Mobile native app

---

## 4. Product Scope

### MVP Features (all implemented)
- Create grant with title, description, milestone titles/descriptions/amounts, optional deadline
- Fund grant (admin approves USDC ERC-20 spend + calls fundGrant)
- Apply for grant (one builder per grant; reviewer and admin addresses blocked)
- Submit milestone evidence (URL or IPFS CID; stored as keccak256 hash onchain)
- Review milestone (approve/reject; auto-reject on impossibility threshold)
- Claim payment — builder pull-withdraws queued USDC
- Cancel grant — admin cancels; unreleased USDC queued as funder refund
- Claim funder refund — admin/funder pulls cancelled grant USDC back
- Admin Panel: add/remove reviewers, set required approvals, cancel grants, claim refunds
- Role-gated UI: admin, builder (per grant), reviewer, observer views
- Pause / unpause contract
- Builder reassignment by admin
- Expire grant (permissionless, requires deadline to have passed)
- Evidence localStorage cache + explorer tx link
- GrantsContext: single authoritative grant list, no duplicate RPC calls
- Event-based invalidation on 6 contract events

### Future Features
- Deadline UI in Admin Panel (date picker, show countdown in grant cards)
- expireGrant button in UI (currently contract-callable only)
- Subgraph or event indexer for full evidence URI retrieval without explorer
- Pagination / infinite scroll for grant lists > 50
- Multi-reviewer quorum display (live vote tally visible to all)
- Grant search and filter (by status, amount, deadline)
- Builder profile page (all grants applied to, claims history)
- Mainnet deployment with multisig admin (Gnosis Safe)
- IPFS pinning service integration (Pinata / web3.storage)
- Email / push notification on milestone approval

### Out of Scope
- Non-USDC token support
- Cross-chain grants
- Any centralised backend server or database
- KYC / identity verification
- Upgrade proxy (contract is immutable; migration path documented)
- Token-gated access
- Fiat onramp

---

## 5. Functional Requirements

### Feature: Create Grant
- **Purpose:** Admin defines a grant with milestone structure and optional deadline
- **User Flow:** Admin Panel → Create tab → fill title, description, milestone titles/amounts → submit
- **Inputs:** title (string), description (string), milestoneCount (1–20), milestone titles[], milestone descriptions[], milestone amounts[] (USDC, 6 decimals), deadline (uint40, 0 = none)
- **Outputs:** GrantCreated event; new grantId returned; UI refreshes grant list
- **Business Rules:** Only admin can call. milestoneCount ≤ 20. deadline must be 0 or in the future. Sum of milestone amounts = totalAmount stored on grant.
- **Validation:** All fields non-empty. Amount regex `/^\d+(\.\d{1,6})?$/`. Each amount > 0. Title ≤ 100 chars. Description ≤ 500 chars (char counter shown above 300).
- **States:** Loading spinner on submit button. Success: green "Grant Created ✓" dwell for 1.5s. Error: inline toast with decoded revert reason.
- **Acceptance Criteria:** Grant appears in grid within one event cycle. grantCount increments. Admin cannot create with 21 milestones (reverts MaxMilestonesExceeded).

---

### Feature: Fund Grant
- **Purpose:** Admin deposits USDC into the contract to activate the grant
- **User Flow:** Grant Detail → Admin view → Fund Grant button
- **Inputs:** grantId (uint256); amount derived from grant.totalAmount
- **Outputs:** GrantFunded event; grant.status → Active; UI updates status badge
- **Business Rules:** Only admin. Grant must be in Open status. USDC ERC-20 approval must be granted to contract address before fundGrant call. Contract is not paused.
- **Validation:** Wallet must be on Arc Testnet. USDC balance ≥ grant.totalAmount.
- **States:** Two-step indicator shown (Approve USDC → Fund Grant). Spinner during both steps. Error state if approval fails separately from fund call.
- **Acceptance Criteria:** grant.status == Active after tx. grant.totalAmount transferred from funder to contract. pendingWithdrawals unchanged at this point.

---

### Feature: Apply for Grant
- **Purpose:** A builder registers their address as the grantee for an Active grant
- **User Flow:** Grant Detail → Apply button (shown when no builder set and wallet is not reviewer/admin)
- **Inputs:** grantId
- **Outputs:** GrantApplied event; grant.builder = msg.sender; UI shows builder view
- **Business Rules:** Grant must be Active. No builder assigned yet. msg.sender must not be admin or reviewer. Contract not paused.
- **Validation:** Wallet connected. Correct chain.
- **States:** Button disabled with reason if reviewer or admin. Spinner on submit.
- **Acceptance Criteria:** grant.builder == applicant address after tx. Reviewer cannot apply (reverts InvalidStatus). Admin cannot apply (reverts AdminCannotBeBuilder).

---

### Feature: Submit Milestone Evidence
- **Purpose:** Builder commits evidence for a completed milestone
- **User Flow:** Grant Detail → Milestone card → Evidence input → Submit
- **Inputs:** grantId, milestoneIndex, evidenceUri (string — URL or IPFS CID)
- **Outputs:** MilestoneSubmitted event (with full evidenceUri); milestone.evidenceHash = keccak256(evidenceUri); milestone.status → SubmittedForReview; evidenceUri cached to localStorage
- **Business Rules:** Only grant.builder. Milestone must be Pending or Rejected. Contract not paused.
- **Validation:** evidenceUri non-empty. milestoneRound incremented on resubmit (old votes invalidated).
- **States:** Char counter shown > 300 chars, red > 450. Spinner. On success: cached URI shown with explorer link.
- **Acceptance Criteria:** milestone.status == SubmittedForReview. evidenceHash matches keccak256 of submitted URI. Builder can resubmit after rejection (round increments, old votes ignored).

---

### Feature: Review Milestone
- **Purpose:** Reviewer votes to approve or reject a submitted milestone
- **User Flow:** Grant Detail → Milestone card (reviewer view) → Approve / Reject
- **Inputs:** grantId, milestoneIndex, approved (bool)
- **Outputs:** MilestoneReviewCast event; VoteCount updated; if threshold met: MilestoneApproved event + payment queued; if impossible: milestone rejected
- **Business Rules:** Only reviewers. Milestone must be SubmittedForReview. One vote per reviewer per round (AlreadyVoted on duplicate). Auto-approve when approvals ≥ requiredApprovals. Auto-reject when rejections > reviewerCount − requiredApprovals. Contract not paused.
- **Validation:** Correct chain. Reviewer has not already voted this round.
- **States:** Voted badge shown after voting (green "Vote recorded — awaiting other reviewers (N/M)"). Both buttons hidden after vote cast.
- **Acceptance Criteria:** Second vote from same reviewer in same round reverts AlreadyVoted. Resubmission by builder allows reviewer to vote again. Auto-reject fires on first rejection when reviewerCount=2, requiredApprovals=2.

---

### Feature: Claim Payment
- **Purpose:** Builder withdraws queued USDC after milestone approval
- **User Flow:** Grant Detail → Claim USDC button (shown when pendingWithdrawals > 0)
- **Inputs:** none (reads msg.sender)
- **Outputs:** PaymentClaimed event; pendingWithdrawals[builder] = 0; USDC transferred to builder
- **Business Rules:** pendingWithdrawals[msg.sender] > 0. NonReentrant.
- **Validation:** Wallet is grant builder. Correct chain.
- **States:** Claim button shows amount. Spinner. Toast on success.
- **Acceptance Criteria:** Builder USDC balance increases by claimed amount. pendingWithdrawals = 0 after call. USDC is NOT transferred during reviewMilestone (pull only).

---

### Feature: Cancel Grant + Claim Funder Refund
- **Purpose:** Admin cancels a stalled grant and reclaims unreleased USDC
- **User Flow:** Admin Panel → Cancel tab → confirm inline → Cancel Grant → Claim Refund appears
- **Inputs:** cancelGrant(grantId); claimFunderRefund() (no args)
- **Outputs:** GrantCancelled event; pendingFunderRefunds[funder] += unreleased; FunderRefundClaimed event on claim
- **Business Rules:** Only admin for cancelGrant. Grant must be Open or Active. claimFunderRefund callable by anyone with a pending refund balance (but in practice only the funder). NonReentrant on claim.
- **Validation:** No window.confirm — inline confirm panel with explicit "Yes, Cancel Grant" / "Keep Grant" buttons.
- **States:** Refund amount shown on cancel card. Green claim card appears when pendingFunderRefunds > 0. Explorer link on claim tx.
- **Acceptance Criteria:** Completed grants cannot be cancelled. Cancelled grant shows $X refundable. Funder USDC increases on claimFunderRefund. Push transfer never occurs in cancelGrant.

---

## 6. UI/UX Requirements

- **Design System:** Custom token system in `src/index.css`. CSS custom properties for all colours, spacing, and type. Tailwind for layout utilities.
- **Colors and Typography:**
  - `--spring` (#10b981) — primary action, success, USDC amounts
  - `--accent` (#6366f1) — links, secondary actions
  - `--danger` (#ef4444) — destructive actions, errors
  - `--ink` (#111827) — primary text
  - `--muted` (#6b7280) — secondary text
  - `--surface` (#ffffff), `--surface-muted` (#f9fafb), `--surface-strong` (#f3f4f6) — card backgrounds
  - Type: `.heading-1` (1.5rem/700), `.heading-2` (1.125rem/600), `.label-caps` (0.6875rem/600/uppercase/tracked)
  - Monospace: `.mono` for addresses, hashes, amounts
- **Page Layouts:** Single-page app. Default view: grants grid (max-w-screen-xl, 3-col md, 2-col sm, 1-col xs). Detail view: single-column max-w-2xl. Admin Panel: modal overlay with tab navigation.
- **Navigation:** Header with ConnectKit wallet button and Arc Testnet badge. No router — view state managed by `selectedGrantId` in App.tsx. Admin Panel opened via header button (only shown when admin wallet connected).
- **Responsive Behaviour:** Mobile-first. Single column on < 640px. Tap targets ≥ 44px. Actions grouped in a labelled section on mobile. Tab row shows scroll fade gradient on overflow.
- **Animations and Interactions:** Card hover: subtle opacity + scale (0.98) transition. Skeleton pulse on loading. `prefers-reduced-motion: reduce` disables all transitions. Spinner on all async buttons. Success dwell states (1.5s) on create/claim actions.
- **Accessibility:** WCAG 2.1 AA. Status badges use icon + colour (never colour alone). Progress bars: `role="progressbar"` with `aria-valuenow/min/max`. Focus: `btn-focus` class (2px outline, 2px offset on `:focus-visible`). All icons `aria-hidden="true"`. Live regions `aria-live="polite"` on vote status.

---

## 7. Technical Architecture

- **Frontend:** React 18, TypeScript, Vite 5, Tailwind CSS v3, wagmi v2, viem, ConnectKit, Sonner (toasts), lucide-react (icons), framer-motion (animations)
- **Backend:** None. All state lives onchain. No Express server, no API routes, no database.
- **Database:** None. Contract storage is the single source of truth. Evidence URIs cached to browser localStorage.
- **Authentication:** Wallet connection via ConnectKit (injected wallets, WalletConnect). Role detection purely from contract reads (admin(), isReviewer(addr), grant.builder).
- **External APIs:** Arc Testnet RPC (public endpoint from arcTestnet.rpcUrls.default.http[0]). Arc Testnet block explorer (explorer.testnet.arc.io) for tx links.
- **Third-Party Integrations:** OpenZeppelin Contracts 5.1.0 (SafeERC20, ReentrancyGuard). ConnectKit for wallet modal. Sonner for toast notifications.
- **Deployment:** Static Vite build. Deployable to Netlify, Hugging Face Spaces, or Vercel. No server required.

---

## 8. Data Model

### Contract Entities

**Grant**
| Field | Type | Notes |
|---|---|---|
| title | string | Stored in contract storage |
| description | string | Stored in contract storage |
| funder | address | Set on fundGrant |
| builder | address | Set on applyForGrant; reassignable by admin |
| totalAmount | uint128 | Sum of milestone amounts, 6 USDC decimals |
| releasedAmount | uint128 | Incremented on each milestone approval |
| milestoneCount | uint8 | 1–20 (MAX_MILESTONES = 20) |
| approvedMilestoneCount | uint8 | O(1) completion check |
| status | GrantStatus (uint8) | Open/Active/Completed/Cancelled |
| createdAt | uint40 | block.timestamp at creation |
| deadline | uint40 | 0 = no deadline |

**Milestone**
| Field | Type | Notes |
|---|---|---|
| index | uint8 | 0-based |
| title | string | |
| description | string | |
| amount | uint128 | USDC, 6 decimals |
| status | MilestoneStatus (uint8) | Pending/SubmittedForReview/Approved/Rejected |
| submittedBy | address | |
| evidenceHash | bytes32 | keccak256(evidenceUri) |
| submittedAt | uint40 | |
| approvedAt | uint40 | |

**VoteCount**
| Field | Type | Notes |
|---|---|---|
| approvals | uint128 | Per grant per milestone |
| rejections | uint128 | Per grant per milestone |

**Mappings**
| Mapping | Key | Value | Purpose |
|---|---|---|---|
| grants | uint256 grantId | Grant | All grants |
| milestones | grantId → milestoneIndex | Milestone | All milestones |
| voteCounts | grantId → milestoneIndex | VoteCount | Packed vote counts |
| milestoneRound | grantId → milestoneIndex | uint256 | Resubmission round counter |
| reviewerVote | grantId → milestoneIndex → round → reviewer | bool | Per-round vote record |
| isReviewer | address | bool | Reviewer registry |
| pendingWithdrawals | address | uint128 | Builder pull-payment queue |
| pendingFunderRefunds | address | uint128 | Funder pull-refund queue |

- **Constraints:** milestoneCount ≤ 20. requiredApprovals ≤ reviewerCount. Amounts fit uint128 (USDC max supply ~4.3×10^28 micro-units, fits in uint128 ~3.4×10^38).
- **Data Ownership:** All data stored in contract storage on Arc Testnet. Evidence URIs owned by submitter's browser (localStorage).
- **Migrations:** Contract is immutable. A new deployment requires manual migration of grant data (not supported automatically). Admin must recreate grants on a new contract address.

---

## 9. API Specifications

All interactions are onchain function calls via wagmi `useWriteContract` / `useReadContract`. No HTTP API.

### Write Functions

| Function | Caller | Args | Notes |
|---|---|---|---|
| `createGrant` | admin | title, description, milestoneCount, titles[], descs[], amounts[], deadline | Emits GrantCreated |
| `fundGrant` | admin | grantId | Requires ERC-20 approval first |
| `applyForGrant` | any (non-admin, non-reviewer) | grantId | Emits GrantApplied |
| `submitMilestoneEvidence` | grant.builder | grantId, milestoneIndex, evidenceUri | Stores hash; emits URI in event |
| `reviewMilestone` | reviewer | grantId, milestoneIndex, approved | Emits MilestoneReviewCast |
| `claimPayment` | builder | — | NonReentrant; emits PaymentClaimed |
| `cancelGrant` | admin | grantId | Queues funder refund; emits GrantCancelled |
| `claimFunderRefund` | funder | — | NonReentrant; emits FunderRefundClaimed |
| `adminReassignBuilder` | admin | grantId, newBuilder | Resets in-review milestones |
| `expireGrant` | anyone | grantId | Requires deadline passed |
| `addReviewer` | admin | reviewer | Emits ReviewerAdded |
| `removeReviewer` | admin | reviewer | Guards requiredApprovals ≤ reviewerCount |
| `setRequiredApprovals` | admin | n | Guards n ≤ reviewerCount |
| `pause` | admin | — | Blocks all state-mutating calls |
| `unpause` | admin | — | |

### Read Functions

| Function | Args | Returns | Notes |
|---|---|---|---|
| `getGrant` | grantId | Grant struct | |
| `getGrantsBatch` | fromId, toId | Grant[] | Max 50 per call |
| `getMilestone` | grantId, index | Milestone struct | |
| `getMilestoneApprovalCount` | grantId, index | uint128 | |
| `getMilestoneVoteCounts` | grantId, index | (approvals, rejections) | |
| `getReviewerVote` | grantId, index, round, reviewer | bool | |
| `grantCount` | — | uint256 | Total grants ever created |
| `requiredApprovals` | — | uint256 | Current quorum threshold |
| `reviewerCount` | — | uint256 | Current reviewer count |
| `isReviewer` | address | bool | |
| `admin` | — | address | |
| `pendingWithdrawals` | address | uint128 | Builder claimable USDC |
| `pendingFunderRefunds` | address | uint128 | Funder claimable refund |
| `paused` | — | bool | |
| `milestoneRound` | grantId, index | uint256 | Current round |

---

## 10. Security Requirements

- **Authentication and Authorization:** All privileged functions guarded by `onlyAdmin` or `onlyReviewer` modifiers. Builder actions guarded by `if (msg.sender != grant.builder)`. No off-chain auth.
- **Input Validation:** milestoneCount ≤ MAX_MILESTONES. requiredApprovals ≤ reviewerCount. deadline must be 0 or future. Amount > 0 per milestone. evidenceUri non-empty enforced on frontend (contract stores hash regardless).
- **Secrets Management:** No secrets in the app. Wallet signing is entirely client-side via MetaMask / WalletConnect. No private keys in code, env, or localStorage.
- **Data Privacy:** All grant data is public onchain. Evidence URIs are public (emitted in events). No PII collected or stored.
- **Threat Model:**
  - USDC blocklist: mitigated by pull-payment for both builders and funders
  - Reviewer self-approval: blocked (isReviewer check in applyForGrant)
  - Admin-as-builder: blocked (admin check in applyForGrant)
  - Vote replay across resubmissions: mitigated by milestoneRound counter
  - Unbounded loop DoS: mitigated by MAX_MILESTONES = 20 cap and O(1) approvedMilestoneCount check
  - Reentrancy: ReentrancyGuard on claimPayment and claimFunderRefund
  - Emergency: pause() blocks all state-mutating functions
- **Abuse Prevention:** One builder per grant. One vote per reviewer per round. No flash-loan attack surface (no price oracle, no swap). Contract holds USDC but releases only to known addresses (builder, funder) via pull.

---

## 11. Non-Functional Requirements

- **Performance:** Single `getGrantsBatch` call replaces N individual `eth_call`s. Event-based UI invalidation eliminates unnecessary polls. 12s fallback poll for safety.
- **Reliability:** Pull-payment pattern ensures no stuck funds due to transfer failure. Pause allows emergency halt without fund loss.
- **Scalability:** MAX_MILESTONES = 20 caps per-grant complexity. Batch fetch caps at 50 grants. Pagination / infinite scroll planned for > 50 grants.
- **Accessibility:** WCAG 2.1 AA. Status icons (not colour-only). ARIA progressbar. Focus rings on all interactive elements. prefers-reduced-motion respected.
- **Browser Compatibility:** Latest Chrome, Firefox, Safari, Edge. Requires browser wallet extension or WalletConnect-compatible mobile wallet.
- **Maintainability:** ABI imported from Foundry artifact (no drift risk). All hooks isolated in useProofSpring.ts. GrantsContext is single source of truth for grant state. No inline styles except where design tokens are not sufficient.

---

## 12. Testing and Quality Assurance

### Unit Tests (Foundry) — 23/23 passing

| Test | Coverage |
|---|---|
| testFullHappyPath | Full lifecycle: create → fund → apply → submit → approve → complete → claim |
| testRejectMilestoneAndResubmit | Rejection fires on impossibility; builder resubmits; reviewer re-votes |
| testCancelGrantRefundsFunder | Pull refund pattern; funder reclaims USDC after cancel |
| testReviewerCannotApplyAsBuilder | applyForGrant reverts InvalidStatus for reviewer |
| testAdminCannotApplyAsBuilder | applyForGrant reverts AdminCannotBeBuilder for admin |
| testAlreadyVotedReverts | Second vote in same round reverts AlreadyVoted |
| testRoundResetOnResubmit | Resubmission increments round; reviewer can vote again |
| testClaimPaymentPullModel | USDC not transferred in reviewMilestone; builder must call claimPayment |
| testRequiredApprovalsGuard | setRequiredApprovals > reviewerCount reverts InsufficientApprovers |
| testPauseBlocks | fundGrant and submitMilestoneEvidence revert Paused when paused |
| testAdminReassignBuilder | New builder set; in-review milestones reset to Pending |
| testExpireGrant | Grant cancelled and refund queued after deadline |
| testGetGrantsBatch | Returns correct slice; reverts BatchTooLarge for > 50 |
| testMaxMilestones | 21 milestones reverts MaxMilestonesExceeded; 20 succeeds |
| + 9 additional edge case tests | Zero refund, zero withdrawal, only-admin guards, only-reviewer guards, cancel open grant, apply twice, not-expired guard, milestone not auto-rejected below threshold, batch size 1 |

### Integration Tests
- Planned: fork Arc Testnet with anvil, fund with USDC storage writes, run full lifecycle against live state
- Tool: Foundry anvil fork + contract-integration-tester agent

### End-to-End Tests
- Planned: Playwright against preview URL — connect wallet, create grant, fund, apply, submit evidence, review, claim

### Security Tests
- Foundry fuzz tests planned for amount arithmetic (parseUnits overflow edge cases)
- Slither static analysis: run before any mainnet consideration

### Build and Runtime Verification
- `forge build` must complete with zero errors before deploy
- `bun run check` (oxlint + tsc --noEmit) must report zero errors
- Vite dev server must serve preview on port 5173 after all changes

---

## 13. Implementation Plan

### Phase 1 — Contract v1 + Core Frontend (COMPLETE)
- ProofSpring.sol written with milestone-gated USDC disbursement
- Security audit: 3 High findings (loop DoS, self-approval, push-payment)
- Fixes applied: O(1) round counter, reviewer-as-builder guard, pull-payment
- Deployed to Arc Testnet (v1): `0x090e040f2a56676d3f91c773ea8a42106435f920`
- Full React frontend: App.tsx, GrantCard, GrantDetail, AdminPanel, Header, StatusBadge, GrantSkeleton

### Phase 2 — Contract v2 + Architecture Improvements (COMPLETE)
- Contract v2 rewrites: rejection logic, funder pull refund, admin-as-builder guard, milestone cap, evidence hash, builder reassignment, deadlines, pause, gas packing, O(1) completion, batch read
- 23/23 unit tests passing
- Deployed to Arc Testnet (v2): `0x956b9d4b1c4a5f8ec2f647bb3b0999d98c46b388`
- Frontend: GrantsContext, event-based invalidation, batch fetch, localStorage evidence cache, claimFunderRefund UI, explicit RPC URL

### Phase 3 — UI Redesign + Production Readiness (NEXT)
- Full UI redesign by frontend design agent (new design system, page layouts, visual polish)
- Deadline UI (date picker in create form, countdown in grant cards)
- expireGrant button in grant detail
- Pagination for > 50 grants
- Subgraph or event indexer for evidence URI retrieval
- Integration test suite (anvil fork)
- Mainnet readiness review (multisig admin, upgradeability decision, Slither audit)

---

## 14. Acceptance and Definition of Done

- All 23 unit tests pass (`forge test`)
- `bun run check` reports zero lint and TypeScript errors
- Contract deployed and address wired in `src/contracts/proofSpring.ts`
- No `window.confirm` used anywhere — all destructive actions use inline confirm UI
- No push-payment: USDC transfers only in `claimPayment` and `claimFunderRefund`
- No float arithmetic for USDC amounts — `parseUnits` / `formatUnits` (viem) used exclusively
- No mock data in production flows — all state read from contract
- No hand-typed ABI const that can drift from artifact — ABI imported from `contracts/out/`
- Role detection purely from contract reads (no hardcoded address lists in frontend)
- Existing functionality remains intact after each change

---

## 15. Constraints and Assumptions

- **Technical Constraints:**
  - Arc Testnet only (chain ID 5042002). Mainnet requires independent audit and multisig admin setup.
  - Contract is immutable. No upgrade proxy. A breaking change requires redeployment and manual data migration.
  - USDC only. No multi-token support.
  - MAX_MILESTONES = 20 hard cap in contract.
  - Evidence URI readable from event log only (not from contract storage). Full indexing requires subgraph or anvil fork.
  - localStorage evidence cache is per-browser, per-user. Other reviewers cannot see the cached URI unless they view the tx on explorer.

- **Budget or Time Constraints:** Testnet deployment is free. Arc Testnet USDC available from the in-app faucet link. No budget constraints for current scope.

- **External Dependencies:**
  - Arc Testnet RPC availability (public endpoint)
  - Arc Testnet block explorer (explorer.testnet.arc.io) for tx links
  - USDC contract on Arc Testnet (address resolved at runtime from onchain-facts)
  - ConnectKit / WalletConnect for wallet connection

- **Unresolved Questions:**
  - Should the admin be a multisig (Gnosis Safe) before mainnet?
  - Should the contract use UUPS upgradeability or stay immutable?
  - Should evidence URIs be pinned to IPFS via a pinning service at submission time?
  - Should there be a frontend-based subgraph for evidence URI retrieval?
  - What is the right mainnet USDC address for Arc (mainnet)?

---

## 16. References

- **Design References:**
  - Arc Studio frontend design tokens: `src/index.css`
  - Existing component implementations: `src/components/`

- **API Documentation:**
  - wagmi v2 docs: https://wagmi.sh
  - viem docs: https://viem.sh
  - ConnectKit docs: https://docs.family.co/connectkit
  - Sonner docs: https://sonner.emilkowal.ski

- **Official Documentation:**
  - Arc Testnet docs: https://docs.arc.io
  - Circle USDC docs: https://developers.circle.com
  - OpenZeppelin Contracts 5.x: https://docs.openzeppelin.com/contracts/5.x
  - Foundry book: https://book.getfoundry.sh

- **Repository Links:**
  - Source repo: https://github.com/syther069/grantflow
  - Contract v1 (deprecated): `0x090e040f2a56676d3f91c773ea8a42106435f920` on Arc Testnet
  - Contract v2 (live): `0x956b9d4b1c4a5f8ec2f647bb3b0999d98c46b388` on Arc Testnet
  - Arc Testnet explorer: https://explorer.testnet.arc.io
  - Contract on explorer: https://explorer.testnet.arc.io/address/0x956b9d4b1c4a5f8ec2f647bb3b0999d98c46b388
