# GrantFlow Motion Guidelines
## Framer Motion System — Version 2.0, Phase 2A Finalised

---

## 1. PRINCIPLE: ANIMATION EARNS ITS PLACE

Every animation in GrantFlow must pass at least one of these tests:

1. **Communicates a state change** — a grant going Active, a milestone being approved, a tx confirming
2. **Provides spatial orientation** — view transitions that tell the user where they are in the app
3. **Reduces cognitive load** — staggered list entrance helps users scan in order, not be hit all at once
4. **Confirms an action** — button press feedback, success pulse, progress bar fill

If an animation fails all four tests, it is removed.

**Explicitly prohibited:**
- Looping decorative animations (floating elements, background gradients that pulse)
- Number countup animations on USDC amounts (misrepresents financial precision)
- Motion that starts during a transaction flow (do not distract users who need to confirm in their wallet)
- Hover animations on disabled elements

---

## 2. REDUCED MOTION (REQUIRED ON EVERY ANIMATED COMPONENT)

```tsx
import { useReducedMotion } from 'framer-motion'

function AnimatedComponent() {
  const shouldReduce = useReducedMotion()
  // When shouldReduce is true: replace all motion with opacity 0→1 only.
  // Never skip the visual change entirely — only skip the transition.
}
```

Pattern for every motion variant set:

```tsx
function getVariants(shouldReduce: boolean) {
  if (shouldReduce) {
    return {
      hidden:  { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.15 } },
    }
  }
  return {
    hidden:  { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22,1,0.36,1] } },
  }
}
```

This pattern is mandatory. There are no exceptions.

---

## 3. TIMING TOKENS

| Token        | Duration | Easing                 | Use                                              |
|--------------|----------|------------------------|--------------------------------------------------|
| `instant`    | 0ms      | —                      | State labels that must appear without delay      |
| `fast`       | 120ms    | `easeOut`              | Button press, hover tint, focus ring             |
| `default`    | 200ms    | `easeOut`              | Fade in/out, badge transitions, icon swaps       |
| `moderate`   | 280ms    | `[0.22, 1, 0.36, 1]`  | Card entrance, panel slide, tab content          |
| `deliberate` | 350ms    | `[0.22, 1, 0.36, 1]`  | View transition (grants ↔ detail ↔ admin)        |
| `slow`       | 500ms    | `easeInOut`            | Progress bar fill width change                   |

Custom easing `[0.22, 1, 0.36, 1]` is a snappy spring-like curve: fast out, clean settle.
This is the primary spatial easing used for anything that moves across the screen.

---

## 4. COMPONENT-BY-COMPONENT SPECIFICATIONS

### 4.1 Grant Card Grid — staggered entrance

**When:** Grant list loads (data transitions from skeleton to content).
**Component:** `AnimatedGroup` from Motion-Primitives (source: `src/components/ui/animated-group.tsx`)

```tsx
// Container variants
const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06 } },
}

// Each card item
const cardVariants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22,1,0.36,1] } },
}

// Reduced motion override
// hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.15 } }
// No y offset. No stagger.
```

Maximum stagger: 8 cards × 60ms = 480ms total. Cap stagger at 8 items; remaining cards use 0ms stagger.

### 4.2 View transitions (grants ↔ detail ↔ admin)

**When:** User clicks a grant card (entering detail) or presses Back (returning to list).
**Component:** `<AnimatePresence mode="wait">` around the view switcher in `App.tsx`

```tsx
// Entering detail view (sliding in from right)
initial:  { opacity: 0, x: 24 }
animate:  { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.22,1,0.36,1] } }
exit:     { opacity: 0, x: 16, transition: { duration: 0.18, ease: 'easeIn' } }

// Returning to grants list (coming back from left)
initial:  { opacity: 0, x: -16 }
animate:  { opacity: 1, x: 0, transition: { duration: 0.25, ease: [0.22,1,0.36,1] } }

// Admin panel (from grants — same as detail but direction cue is secondary)
initial:  { opacity: 0, y: 8 }
animate:  { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22,1,0.36,1] } }
```

