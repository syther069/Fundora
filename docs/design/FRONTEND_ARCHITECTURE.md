# GrantFlow Frontend Architecture
## Phase 3 — Design System Implementation

> Status: APPROVED direction — awaiting implementation sign-off

---

## 1. MISSING FEATURES — CLASSIFICATION

The following features from the PRD are not yet in the UI. Classified by contract readiness.

---

### TIER 1 — Contract function EXISTS, hook EXISTS, just needs UI

| Feature               | Contract fn          | Hook                    | UI work needed                                    | Priority |
|-----------------------|----------------------|-------------------------|---------------------------------------------------|----------|
| Deadline UI (create)  | `createGrant(deadline)` | none needed (arg)    | Date picker in AdminPanel CreateTab; pass deadline as uint40 to createGrant | P1 |
| Deadline display      | `grant.deadline`     | data already in `Grant` | DeadlineBadge on GrantCard and GrantDetail header | P1 |
| expireGrant button    | `expireGrant(grantId)`| needs new hook          | Button on GrantDetail when grant.deadline < now and status Active | P1 |
| adminReassignBuilder  | `adminReassignBuilder(grantId, newBuilder)` | needs new hook | New section in AdminPanel Manage tab | P2 |
| pause/unpause         | `pause()`, `unpause()` | needs new hooks        | Toggle in AdminPanel Settings tab (currently no UI for this) | P2 |
| claimFunderRefund     | `claimFunderRefund()` | `usePendingFunderRefund` exists | VERIFY: is claim button in AdminPanel already wired? Read AdminPanel | P1 |
| transferAdmin         | `transferAdmin(addr)` | needs new hook         | Section in AdminPanel Settings tab | P3 |

---

### TIER 2 — Contract function EXISTS, needs a new read hook

| Feature            | Contract fn                      | New hook needed                         |
|--------------------|----------------------------------|-----------------------------------------|
| expireGrant        | `expireGrant(grantId)`           | `useExpireGrant(grantId)` write hook    |
| adminReassignBuilder| `adminReassignBuilder()`        | `useAdminReassignBuilder()` write hook  |
| pause/unpause      | `pause()`, `unpause()`           | `usePausedState()` read + write hooks   |
| getMilestoneVoteCounts| `getMilestoneVoteCounts()`    | `useMilestoneVoteCounts(grantId, idx)`  |
| transferAdmin      | `transferAdmin(newAdmin)`        | `useTransferAdmin()` write hook         |

Note: adding hooks to `src/hooks/useProofSpring.ts` is necessary for Tier 2.
This requires touching a hook file. Per MEMORY.md rules, this is allowed but must be
done carefully — never change function signatures, never change return types of existing hooks.
ADD only, never modify existing hooks.

---

### TIER 3 — Pure frontend feature, no contract changes needed

| Feature            | What it needs                                            | Priority |
|--------------------|----------------------------------------------------------|----------|
| Grant search       | Client-side filter on `grants` array from GrantsContext — no RPC | P1 |
| Status filter      | Same — filter by `grant.status` 0–3                    | P1 |
| Evidence history   | Link to Arc explorer `MilestoneSubmitted` event log — already implemented via explorer link | Done (sort of) |
| Pagination         | Only needed >50 grants. `getGrantsBatch` supports it. Low priority for hackathon | P3 |

---

### TIER 4 — Requires contract changes (DO NOT IMPLEMENT without approval)

| Feature         | Why it needs contract change                               |
|-----------------|------------------------------------------------------------|
| Multi-reviewer display | `reviewerCount` is a uint — no array of reviewer addresses onchain. Cannot show reviewer list without events or an off-chain index. |
| Evidence history (full) | Full URI is only in `MilestoneSubmitted` event log. Requires an event indexer or explorer API — no contract change needed but needs an off-chain service. |

---

## 2. RECOMMENDED SCOPE FOR THIS PHASE

**Implement (Phase 3):**
- Full visual redesign of all 7 components + App.tsx
- Complete AdminPanel redesign including Manage tab
- Deadline UI in create form + DeadlineBadge display
- expireGrant button in GrantDetail
- Client-side grant search + status filter
- Framer Motion system (all 10 animation specs from MOTION_GUIDELINES.md)
- New hooks: `useExpireGrant`, `usePausedState`, `useAdminReassignBuilder`, `useMilestoneVoteCounts`
- Pause/unpause toggle in AdminPanel Settings
- adminReassignBuilder in AdminPanel Manage tab
- Motion-Primitives components (AnimatedGroup, TextEffect, InView, TransitionPanel)

