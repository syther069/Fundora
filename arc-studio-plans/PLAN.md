# GrantFlow — Passkey + Gasless Onboarding (Circle Modular Wallets on Arc)

## Implementation Plan: Passkey + Gasless Onboarding

### Summary
Add a passkey (FaceID / TouchID / Windows Hello) sign-in path to GrantFlow that creates a Circle MSCA (smart contract account) on Arc Testnet, with gas sponsored entirely by Circle Gas Station. Existing ConnectKit/wagmi wallet users are completely unaffected.

---

### ABI verification (confirmed)

| Function | ABI signature | Status |
|---|---|---|
| `applyForGrant` | `(grantId: uint256)` | Correct |
| `submitMilestoneEvidence` | `(grantId: uint256, milestoneIndex: uint256, evidenceUri: string)` | Correct — cast index to `BigInt` at callsite |
| `claimPayment` | `()` | Correct |

---

### Gas Station setup — required before transactions work

Complete in Circle Console (Testnet mode) before testing:
1. Console → **Gas Station** → **Create Policy**
2. Select **Arc Testnet**, sponsorship type "All user operations"
3. Save — without this, every `paymaster: true` call fails with AA33

---

### Architecture

- **Blockchain:** Arc Testnet only (chain ID 5042002)
- **Contract:** Existing ProofSpring at `0xef34036dda3960a1cd57b1368329bfcf29700259` — no contract changes
- **Passkey SDK:** `@circle-fin/modular-wallets-core` (^1.0.16, already installed) + `viem/account-abstraction`
- **Chain import:** `arcTestnet` from `viem/chains` (confirmed in viem ^2.56.3)
- **Transport path:** `${clientUrl}/arcTestnet`
- **Frontend:** React context + modal + Header patch + GrantDetail patch; existing CSS vars
- **Wallet:** ConnectKit untouched; passkey is a parallel sign-in path

---

### Files to Create / Modify

1. **`src/utils/modularWallet.ts`** — New. Engine: `getModularClients`, `registerPasskey`, `loginPasskey`, `sendGaslessContractCall`. Typed with `P256Credential`, `SmartAccount`, `BundlerClient`.
2. **`src/context/PasskeyContext.tsx`** — New. Provider with localStorage credential persistence. Exposes: `smartAccountAddress`, `account`, `isPasskeyConnected`, `isLoading`, `error`, `register(username)`, `login()`, `disconnect()`, `executeGaslessAction(functionName, args)`.
3. **`src/components/PasskeyAuthModal.tsx`** — New. Two-tab modal (Create / Sign In). Gasless badge. Loading + readable errors for `NotAllowedError`, `SecurityError`, `InvalidStateError`. Missing-key guard shows setup notice instead of crashing.
4. **`src/components/Header.tsx`** — Modify. Keep ConnectKitButton untouched. Add passkey button when disconnected; show smart account address + Disconnect when passkey-connected.
5. **`src/components/GrantDetail.tsx`** — Modify. Branch `applyForGrant`, `submitMilestoneEvidence`, `claimPayment` to gasless path when `isPasskeyConnected`; all other actions stay wagmi-only.
6. **`src/App.tsx`** — Modify. Wrap provider tree with `<PasskeyProvider>`.
7. **`.env`** — Add `VITE_CLIENT_KEY=` placeholder and `VITE_CLIENT_URL=https://modular-sdk.circle.com/v1/rpc/w3s/buidl`.

---

### Build Sequence

1. Write `src/utils/modularWallet.ts`
2. Write `src/context/PasskeyContext.tsx`
3. Write `src/components/PasskeyAuthModal.tsx`
4. Patch `src/components/Header.tsx`
5. Patch `src/components/GrantDetail.tsx`
6. Patch `src/App.tsx`
7. Add env var placeholders to `.env`
8. Run `tsc --noEmit`, fix type errors

---

### Done When

- [ ] `npm run typecheck` passes with zero errors
- [ ] "Passkey (Gasless)" button appears in Header when no wallet is connected
- [ ] Create account tab triggers a browser passkey prompt on submit
- [ ] Smart account address is displayed in Header after registration
- [ ] Sign out and sign back in restores the same smart account address
- [ ] Apply, submit evidence, and claim all work via gasless path with zero USDC in account
- [ ] ConnectKit wallet users retain all existing functionality unchanged
- [ ] Admin and Reviewer flows are ConnectKit-only and untouched
- [ ] Missing `VITE_CLIENT_KEY` shows a setup notice instead of crashing
- [ ] Gas Station policy configured in Circle Console before testing

---

# GrantFlow — Cross-Chain Grant Funding via CCTP

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

# GrantFlow — Previous Submission-Ready Plan (archived)

