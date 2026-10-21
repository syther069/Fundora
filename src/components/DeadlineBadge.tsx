// GrantFlow — deadline display badge
// Shows relative time to deadline, or "Expired" if past, or nothing if no deadline set.
import { Timer, AlertTriangle } from 'lucide-react'

interface Props {
  deadline: bigint | number | undefined
  className?: string
}

function formatDeadline(deadline: bigint | number): { label: string; expired: boolean } {
  const ts = Number(deadline) * 1000
  const now = Date.now()
  const diff = ts - now

  if (diff <= 0) return { label: 'Deadline passed', expired: true }

  const days  = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff % 86_400_000) / 3_600_000)

  if (days > 30)  return { label: `${Math.floor(days / 30)}mo left`, expired: false }
  if (days >= 1)  return { label: `${days}d left`, expired: false }
  if (hours >= 1) return { label: `${hours}h left`, expired: false }
  return { label: 'Due soon', expired: false }
}

export function DeadlineBadge({ deadline, className = '' }: Props) {
  // 0 or undefined = no deadline
  if (!deadline || BigInt(deadline) === 0n) return null

  const { label, expired } = formatDeadline(deadline)

  return (
    <span
      className={`badge ${className}`}
      style={{
        background: expired ? 'var(--coral-light)'  : 'var(--amber-light)',
        color:      expired ? 'var(--coral)'        : 'var(--amber)',
        borderColor: expired ? 'var(--coral-border)' : 'var(--amber-border)',
      }}
      aria-label={`Deadline: ${label}`}
    >
      {expired
        ? <AlertTriangle size={10} aria-hidden={true} />
        : <Timer size={10} aria-hidden={true} />
      }
      {label}
    </span>
  )
}
