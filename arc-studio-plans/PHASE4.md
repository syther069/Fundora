# Fundora Phase 4 — Demo / Live Mode Switcher

## Summary
Add a **Demo / Live** toggle to the header that lets judges and organizers switch between the existing mock-data demo experience and a live read-only view of real events from the `FundoraEvents` contract on Arc Mainnet. The selected mode persists in `localStorage`. If no events exist on mainnet yet, a clear "No live events yet" state is shown — no mock data bleeds into Live mode.

## Architecture
- **Demo mode**: existing `EventsContext` with `MOCK_EVENTS` data, all creation/submission flows enabled as before.
- **Live mode**: reads `eventCount` and `getEventsBatch` from `FundoraEvents` on Arc Mainnet (chain ID 5042) via wagmi `useReadContract` with the mainnet RPC. No writes — creation/submission CTAs replaced with mainnet-connect prompts.
- **Mode state**: `'demo' | 'live'` stored in `localStorage` key `fundora_mode`, managed in `ModeContext`.
- **Contract**: `getFundoraEventsAddress(ARC_MAINNET_ID)` in `fundoraEvents.ts`. Mainnet address currently mirrors testnet — flag for update once mainnet contract is verified/deployed separately.

## Files to Create / Modify

1. `src/context/ModeContext.tsx` — New. `'demo' | 'live'` state, `localStorage` key `fundora_mode`, `useMode()` hook, `ModeProvider`.
2. `src/hooks/useLiveEvents.ts` — New. Reads `eventCount` + `getEventsBatch(0, count)` from Arc Mainnet. Maps `OnchainEventInfo[]` → frontend `Event[]`. Returns `{ events, isLoading, isError }`.
3. `src/context/EventsContext.tsx` — Modify. Consume `useMode()`, branch event source: `MOCK_EVENTS` in demo, `useLiveEvents` data in live. Filter/sort/search pipeline unchanged.
4. `src/components/Header.tsx` — Modify. Add `ModeSwitcher` pill toggle (Demo | Live) next to `ChainBadge`. Live mode hides `ChainBadge`.
5. `src/App.tsx` — Modify. Wrap with `ModeProvider`. In live mode: show a "Viewing live mainnet events" banner, suppress write CTAs (submit, create event).
6. `src/main.tsx` — Modify. Add `<ModeProvider>` to provider stack.

## Build Sequence

1. Create `src/context/ModeContext.tsx`
2. Create `src/hooks/useLiveEvents.ts`
3. Modify `src/context/EventsContext.tsx`
4. Modify `src/components/Header.tsx`
5. Modify `src/App.tsx`
6. Modify `src/main.tsx`
7. Lint + typecheck — zero errors
8. Commit and push to syther069/Fundora

## Done When
- [ ] Header shows Demo / Live pill toggle next to chain badge
- [ ] Demo shows mock events; Live reads from Arc Mainnet FundoraEvents contract
- [ ] Live mode with no onchain events shows "No live events yet" — no mock data visible
- [ ] Mode persists across page reloads via localStorage
- [ ] Live mode suppresses submit/create CTAs with mainnet-connect prompts
- [ ] TypeScript: 0 errors. Lint: 0 src/ errors
- [ ] Committed and pushed to syther069/Fundora main
