import { formatUnits } from 'viem'
import { ArrowRight, Users, CheckCircle2, CalendarDays, Clock, AlertTriangle } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import type { Grant } from '../hooks/useProofSpring'

function UsdcPill({ amount }: { amount: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 tabular-nums text-xs font-semibold px-2.5 py-1 rounded-full border shadow-2xs"
      style={{
        background: 'var(--spring-light)',
        color: 'var(--spring)',
        borderColor: 'rgba(52, 211, 153, 0.4)',
      }}
    >
      <span
        className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-white font-bold bg-[var(--spring)]"
        style={{ fontSize: '9px', lineHeight: 1 }}
        aria-label="USDC"
      >
        $
      </span>
      <span>{amount} USDC</span>
    </span>
  )
}

function formatGrantDate(createdAt: bigint): string {
  if (!createdAt || createdAt === 0n) return ''
  try {
    return new Date(Number(createdAt) * 1000).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

function getDeadlineStatus(deadline: bigint): { text: string; isExpired: boolean; isUrgent: boolean } | null {
  if (!deadline || deadline === 0n) return null
  const now = Math.floor(Date.now() / 1000)
  const diffSec = Number(deadline) - now
  if (diffSec <= 0) {
    return { text: 'Expired', isExpired: true, isUrgent: false }
  }
  const days = Math.floor(diffSec / 86400)
  const hours = Math.floor((diffSec % 86400) / 3600)
  if (days > 1) {
    return { text: `${days}d left`, isExpired: false, isUrgent: false }
  }
  if (days === 1) {
    return { text: '1d left', isExpired: false, isUrgent: true }
  }
  return { text: hours > 0 ? `${hours}h left` : '<1h left', isExpired: false, isUrgent: true }
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
  const deadlineStatus = getDeadlineStatus(grant.deadline)

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border border-[var(--border)] p-5 transition-all duration-200 bg-[var(--surface-strong)] hover:border-[var(--border-strong)] hover:shadow-md hover:-translate-y-1 active:translate-y-0 group btn-focus min-h-[160px] flex flex-col justify-between"
      style={{
        opacity: isNavigating ? 0.6 : 1,
        transform: isNavigating ? 'scale(0.99)' : undefined,
        pointerEvents: isNavigating ? 'none' : undefined,
      }}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="display font-semibold text-base truncate mb-1 text-[var(--ink)]">
              {grant.title}
            </h3>
            <p
              className="text-xs sm:text-sm line-clamp-2 text-[var(--muted)]"
              title={grant.description || undefined}
            >
              {grant.description || 'No description provided.'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <StatusBadge type="grant" status={grant.status} />
            {deadlineStatus && (
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  deadlineStatus.isExpired
                    ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                    : deadlineStatus.isUrgent
                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 animate-pulse'
                    : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700'
                }`}
              >
                {deadlineStatus.isExpired ? (
                  <AlertTriangle size={10} className="shrink-0" />
                ) : (
                  <Clock size={10} className="shrink-0" />
                )}
                {deadlineStatus.text}
              </span>
            )}
          </div>
        </div>

        <div className="mb-3.5">
          <UsdcPill amount={total.toFixed(2)} />
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1.5 text-[var(--subtle)]">
              <span>Funding progress</span>
              <span className="tabular-nums font-semibold text-[var(--ink)]">
                ${released.toFixed(2)}{' '}
                <span className="text-[var(--muted)] font-normal">/ ${total.toFixed(2)}</span>
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden bg-[var(--surface-muted)]"
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Funding progress"
            >
              <div
                className="h-full rounded-full transition-all duration-300 bg-[var(--spring)]"
                style={{
                  width: `${progressPct}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-[var(--subtle)]">
            <CheckCircle2 size={12} aria-hidden="true" />
            {grant.milestoneCount.toString()} milestone{grant.milestoneCount !== 1n ? 's' : ''}
          </span>
          {!noBuilder && (
            <span className="flex items-center gap-1 text-xs text-[var(--subtle)]">
              <Users size={12} aria-hidden="true" />
              Builder assigned
            </span>
          )}
          {createdDate && (
            <span className="hidden sm:flex items-center gap-1 text-xs text-[var(--subtle)]">
              <CalendarDays size={12} aria-hidden="true" />
              {createdDate}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-[var(--accent)] group-hover:text-[var(--spring)] transition-colors">
          <span>View</span>
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-1 shrink-0"
            aria-hidden="true"
          />
        </div>
      </div>
    </button>
  )
}
