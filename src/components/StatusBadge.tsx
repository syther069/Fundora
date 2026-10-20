import { clsx } from 'clsx'
import { Circle, Zap, CheckCircle2, XCircle, Clock, Eye } from 'lucide-react'

// ── Grant status ──────────────────────────────────────────────────────────────
const GRANT_STATUS: Record<number, {
  label: string
  bg: string
  text: string
  border: string
  Icon: React.ElementType
}> = {
  0: {
    label:  'Open',
    bg:     'var(--brand-light)',
    text:   'var(--brand)',
    border: 'var(--brand-border)',
    Icon:   Circle,
  },
  1: {
    label:  'Active',
    bg:     'var(--success-light)',
    text:   'var(--success)',
    border: 'var(--success-border)',
    Icon:   Zap,
  },
  2: {
    label:  'Completed',
    bg:     'var(--success-light)',
    text:   'var(--success)',
    border: 'var(--success-border)',
    Icon:   CheckCircle2,
  },
  3: {
    label:  'Cancelled',
    bg:     'var(--danger-light)',
    text:   'var(--danger)',
    border: 'var(--danger-border)',
    Icon:   XCircle,
  },
}

// ── Milestone status ──────────────────────────────────────────────────────────
const MILESTONE_STATUS: Record<number, {
  label: string
  bg: string
  text: string
  border: string
  Icon: React.ElementType
}> = {
  0: {
    label:  'Pending',
    bg:     'var(--surface-muted)',
    text:   'var(--text-secondary)',
    border: 'var(--border)',
    Icon:   Clock,
  },
  1: {
    label:  'In Review',
    bg:     'var(--warning-light)',
    text:   'var(--warning)',
    border: 'var(--warning-border)',
    Icon:   Eye,
  },
  2: {
    label:  'Approved',
    bg:     'var(--success-light)',
    text:   'var(--success)',
    border: 'var(--success-border)',
    Icon:   CheckCircle2,
  },
  3: {
    label:  'Rejected',
    bg:     'var(--danger-light)',
    text:   'var(--danger)',
    border: 'var(--danger-border)',
    Icon:   XCircle,
  },
}

interface Props {
  type: 'grant' | 'milestone'
  status: number
  className?: string
}

export function StatusBadge({ type, status, className }: Props) {
  const map   = type === 'grant' ? GRANT_STATUS : MILESTONE_STATUS
  const entry = map[status] ?? map[0]
  const { label, bg, text, border, Icon } = entry

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        className,
      )}
      style={{ background: bg, color: text, borderColor: border }}
    >
      <Icon size={10} aria-hidden="true" />
      {label}
    </span>
  )
}