**Defer to Phase 4:**
- Pagination (not needed at hackathon scale)
- Full evidence history (requires off-chain indexer)
- transferAdmin UI (rarely used, low risk to defer)
- Multi-reviewer list display

---

## 3. PAGE-BY-PAGE IMPLEMENTATION SPEC

---

### 3.1 DISCONNECTED STATE (view: grants, !isConnected)

**Purpose:** Convert visitors to connected users. Communicate trust and value.

**Layout:** centred column, max-w-lg, vertical rhythm

**Sections:**

```
[Logo mark — gradient 40px]
[Hero headline — TextEffect "Fund ideas. Verify progress. Release grants with proof."]
[Sub-copy — 2 lines, muted]
[Feature pills row — 3 pills: "Onchain · Trustless · Milestone-gated"]
[ConnectKitButton — primary pill, large, brand]
[Stats strip — 2–3 onchain stats if contract reachable: total grants, total funded]
```

**Motion:** TextEffect per-word fade-in-blur on headline. Sub-copy + pills fade in sequentially after.

---

### 3.2 GRANT GRID (view: grants, isConnected)

**Purpose:** Give admin/builder/reviewer a quick overview of all grants.

**Layout:** max-w-6xl, grid 3-col (lg) / 2-col (md) / 1-col (sm), gap-4

**Sections:**

```
[Page header: "Grants" h1 + stats strip right-aligned]
[GrantsToolbar: search input + status filter tabs]
[AnimatedGroup grant card grid — stagger 60ms per card]
[Loading: skeleton grid]
[Error: EmptyState with retry]
[Empty: EmptyState "No grants yet"]
```

**GrantsToolbar spec:**
- Search: `<input>` with search icon prefix, searches `grant.title` and `grant.description`
- Filter: 5 pill tabs: All / Open / Active / Completed / Cancelled
- Client-side, no RPC calls
- Filter state in local `useState`, not URL (SPA architecture)
- Show count per status in pill tab

**GrantCard spec (revised from previous redesign):**
- Top accent bar: 3px height, full width, colour by status
  - Open: `--brand` (indigo)
  - Active: `--teal`
  - Completed: `--teal` (darker shade)
  - Cancelled: `--coral`
- Card body: white surface, `--shadow-card`, border `--border`
- Title: `t-h3`, ink, truncate 1 line
- Description: `t-body`, muted, 2-line clamp
- USDC amount: `t-amount`, teal, bottom of first section
- Progress bar: h-2, gradient fill, show released/total below
- Footer: milestone count pill, builder assigned indicator, creation date, deadline badge if set, arrow icon
- Hover: `--shadow-hover`, lift `translateY(-2px)`, transition 200ms
- Framer Motion: `whileTap={{ scale: 0.98 }}`, entrance from AnimatedGroup
- Deadline badge: shown only when `grant.deadline > 0`
  - If expired: "Expired" in coral
  - If within 7 days: "X days left" in amber
  - Otherwise: formatted date

---

### 3.3 GRANT DETAIL (view: detail)

**Purpose:** Single source of truth for a grant. All role-gated actions in one place.

**Layout:** max-w-2xl, centred, vertical sections, back nav at top

**Sections:**

```
[Back nav — "← All Grants", muted, hover brand]

[Hero band — full-width panel, status-tinted background]
  title (t-h1)
  description (body, 3-line clamp with "show more")
  [status badge] [deadline badge if set]
  USDC total (t-amount, teal)
  progress bar + released/total label
  created date + builder address (if set)

[Actions zone — white card]
  Wrong-chain banner (if applicable)
  Fund Grant button (admin, Open grants only)
  Two-step progress indicator (during fund flow)
  Apply button (non-reviewer, non-admin, Active, no builder)
  Observer context hint
  Pending USDC claim (builder — teal panel)
  expireGrant button (if deadline passed and status Active)
  Cancel Grant (admin — danger, inline confirm)

[Milestones section]
  "Milestones (N)" heading
  InView-wrapped MilestoneCard list

[MilestoneCard spec:]
  Left border: 3px, colour by milestone status
  Header row: "Milestone N" label + amount (teal) + StatusBadge
  Title (t-h3) + description (body)
  Evidence section (if submitted): hash + cached URI
  Approval progress (if In Review): "N/M approvals"
  Evidence input + Submit (builder, Pending/Rejected)
  Approve/Reject buttons (reviewer, In Review)
  Already-voted badge
  Framer Motion InView entrance
```

