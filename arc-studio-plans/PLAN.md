# GrantFlow Frontend Redesign

## Summary
Full visual redesign of GrantFlow (formerly ProofSpring) — a milestone-based USDC microgrants platform — into a warm, community-first aesthetic inspired by Gitcoin and Giveth. No changes to contract logic, hooks, context, or ABI. Pure visual layer.

## Architecture
- Blockchain: Arc Testnet (unchanged)
- Contract: Unchanged — same address, hooks, context
- Frontend: React + Vite + Tailwind — all hook imports and data flows preserved exactly
- Wallet: ConnectKit (unchanged)
- What changes: index.css tokens, tailwind.config.js font/colour extensions, and all five component files + App.tsx

## Design Language

### Colour palette — warm community
| Token | Value | Use |
|---|---|---|
| --brand | #6366f1 (indigo) | Primary CTA, links, focus |
| --brand-light | #eef2ff | Brand pill backgrounds |
| --warm-bg | #fffbf5 | Page background |
| --warm-surface | #ffffff | Card surfaces |
| --warm-surface-2 | #fdf8f0 | Inset / muted surfaces |
| --teal | #0d9488 | Success, approved, USDC amounts |
| --teal-light | #f0fdfa | Teal badge backgrounds |
| --amber | #d97706 | In-review, pending states |
| --amber-light | #fffbeb | Amber badge backgrounds |
| --coral | #e11d48 | Danger, rejected, cancel |
| --ink | #1c1917 | Primary text (warm near-black) |
| --muted | #78716c | Secondary text |
| --subtle | #a8a29e | Placeholder, metadata |
| --border | #e7e5e4 | Card borders |

### Typography
- Display/headings: Plus Jakarta Sans (warm, rounded, community feel)
- Body: Inter (clean readability)
- Mono: JetBrains Mono (unchanged, for hashes/addresses)

### Motion
- Cards: hover:shadow-lg hover:-translate-y-1 with transition-all duration-200
- Status badges: soft colour fills, rounded-full, icon + label
- Progress bars: rounded-full with a gradient fill from --teal to --brand
- Buttons: filled with --brand, pill-shaped (rounded-full for primary CTAs)

## Files to Create/Modify
1. index.html — add Google Fonts import for Plus Jakarta Sans + Inter
2. src/index.css — full token replacement, new warm palette, updated type scale, card shadows
3. tailwind.config.js — add font families, custom colours, animation keyframe for pulse-glow
4. src/components/Header.tsx — new logo mark (colourful gradient icon), GrantFlow name, warm nav
5. src/App.tsx — redesigned hero connect state, role banners, page layout with sidebar stats strip
6. src/components/GrantCard.tsx — new card layout: coloured top accent bar per status, large USDC amount, avatar-style milestone count, hover shadow
7. src/components/GrantSkeleton.tsx — warm skeleton matching new card shape
8. src/components/StatusBadge.tsx — warm filled colour badges (not just border), pill shape
9. src/components/GrantDetail.tsx — new detail layout: full-width hero band with grant title + amount + status; milestone cards with coloured left border; action zone redesigned with pill buttons

## Build Sequence
1. Update index.html fonts (Google Fonts CDN link for Plus Jakarta Sans + Inter)
2. Replace src/index.css with new warm token system + type scale + shadow utilities
3. Update tailwind.config.js with font + colour extensions
4. Redesign Header.tsx — new logo, GrantFlow name, warm chain badge
5. Redesign StatusBadge.tsx — new warm filled pill badges for all 8 states
6. Redesign GrantCard.tsx — new card layout with accent bar and big amount
7. Redesign GrantSkeleton.tsx — match new card proportions
8. Redesign App.tsx — hero, role banners, stats strip, grants grid layout
9. Redesign GrantDetail.tsx — hero band, milestone cards, action zone
10. Lint + typecheck — zero errors required

## Done When
- [ ] All grant cards show coloured accent bar, large USDC amount, warm typography
- [ ] Status badges are filled warm pills with icons, not just coloured borders
- [ ] Header shows GrantFlow (not ProofSpring), with gradient logo mark
- [ ] Disconnected state shows a welcoming hero with value proposition
- [ ] Grant detail has a prominent hero band and readable milestone cards
- [ ] All buttons are pill-shaped primary with --brand indigo for CTAs
- [ ] All hook imports, contract calls, and data flows are completely unchanged
- [ ] Zero lint errors, zero TypeScript errors
- [ ] App running on port 5173
