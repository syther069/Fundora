# Fundora UX and Visual Design Brief

## Purpose

Use this document as the product and visual-design source of truth before implementing Fundora's UX workflows. Review the current application and its existing product, contract, and design documentation first. The product is evolving from a milestone-grant interface toward an Arc community platform for hackathons and contests; do not assume the new event workflows already exist.

## Product in one sentence

Fundora helps Arc community organizers publish funded hackathons and contests, participants submit projects, reviewers judge entries, and winners claim USDC rewards.

## Primary roles

### Organizer

Admins, hackathon hosts, and contest hosts create an event or list an externally hosted event, publish its requirements and prize structure, invite reviewers, monitor entries, oversee judging, select winners, and track reward claims. Organizer wallets and event pools are intended to connect to Fundora contracts.

### Participant

Builders enter hackathons with prototypes or finished products, or submit contest entries such as X posts, threads, memes, videos, and designs. They provide project details and links, connect a receiving wallet, and track submission, judging, and reward status. Team entries should credit collaborators visibly.

### Reviewer

Reviewers are invited by an organizer to inspect assigned submissions and evaluate them against the event's published criteria. Their access should be scoped to the event and information necessary to judge it. Reviewers need a clear queue, progress state, rubric, save/submit behavior, and confirmation that a review was recorded.

## Core UX journeys

1. **Discover:** Browse and filter open, upcoming, and completed events. Event cards and details make type, organizer, prize pool, eligibility, dates, submission format, judging criteria, and funding status easy to scan.
2. **Create or list:** Organizer drafts an event, chooses native Fundora hosting or an external listing, adds requirements and judging criteria, defines prize places and amounts, invites reviewers, checks the event preview, and publishes. Funding and publication states must be explicit.
3. **Submit:** Participant connects a wallet, reviews eligibility and rules, submits project information and required links, names collaborators for display, confirms the prize recipient wallet, and receives a timestamped receipt. Explain whether edits or resubmissions are allowed before the deadline.
4. **Judge:** Reviewer opens assigned entries, sees the criteria and relevant evidence, saves progress if supported, submits a score or vote, and sees that the review is complete. Do not expose private participant information by default unless it is required and permitted.
5. **Award and claim:** Organizer reviews judging progress, resolves incomplete or conflicting reviews, confirms winners and allocations, then records/finalizes awards. Participants see the award decision, amount, recipient wallet, claim status, and transaction link. Never imply automatic or instant payment unless the deployed contract confirms it.

## Information architecture direction

- **Public:** Events, event details, how judging and rewards work, connect wallet.
- **Organizer workspace:** Overview, My events, event setup, submissions, reviewers, judging progress, awards and claims, settings.
- **Participant workspace:** Discover events, My submissions, submission detail/status, received awards and claims, profile/wallet.
- **Reviewer workspace:** Assigned events, review queue, submission detail, rubric, completed reviews.
- Keep role-specific actions separate and obvious. A person may hold more than one role; provide a simple role/workspace switcher instead of mixing every action into one dashboard.

## Visual direction

**Target:** A premium fintech dashboard that could sit beside Stripe or Linear: clean, precise, data-dense, calm, and financially serious. Borrow Stripe's clarity, Linear's hierarchy and purposeful motion, and Notion's warm restraint. The result must not look like a DeFi trading app.

Use the attached palette reference at [`fundora-color-palette.png`](./fundora-color-palette.png). Its visual palette is a progression from deep midnight navy through layered blues to pale blue. The image's final two printed hex labels appear malformed or inconsistent, so treat the image as the visual reference and verify exact swatch values before encoding them. Suggested approximate starting tokens, subject to visual verification:

| Token | Approximate value | Use |
|---|---|---|
| Midnight | `#00002A` | Primary ink, dark navigation, high-contrast emphasis |
| Fundora blue | `#1A3F75` | Primary actions, links, selected states |
| Slate blue | `#4F7897` | Secondary emphasis, chart series, supporting labels |
| Mist blue | `#A7C6D8` | Subtle highlights, borders, selected surfaces |
| Pale blue | `#D1E2EC` | Soft panels and quiet backgrounds |
| Warm white | `#F7F8F6` | Main canvas and cards where a neutral surface improves readability |

