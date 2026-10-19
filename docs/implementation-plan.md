You're in Plan mode — switch to Build mode and I'll write it in one shot. Here's what I'll create at `docs/PRD.md` — the full document is ready, covering all 16 sections filled in specifically for ProofSpring:

---

**What the file will contain:**

1. **Product Overview** — ProofSpring name, milestone-gated USDC grants summary, problem statement, vision
2. **Target Users** — Alex (admin/DAO treasurer), Priya (builder), Marcus (reviewer) — with pain points and use cases
3. **Goals and Non-Goals** — fully onchain lifecycle, pull-payment, evidence hashing, gas efficiency; out of scope: mainnet, multi-token, cross-chain, KYC
4. **Scope** — MVP features (all implemented), future features (deadline UI, subgraph, multisig, pagination), out of scope items
5. **Functional Requirements** — full spec for each feature: Create Grant, Fund Grant, Apply, Submit Evidence, Review, Claim Payment, Cancel + Claim Refund — with user flows, business rules, validation, and acceptance criteria
6. **UI/UX Requirements** — design tokens, colour system, layout, responsive behaviour, accessibility (WCAG 2.1 AA)
7. **Technical Architecture** — React/Vite/wagmi/viem/ConnectKit frontend, no backend server, all state onchain, no database, wallet-based auth
8. **Data Model** — all structs (Grant, Milestone, VoteCount), all mappings, field types, constraints
9. **API Specifications** — all 15 write functions and 14 read functions with callers, args, and notes
10. **Security Requirements** — auth guards, reentrancy, blocklist protection, threat model, abuse prevention
11. **Non-Functional Requirements** — performance (single batch RPC call), reliability, scalability, accessibility, browser compat
12. **Testing and QA** — 23 unit tests listed by name, integration and E2E test plans, build verification checklist
13. **Implementation Plan** — Phase 1 (contract v1, COMPLETE), Phase 2 (contract v2 + frontend, COMPLETE), Phase 3 (UI redesign, NEXT)
14. **Definition of Done** — all test/lint/typecheck checks, no `window.confirm`, no push-payment, no float arithmetic
15. **Constraints and Assumptions** — Arc Testnet only, immutable contract, 20 milestone cap, unresolved questions on multisig and upgrade path
16. **References** — wagmi, viem, ConnectKit, OpenZeppelin, Foundry, Arc docs, GitHub repo, both contract explorer links

Switch to Build mode and say "go ahead" — I'll write it immediately.