**Critical rule:** Do NOT animate the view transition while a transaction is pending.
If `txPending` is true, transition is instant (opacity only, 100ms).

### 4.3 Admin Panel tab transitions

**Component:** `TransitionPanel` from Motion-Primitives (`src/components/ui/transition-panel.tsx`)
**Tab indicator:** Framer Motion `layoutId="admin-tab-bar-indicator"`

```tsx
// Tab indicator (absolute bottom border 2px, slides between tabs)
<motion.div
  layoutId="admin-tab-bar-indicator"
  className="absolute bottom-0 left-0 right-0 h-0.5"
  style={{ background: 'var(--brand)' }}
  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
/>

// Tab content panel
// dir: +1 advancing tab index, -1 going back
variants={{
  enter:  (dir: number) => ({ x: dir > 0 ? 20 : -20, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.22, ease: [0.22,1,0.36,1] } },
  exit:   (dir: number) => ({ x: dir > 0 ? -20 : 20, opacity: 0,
                               transition: { duration: 0.15, ease: 'easeIn' } }),
}}
```

### 4.4 Milestone status change — badge pulse

**When:** `milestone.status` prop changes (Pending → InReview → Approved/Rejected).
Use React key change on the `<motion.span>` to re-trigger animation when status changes.

```tsx
// StatusBadge — wraps the pill in a motion.span
<motion.span
  key={status}  // key change re-runs animate
  initial={{ scale: 0.92, opacity: 0.7 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
>
  {/* badge content */}
</motion.span>

// Approved milestone card — left border glow pulse (fires once on Approved status)
// Applied to the left-border element of the MilestoneCard
animate={{
  boxShadow: [
    '0 0 0 0 rgba(15,118,110,0)',
    '0 0 0 6px rgba(15,118,110,0.22)',
    '0 0 0 0 rgba(15,118,110,0)',
  ]
}}
transition={{ duration: 0.6, ease: 'easeOut', times: [0, 0.4, 1] }}
```

### 4.5 Skeleton → content transition

**When:** Loading state resolves and real data appears.
**Component:** `<AnimatePresence mode="wait">` in the grant grid and milestone list.

```tsx
<AnimatePresence mode="wait">
  {isLoading ? (
    <motion.div key="skeleton" exit={{ opacity: 0, transition: { duration: 0.12 } }}>
      {skeletons}
    </motion.div>
  ) : (
    <motion.div
      key="content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.2 } }}
    >
      {content}
    </motion.div>
  )}
</AnimatePresence>
```

### 4.6 Button press (tap) feedback

**Applied to:** All primary and secondary buttons via `motion.button`.

```tsx
<motion.button
  whileTap={{ scale: 0.97 }}
  transition={{ duration: 0.1 }}
  // Do NOT apply whileTap to disabled buttons — check disabled prop first
>
```

**Rule:** If `disabled` is true, do not pass `whileTap`. A disabled button should not animate.

```tsx
// Safe pattern
const tapProps = disabled ? {} : { whileTap: { scale: 0.97 } }
<motion.button {...tapProps} disabled={disabled}>
```

### 4.7 Expandable sections (evidence panel, cancel confirm, milestone evidence input)

**When:** Section expands/collapses, not triggered by a page transition.

```tsx
<AnimatePresence>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1,
                 transition: { height: { duration: 0.22, ease: [0.22,1,0.36,1] },
                               opacity: { duration: 0.18 } } }}
      exit={{ height: 0, opacity: 0,
              transition: { height: { duration: 0.18, ease: 'easeIn' },
                            opacity: { duration: 0.1 } } }}
      style={{ overflow: 'hidden' }}
    >
      {children}
    </motion.div>
  )}
</AnimatePresence>
```

Applies to: cancel confirm dialog, milestone evidence input zone, "show more" description expansion.

