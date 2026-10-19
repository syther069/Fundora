import { formatUnits } from 'viem'
import { ArrowRight, Users, CheckCircle2, CalendarDays } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import type { Grant } from '../hooks/useProofSpring'

function UsdcPill({ amount }: { amount: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 tabular-nums text-xs font-semibold px-2 py-0.5 rounded-full border"
      style={{ background: 'var(--spring-light)', color: 'var(--spring)', borderColor: '#a7f3d0' }}
    >
      <span
        className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-white font-bold"
        style={{ background: 'var(--spring)', fontSize: '8px', lineHeight: 1 }}
        aria-label="USDC"
      >
        $
      </span>
      {amount} USDC
    </span>
  )
}

// C5: format Unix timestamp (bigint seconds) to a short locale date
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
  const total = parseFloat(formatUnits(grant.totalAmount, 6))
  const released = parseFloat(formatUnits(grant.releasedAmount, 6))
  const progressPct = total > 0 ? Math.round((released / total) * 100) : 0
  const noBuilder = grant.builder === '0x0000000000000000000000000000000000000000'
  const createdDate = formatGrantDate(grant.createdAt)

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border p-5 transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 group btn-focus"
      style={{
        background: 'var(--surface-strong)',
        borderColor: 'var(--border)',
        opacity: isNavigating ? 0.6 : 1,
        transform: isNavigating ? 'scale(0.99)' : undefined,
        pointerEvents: isNavigating ? 'none' : undefined,
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="display font-semibold text-base truncate mb-1" style={{ color: 'var(--ink)' }}>
            {grant.title}
          </h3>
          {/* B6: title tooltip shows full description on hover */}
          <p
            className="text-sm line-clamp-2"
            style={{ color: 'var(--muted)' }}
            title={grant.description || undefined}
          >
            {grant.description || 'No description provided.'}
          </p>
        </div>
        <StatusBadge type="grant" status={grant.status} className="shrink-0" />
      </div>

      <div className="mb-3">
        <UsdcPill amount={total.toFixed(2)} />
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--subtle)' }}>
            <span>Released</span>
            <span className="tabular-nums font-medium" style={{ color: 'var(--ink)' }}>
              ${released.toFixed(2)} <span style={{ color: 'var(--muted)' }}>/ ${total.toFixed(2)}</span>
            </span>
          </div>
          {/* B2: accessible progress bar */}
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: 'var(--surface-muted)' }}
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Funding progress"
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progressPct}%`,
                background: progressPct === 100 ? 'var(--success)' : 'var(--spring)',
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--subtle)' }}>
            <CheckCircle2 size={12} aria-hidden="true" />
            {grant.milestoneCount.toString()} milestone{grant.milestoneCount !== 1n ? 's' : ''}
          </span>
          {!noBuilder && (
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--subtle)' }}>
              <Users size={12} aria-hidden="true" />
              Builder assigned
            </span>
          )}
          {/* C5: creation date */}
          {createdDate && (
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--subtle)' }}>
              <CalendarDays size={12} aria-hidden="true" />
              {createdDate}
            </span>
          )}
        </div>
        <ArrowRight
          size={14}
          className="transition-transform group-hover:translate-x-0.5 shrink-0"
          style={{ color: 'var(--accent)' }}
          aria-hidden="true"
        />
      </div>
    </button>
  )
}
