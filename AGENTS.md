# ProofSpring

> Built with Arc Studio - money-powered apps in minutes

This is the **project memory** — what Arc Studio remembers about building this app.

---

## What This App Does

ProofSpring is a full-stack onchain microgrants platform. Grant admins create milestone-based USDC grants, fund them, and assign reviewers. Builders apply, submit evidence (URLs/IPFS CIDs) per milestone, and reviewers vote to approve. USDC is queued for the builder on milestone approval and claimed via `claimPayment()`. All decisions are recorded onchain.

## Deployed Contracts

| Contract | Version | Network | Address |
|----------|---------|---------|---------|
| ProofSpring | v2 (current) | Arc Testnet | `0x956b9d4b1c4a5f8ec2f647bb3b0999d98c46b388` |
| ProofSpring | v1 (superseded) | Arc Testnet | `0x090e040f2a56676d3f91c773ea8a42106435f920` |

v2 Constructor args: `_usdc=0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d, _initialAdmin=0x5B12Ce46C7194aD57d143bC22847224047b1Ef42, _requiredApprovals=1`
v2 Tx hash: `0x22083b6d552784a87e7eb62a153b1b208dfb52b452f6d8d39c10f58506322305`

Explorer (v2): https://explorer.testnet.arc.io/address/0x956b9d4b1c4a5f8ec2f647bb3b0999d98c46b388

## Post-Deploy Checklist (run after each redeployment)

1. Add reviewers: `addReviewer(address)` — need at least `requiredApprovals` reviewers before funding any grant
2. Confirm `requiredApprovals` is correct: `setRequiredApprovals(n)`
3. Approve USDC spend on the USDC contract before calling `fundGrant`: `usdc.approve(proofSpringAddress, totalAmount)`
4. Confirm `paused == false` before live use

## Tech Stack

- Frontend: React 18, Vite, TypeScript, Tailwind CSS
- Web3: wagmi v2, viem v2, ConnectKit
- Contracts: Solidity 0.8.28 + Foundry. Sources in `contracts/`, unit tests in `contracts/test/*.t.sol`. Build with `bun run contracts:build` (`forge build`), test with `bun run contracts:test` (`forge test`).
- Wallet: injected (MetaMask, etc.)
- Chain: Arc Testnet (Chain ID: 5042002, imported from `viem/chains`)
- Token: USDC (6 decimals) (Address: 0x3600000000000000000000000000000000000000, Chain: Arc Testnet)
- Toasts: Sonner

## Key Files

- `src/App.tsx` - Main application logic
- `src/components/` - UI components
- `src/config.ts` - wagmi config (chains, connectors, transports)

## Design Phase 3 — Docs

Full design specs live in `docs/design/`:
- `DESIGN_SYSTEM.md` — colour tokens, typography, spacing, component specs
- `MOTION_GUIDELINES.md` — Framer Motion system, per-component animation specs
- `COMPONENT_REGISTRY.md` — external component status, internal component inventory
- `FRONTEND_ARCHITECTURE.md` — missing feature classification, page-by-page specs
- `ARC_STUDIO_HANDOFF.md` — implementation order, constraints

## External Component Rule

If source code for an animation, component, or design pattern from an external library
(Watermelon UI, 21st.dev, Skiper UI, Motion-Primitives, etc.) cannot be accessed or extracted,
STOP for that specific component and ask the user for the exact source code.
Provide: component name, direct URL, dependencies, and what you need pasted.
Continue working on all unrelated components while waiting.
Never skip this rule and never fabricate component implementations.

## To Run

```bash
bun install
bun run dev
```