### 4.8 Hero connect state headline

**Component:** `TextEffect` from Motion-Primitives (`src/components/ui/text-effect.tsx`)

```tsx
<TextEffect
  per="word"
  preset="fade-in-blur"
  as="h1"
  className="t-hero"
>
  Fund ideas. Verify progress. Release grants with proof.
</TextEffect>
```

Sub-copy fades in after the headline with a 0.4s delay:
```tsx
<motion.p
  initial={{ opacity: 0, y: 6 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.4, duration: 0.3 }}
>
  {subCopy}
</motion.p>
```

Feature pills stagger in after sub-copy (delay: 0.6s, stagger 0.08s per pill).

Reduced motion: TextEffect shows text instantly. Sub-copy and pills fade in without delay or y offset.

### 4.9 Transaction confirmation — pending withdrawal glow

**When:** `pendingWithdrawal > 0n` and the claim panel first mounts.

```tsx
// The teal claim panel glows once on mount to draw the builder's eye
<motion.div
  initial={{ boxShadow: '0 0 0 0 rgba(15,118,110,0)' }}
  animate={{ boxShadow: '0 0 0 0 rgba(15,118,110,0)' }}
  whileInView={{
    boxShadow: ['0 0 0 0 rgba(15,118,110,0)', '0 0 0 8px rgba(15,118,110,0.20)', '0 0 0 0 rgba(15,118,110,0)']
  }}
  transition={{ duration: 0.6, delay: 0.3 }}
>
  {claimPanel}
</motion.div>
```

### 4.10 Milestone card — scroll-triggered entrance

**Component:** `InView` from Motion-Primitives (`src/components/ui/in-view.tsx`)

```tsx
<InView
  variants={{
    hidden:  { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0 },
  }}
  transition={{ duration: 0.24, ease: [0.22,1,0.36,1] }}
  viewOptions={{ once: true, margin: '0px 0px -48px 0px' }}
>
  <MilestoneCard {...props} />
</InView>
```

`once: true` — plays once when the card scrolls into view. Does not replay on scroll out/back.

---

## 5. WHAT NOT TO ANIMATE

| Element                           | Reason                                                        |
|-----------------------------------|---------------------------------------------------------------|
| Loading spinners                  | Use Tailwind `animate-spin` via CSS — not Framer Motion       |
| Toast notifications               | Sonner handles its own entrance/exit animation                 |
| ConnectKit modal                  | ConnectKit owns its own animation — do not interfere          |
| Transaction hash links appearing  | Simple CSS opacity transition, not a slide                    |
| Error messages                    | Instant appearance — delay causes user anxiety                |
| USDC amounts updating             | Never count-up animate financial numbers                      |
| Anything during a pending tx      | Do not distract users who must confirm in their wallet        |
| Skeleton shimmer                  | Use Tailwind `animate-pulse` — Framer Motion overkill here    |
| Hover on disabled buttons         | Disabled elements should not respond to interaction           |

---

## 6. MOTION-PRIMITIVES COMPONENTS

All four components are open-source (MIT), built on Framer Motion + Tailwind.
They are copy-paste installs, not npm packages. Place in `src/components/ui/`.

| Component        | Source URL                                | File                                | Used for                              |
|------------------|-------------------------------------------|-------------------------------------|---------------------------------------|
| `AnimatedGroup`  | motion-primitives.com/docs/animated-group | `src/components/ui/animated-group.tsx` | Grant card grid stagger            |
| `TextEffect`     | motion-primitives.com/docs/text-effect    | `src/components/ui/text-effect.tsx`    | Hero headline animation            |
| `InView`         | motion-primitives.com/docs/in-view        | `src/components/ui/in-view.tsx`        | Milestone card scroll entrance     |
| `TransitionPanel`| motion-primitives.com/docs/transition-panel| `src/components/ui/transition-panel.tsx`| Admin tab content transition     |

These components will be fetched from their public documentation during implementation.
No source code paste is required from the user for these four.
