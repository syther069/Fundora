import { clsx } from 'clsx'
import { Circle, Zap, CheckCircle2, XCircle, Clock, Eye } from 'lucide-react'

// B1: each status gets a leading icon so meaning isn't conveyed by color alone
const GRANT_STATUS: Record<number, { label: string; color: string; Icon: React.ElementType }> = {
  0: { label: 'Open',      color: 'bg-blue-50 text-blue-700 border-blue-200',      Icon: Circle },
  1: { label: 'Active',    color: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: Zap },
  2: { label: 'Completed', color: 'bg-green-50 text-green-800 border-green-200',   Icon: CheckCircle2 },
  3: { label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200',         Icon: XCircle },
}

const MILESTONE_STATUS: Record<number, { label: string; color: string; Icon: React.ElementType }> = {
  0: { label: 'Pending',     color: 'bg-slate-50 text-slate-600 border-slate-200',  Icon: Clock },
  1: { label: 'In Review',   color: 'bg-amber-50 text-amber-700 border-amber-200',  Icon: Eye },
  2: { label: 'Approved',    color: 'bg-green-50 text-green-800 border-green-200',  Icon: CheckCircle2 },
  3: { label: 'Rejected',    color: 'bg-red-50 text-red-700 border-red-200',        Icon: XCircle },
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
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border tabular-nums',
        color,
        className,
      )}
    >
      <Icon size={10} aria-hidden="true" />
      {label}
    </span>
  )
}
