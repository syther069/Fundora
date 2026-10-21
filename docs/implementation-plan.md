Let me do a thorough audit of the remaining files before writing the plan. Now I have a complete and honest picture of the entire codebase. Let me check the use-arc skill for mainnet chain IDs and RPC details: Now I have a complete and ground-truth picture. I know exactly what exists and what doesn't. Here is the full plan: That's the old plan from the redesign phase. Replace it entirely with the current submission-readiness plan: Here is the full plan, grounded in what's actually in the code:

---

## Implementation Plan: GrantFlow — Submission Ready

### Summary
ProofSpring v3 is live on Arc Testnet and all core flows work. The remaining work is: fix two lingering `parseFloat` money-path violations, wire in Arc Mainnet as a second supported network, fix mobile layout overflow issues in 4 components, fill 3 missing UI pieces (expireGrant, claimFunderRefund, adminReassignBuilder), and apply production polish (fonts, meta tags, tailwind token sync).

### Architecture
- **Blockchain:** Arc Testnet (5042002) + Arc Mainnet (5042), user-switchable
- **Contract:** ProofSpring v3 — same ABI both networks; separate addresses
- **Frontend:** React + Vite + wagmi + ConnectKit + Tailwind + Framer Motion
- **USDC:** `0x3600000000000000000000000000000000000000` on both networks

### 6 Phases

**Phase 1 — Money path fixes** (2 files)
- `GrantDetail.tsx` lines 188–211: `total`/`released`/`refundable` are `parseFloat` of `formatUnits` — replace with bigint arithmetic, `formatUnits` at render only
- `GrantCard.tsx` lines 50–51: dead float vars, clean up

**Phase 2 — Dual network** (7 files)
- `proofSpring.ts`: add `ARC_MAINNET_ID`, `PROOF_SPRING_ADDRESS_MAINNET`, `getContractAddress(chainId)` 
- `config.ts`: add `arc` mainnet chain + explicit RPC transport
- `hooks/useProofSpring.ts`: accept dynamic `chainId` on reads
- `context/GrantsContext.tsx`: dynamic chainId + contract address
- `App.tsx`: `SUPPORTED_CHAIN_IDS` guard, network toggle pill, updated wrong-chain banner
- `Header.tsx`: dynamic badge (testnet teal / mainnet indigo)
- `GrantDetail.tsx`: replace 6 hardcoded `ARC_TESTNET_ID` explorer URL calls with `activeChainId`

**Phase 3 — Mobile responsiveness** (4 files)
- `GrantDetail.tsx`: stack hero title/badge, amount block, `flex-wrap` on milestone header, `break-all` address
- `GrantCard.tsx`: `text-xl sm:text-2xl`, `min-h-[72px]` description area, `flex-wrap` footer
- `App.tsx`: narrower HeroConnect padding, `flex-wrap` on admin toggle row
- `AdminPanel.tsx`: `overflow-x-auto` tabs, `flex-col sm:flex-row` milestone rows, `truncate` addresses

**Phase 4 — Missing UI** (2 files)
- `GrantDetail.tsx`: `expireGrant` button (admin, expired grants), `claimFunderRefund` panel (funder, cancelled grants)
- `AdminPanel.tsx`: `adminReassignBuilder` UI, keyboard arrow-key tab navigation

**Phase 5 — Production polish** (3 files)
- `index.html`: meta description, OG tags, SVG favicon
- `index.css`: Google Fonts `@import` (Plus Jakarta Sans, Inter, JetBrains Mono — currently missing)
- `tailwind.config.js`: sync `warm.ink/muted/subtle` to corrected spec values

**Phase 6 — Mainnet deploy + push**
- Deploy ProofSpring to Arc Mainnet, update addresses, commit + push + Vercel

### Done When
All checkboxes in the plan file pass. Key ones: zero TS errors, no `parseFloat` on money paths, 320px renders cleanly, both networks work, all 3 missing UI pieces present, fonts load, mainnet contract live, pushed to GitHub.

---

The plan is saved to `arc-studio-plans/PLAN.md`. Switch to **Build mode** to start — it will work through all 6 phases in sequence.
