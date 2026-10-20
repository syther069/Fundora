import { formatUnits } from 'viem'
import { ArrowRight, Layers } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { DeadlineBadge } from './DeadlineBadge'
import type { Grant } from '../hooks/useProofSpring'

// Accent bar colour per grant status
const STATUS_ACCENT: Record<number, string> = {
  0: '#6366f1', // Open — brand indigo
  1: '#0d9488', // Active — teal
  2: '#0d9488', // Completed — teal
  3: '#e11d48', // Cancelled — coral
}

function formatGrantDate(createdAt: bigint): string {
  if (!createdAt || createdAt === 0n) return ''
  try {
    return new Date(Number(createdAt) * 1000).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  } catch { return '' }
}

function UsdcAmount({ amount }: { amount: string }) {
  return (
    <div className="flex items-baseline gap-1">
      <span
        className="font-jakarta font-bold text-2xl tabular-nums"
        style={{ color: 'var(--teal)', letterSpacing: '-0.02em' }}
      >
        {amount}
      </span>
      <span className="text-xs font-semibold" style={{ color: 'var(--teal)' }}>USDC</span>
    </div>
  )
}

interface Props {
  grant: Grant
  onClick: () => void
  isNavigating?: boolean
}

export function GrantCard({ grant, onClick, isNavigating }: Props) {
  // Bigint arithmetic first, then format once — no float arithmetic on money paths
  const totalAmt    = BigInt(grant.totalAmount)
  const releasedAmt = BigInt(grant.releasedAmount)
  const totalStr    = formatUnits(totalAmt, 6)
  const releasedStr = formatUnits(releasedAmt, 6)
  const total       = parseFloat(totalStr)
  const released    = parseFloat(releasedStr)
  const progressPct = totalAmt > 0n ? Math.round(Number((releasedAmt * 100n) / totalAmt)) : 0
  const noBuilder  = grant.builder === '0x0000000000000000000000000000000000000000'
  const createdDate = formatGrantDate(grant.createdAt)
  const accentColor = STATUS_ACCENT[grant.status] ?? '#6366f1'

  return (
    <button
      onClick={onClick}
      className="w-full text-left card card-interactive rounded-2xl overflow-hidden group btn-focus"
      style={{
        opacity: isNavigating ? 0.6 : 1,
        transform: isNavigating ? 'scale(0.98)' : undefined,
        pointerEvents: isNavigating ? 'none' : undefined,
      }}
      aria-label={`View grant: ${grant.title}`}
    >
      {/* Coloured accent bar at top */}
      <div
        className="h-1.5 w-full"
        style={{ background: accentColor }}
        aria-hidden="true"
      />

      <div className="p-5">
        {/* Header row: title + status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3
              className="font-jakarta font-bold text-base truncate mb-1"
              style={{ color: 'var(--ink)', letterSpacing: '-0.015em' }}
            >
              {grant.title}
            </h3>
            <p
              className="text-sm line-clamp-2 leading-relaxed"
              style={{ color: 'var(--muted)' }}
              title={grant.description || undefined}
            >
              {grant.description || 'No description provided.'}
            </p>
          </div>
          <StatusBadge type="grant" status={grant.status} className="shrink-0 mt-0.5" />
        </div>

        {/* USDC amount — prominent */}
        <UsdcAmount amount={parseFloat(totalStr).toFixed(2)} />

        {/* Progress bar */}
        {total > 0 && (
          <div className="mt-3 mb-1">
            <div
              className="progress-track"
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Funding progress"
            >
              <div
                className="progress-fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="label-caps">{progressPct}% released</span>
              <span className="label-caps">{parseFloat(releasedStr).toFixed(0)} / {parseFloat(totalStr).toFixed(0)} USDC</span>
            </div>
          </div>
        )}

        {/* Footer: milestones + builder + date */}
        <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            {/* Milestone count */}
            <span
              className="inline-flex items-center gap-1 text-xs font-medium"
              style={{ color: 'var(--muted)' }}
            >
              <Layers size={12} aria-hidden="true" />
              {Number(grant.milestoneCount)} milestone{Number(grant.milestoneCount) !== 1 ? 's' : ''}
            </span>

            {/* Builder status */}
            <span
              className="inline-flex items-center gap-1 text-xs font-medium"
              style={{ color: noBuilder ? 'var(--amber)' : 'var(--teal)' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: noBuilder ? 'var(--amber)' : 'var(--teal)' }}
                aria-hidden="true"
              />
              {noBuilder ? 'Seeking builder' : 'Builder assigned'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <DeadlineBadge deadline={grant.deadline} />
            {createdDate && (
              <span className="text-xs" style={{ color: 'var(--subtle)' }}>{createdDate}</span>
            )}
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
              style={{ color: 'var(--subtle)' }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </button>
  )
}
