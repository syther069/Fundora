# GrantFlow Accessibility and UX Checklist
## Phase 2A — Implementation Requirement Standard

> UX PDF research: **PENDING** — checklist will be updated when PDFs are provided.
> All items below are derived from PRD.md, MEMORY.md, WCAG 2.1 AA, and code analysis.

---

## PART 1: INTERACTION STATE COVERAGE

Every interactive component must explicitly implement the following states.
"Implemented" means a distinct visual treatment — not just the browser default.

### 1.1 Global state checklist (applies to every screen)

- [ ] **Default** — live data, no pending operations
- [ ] **Loading** — explicit skeleton or spinner, never blank space
- [ ] **Error** — inline error message with retry where possible; `role="alert"`
- [ ] **Empty** — explicit EmptyState component, never a blank grid
- [ ] **Partial** — show available data; mark the fetching portion separately
- [ ] **Disconnected wallet** — hero connect state, not a broken UI
- [ ] **Wrong chain** — banner appears *before* the user tries to act, not after
- [ ] **Contract paused** — pause state surfaced in UI so users know why actions fail

### 1.2 Transaction state checklist (applies to every write operation)

These six states must all be visually distinct. Conflating "submitted" with "confirmed" is a
critical UX error in financial applications.

| State              | Visual treatment                                                          |
|--------------------|---------------------------------------------------------------------------|
| **Idle**           | Action button, normal appearance                                          |
| **Wallet prompt**  | Spinner + "Confirm in wallet…" — wallet modal is open                     |
| **Submitted**      | Spinner + "Confirming…" — tx in mempool, not yet mined                    |
| **Confirmed**      | Success toast + status/badge update — `isSuccess` from `useWaitForTransactionReceipt` |
| **Failed (user)**  | User rejected in wallet → toast: "Transaction cancelled"                  |
| **Failed (chain)** | Revert error → decoded error message in toast, button returns to idle     |

**Rule:** Never show a success badge, update grant status, or remove an action button until
`isSuccess` from `useWaitForTransactionReceipt` fires. Showing success on wallet signature
alone is misleading.

### 1.3 Form field state checklist

- [ ] Default — label + placeholder visible
- [ ] Focused — `--border-strong` + `--shadow-brand` ring, no outline: none without replacement
- [ ] Filled — value visible, clear
- [ ] Invalid — `--coral-border` + `--coral-light` bg + error message below (not in tooltip)
- [ ] Disabled — `opacity-50`, `cursor-not-allowed`, reason in `title` attribute
- [ ] Loading (during tx) — disabled + spinner
- [ ] Success feedback — brief dwell ("Grant Created ✓") where appropriate

---

## PART 2: KEYBOARD NAVIGATION

All interactive elements must be reachable and operable by keyboard alone.

### 2.1 Tab order rules

1. Tab order follows DOM order — do not use positive tabIndex values
2. Modals and dialogs must trap focus inside themselves while open
3. On view transition (grants → detail), move focus to the first heading in the new view
4. On view transition (detail → grants), move focus to the grant card that was clicked
5. Admin panel tabs: Left/Right arrow keys navigate between tabs; Enter/Space activates
6. Expandable sections: Enter/Space on the trigger opens/closes; focus moves into the content

### 2.2 Focus ring rules

All focusable elements:
```css
focus-visible:outline: none;
focus-visible:box-shadow: var(--shadow-brand);
```

No element may suppress focus indication entirely (`:focus { outline: none }` with no
replacement is a WCAG 2.4.7 failure).

The `.btn-focus` class in index.css handles this globally.

### 2.3 Skip navigation

A visually-hidden skip link must be the first focusable element in the DOM:
```html
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 ...">
  Skip to main content
</a>
```

### 2.4 Specific component keyboard patterns

| Component               | Keys              | Behaviour                                        |
|-------------------------|-------------------|--------------------------------------------------|
| GrantCard (button)      | Enter / Space     | Navigates to detail view                         |
| Admin tab bar           | ←/→               | Moves focus between tabs; Enter activates        |
| Cancel confirm dialog   | Escape            | Closes confirm (equivalent to "Keep Grant")      |
| Evidence input          | Enter             | Does NOT submit (accidental submit risk); Shift+Enter for submit, or explicit button |
| ConnectKit button       | Enter             | Opens ConnectKit modal (handled by ConnectKit)   |
| Back navigation         | Enter / Space     | Returns to grants list                           |

