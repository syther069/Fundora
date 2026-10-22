Let me read the remaining reference files and existing files I need before writing the plan. Good — I have everything I need. Let me also check the GrantDetail's action sections and the package.json to confirm installed packages. Now let me check the existing plan and read GrantDetail's submit evidence section. I have everything I need. Here's the complete plan:

---

## Implementation Plan: Passkey + Gasless Onboarding for GrantFlow

### Summary
Add a passkey (FaceID / TouchID / Windows Hello) sign-in path to GrantFlow that creates a Circle MSCA (smart contract account) on Arc Testnet, with gas sponsored entirely by Circle Gas Station. Existing ConnectKit/wagmi wallet users are completely unaffected.

---

### ABI verification (confirmed before planning)

All three function names and arg types in the prompt match the actual ABI:

| Function | ABI signature | Match |
|---|---|---|
| `applyForGrant` | `(grantId: uint256)` | Correct |
| `submitMilestoneEvidence` | `(grantId: uint256, milestoneIndex: uint256, evidenceUri: string)` | Correct — `evidenceUri` is the on-event string; the on-chain stored field is `evidenceHash`, but the function accepts the raw string |
| `claimPayment` | `()` | Correct |

Note: `submitMilestoneEvidence` takes `milestoneIndex` as `uint256` in the ABI — the gasless path will cast the `index` number to `BigInt(index)` for correctness.

---

### Gas Station setup — required before build works

You answered that you do not yet have a Gas Station policy. Before approving the build, complete these steps in Circle Console (Testnet mode):

1. Console → **Gas Station** → **Create Policy**
2. Name it (e.g. "GrantFlow Arc Testnet"), select **Arc Testnet** as the chain
3. Set **Sponsorship type** to "All user operations" (or scope to your bundler address)
4. Save — the policy activates immediately
5. Without this, every `paymaster: true` call returns AA33 and the transaction fails

---

### Architecture

- **Blockchain:** Arc Testnet only (chain ID 5042002) — follows your answer; mainnet left for a later phase
- **Contract:** Existing ProofSpring at `0xef34036dda3960a1cd57b1368329bfcf29700259`, same ABI — no contract changes
- **Passkey SDK:** `@circle-fin/modular-wallets-core` (already installed at ^1.0.16) + `viem/account-abstraction`
- **Chain import:** `arcTestnet` from `viem/chains` — confirmed present in viem ^2.56.3 (which exports both `arcTestnet` and `arc`)
- **Frontend:** React context + modal + Header patch + GrantDetail patch; Tailwind with existing CSS vars
- **Wallet:** ConnectKit untouched; passkey adds a parallel sign-in path in `Header.tsx`

---

### Files to Create / Modify

1. **`src/utils/modularWallet.ts`** — New file. Engine: `getModularClients`, `registerPasskey`, `loginPasskey`, `sendGaslessContractCall`. Arc Testnet only (`/arcTestnet` transport path). No `any` types; uses `P256Credential`, `SmartAccount`, `BundlerClient` from `viem/account-abstraction`.

2. **`src/context/PasskeyContext.tsx`** — New file. React context + provider. Persists `P256Credential` in `localStorage` (noted as dev-only; production should use httpOnly cookies). Exposes: `smartAccountAddress`, `account`, `isPasskeyConnected`, `isLoading`, `error`, `register(username)`, `login()`, `disconnect()`, `executeGaslessAction(functionName, args)`.

3. **`src/components/PasskeyAuthModal.tsx`** — New file. Two-tab modal (Create / Sign In). Nickname input on Create tab. "Create Passkey" and "Continue with Passkey" buttons with Fingerprint/Shield icon. "Gasless Account" badge. Loading + readable error states for `NotAllowedError` (cancelled), `SecurityError` (domain mismatch), `InvalidStateError` (already registered). Styled with `--brand`, `--warm-surface`, and existing CSS vars. If `VITE_CLIENT_KEY` is missing or empty, shows a setup notice and disables the buttons — no crash.

