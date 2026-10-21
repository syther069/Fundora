# GrantFlow — Submission-Ready Implementation Plan

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

- [x] Zero TypeScript errors, zero lint errors
- [x] `parseFloat` on money paths: none — `formatUnits` used only at render time
- [x] App renders correctly at 320px, 375px, 768px, 1280px widths
- [x] Network switcher: user can switch between Arc Testnet and Arc Mainnet in the UI
- [x] Wrong-chain banner resolves to whichever supported network is appropriate
- [x] Explorer links use the correct chain's explorer for the active network
- [x] `expireGrant` button visible in GrantDetail when grant is expired and admin is connected
- [x] `claimFunderRefund` panel visible to funder on cancelled grants
- [x] `adminReassignBuilder` UI present in AdminPanel
- [x] Keyboard left/right arrow nav works on AdminPanel tabs
- [x] Plus Jakarta Sans and Inter fonts load (not system-ui fallback)
- [x] `index.html` has title, description, and OG meta tags
- [x] ProofSpring deployed on Arc Mainnet with correct USDC address (`0xd473c4557D50D354667d9109a41634c98d5cdd3e`)
- [x] All changes committed and pushed to `syther069/grantflow` main
- [x] Vercel deployment live and production-ready
