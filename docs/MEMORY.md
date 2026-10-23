# MEMORY.md — Persistent Project Context

> Purpose: Preserve essential project knowledge across AI coding-agent sessions.
> Last Updated: 2026-10-23

---

## 1. Project Identity

- **Project Name:** Mezo (Bitcoin Banking: Deposit BTC, Borrow MUSD at 0%, Earn yield, Swap & Spend) + GrantFlow / ProofSpring (Milestone-gated USDC microgrants platform)
- **Target Chains:** Arc Mainnet (Chain ID 5042) and Arc Testnet (Chain ID 5042002)
- **Core Value Proposition:** 
  1. **Mezo:** Bitcoin banking where users deposit BTC, borrow MUSD, earn yield, swap, and spend with a sovereign debit card without selling their BTC.
  2. **GrantFlow / ProofSpring:** Milestone-based USDC microgrants where every payout requires verified onchain proof of work.
- **Current Development Stage:** Complete UI/UX Overhaul & Escrow Workflow Hardening Verified. Built 13-component token-based UI design system, above-the-fold Mezo landing page, interactive feature views, developer Docs portal, and resolved two critical escrow & UX workflow findings in GrantFlow (Finding #1 & #2). Configured zero-secret static Vercel deployment pipeline.

---

## 2. Project Status

### Implemented
- **Escrow & Admin Workflow Hardening (2026-10-23):**
  - **Finding #1 Fixed (`GrantDetail.tsx`):** Added onchain USDC `allowance` check with 1-click funding bypass when allowance covers `grant.totalAmount`. Gated Step 2 ("Fund Grant") on verified transaction receipt confirmation (`useWaitForTransactionReceipt`), preventing approval race conditions. Explorer links updated to resolve target chain.
  - **Finding #2 Fixed (`AdminPanel.tsx`):** Decoupled form reset from write trigger; form inputs (title, desc, deadline, milestone rows) are preserved across user signature rejections or failed transactions. Inputs lock while pending and only clear upon confirmed onchain receipt (`createSuccess`) with a dwell toast. Aligned reviewer management actions to receipt confirmation.
  - **Vercel Build Integration:** Added `"build": "vite build"` script to `package.json` and strict typing to `scripts/compass-chains.d.ts`. Verified 0 env variables/secrets required for hosting.
- **Mezo Bitcoin Banking & Design System:**
  - Standardized token-based styling (`src/index.css`) preserving core colors (`--ink: #122d45`, `--spring: #2d7d46`) with complete dark mode (`#0b131e` surfaces).
  - 13 reusable UI components in `src/components/ui/` (`Button`, `Card`, `Input`, `Modal`, `Tabs`, `Tooltip`, `Badge`, `Toast`, `Skeleton`, `Accordion`, `Stepper`, `Table`, `EmptyState`).
  - Dark mode context (`ThemeContext.tsx`) and 3-way toggle (`ThemeToggle.tsx`) with localStorage persistence and system theme listener.
  - Above-the-fold Landing Page (`LandingPage.tsx`) answering what/who/why/next with zero buzzwords, protocol metrics, 4-step stepper, and interactive loan calculator.
  - Interactive Feature Views (`src/components/features/`):
    - `BorrowView.tsx`: Vault simulator, collateral ratio slider, real-time liquidation price calculation.
    - `EarnView.tsx`: Stability Pool yield calculator (8.4% APY paid in BTC).
    - `SwapView.tsx`: Zero-slippage BTC/MUSD/USDC swap interface.
    - `SpendView.tsx`: Sovereign debit card graphic with interactive freeze toggle and cash-back tiers.
  - Developer Documentation Portal (`DocsPage.tsx`): Sticky sidebar navigation, live search, "On this page" outline, copyable code blocks, next/previous links, and mobile drawer.
  - Simplified Header (`Header.tsx`): Simple English navigation (**Borrow**, **Earn**, **Swap**, **Spend**, **Learn**, **Open app**), mobile drawer, theme toggle, and wallet connection.
- **ProofSpring v2 Smart Contract & Microgrants:**
  - Full milestone lifecycle: create grant → fund → apply → submit evidence → review → claim payment
  - Pull-payment pattern for builders (`claimPayment`) and funders (`claimFunderRefund`)
  - Admin functions: add/remove reviewer, set required approvals, cancel grant, pause/unpause, reassign builder, set deadline
  - Multi-device evidence resolver (`src/hooks/useEvidenceResolver.ts`): localStorage lookup + onchain `getLogs` fallback querying `MilestoneSubmitted` events with cryptographic hash verification
  - All unit tests passing: 23/23 Foundry unit tests
  - All quality gates passing: `npx oxlint src` (0 errors), `tsc --noEmit` (0 errors), `vite build` (0 errors)

### In Progress
- Smart contract deployment to Arc Mainnet (Chain ID `5042`) with canonical USDC `0x3600000000000000000000000000000000000000`
- Generation of live Arc Mainnet proof transaction on `explorer.arc.io`

### Critical Audit Findings & Blockers
- **P0 Defect on Deployed v2 Contract (`0x956b9d4b1c4a5f8ec2f647bb3b0999d98c46b388`):** Initialized with `0x8AC76a...580d` (BSC USDC token address), which has 0 code on Arc. All `fundGrant`, `claimPayment`, and `claimFunderRefund` calls revert with `AddressEmptyCode`. Contract is ready to be redeployed with `_usdc = 0x3600000000000000000000000000000000000000`.
- **P1 Hackathon Compliance (DoraHacks Arc Microgrants):** Mandatory submission requires Arc Mainnet contract deployment (`explorer.arc.io`) and a live mainnet USDC transaction hash.
- **P1 Data Integrity (Resolved):** Milestone evidence plaintext URIs now resolve across devices via onchain `getLogs` fallback and cryptographic hash verification.

---

## 3. Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS v3, wagmi v2, viem, ConnectKit, Sonner (toasts), Lucide React (icons), Framer Motion
- **Backend:** None — fully onchain, no server
- **Database:** None — all state in the ProofSpring smart contract on Arc Testnet. Evidence URIs cached in browser `localStorage`.
- **Authentication:** Wallet-based (ConnectKit). Role derived from contract state: `admin`, `isReviewer[addr]`, `grant.builder`
- **External Services:** Arc Testnet RPC (`arcTestnet.rpcUrls.default.http[0]`), Arc Testnet explorer (`https://explorer.testnet.arc.io`)
- **Deployment:** Not yet deployed to a host. Ready for Netlify / Hugging Face / Vercel.
- **Testing Tools:** Foundry (`forge test`), oxlint, TypeScript compiler (`tsc --noEmit`)

---

## 4. Architecture Summary

- **Architecture Style:** Fully onchain dApp — no backend, no database, no API server
- **Major Components:**
  - `contracts/ProofSpring.sol` — single contract, all business logic
  - `src/contracts/proofSpring.ts` — contract address, ABI, chain ID constant
  - `src/hooks/useProofSpring.ts` — all read hooks (12s poll + event invalidation)
  - `src/context/GrantsContext.tsx` — single authoritative grant list, consumed by all components
  - `src/components/` — UI components (App, Header, GrantCard, GrantDetail, AdminPanel, StatusBadge, GrantSkeleton)
- **Data Flow:** Contract state → wagmi `useReadContract` hooks → GrantsContext → components. User actions → `useWriteContract` → `useWaitForTransactionReceipt` → `refetch` via event watcher
- **Source of Truth:** Arc Testnet blockchain. No off-chain database.
- **Important Dependencies:** `@openzeppelin/contracts` 5.1.0 (SafeERC20, ReentrancyGuard), wagmi v2, viem, ConnectKit

---

## 5. Important Codebase Locations

| Path | Responsibility | Notes |
|---|---|---|
| `contracts/ProofSpring.sol` | Full smart contract source | v2, deployed |
| `contracts/test/ProofSpring.t.sol` | Foundry unit tests | 23/23 passing |
| `contracts/out/ProofSpring.sol/ProofSpring.json` | Compiled artifact + ABI | Rebuilt with `forge build` |
| `src/contracts/proofSpring.ts` | Contract address, ABI const, chain ID | Update address here after redeployment |
| `src/hooks/useProofSpring.ts` | All wagmi read hooks | Add new read hooks here |
| `src/context/GrantsContext.tsx` | Authoritative grant list, batch fetch, event invalidation | Do not duplicate grant fetching in components |
| `src/components/AdminPanel.tsx` | Admin-only UI: create grant, reviewers, settings, cancel, claim refund | Guarded by `isAdmin` |
| `src/components/GrantDetail.tsx` | Full grant view: milestones, evidence, fund, apply, review, claim | Most complex component |
| `src/components/GrantCard.tsx` | Grant summary card in the grid | |
| `src/config.ts` | wagmi config, Arc Testnet chain | Do not modify unless adding chains |
| `src/index.css` | Tailwind + design tokens | All CSS variables defined here |
| `docs/PRD.md` | Full product requirements | GrantFlow product name |
| `docs/MEMORY.md` | This file | Update when anything significant changes |
| `AGENTS.md` | Deployed contract addresses + post-deploy checklist | Always update after redeployment |
| `foundry.toml` | Foundry config | `via_ir = true` required for stack-depth in createGrant |

---

## 6. Confirmed Decisions

- **Decision:** Pull-payment pattern for both builders and funders
  **Reason:** USDC blocklist can brick push-transfers to builder or funder addresses. Pull pattern means a blocklisted address only affects their own withdrawal.
  **Date:** 2026-10-17
  **Status:** Active

- **Decision:** Evidence stored as `bytes32 keccak256` hash onchain, full URI in event log only
  **Reason:** Storing arbitrary-length strings onchain costs ~7,000 extra gas per submission. URI is still immutable (in event log). Frontend reads from localStorage cache or explorer link.
  **Date:** 2026-10-17
  **Status:** Active

- **Decision:** O(1) milestone completion check via `approvedMilestoneCount` counter
  **Reason:** Previous `_allMilestonesApproved` loop was O(n) on every approval. Counter increments once per approval.
  **Date:** 2026-10-17
  **Status:** Active

- **Decision:** Rejection auto-fires when `rejections > reviewerCount - requiredApprovals`
  **Reason:** Mathematically impossible to reach approval threshold — more defensible than `rejections >= requiredApprovals` which created a race condition with ties.
  **Date:** 2026-10-17
  **Status:** Active

- **Decision:** `via_ir = true` in `foundry.toml`
  **Reason:** `createGrant` has too many local variables for the default Solidity stack; IR-based compilation resolves the "stack too deep" error cleanly.
  **Date:** 2026-10-17
  **Status:** Active

- **Decision:** GrantsContext as single source of truth for grant list
  **Reason:** `App.tsx` and `AdminPanel.tsx` were both calling `useGrantCount` + `useAllGrants` independently, causing duplicate RPC calls on every 12s poll.
  **Date:** 2026-10-19
  **Status:** Active

- **Decision:** Admin wallet (`0x5B12Ce46C7194aD57d143bC22847224047b1Ef42`) is also the first reviewer
  **Reason:** User decision — single operator for testnet deployment.
  **Date:** 2026-10-19
  **Status:** Active

---

## 7. User and Product Requirements

- **Must-Have Requirements:** All USDC transfers via pull-payment. No `window.confirm`. Evidence onchain (hash). Reviewer vote deduplication. Admin cannot be builder. Reviewers cannot be builders.
- **Design Constraints:** Arc Testnet only. Single admin EOA. Max 20 milestones per grant. No off-chain storage.
- **Performance Requirements:** Grants list loads in one batch RPC call. UI updates within 1 block of a confirmed event.
- **Compatibility Requirements:** MetaMask and any WalletConnect-compatible wallet. Arc Testnet (chain ID 5042002).
- **Explicitly Prohibited Behaviour:** Push-payment to builder or funder. `window.confirm` for destructive actions. Float arithmetic on USDC amounts (use `parseUnits`/`formatUnits`). Hardcoded USDC amounts as floats. Double-counting native + ERC-20 balance.

---

## 8. Important Lessons

### Issues Encountered

- **Symptom:** `error Paused()` and `event Paused(address)` caused compile error
  **Root Cause:** Solidity 0.8.x puts custom errors and events in the same identifier namespace; naming both `Paused` is a clash.
  **Fix:** Renamed events to `ContractPaused` / `ContractUnpaused`.
  **Verification:** `forge build` succeeds with zero errors.

- **Symptom:** `createGrant` failed with "stack too deep"
  **Root Cause:** Too many local variables in a single function scope for default Solidity codegen.
  **Fix:** Added `via_ir = true` to `foundry.toml`.
  **Verification:** `forge build` succeeds.

- **Symptom:** `testAlreadyVotedReverts` failed with `InvalidStatus` instead of `AlreadyVoted`
  **Root Cause:** Test tried to re-submit evidence while milestone was still `SubmittedForReview` (not `Rejected`). With 2 reviewers and `requiredApprovals=2`, the auto-reject threshold is `rejections > 0` — a single rejection would auto-reject. But the test was not rejecting first; it was re-submitting while still open.
  **Fix:** Restructured test to only call `_submitEvidence` once before testing `AlreadyVoted`.
  **Verification:** 23/23 tests pass.

### Failed Approaches

- **Approach:** Separate `approvalCount` and `rejectionCount` mappings
  **Why It Failed:** Two storage reads per `reviewMilestone` call; wastes a slot.
  **Alternative:** Single `VoteCount { uint128 approvals; uint128 rejections }` packed struct mapping — one slot access.

---

## 9. Security and Reliability Notes

- **Trust Boundaries:** Only `admin` can create grants, add/remove reviewers, set approvals, pause, cancel, reassign builder. Only `isReviewer[addr]` can call `reviewMilestone`. Only `grant.builder` can submit evidence. Only `msg.sender` can claim their own `pendingWithdrawals` or `pendingFunderRefunds`.
- **Sensitive Operations:** `fundGrant` (transfers USDC in), `claimPayment` (transfers USDC out to builder), `claimFunderRefund` (transfers USDC out to funder), `cancelGrant` (queues funder refund).
- **Known Security Risks:** Contract is immutable — no upgrade path. Admin is a single EOA — no multisig. If admin key is lost, no recovery.
- **Data Integrity Constraints:** `requiredApprovals` can never exceed `reviewerCount`. Milestone amounts must sum correctly for total grant amount (not enforced onchain — frontend responsibility). Evidence hash is stored; full URI only in event log.
- **Required Verification:** Before going to mainnet: independent security audit, multisig admin, upgradeability decision.

**Never store API keys, private keys, passwords, access tokens, seed phrases, or other secrets in this file or any tracked file.**

---

## 10. Current Priorities

### P0 — Critical (Next Step)
- Connect mainnet deployer wallet with Arc USDC for gas
- Execute `contracts:build` and deploy `ProofSpring.sol` to Arc Mainnet (Chain ID `5042`) with canonical USDC `0x3600000000000000000000000000000000000000`
- Immediately run post-deploy checklist: call `addReviewer` to configure reviewer quorum and unblock grant funding
- Record live mainnet deployment transaction and contract address in `AGENTS.md` and `src/contracts/proofSpring.ts`

### P1 — High
- Generate mandatory mainnet proof transaction on `explorer.arc.io` (live USDC funding or milestone payment claim)
- Optional: Deploy verified contract to Arc Testnet if dual-testnet operations are required
- Deploy frontend to hosting (Vercel / Netlify / Hugging Face)

---

## 11. Pending Tasks and Blockers

- **Task:** Arc Mainnet Contract Deployment & Verification
  **Dependencies:** Mainnet deployer wallet with Arc USDC for gas, contract constructor args (`_usdc = 0x3600...0000`, `_initialAdmin`, `_requiredApprovals`)
  **Blocker:** User execution/approval of deployer private key & parameters
  **Next Action:** Run deployment script once deployer key is provided

- **Task:** Architecture & Frontend Redesign (Completed)
  **Deliverables:**
  - `docs/architecture.md` (comprehensive architecture blueprint)
  - `src/hooks/useEvidenceResolver.ts` (cross-device evidence resolution with onchain log queries and hash verification)
  - Responsive multi-chain frontend with GrantFlow branding, metrics cards, countdown badges, deadline picker, builder reassignment, and `expireGrant` inline UI
  **Status:** Completed and verified against `forge test` (23/23 passing), `tsc --noEmit` (0 errors), and `vite build` (0 errors)

---

## 12. Verification Status

- **Last Successful Contract Build:** `forge build` — 2026-10-23, zero errors
- **Last Contract Test Run:** `forge test` — 2026-10-23, 23/23 passing
- **TypeScript Check:** `tsc --noEmit` — 2026-10-23, 0 errors
- **Linter Check:** `oxlint .` — 2026-10-23, 0 errors, 0 warnings
- **Vite Production Bundle:** `npm run build` — 2026-10-23, successfully built into `dist/` in 32.9s
- **Known Failing Tests:** None
- **Last Verified Commits:**
  - `de11439ae` — `fix(escrow): resolve USDC funding race condition and admin form data retention`
  - `cfdbd046d` — `build: add standard build script to package.json for Vercel deployment`
- **Session Record:** `docs/GRANTFLOW_SESSION_2026_10_23.md`

---

## 13. Instructions for Future Sessions

- Read `docs/PRD.md` and `docs/MEMORY.md` first before making any changes.
- Read `AGENTS.md` for deployed contract addresses before redeploying.
- Run `bash /home/user/arc-studio-helpers/check.sh` (not `scripts/check.sh`) for lint + typecheck.
- Run `forge test` before and after any contract changes.
- After any contract change: run `forge build`, then redeploy, then update address in `src/contracts/proofSpring.ts` AND `AGENTS.md`.
- Do not touch `src/hooks/`, `src/context/`, `src/contracts/`, `src/config.ts` for UI-only changes.
- Do not add new dependencies without checking the pre-installed list first.
- Do not use `npm` or `npx` — this project uses `bun`.
- Do not use `sudo`.
- `via_ir = true` in `foundry.toml` is required — do not remove it.
- Never use `window.confirm` — use inline confirmation UI.
- Never use push-payment for USDC — use `pendingWithdrawals` / `pendingFunderRefunds` pull pattern.
- Update `docs/MEMORY.md` and `AGENTS.md` when anything significant changes.

---

## 14. Related Documentation

- `docs/PRD.md` — Full product requirements document (GrantFlow)
- `docs/implementation-plan.md` — Original implementation plan
- `AGENTS.md` — Deployed contract addresses and post-deploy checklist
- Arc Testnet explorer: https://explorer.testnet.arc.io
- wagmi v2 docs: https://wagmi.sh
- viem docs: https://viem.sh
- OpenZeppelin contracts: https://docs.openzeppelin.com/contracts/5.x
- Foundry book: https://book.getfoundry.sh
- Circle/Arc developer docs: https://developers.circle.com
