# Fundora

> Built with Arc Studio - money-powered apps in minutes

This is the **project memory** — what Arc Studio remembers about building this app.

---

## What This App Does

Fundora is a full-stack onchain microgrants platform. Grant admins create milestone-based USDC grants, fund them, and assign reviewers. Builders apply, submit evidence (URLs/IPFS CIDs) per milestone, and reviewers vote to approve. USDC is queued for the builder on milestone approval and claimed via `claimPayment()`. All decisions are recorded onchain.

## Deployed Contracts

| Contract | Version | Network | Address |
|----------|---------|---------|---------|
| Fundora | v2 (live) | Arc Mainnet (`5042`) | `0x371b4b6894882082e706cd84b781bf749472a602` |
| Fundora | v2 (current) | Arc Testnet (`5042002`) | `0x956b9d4b1c4a5f8ec2f647bb3b0999d98c46b388` |
| Fundora | v1 (superseded) | Arc Testnet | `0x090e040f2a56676d3f91c773ea8a42106435f920` |

### Arc Mainnet Deployment
- **Contract Address:** `0x371b4b6894882082e706cd84b781bf749472a602`
- **Tx Hash:** `0x5d68fc6caaf6217a9a6b0e68b2c9fff145ed84360501d635c610971c5018fb20`
- **Block:** `27655153`
- **Deployer / Admin:** `0xb5fd2471b99e9c7324309a43282a391e87585c5e`
- **USDC Token:** Canonical Arc USDC (`0x3600000000000000000000000000000000000000`)
- **Explorer:** https://explorer.arc.io/address/0x371b4b6894882082e706cd84b781bf749472a602
- **Tx Explorer:** https://explorer.arc.io/tx/0x5d68fc6caaf6217a9a6b0e68b2c9fff145ed84360501d635c610971c5018fb20

### Arc Testnet Deployment
- **Contract Address:** `0x956b9d4b1c4a5f8ec2f647bb3b0999d98c46b388`
- **Tx Hash:** `0x22083b6d552784a87e7eb62a153b1b208dfb52b452f6d8d39c10f58506322305`
- **Explorer:** https://explorer.testnet.arc.io/address/0x956b9d4b1c4a5f8ec2f647bb3b0999d98c46b388

## Post-Deploy Checklist (run after each redeployment)

1. Add reviewers: `addReviewer(address)` — need at least `requiredApprovals` reviewers before funding any grant
2. Confirm `requiredApprovals` is correct: `setRequiredApprovals(n)`
3. Approve USDC spend on the USDC contract before calling `fundGrant`: `usdc.approve(fundoraAddress, totalAmount)`
4. Confirm `paused == false` before live use

## Tech Stack

- Frontend: React 18, Vite, TypeScript, Tailwind CSS
- Web3: wagmi v2, viem v2, ConnectKit
- Contracts: Solidity 0.8.28 + Foundry. Sources in `contracts/`, unit tests in `contracts/test/*.t.sol`. Build with `bun run contracts:build` (`forge build`), test with `bun run contracts:test` (`forge test`).
- Wallet: injected (MetaMask, etc.)
- Chain: Arc Mainnet (`5042`) and Arc Testnet (`5042002`)
- Token: Canonical Arc USDC (6 decimals) (Address: `0x3600000000000000000000000000000000000000`)
- Toasts: Sonner

## Key Files

- `src/App.tsx` - Main application logic
- `src/components/` - UI components
- `src/contracts/fundora.ts` - Contract ABI and address resolver
- `src/hooks/useFundora.ts` - React contract read hooks
- `src/config.ts` - wagmi config (chains, connectors, transports)

## To Run

```bash
bun install
bun run dev
```
