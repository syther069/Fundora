# ProofSpring

> Built with Arc Studio - money-powered apps in minutes

This is the **project memory** — what Arc Studio remembers about building this app.

---

## What This App Does

ProofSpring is a full-stack onchain microgrants platform. Grant admins create milestone-based USDC grants, fund them, and assign reviewers. Builders apply, submit evidence (URLs/IPFS CIDs) per milestone, and reviewers vote to approve. USDC is queued for the builder on milestone approval and claimed via `claimPayment()`. All decisions are recorded onchain.

## Deployed Contracts

| Contract | Version | Network | Address |
|----------|---------|---------|---------|
| ProofSpring | v4 (current) | Arc Testnet | `0xef34036dda3960a1cd57b1368329bfcf29700259` |
| ProofSpring | v3 (superseded) | Arc Testnet | `0x433cc087e4daf08f7875c9621c7a3efd950ef016` |
| ProofSpring | v2 (superseded — wrong USDC) | Arc Testnet | `0x956b9d4b1c4a5f8ec2f647bb3b0999d98c46b388` |
| ProofSpring | v1 (superseded) | Arc Testnet | `0x090e040f2a56676d3f91c773ea8a42106435f920` |
| ProofSpring | v1 (active) | Arc Mainnet | `0xd473c4557D50D354667d9109a41634c98d5cdd3e` |

Mainnet Constructor args: `_usdc=0x3600000000000000000000000000000000000000 (Arc USDC), _initialAdmin=0xD68d8c72b3289899Df3c41f2DE51d76817694eEE, _requiredApprovals=1`
Mainnet Tx hash: `0xa050cab947cbebebc5fa3f3b804162734f6a9d220159d0d716b0f236343bad2d`
Explorer (Mainnet): https://explorer.arc.io/address/0xd473c4557D50D354667d9109a41634c98d5cdd3e

v4 Constructor args (Testnet): `_usdc=0x3600000000000000000000000000000000000000 (Arc USDC), _initialAdmin=0x5B12Ce46C7194aD57d143bC22847224047b1Ef42, _requiredApprovals=1`
v4 Tx hash (Testnet): `0x448a0a8ad34372769102d87a6c9379665b1adb37d675685350baf09da718496c`
Explorer (Testnet v4): https://explorer.testnet.arc.io/address/0xef34036dda3960a1cd57b1368329bfcf29700259

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
