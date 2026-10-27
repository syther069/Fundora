import { motion } from 'framer-motion'
import { formatUnits } from 'viem'
import { Clock, ExternalLink, Trophy, Users } from 'lucide-react'
import { EventType, EventStatus, type OnchainEventInfo } from '../contracts/fundoraEvents'

// ── Helpers ───────────────────────────────────────────────────────────────────

function useCountdown(deadlineSecs: number) {
  const now = Math.floor(Date.now() / 1000)
  const diff = deadlineSecs - now

  if (deadlineSecs === 0) return null
  if (diff <= 0) return { label: 'Ended', urgent: true }

  const days = Math.floor(diff / 86400)
  const hours = Math.floor((diff % 86400) / 3600)

  if (days > 0) return { label: `${days}d ${hours}h left`, urgent: days <= 3 }
  const mins = Math.floor((diff % 3600) / 60)
  return { label: `${hours}h ${mins}m left`, urgent: true }
}

function statusLabel(ev: OnchainEventInfo): string {
  const now = Math.floor(Date.now() / 1000)
  if (ev.status === EventStatus.Cancelled) return 'Cancelled'
  if (ev.status === EventStatus.Finalized) return 'Completed'
  if (ev.status === EventStatus.SubmissionsClosed) return 'In Judging'
  if (ev.submissionDeadline !== 0 && ev.submissionDeadline < now) return 'Submissions Closed'
  return 'Active'
}

function statusStyle(label: string): { bg: string; text: string; border: string } {
  if (label === 'Active') return { bg: 'var(--teal-light)', text: 'var(--teal)', border: 'var(--teal-border)' }
  if (label === 'In Judging') return { bg: 'var(--amber-light)', text: 'var(--amber)', border: 'var(--amber-border)' }
  if (label === 'Completed') return { bg: 'var(--teal-light)', text: 'var(--teal)', border: 'var(--teal-border)' }
  if (label === 'Cancelled') return { bg: 'var(--coral-light)', text: 'var(--coral)', border: 'var(--coral-border)' }
  return { bg: 'var(--slate-light)', text: 'var(--slate)', border: 'var(--slate-border)' }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface EventCardProps {
  event: OnchainEventInfo
  onClick: () => void
  isNavigating?: boolean
}

export function EventCard({ event: ev, onClick, isNavigating }: EventCardProps) {
  const countdown = useCountdown(ev.submissionDeadline)
  const slabel    = statusLabel(ev)
  const sstyle    = statusStyle(slabel)
  const isExternal = ev.eventType === EventType.ExternalListing
  const prizeUSDC  = ev.totalPrizePool > 0n
    ? formatUnits(ev.totalPrizePool, 6)
    : null

  const accentColor = isExternal ? 'var(--slate)' : 'var(--teal)'

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={isNavigating}
      className="w-full text-left rounded-2xl border overflow-hidden focus-visible:outline-none"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow-card)',
        cursor: isNavigating ? 'wait' : 'pointer',
      }}
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(24,24,27,.10), 0 2px 8px rgba(24,24,27,.06)' }}
      whileFocus={{ boxShadow: '0 0 0 3px rgba(79,70,229,.20)' }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
    >
      {/* Top accent bar */}
      <div className="h-0.5 w-full" style={{ background: accentColor }} aria-hidden="true" />

      <div className="p-5 space-y-3">
        {/* Badges row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Escrow / External badge */}
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border"
            style={{
              background: isExternal ? 'var(--slate-light)' : 'var(--teal-light)',
              color: isExternal ? 'var(--slate)' : 'var(--teal)',
              borderColor: isExternal ? 'var(--slate-border)' : 'var(--teal-border)',
            }}
          >
            {isExternal ? (
              <><ExternalLink size={9} aria-hidden="true" /> External Listing</>
            ) : (
              <><Trophy size={9} aria-hidden="true" /> Verified Escrow</>
            )}
          </span>

          {/* Status badge */}
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border"
            style={{ background: sstyle.bg, color: sstyle.text, borderColor: sstyle.border }}
          >
            {slabel}
          </span>
        </div>

        {/* Title */}
        <div>
          <h3
            className="font-jakarta font-bold text-base leading-snug line-clamp-1"
            style={{ color: 'var(--ink)', letterSpacing: '-0.015em' }}
          >
            {ev.title}
          </h3>
          <p
            className="text-sm mt-1 line-clamp-2 leading-relaxed"
            style={{ color: 'var(--muted)' }}
          >
            {ev.description}
          </p>
        </div>

        {/* Prize pool */}
        {prizeUSDC && (
          <div className="flex items-baseline gap-1.5">
            <span
              className="font-jakarta font-bold text-2xl tabular-nums"
              style={{ color: 'var(--teal)', letterSpacing: '-0.02em' }}
            >
              ${Number(prizeUSDC).toLocaleString()}
            </span>
            <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>USDC prize pool</span>
          </div>
        )}
        {!prizeUSDC && isExternal && (
          <p className="text-sm font-medium" style={{ color: 'var(--subtle)' }}>
            Prize details on external site
          </p>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            {/* Submission count */}
            <span
              className="flex items-center gap-1 text-xs"
              style={{ color: 'var(--muted)' }}
            >
              <Users size={11} aria-hidden="true" />
              {ev.submissionCount} {ev.submissionCount === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          {/* Countdown */}
          {countdown && (
            <span
              className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: countdown.urgent ? 'var(--amber)' : 'var(--muted)' }}
            >
              <Clock size={11} aria-hidden="true" />
              {countdown.label}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  )
}
