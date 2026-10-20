// GrantFlow — warm filled status badges with Lucide icons (colour + icon, never colour alone)
import { Circle, Zap, CheckCircle2, XCircle, Clock, Eye } from 'lucide-react'

interface Props {
  type: 'grant' | 'milestone'
  status: number
  className?: string
}

// Grant statuses: 0=Open, 1=Active, 2=Completed, 3=Cancelled
// Milestone statuses: 0=Pending, 1=SubmittedForReview, 2=Approved, 3=Rejected

type Config = {
  label: string
  bg: string
  color: string
  border: string
  Icon: React.FC<{ size?: number; 'aria-hidden'?: boolean }>
}

const GRANT_CONFIGS: Record<number, Config> = {
  0: { label: 'Open',      bg: 'var(--brand-light)',  color: 'var(--brand)',  border: 'var(--brand-border)', Icon: Circle       },
  1: { label: 'Active',    bg: 'var(--teal-light)',   color: 'var(--teal)',   border: 'var(--teal-border)',  Icon: Zap          },
  2: { label: 'Completed', bg: 'var(--teal-light)',   color: 'var(--teal)',   border: 'var(--teal-border)',  Icon: CheckCircle2 },
  3: { label: 'Cancelled', bg: 'var(--coral-light)',  color: 'var(--coral)',  border: 'var(--coral-border)', Icon: XCircle      },
}

const MILESTONE_CONFIGS: Record<number, Config> = {
  0: { label: 'Pending',       bg: 'var(--warm-bg-2)',   color: 'var(--muted)',  border: 'var(--border)',       Icon: Clock        },
  1: { label: 'In Review',     bg: 'var(--amber-light)', color: 'var(--amber)',  border: 'var(--amber-border)', Icon: Eye          },
  2: { label: 'Approved',      bg: 'var(--teal-light)',  color: 'var(--teal)',   border: 'var(--teal-border)',  Icon: CheckCircle2 },
  3: { label: 'Rejected',      bg: 'var(--coral-light)', color: 'var(--coral)',  border: 'var(--coral-border)', Icon: XCircle      },
}

const FALLBACK: Config = {
  label: 'Unknown',
  bg: 'var(--warm-bg-2)',
  color: 'var(--muted)',
  border: 'var(--border)',
  Icon: Circle,
}

export function StatusBadge({ type, status, className = '' }: Props) {
  const configs = type === 'grant' ? GRANT_CONFIGS : MILESTONE_CONFIGS
  const cfg = configs[status] ?? FALLBACK
  const { Icon } = cfg

  return (
    <span
      className={`badge ${className}`}
      style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
      aria-label={`Status: ${cfg.label}`}
    >
      <Icon size={10} aria-hidden={true} />
      {cfg.label}
    </span>
  )
}
