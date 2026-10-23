import { clsx } from 'clsx'
import { Circle, Zap, CheckCircle2, XCircle, Clock, Eye } from 'lucide-react'

// WCAG 1.4.1: each status gets a leading icon so meaning isn't conveyed by color alone
const GRANT_STATUS: Record<number, { label: string; color: string; Icon: React.ElementType }> = {
  0: {
    label: 'Open',
    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',
    Icon: Circle,
  },
  1: {
    label: 'Active',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
    Icon: Zap,
  },
  2: {
    label: 'Completed',
    color: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800/60',
    Icon: CheckCircle2,
  },
  3: {
    label: 'Cancelled',
    color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60',
    Icon: XCircle,
  },
}

const MILESTONE_STATUS: Record<number, { label: string; color: string; Icon: React.ElementType }> = {
  0: {
    label: 'Pending',
    color: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700',
    Icon: Clock,
  },
  1: {
    label: 'In Review',
    color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
    Icon: Eye,
  },
  2: {
    label: 'Approved',
    color: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800/60',
    Icon: CheckCircle2,
  },
  3: {
    label: 'Rejected',
    color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60',
    Icon: XCircle,
  },
}

interface Props {
  type: 'grant' | 'milestone'
  status: number
  className?: string
}

export function StatusBadge({ type, status, className }: Props) {
  const map = type === 'grant' ? GRANT_STATUS : MILESTONE_STATUS
  const entry = map[status] ?? map[0]
  const { label, color, Icon } = entry

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border tabular-nums select-none shrink-0',
        color,
        className
      )}
    >
      <Icon size={11} aria-hidden="true" />
      <span>{label}</span>
    </span>
  )
}
