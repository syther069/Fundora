I'm currently in Plan mode and can't run commands. Switch to **Build mode** using the mode selector and I'll check git status immediately.

That said, based on what we did this session, here's what I know was committed and pushed:

**Committed and pushed:**
- `contracts/Fundora.sol` + `contracts/test/Fundora.t.sol`
- `src/contracts/fundora.ts` + `src/hooks/useFundora.ts`
- All component/context/util imports updated
- `AGENTS.md` with mainnet address
- `Fundora.flat.sol`

**Potentially uncommitted** (these were modified but not explicitly staged):
- `console.jsonl` — runtime log file
- `docs/implementation-plan.md` — was modified
- `contracts/contract-metadata/Fundora.json` — was untracked, never staged
- `node_modules/.tmp/tsconfig.app.tsbuildinfo` — build artifact, should be gitignored

Switch to Build mode and I'll run `git status` to give you the exact answer and push anything that's missing.
