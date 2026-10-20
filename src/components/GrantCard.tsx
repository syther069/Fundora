import { formatUnits } from 'viem'
import { ArrowRight, CheckCircle2, Users, CalendarDays } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import type { Grant } from '../hooks/useProofSpring'

// Accent bar colour per grant status
const ACCENT_COLOR: Record<number, string> = {
  0: 'var(--brand)',    // Open — indigo
  1: 'var(--success)',  // Active — teal
  2: 'var(--success)',  // Completed — teal
  3: 'var(--danger)',   // Cancelled — rose
}

function formatGrantDate(createdAt: bigint): string {
  if (!createdAt || createdAt === 0n) return ''
  try {
    return new Date(Number(createdAt) * 1000).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  } catch {
    return ''
  }
}

interface Props {
  grant: Grant
  onClick: () => void
  isNavigating?: boolean
}

export function GrantCard({ grant, onClick, isNavigating }: Props) {
  const total       = parseFloat(formatUnits(grant.totalAmount, 6))
  const released    = parseFloat(formatUnits(grant.releasedAmount, 6))
  const progressPct = total > 0 ? Math.round((released / total) * 100) : 0
  const noBuilder   = grant.builder === '0x0000000000000000000000000000000000000000'
  const createdDate = formatGrantDate(grant.createdAt)
  const accentColor = ACCENT_COLOR[grant.status] ?? ACCENT_COLOR[0]

  return (
    <button
      onClick={onClick}
      className="gf-card gf-focus w-full text-left group transition-all duration-200"
      style={{
        opacity:       isNavigating ? 0.6 : 1,
        transform:     isNavigating ? 'scale(0.985)' : undefined,
        pointerEvents: isNavigating ? 'none' : undefined,
      }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-hover)'
        ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-card)'
        ;(e.currentTarget as HTMLButtonElement).style.transform = isNavigating ? 'scale(0.985)' : ''
      }}
    >
      {/* Status accent bar */}
      <div
        className="gf-accent-bar"
        style={{ background: accentColor }}
        aria-hidden="true"
      />

      <div className="p-5 space-y-4">
        {/* Title + status badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="t-h3 truncate mb-1">{grant.title}</h3>
            <p
              className="t-body text-sm line-clamp-2 leading-relaxed"
              title={grant.description || undefined}
            >
              {grant.description || 'No description provided.'}
            </p>
          </div>
          <StatusBadge type="grant" status={grant.status} className="shrink-0 mt-0.5" />
        </div>

        {/* USDC amount */}
        <div className="flex items-baseline gap-1">
          <span className="t-amount t-amount-md">
            ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs font-semibold" style={{ color: 'var(--success)', opacity: 0.65 }}>
            USDC
          </span>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
            <span>Released</span>
            <span className="tabular-nums font-medium" style={{ color: 'var(--text-primary)' }}>
              ${released.toFixed(2)}{' '}
              <span style={{ color: 'var(--text-tertiary)' }}>/ ${total.toFixed(2)}</span>
            </span>
          </div>
          <div
            className="gf-progress-track"
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Funding progress"
          >
            <div className="gf-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Footer meta row */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Milestone count pill */}
            <span
              className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}
            >
              <CheckCircle2 size={11} aria-hidden="true" />
              {grant.milestoneCount.toString()} milestone{grant.milestoneCount !== 1n ? 's' : ''}
            </span>
            {!noBuilder && (
              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                <Users size={11} aria-hidden="true" />
                Builder assigned
              </span>
            )}
            {createdDate && (
              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                <CalendarDays size={11} aria-hidden="true" />
                {createdDate}
              </span>
            )}
          </div>
          <ArrowRight
            size={14}
            className="transition-transform duration-200 group-hover:translate-x-1 shrink-0"
            style={{ color: 'var(--brand)' }}
            aria-hidden="true"
          />
        </div>
      </div>
    </button>
  )
}