**Hero band tint colours:**
- Open: `--brand-light` background, `--brand-border` bottom border
- Active: `--teal-light` background, `--teal-border` bottom border
- Completed: `--teal-light` with teal accent
- Cancelled: `--surface-raised` with muted tones

---

### 3.4 ADMIN PANEL (view: admin)

**Purpose:** Complete grant and platform administration.

**Layout:** max-w-2xl, centred, tab-based navigation

**Tab bar:**
- 4 tabs: Create / Reviewers / Settings / Manage
- Active tab: sliding indicator via Framer Motion `layoutId`
- TransitionPanel for content transitions

**Tab: Create**

```
[Section header: "Create Grant"]
[Grant title input — required, max 100 chars]
[Grant description textarea — optional, 500 chars, counter at 300+]
[Deadline input — date picker (optional). Shows "No deadline" toggle. Converts to uint40 unix timestamp.]
[Milestone rows]
  [Milestone N — card with: title input, description input (optional), amount input]
  [Remove row button — only if >1 row]
  [+ Add milestone button — disabled at 20]
[Total USDC summary — computed, shown below milestone rows]
[Create Grant button — disabled reason shown as tooltip]
[Success state: green dwell "Grant Created ✓"]
```

**Tab: Reviewers**

```
[Current reviewer count: "N reviewer(s) · M required approvals"]
[Add reviewer — address input + Add button]
[Remove reviewer — address input + Remove button]
[Note: show warning if removing would leave reviewerCount < requiredApprovals]
```

**Tab: Settings**

```
[Required approvals — current value shown, number input + Update button]
[Contract status — Paused / Active with toggle button]
[Pause/Unpause button — danger styling when pausing]
```

**Tab: Manage**

```
[Cancel Grant section]
  [List of cancellable grants (Open or Active) — each row: title, status badge, Cancel button]
  [Inline confirm per row: AlertTriangle warning + Yes/Keep buttons]
  [Empty state: "No cancellable grants"]

[Reassign Builder section]
  [Grant selector (dropdown of Active grants with a builder assigned)]
  [New builder address input]
  [Reassign button — warns that In Review milestones reset]

[Claim Funder Refund section — shown when pendingFunderRefund > 0]
  [Amount shown in teal]
  [Claim button]
```

---

## 4. HACKATHON NETWORK REQUIREMENT — UNVERIFIED FLAG

**STATUS: CANNOT CONFIRM — requires your manual check**

I attempted to fetch the DoraHacks hackathon page (`https://dorahacks.io/hackathon/arc-microgrants-2/detail`)
but received an HTTP 405 error — the page blocked automated fetching.

**What I know from the project:**
- Contract deployed on Arc Testnet (chain ID 5042002) ✓
- USDC address is the Arc Testnet USDC ✓
- The hackathon is named "Arc Microgrants" suggesting Arc is the required chain ✓

**What I cannot confirm without you reading the rules:**
- Whether Arc Testnet is acceptable for the final submission, or whether Arc Mainnet
  with real USDC movement is required
- Whether Arc Studio must be used for the entire build or just the onchain layer

**Action required from you BEFORE deployment:**
1. Open `https://dorahacks.io/hackathon/arc-microgrants-2/detail` in your browser
2. Find the "Rules" or "Requirements" section
3. Check specifically for: "testnet", "mainnet", "Arc Studio required", "deployed contract"
4. Paste the relevant excerpt here

**If mainnet is required:** this has significant implications — I will need to deliver the full
mainnet warning, and the contract would need redeployment with real USDC. Do not proceed
to mainnet without your explicit approval after reading that warning.

**For now:** all implementation proceeds targeting Arc Testnet, which is the safe default.