---

## PART 3: SEMANTIC HTML AND ARIA

### 3.1 Landmark structure (required)

```html
<header>                          <!-- sticky nav bar -->
<main id="main-content">          <!-- page content -->
  <section aria-label="...">      <!-- major sections -->
<footer>                          <!-- bottom strip -->
```

### 3.2 Component-level ARIA

| Component                    | Required ARIA                                                      |
|------------------------------|--------------------------------------------------------------------|
| GrantCard                    | `role="button"` already on `<button>` — ensure `aria-label` includes title |
| StatusBadge                  | `aria-label="Status: {label}"` on the outer span                   |
| Progress bar                 | `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label` |
| Admin tab bar container      | `role="tablist"`                                                   |
| Each admin tab               | `role="tab"`, `aria-selected`, `aria-controls="panel-{id}"`        |
| Each tab panel               | `role="tabpanel"`, `id="panel-{id}"`, `aria-labelledby="tab-{id}"` |
| MilestoneCard                | `<article>`, `aria-label="Milestone {N}: {title}"`                 |
| Cancel confirm               | `role="alertdialog"`, `aria-labelledby`, `aria-describedby`        |
| Error messages               | `role="alert"` on the error text container                         |
| Loading regions              | `aria-live="polite"` on the container that switches skeleton → data |
| Pending tx button            | `aria-busy="true"` while pending                                   |
| Wallet address display       | `<abbr title="Full address">0x1234…5678</abbr>` or `aria-label`   |

### 3.3 Screen reader announcements

| Event                        | Announcement method                                                |
|------------------------------|--------------------------------------------------------------------|
| Grant status change          | `aria-live="polite"` region updated with new status               |
| Tx submitted                 | Sonner toast (visually and via ARIA live)                          |
| Tx confirmed                 | Sonner toast + `aria-live` region update                          |
| Error                        | `role="alert"` fires immediately                                   |
| View transition              | Focus move to `<h1>` of new view communicates context change      |

---

## PART 4: COLOUR AND CONTRAST

### 4.1 Minimum contrast ratios (WCAG AA)

All text/background combinations must meet 4.5:1 minimum for normal text, 3:1 for large text (≥24px bold).

See DESIGN_SYSTEM.md §2 for the full verified contrast table.

### 4.2 Colour-alone rule

Status is NEVER communicated by colour alone. Every status badge has:
- An icon (10px Lucide icon)
- A text label
- A colour fill

This covers: colour blindness, monochrome displays, printed receipts.

### 4.3 Semantic colour discipline

- `--teal` is only used for positive financial outcomes (approved, funded, claimed)
- `--coral` is only used for negative/danger states (rejected, cancelled, errors)
- `--amber` is only used for warning/in-progress states
- `--brand` is only used for interactive elements (CTAs, links, focus)

Never use `--brand` to mean "success". Never use `--teal` for a CTA button.

---

## PART 5: FINANCIAL DATA UX RULES

These rules are specific to GrantFlow's financial nature and are more stringent
than generic app UX requirements.

### 5.1 USDC amount display

- Always show "USDC" adjacent to the number (never bare digits for amounts)
- Always use `formatUnits(bigint, 6)` — never float division
- Positive balances: `--teal` colour
- Zero balances: `--subtle` colour
- "/ total" secondary text: `--muted`, smaller size

### 5.2 Transaction confirmation honesty

- **Wallet prompt state:** "Confirm in wallet…" — the user must act
- **Mempool state:** "Confirming on Arc…" or "Confirming…" — the chain is processing
- **Success state:** only after `isSuccess` fires from `useWaitForTransactionReceipt`
- Never call a tx "complete" at the moment of wallet signature
- Never say "funds transferred" before the receipt confirms

### 5.3 Destructive action prevention

- Cancel Grant: requires a 2-step confirm — initial button + explicit confirm panel
- No `window.confirm()` — inline confirmation UI only (already enforced in MEMORY.md)
- Confirm panel must display: what will happen + the USDC amount affected + irreversibility notice
- Confirm button label: "Yes, Cancel Grant" (action-specific, not "OK" or "Confirm")

### 5.4 Persistence accuracy

The app has no off-chain storage. Every piece of state is either:
1. Onchain (permanent, authoritative)
2. In localStorage (browser-local, volatile — must be labelled "cached locally")
3. In React state (session-only, will be lost on refresh — no persistent display)

