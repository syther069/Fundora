// GrantFlow — warm filled status badges with Lucide icons (colour + icon, never colour alone)
import { motion, useReducedMotion } from 'framer-motion'
import type { LucideProps } from 'lucide-react'
import { Circle, Zap, CheckCircle2, XCircle, Clock, Eye } from 'lucide-react'
import type { ForwardRefExoticComponent, RefAttributes } from 'react'

interface Props {
  type: 'grant' | 'milestone'
  status: number
  className?: string
}

// Grant statuses: 0=Open, 1=Active, 2=Completed, 3=Cancelled
// Milestone statuses: 0=Pending, 1=SubmittedForReview, 2=Approved, 3=Rejected

type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>

type Config = {
  label: string
  bg: string
  color: string
  border: string
  Icon: LucideIcon
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
  const shouldReduce = useReducedMotion()

  return (
    // key={status} re-triggers the entrance animation on status change (MOTION_GUIDELINES §4.4)
    <motion.span
      key={status}
      initial={{ scale: shouldReduce ? 1 : 0.92, opacity: 0.7 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`badge ${className}`}
      style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
      aria-label={`Status: ${cfg.label}`}
    >
      <Icon size={10} aria-hidden={true} />
      {cfg.label}
    </motion.span>
  )
}