4. **`src/components/Header.tsx`** — Modify. Keep `ConnectKitButton` untouched. Add `usePasskeyContext` import. If no wallet and no passkey connected: show secondary "Passkey (Gasless)" button with `Fingerprint` icon → opens `PasskeyAuthModal`. If passkey connected: show shortened smart account address, "Smart Account (Gasless)" badge, and Disconnect button.

5. **`src/components/GrantDetail.tsx`** — Modify. Import `usePasskeyContext`. For builder actions only (`applyForGrant`, `submitMilestoneEvidence`, `claimPayment`): if `isPasskeyConnected`, route to `executeGaslessAction` instead of the wagmi write hook. Status text: "Submitting gasless transaction on Arc…" while pending; show tx hash link on success; readable error on failure. The existing wagmi path for these three actions remains the default. All other actions (fund, approve, cancel, expire, reviewer vote, admin functions) stay wagmi-only.

6. **`src/App.tsx`** — Modify. Wrap the existing provider tree with `<PasskeyProvider>`. One-line change inside the existing provider stack.

7. **`.env`** — Add `VITE_CLIENT_KEY=` (empty placeholder) and `VITE_CLIENT_URL=https://modular-sdk.circle.com/v1/rpc/w3s/buidl` if not already present.

---

### Build Sequence

1. Write `src/utils/modularWallet.ts` — engine functions, typed, testnet-only
2. Write `src/context/PasskeyContext.tsx` — provider with localStorage credential persistence and `executeGaslessAction` helper
3. Write `src/components/PasskeyAuthModal.tsx` — two-tab UI, missing-key guard, error states
4. Patch `src/components/Header.tsx` — add passkey button / connected state alongside existing ConnectKit button
5. Patch `src/components/GrantDetail.tsx` — branch builder actions to gasless path when `isPasskeyConnected`
6. Patch `src/App.tsx` — add `<PasskeyProvider>` wrapper
7. Add env var placeholders to `.env`
8. Run `tsc --noEmit`, fix any type errors

---

### Done When

- [ ] `npm run typecheck` passes with zero errors
- [ ] "Passkey (Gasless)" button appears in Header when no wallet is connected
- [ ] Create account tab: entering a nickname and tapping the button triggers a browser passkey prompt
- [ ] A smart account address is displayed in the Header after registration
- [ ] Sign out and sign back in restores the same smart account address
- [ ] Apply for grant, submit evidence, and claim payment all work via gasless path (zero USDC in account)
- [ ] ConnectKit wallet users can still do all of the above via wagmi (unchanged)
- [ ] Admin and Reviewer flows remain ConnectKit-only and are not touched
- [ ] Missing `VITE_CLIENT_KEY` shows a setup notice in the modal instead of crashing
- [ ] Gas Station policy is configured in Circle Console before testing sponsored transactions

---

## Ready to build?

Approve this plan and switch to Build mode. One reminder: the Gas Station policy in Circle Console must be created **before** testing — without it, sponsored user operations will be rejected at the bundler with AA33. The plan is saved. Here's a summary of what's in it and a few things worth noting before you approve:

**ABI is clean.** All three function names and argument types match exactly. `submitMilestoneEvidence` gets `milestoneIndex` cast to `BigInt` at the callsite — the ABI declares it `uint256`.

**Chain imports confirmed.** `viem` ^2.56.3 exports both `arcTestnet` and `arc` from `viem/chains`, so no need to define them manually with `defineChain`.

**Gas Station is the only blocker you control before build.** The plan documents the three Console steps (Gas Station → Create Policy → Arc Testnet → Save). The build itself will work without it, but sponsored transactions will fail at runtime with AA33 until the policy exists.

**What stays untouched:** `AdminPanel`, reviewer vote flow, `fundGrant`, `cancelGrant`, `expireGrant`, `claimFunderRefund` — all wagmi-only, zero changes.

**localStorage note:** The passkey credential is persisted in `localStorage` for a working demo. The code will include a comment flagging that production should use httpOnly cookies to mitigate XSS credential theft.

When you're ready, approve and switch to Build mode.