## Summary
GrantFlow is a milestone-based USDC microgrants platform on Arc. The contract (ProofSpring v3) is deployed on Arc Testnet at `0x433cc087e4daf08f7875c9621c7a3efd950ef016`. The frontend is largely built. This plan makes it submission-ready: dual-network support (testnet + mainnet), mobile responsiveness, remaining UX gaps, and production polish.

---

## What Already Exists (Do Not Duplicate)

- ProofSpring v3 on Arc Testnet with 23/23 unit tests passing
- Full wagmi hooks in `src/hooks/useProofSpring.ts`
- `src/context/GrantsContext.tsx` — event-invalidated grant list
- All core flows in `src/components/GrantDetail.tsx` (apply, fund, vote, claim, cancel, evidence)
- Warm design token system in `src/index.css` and `tailwind.config.js`
- Admin panel with create grant, reviewer management, pause/unpause
- Framer Motion transitions, AnimatePresence, skip link, ARIA roles
- `src/components/GrantsToolbar.tsx`, `DeadlineBadge.tsx`, `GrantSkeleton.tsx`

---

## Architecture

- **Blockchain:** Arc Testnet (chain ID `5042002`) + Arc Mainnet (chain ID `5042`), user-switchable in UI
- **Contract:** ProofSpring v3 — same ABI on both networks; separate deployed addresses
- **Frontend:** Vite + React + TypeScript + wagmi + ConnectKit + Tailwind CSS + Framer Motion
- **Wallet:** ConnectKit (already wired)
- **USDC:** `0x3600000000000000000000000000000000000000` on both Arc Testnet and Arc Mainnet

---

## Files to Create / Modify

### Phase 1 — Money Path Fixes (Blockers)

In `GrantDetail.tsx` lines 188–191, `total`, `released`, `refundable`, and `progressPct` all use `parseFloat(formatUnits(...))`. The `.toFixed(2)` display calls on lines 211, 284, 293, 510 must be replaced with bigint integer arithmetic + `formatUnits` used at render time only. The `Fund Grant — $X USDC` label on line 211 also uses a float — fix to bigint display.

1. `src/components/GrantDetail.tsx` — Replace all `parseFloat(formatUnits(...))` money logic with bigint arithmetic. Use `formatUnits` only at the final render step, never store the result in a `number` variable that participates in math.
2. `src/components/GrantCard.tsx` — Remove unused `total` and `released` float vars (lines 50–51). Already uses bigint `progressPct`; clean up the now-dead float code.

### Phase 2 — Dual Network Support

3. `src/contracts/proofSpring.ts` — Add `ARC_MAINNET_ID = 5042`, `PROOF_SPRING_ADDRESS_MAINNET` (placeholder until mainnet deploy), and a `getContractAddress(chainId)` helper that returns the right address per chain.
4. `src/config.ts` — Add `arc` (mainnet) from `viem/chains` alongside `arcTestnet`. Add explicit transport `https://rpc.mainnet.arc.io`. Register mainnet chain with tracing.
5. `src/hooks/useProofSpring.ts` — Accept an optional `chainId` parameter (default `ARC_TESTNET_ID`) on all `useReadContract` hooks so reads follow the active network.
6. `src/context/GrantsContext.tsx` — Pass dynamic `chainId` + contract address so the grant list switches when the network changes.
7. `src/App.tsx` — Replace `ARC_TESTNET_ID` wrong-chain guard with `SUPPORTED_CHAIN_IDS = [ARC_TESTNET_ID, ARC_MAINNET_ID]`. Update `WrongChainBanner` to suggest switching to the nearest supported network. Add a small network toggle pill (Testnet / Mainnet) near the header or stats strip.
8. `src/components/Header.tsx` — Show active network badge dynamically: "Arc Testnet" (teal) or "Arc Mainnet" (brand-indigo) based on connected `chainId`.
9. `src/components/GrantDetail.tsx` — Replace all `buildTxExplorerUrl(ARC_TESTNET_ID, ...)` hardcoded calls (6 places) with `buildTxExplorerUrl(activeChainId, ...)`. Replace "Switch to Arc Testnet" text with "Switch to Arc" generically.

### Phase 3 — Mobile Responsiveness

10. `src/components/GrantDetail.tsx` — Fix mobile overflow:
    - Hero band title + status: `flex-col sm:flex-row` on narrow screens
    - Amount block: stack total/released vertically on mobile
    - Builder address: add `break-all` wrapper
    - Milestone header row: add `flex-wrap` so badge doesn't clip
    - Approve/Reject buttons: `flex-col xs:flex-row` fallback
