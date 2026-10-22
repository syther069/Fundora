Let me read the wagmi adapter reference and the current GrantDetail component before writing the plan. I have everything I need. Here is the plan:

---

## Implementation Plan: Cross-Chain Grant Funding (CCTP via Circle App Kit)

### Summary
Add a "Fund from another chain" button to GrantDetail that lets a funder holding USDC on Base, Arbitrum, or Ethereum bridge it directly to Arc (Testnet or Mainnet) in one click, using Circle's App Kit CCTP v2 fast transfer. After USDC lands on Arc, a success banner prompts the funder to complete the standard `fundGrant()` call on Arc.

---

### Architecture

- **Blockchain:** Auto-detects the user's connected chain. Source chains: Base Sepolia / Base, Arbitrum Sepolia / Arbitrum One, Ethereum Sepolia / Ethereum Mainnet. Destination: Arc Testnet (5042002) or Arc Mainnet (5042) — matched to whichever testnet/mainnet tier the source chain belongs to.
- **Contract:** No contract changes. `fundGrant()` on ProofSpring is called separately after the bridge completes, using the existing wagmi write hooks in `GrantDetail.tsx`.
- **Bridge SDK:** `@circle-fin/app-kit` (`AppKit`) + `@circle-fin/adapter-viem-v2` (`createViemAdapterFromProvider`). Both packages are already installed at their required versions.
- **Frontend:** New modal component + a small CCTP utilities module. Integrated into `GrantDetail.tsx` and `src/config.ts`.
- **Wallet:** ConnectKit (already wired). The modal uses `useAccount`, `useSwitchChain`, and `connector.getProvider()` from wagmi to hand the live browser wallet to the App Kit adapter.

---

### Files to Create / Modify

1. `src/config.ts` — Add `baseSepolia`, `arbitrumSepolia`, `sepolia`, `base`, `arbitrum` to `createConfig` chains + transports alongside the existing Arc and mainnet entries.
2. `src/utils/cctpFunding.ts` — New file. Exports: `CCTP_CHAIN_MAP` (maps wagmi chain IDs to App Kit string chain names and mainnet/testnet tier), `ARC_DEST_CHAIN` helper (returns `"Arc_Testnet"` or `"Arc"` from destination chain ID), `executeBridge` async function that accepts connector provider, source/dest chain names, and decimal amount string; calls `appKit.bridge()`; returns the result object. Singleton `AppKit` instance at module level.
3. `src/components/CrossChainFundModal.tsx` — New file. Full-screen modal with: (a) network source selector showing only chains in the same tier as the current connected chain — auto-selects the currently connected chain if it is a valid CCTP source, (b) read-only amount field pre-filled with `formatUnits(grant.total - grant.released, 6)` (amount still needed), (c) 4-step visual progress stepper — Approve / Burn / Attestation / Mint — driven by `result.steps` from App Kit, (d) mainnet safety warning when targeting Arc Mainnet, (e) on success, dismisses and fires a `onBridgeComplete()` callback.
4. `src/components/GrantDetail.tsx` — Add `CrossChainFundModal` import and a `showCrossChainModal` state flag. In the funding actions zone (near the existing "Fund Grant" button), add a secondary "Fund from Base / Arbitrum / ETH" button that opens the modal. The button is only visible when `grant.status === 0` (unfunded). Wire `onBridgeComplete` to show a `toast.success` banner: "USDC arrived on Arc — click Fund Grant to complete." No automatic `fundGrant()` call.

---

### Build Sequence

1. **Expand `src/config.ts`** — add the five additional chains and transports so wagmi can switch to them.
2. **Write `src/utils/cctpFunding.ts`** — CCTP chain map, arc dest helper, singleton AppKit, and `executeBridge`. Keep bridge call inside a try/catch; surface hard errors; preserve the result object for potential `appKit.retry()` on soft errors.
3. **Write `src/components/CrossChainFundModal.tsx`** — complete modal UI: source selector, amount display, progress stepper bound to `result.steps`, mainnet warning, success/error states.
4. **Update `src/components/GrantDetail.tsx`** — import modal, add state, add trigger button in the funding zone, wire `onBridgeComplete` toast.
5. **Typecheck** — run `tsc --noEmit` and resolve any type errors (connector provider cast, App Kit result shape, wagmi chain types).

---

### Done When

- [ ] `src/config.ts` includes `baseSepolia`, `arbitrumSepolia`, `sepolia`, `base`, `arbitrum` in chains + transports
- [ ] `src/utils/cctpFunding.ts` compiles with zero TypeScript errors
- [ ] `CrossChainFundModal` renders correctly when opened from GrantDetail on an unfunded grant
- [ ] Source chain selector shows only testnet chains when connected to a testnet, and only mainnet chains when on mainnet
- [ ] Amount field pre-fills with `grant.total - grant.released` in USDC (6 decimals, formatted as decimal string)
- [ ] Progress stepper advances through Approve → Burn → Attestation → Mint as each `result.steps` entry resolves
- [ ] Mainnet safety warning is shown before bridge executes when destination is Arc Mainnet
- [ ] Bridge is only triggered by an explicit button click — never auto-invoked
- [ ] On success: modal closes and a toast prompts the user to click Fund Grant
- [ ] Existing Fund Grant flow on Arc is fully untouched
- [ ] Zero TypeScript errors (`tsc --noEmit`)
- [ ] `forge test` still passes (no contract changes)

---

## Ready to build?

Switch to Build mode (or approve this plan) and the build will start. A few notes for when you push manually:

- No new environment variables are needed — bridge operations require no kit key.
- The `git push origin main` → Vercel auto-deploy flow you described will work as-is once the build completes.
- Foundry tests are contract-only and will pass unchanged since this feature touches no Solidity. Plan saved. Here is a summary of the key decisions baked in:

**No contract changes.** The bridge lands USDC on Arc, then the existing `fundGrant()` call handles the rest. You keep the two steps separate (manual flow) so there is no risk of an accidental double-fund.

**Auto-detect testnet vs mainnet.** `CCTP_CHAIN_MAP` in `cctpFunding.ts` will tag each source chain with a `tier` (`testnet` / `mainnet`). The modal filters the selector to match whichever tier the connected wallet is on, and picks the right Arc destination automatically.

**Pre-filled amount = `grant.total - grant.released`.** This is the USDC still needed to fully fund the grant, formatted as a 6-decimal string for App Kit.

**4-step progress stepper** is driven by the `result.steps` array App Kit returns — no custom polling, no manual attestation handling. Soft-error recovery uses `appKit.retry(result)`, not a fresh `bridge()` call.

**No new environment variables needed** — App Kit bridge requires no kit key.

Switch to Build mode to start the implementation.
