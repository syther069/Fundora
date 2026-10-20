// GrantFlow — warm filled status badges for all grant + milestone states

interface Props {
  type: 'grant' | 'milestone'
  status: number
  className?: string
}

// Grant statuses (from Solidity enum):
// 0 = Open, 1 = Active, 2 = Completed, 3 = Cancelled
// Milestone statuses:
// 0 = Pending, 1 = SubmittedForReview, 2 = Approved, 3 = Rejected

const GRANT_CONFIGS: Record<number, { label: string; bg: string; color: string; border: string; dot: string }> = {
  0: { label: 'Open',      bg: 'var(--brand-light)',  color: 'var(--brand)',  border: 'var(--brand-border)', dot: '#6366f1' },
  1: { label: 'Active',    bg: 'var(--teal-light)',   color: 'var(--teal)',   border: 'var(--teal-border)',  dot: '#0d9488' },
  2: { label: 'Completed', bg: 'var(--teal-light)',   color: 'var(--teal)',   border: 'var(--teal-border)',  dot: '#0d9488' },
  3: { label: 'Cancelled', bg: 'var(--coral-light)',  color: 'var(--coral)',  border: 'var(--coral-border)', dot: '#e11d48' },
}

const MILESTONE_CONFIGS: Record<number, { label: string; bg: string; color: string; border: string; dot: string }> = {
  0: { label: 'Pending',     bg: 'var(--warm-bg-2)',    color: 'var(--muted)',  border: 'var(--border)',       dot: '#a8a29e' },
  1: { label: 'In Review',   bg: 'var(--amber-light)',  color: 'var(--amber)',  border: 'var(--amber-border)', dot: '#d97706' },
  2: { label: 'Approved',    bg: 'var(--teal-light)',   color: 'var(--teal)',   border: 'var(--teal-border)',  dot: '#0d9488' },
  3: { label: 'Rejected',    bg: 'var(--coral-light)',  color: 'var(--coral)',  border: 'var(--coral-border)', dot: '#e11d48' },
}

export function StatusBadge({ type, status, className = '' }: Props) {
  const configs = type === 'grant' ? GRANT_CONFIGS : MILESTONE_CONFIGS
  const cfg = configs[status] ?? {
    label: 'Unknown',
    bg: 'var(--warm-bg-2)',
    color: 'var(--muted)',
    border: 'var(--border)',
    dot: '#a8a29e',
  }

  return (
    <span
      className={`badge ${className}`}
      style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
      aria-label={`Status: ${cfg.label}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: cfg.dot }}
        aria-hidden="true"
      />
      {cfg.label}
    </span>
  )
}