Keep most screens light and spacious, with navy typography and restrained blue accents. Use color for meaning: status colors must remain distinct and accessible, and the palette should not turn every surface blue. Avoid neon gradients, token-price aesthetics, glowing wallet imagery, excessive glass effects, and decorative charts without a decision-making purpose.

Use a consistent type scale, strong numeric alignment for USDC amounts, clear table/list density, deliberate spacing, subtle borders, modest corner radii, and restrained shadows. Prefer readable labels over unexplained crypto jargon. Motion should clarify state changes and be brief; respect reduced-motion settings.

## Trust, privacy, and money states

- Explain what participant information is collected, who can view it, and how reviewer access is scoped.
- Clearly distinguish event prize pool **announced**, **funded**, **allocated**, **available to claim**, **claimed**, and **failed/pending** states where supported by product data.
- Show the recipient wallet before a participant submits and before an organizer finalizes awards.
- Make judging rules, reviewer progress, event deadlines, and award decisions auditable in the interface.
- Provide transaction status and explorer links for onchain actions, with plain-language explanations of wallet/network requirements and failures.
- Distinguish an externally listed event from one whose pool is escrowed by Fundora.

## Contract and payout assumptions to validate

- The existing Fundora grant contract is described as one builder/recipient per grant with milestone approvals and pull-claims. Confirm this against the current deployed contract and repository docs before designing the event payout flow.
- A dedicated event escrow contract that supports one event pool, multiple winner allocations, and independent pull-claims is the recommended direction for multi-winner events. This is a product/architecture recommendation, not a claim that the contract is implemented or approved.
- For team entries, keep one recipient address per winning entry for the initial UX. Credit teammates visually. A team may choose a shared Safe or payment-splitter address as that recipient; do not add native percentage-split claims unless separately approved.
- Onchain awards should be represented as claimable by the winner unless the final contract explicitly supports direct transfers. Make the claim action and its status clear.
- Flag any mismatch between this direction, the existing implementation, and the agent's four-phase plan before implementation.

## Accessibility and responsive behavior

- Design mobile and desktop layouts for discovery, submission, judging, and organizer review.
- Support keyboard navigation, visible focus, semantic headings, accessible labels, sufficient text/background contrast, and non-color status cues.
- Keep tables usable on narrow screens through responsive cards or intentional horizontal scrolling; do not silently hide essential financial or judging data.
- Include loading, empty, error, disconnected-wallet, wrong-network, deadline-passed, and transaction-pending/success/failure states.

## Skill guidance

Do not install the entire suggested skill list by default. First check which skills are already available and use only those that add value to this task. Most relevant for UX/design work: `ui-ux-pro-max-skill`, `frontend-design`, `design-system-patterns`, `responsive-design`, `accessibility-compliance`, and `web-design-guidelines`. For later implementation, `react-best-practices`, `react-state-management`, `tailwind-design-system`, and `nextjs-app-router-patterns` are conditional on the actual stack; the repository currently describes a React/Vite app, so do not assume Next.js. Motion, logo, Lark, hallmark, and broad skill collections are optional and not required for this UX brief. If a required skill is missing, report that and ask before installing packages or running an unfamiliar `npx skills add` command.

## Required work before implementation

1. Read this brief and inspect the current code, repository instructions, existing UX/design docs, and contract behavior.
2. Locate and read all user-provided UI/UX PDFs relevant to Fundora. If none are present or accessible, list the missing files and ask for them; do not invent what they contain.
3. Compare this brief with the existing four-phase plan. Identify affected phases, dependencies, unclear decisions, and any work that would need to be reordered.
4. Produce a role-based flow map, screen inventory, key states, and updated phase plan for review.
5. Stop for product approval before implementing UX or UI changes. Do not change code while doing this review.

## Open decisions to surface

- Are external events only directory listings linking out, or can participants submit through Fundora for them?
- Are entries judged through scores/rubrics, approve/reject votes, or both? What is quorum, tie-break, and late-review behavior?
- Are teams supported at submission, and can entries be edited or resubmitted before the deadline?
- Which participant fields are collected, and should judging be blind?
- Are awards finalized by organizer discretion, reviewer consensus, or a specific combination?
- Confirm contract payout mechanics, recipient address rules, and whether unclaimed prizes expire or return to the pool.
