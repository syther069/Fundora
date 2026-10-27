import { useState, useEffect } from 'react'
import { formatUnits } from 'viem'
import { Trophy, ExternalLink, Clock, ArrowLeft, Users, Calendar } from 'lucide-react'
import { EventType, EventStatus, type OnchainEventInfo } from '../contracts/fundoraEvents'

function Countdown({ deadlineSecs }: { deadlineSecs: number }) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000))

  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 10_000)
    return () => clearInterval(id)
  }, [])

  if (deadlineSecs === 0) return null
  const diff = deadlineSecs - now
  if (diff <= 0) return (
    <span className="flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--coral)' }}>
      <Clock size={13} aria-hidden="true" /> Submissions closed
    </span>
  )

  const days  = Math.floor(diff / 86400)
  const hours = Math.floor((diff % 86400) / 3600)
  const mins  = Math.floor((diff % 3600) / 60)
  const label = days > 0 ? `${days}d ${hours}h remaining` : `${hours}h ${mins}m remaining`
  const urgent = days <= 3

  return (
    <span
      className="flex items-center gap-1 text-sm font-semibold"
      style={{ color: urgent ? 'var(--amber)' : 'var(--muted)' }}
    >
      <Clock size={13} aria-hidden="true" />
      {label}
    </span>
  )
}

interface EventHeroProps {
  event: OnchainEventInfo
  onBack: () => void
}

export function EventHero({ event: ev, onBack }: EventHeroProps) {
  const isExternal = ev.eventType === EventType.ExternalListing
  const prizeUSDC  = ev.totalPrizePool > 0n
    ? formatUnits(ev.totalPrizePool, 6)
    : null

  const statusLabel = (() => {
    if (ev.status === EventStatus.Cancelled) return { text: 'Cancelled', bg: 'var(--coral-light)', color: 'var(--coral)', border: 'var(--coral-border)' }
    if (ev.status === EventStatus.Finalized) return { text: 'Completed', bg: 'var(--teal-light)', color: 'var(--teal)', border: 'var(--teal-border)' }
    if (ev.status === EventStatus.SubmissionsClosed) return { text: 'In Judging', bg: 'var(--amber-light)', color: 'var(--amber)', border: 'var(--amber-border)' }
    return { text: 'Active', bg: 'var(--teal-light)', color: 'var(--teal)', border: 'var(--teal-border)' }
  })()

  const createdDate = new Date(ev.createdAt * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* Gradient hero band */}
      <div
        className="h-2"
        style={{
          background: isExternal
            ? 'linear-gradient(90deg, #64748b 0%, #94a3b8 100%)'
            : 'linear-gradient(90deg, #0f766e 0%, #6366f1 60%, #d97706 100%)',
        }}
        aria-hidden="true"
      />

      <div className="p-6 sm:p-8 space-y-5">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold transition-colors focus-visible:outline-none hover:opacity-70"
          style={{ color: 'var(--muted)' }}
          aria-label="Back to events"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          All Events
        </button>

        {/* Title + badges */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border"
              style={{
                background: isExternal ? 'var(--slate-light)' : 'var(--teal-light)',
                color: isExternal ? 'var(--slate)' : 'var(--teal)',
                borderColor: isExternal ? 'var(--slate-border)' : 'var(--teal-border)',
              }}
            >
              {isExternal ? <><ExternalLink size={10} aria-hidden="true" /> External Listing</> : <><Trophy size={10} aria-hidden="true" /> Arc Verified Escrow</>}
            </span>
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border"
              style={{ background: statusLabel.bg, color: statusLabel.color, borderColor: statusLabel.border }}
            >
              {statusLabel.text}
            </span>
          </div>

          <h1
            className="font-jakarta font-extrabold text-2xl sm:text-3xl"
            style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}
          >
            {ev.title}
          </h1>

          <p className="text-sm leading-relaxed max-w-2xl" style={{ color: 'var(--muted)' }}>
            {ev.description}
          </p>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-x-6 gap-y-3 pt-1">
          {prizeUSDC && (
            <div>
              <div
                className="font-jakarta font-extrabold text-3xl tabular-nums"
                style={{ color: 'var(--teal)', letterSpacing: '-0.03em' }}
              >
                ${Number(prizeUSDC).toLocaleString()}
                <span className="text-base font-semibold ml-1.5" style={{ color: 'var(--muted)' }}>USDC</span>
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>Prize pool locked in escrow</div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5" style={{ color: 'var(--ink)' }}>
              <Users size={14} aria-hidden="true" style={{ color: 'var(--muted)' }} />
              <span className="font-jakarta font-bold text-xl tabular-nums">{ev.submissionCount}</span>
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>{ev.submissionCount === 1 ? 'Entry' : 'Entries'}</div>
          </div>

          <div>
            <div className="flex items-center gap-1.5" style={{ color: 'var(--ink)' }}>
              <Calendar size={14} aria-hidden="true" style={{ color: 'var(--muted)' }} />
              <span className="font-jakarta font-bold text-sm">{createdDate}</span>
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>Created</div>
          </div>
        </div>

        {/* Countdown + CTA */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          {ev.submissionDeadline > 0 && (
            <Countdown deadlineSecs={ev.submissionDeadline} />
          )}

          {isExternal && ev.externalUrl && (
            <a
              href={ev.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full transition-all focus-visible:outline-none"
              style={{ background: 'var(--brand)', color: '#fff' }}
            >
              <ExternalLink size={13} aria-hidden="true" />
              View on External Site
            </a>
          )}
        </div>

        {/* Escrow trust note */}
        {!isExternal && (
          <p className="text-xs" style={{ color: 'var(--subtle)' }}>
            For your security, rewards are held in escrow on Arc and claimed directly by your wallet — eliminating risks of third-party transfer failures.
          </p>
        )}
        {isExternal && (
          <p className="text-xs" style={{ color: 'var(--subtle)' }}>
            External Event: applications and prizes are governed by the host organization. Fundora is not responsible for external event operations.
          </p>
        )}
      </div>
    </div>
  )
}