11. `src/components/GrantCard.tsx` — Reduce `UsdcAmount` to `text-xl sm:text-2xl`. Add `min-h-[72px]` to description area for uniform card height. Add `flex-wrap` to the footer row (date + arrow).
12. `src/App.tsx` — HeroConnect: `px-5 sm:px-8 py-8 sm:py-10`. Page header: add `flex-wrap` so admin toggle button wraps cleanly on narrow screens.
13. `src/components/AdminPanel.tsx` — Tabs: add `overflow-x-auto` scrollable row for 4 tabs on 320px. Milestone amount inputs in create form: `flex-col sm:flex-row`. Cancel tab grant addresses: add `truncate`.

### Phase 4 — Missing UI / UX Gaps

14. `src/components/GrantDetail.tsx` — Add `expireGrant` button in the actions zone for grants where `deadline > 0 && BigInt(Math.floor(Date.now()/1000)) > grant.deadline && grant.status !== 2 && grant.status !== 3`. Show only to admin. Use `useExpireGrant` hook (already exists).
15. `src/components/GrantDetail.tsx` — Add `claimFunderRefund` panel. When `grant.status === 3` and connected address matches `grant.funder`, show `usePendingFunderRefund` amount and a "Claim Refund" button. Contract function and hook exist; UI is missing.
16. `src/components/AdminPanel.tsx` — Add `adminReassignBuilder` UI: address input + "Reassign Builder" button in the existing settings or cancel tab. Hook exists in `useProofSpring.ts`.
17. `src/components/AdminPanel.tsx` — Add `onKeyDown` arrow-key handler on each tab button for Left/Right keyboard navigation per ARIA `role="tablist"` pattern.

### Phase 5 — Production Polish

18. `index.html` — Add `<meta name="description" content="Milestone-based USDC grants with onchain evidence and reviewer votes — built on Arc.">`, OG title/description tags, and an inline SVG favicon using the GrantFlow G mark.
19. `src/index.css` — Add Google Fonts `@import` at the top for Plus Jakarta Sans (600/700/800), Inter (400/500/600), and JetBrains Mono (400/500). Currently referenced but never loaded — text falls back to system-ui on first load.
20. `tailwind.config.js` — Sync `warm.ink`, `warm.muted`, `warm.subtle` to corrected spec values (`#18181B`, `#71717A`, `#A1A1AA`) to match the CSS vars already corrected in `index.css`.

### Phase 6 — Mainnet Deploy + Final Commit

21. Deploy ProofSpring to Arc Mainnet (`forge script` against `https://rpc.mainnet.arc.io`) with `_usdc=0x3600000000000000000000000000000000000000`.
22. Update `PROOF_SPRING_ADDRESS_MAINNET` in `src/contracts/proofSpring.ts`.
23. Update `AGENTS.md` with mainnet contract address and tx hash.
24. Commit `.gitignore` (already staged), all Phase 1–5 changes, and mainnet address in one commit.
25. `git push` → Vercel redeploy.

---

## Build Sequence

1. Fix money paths — GrantDetail.tsx + GrantCard.tsx (no network changes, safest first)
2. Wire dual-network — proofSpring.ts, config.ts, hooks, context, App.tsx, Header.tsx, GrantDetail.tsx
3. Mobile fixes — GrantDetail.tsx, GrantCard.tsx, App.tsx, AdminPanel.tsx
4. Missing UI — expireGrant, claimFunderRefund, adminReassignBuilder, keyboard tab nav
5. Production polish — index.html, font imports, tailwind sync
6. Deploy Arc Mainnet contract; update addresses
7. Final lint + typecheck + commit + push + Vercel

---

## Done When

- [ ] Zero TypeScript errors, zero lint errors
- [ ] `parseFloat` on money paths: none — `formatUnits` used only at render time
- [ ] App renders correctly at 320px, 375px, 768px, 1280px widths
- [ ] Network switcher: user can switch between Arc Testnet and Arc Mainnet in the UI
- [ ] Wrong-chain banner resolves to whichever supported network is appropriate
- [ ] Explorer links use the correct chain's explorer for the active network
- [ ] `expireGrant` button visible in GrantDetail when grant is expired and admin is connected
- [ ] `claimFunderRefund` panel visible to funder on cancelled grants
- [ ] `adminReassignBuilder` UI present in AdminPanel
- [ ] Keyboard left/right arrow nav works on AdminPanel tabs
- [ ] Plus Jakarta Sans and Inter fonts load (not system-ui fallback)
- [ ] `index.html` has title, description, and OG meta tags
- [ ] ProofSpring deployed on Arc Mainnet with correct USDC address
- [ ] All changes committed and pushed to `syther069/grantflow` main
- [ ] Vercel deployment live and production-ready