Evidence URIs stored in localStorage must be labelled "Submitted URL (cached locally)" and
never displayed as if they are onchain data.

### 5.5 Error recovery

All recoverable errors must include:
1. What went wrong (decoded revert reason from `parseOnchainError`)
2. Whether the user should retry or take a different action
3. A retry path (button or instruction)

Non-recoverable states (contract cancelled, grant completed) must be visually distinct
from error states — these are final states, not failures.

---

## PART 6: RESPONSIVE BEHAVIOUR CHECKLIST

### 6.1 Required viewport tests

| Width    | Required behaviour                                                          |
|----------|-----------------------------------------------------------------------------|
| 375px    | No horizontal overflow. All content readable. Single column everywhere.     |
| 390px    | iPhone 14 Pro. Touch targets ≥44×44px. Wallet button reachable.            |
| 768px    | Tablet portrait. 2-column grant grid. Admin panel at full width.            |
| 1024px   | Laptop. 3-column grant grid begins. Detail/admin centred at 720px.          |
| 1440px   | Desktop. Generous whitespace. No content stretching to full width.          |

### 6.2 Mobile-specific rules

- Admin panel tabs: scrollable horizontally on small screens, no wrapping
- Milestone cards: full width, adequate touch targets on Approve/Reject buttons
- Evidence input: full width, keyboard-friendly (no accidental submits)
- Address display: truncated with full address on tap/hover (`title` attribute)
- USDC amounts: `text-2xl` on mobile is acceptable; `text-3xl` on desktop

### 6.3 Touch interaction rules

- Minimum touch target: 44×44px (even if the visual element is smaller, use padding)
- No hover-only information (hover tooltips must also be accessible on touch)
- Swipe gestures: not used (not supported by wagmi/ConnectKit flows)

---

## PART 7: UX FLOW COMPLETENESS CHECKLIST

Each user role must be able to complete their primary workflow without confusion.

### 7.1 Admin (Grant Admin) — primary flow

- [ ] Create a grant with ≥1 milestone (title, amount, optional deadline)
- [ ] See the created grant appear in the list
- [ ] Fund the grant (two-step: approve USDC → fundGrant)
- [ ] See the grant status change from Open → Active
- [ ] Add a reviewer via Reviewers tab
- [ ] See current reviewer count displayed
- [ ] Cancel a stalled grant with inline confirm
- [ ] Claim a funder refund after cancellation
- [ ] Pause and unpause the contract
- [ ] Reassign a builder on an Active grant

### 7.2 Builder — primary flow

- [ ] See the grants list without connecting wallet (read-only)
- [ ] Connect wallet
- [ ] Browse Active grants with no builder assigned
- [ ] Apply as builder (one click, confirmation)
- [ ] See own address appear as builder in the grant detail
- [ ] Submit milestone evidence (URL or IPFS CID) with validation
- [ ] See evidence hash confirmed onchain
- [ ] See pending payment appear after reviewer approval
- [ ] Claim USDC payment

### 7.3 Reviewer — primary flow

- [ ] Connect wallet
- [ ] See grants with In Review milestones
- [ ] View milestone evidence (hash + cached URI if present)
- [ ] Approve or reject a milestone
- [ ] See vote recorded badge (no double-vote)
- [ ] See approval count progress if requiredApprovals > 1

### 7.4 Observer — passive flow

- [ ] See all grants without connecting
- [ ] See grant titles, amounts, statuses, progress
- [ ] See contextual hint when they have no actionable role
- [ ] Connect wallet to access relevant role

---

## PART 8: UX RESEARCH PENDING ITEMS

The following items are pending UX PDF guidance. Marked with ⚠️.

- ⚠️ Onboarding flow for first-time admins (no grants exist yet)
- ⚠️ Cognitive load reduction in the AdminPanel create form (20 milestones = high complexity)
- ⚠️ Evidence submission guidance (what makes a good evidence URL?)
- ⚠️ Reviewer decision support (what information helps reviewers make decisions?)
- ⚠️ Financial trust signals (what makes a blockchain grant platform feel safe?)
- ⚠️ Information architecture — should milestones be collapsible by default?
- ⚠️ Navigation patterns — should the app URL update on view change? (currently no Router)

These items will be incorporated when UX PDFs are provided. They do not block Phase 3
implementation — the spec above is sufficient to build a correct, accessible product.
