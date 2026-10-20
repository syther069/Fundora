/**
 * EmptyState — reusable empty / zero-data state.
 *
 * Always explains:
 *   1. What is empty (title)
 *   2. Why it is empty (body) — when known
 *   3. What the user can do next (action) — when applicable
 *
 * Never invents data to fill empty space.
 */

import { clsx } from 'clsx'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  body?: string
  action?: React.ReactNode
  className?: string
  compact?: boolean
}

export function EmptyState({ icon, title, body, action, className, compact }: EmptyStateProps) {
  return (
    <div
      className={clsx(
        'gf-card flex flex-col items-center justify-center text-center',
        compact ? 'py-8 px-6' : 'py-14 px-8',
        className,
      )}
      role="status"
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
        style={{ background: 'var(--surface-raised)' }}
        aria-hidden="true"
      >
        {icon}
      </div>
      <p
        className="t-h3 mb-1"
        style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
      >
        {title}
      </p>
      {body && (
        <p className="t-body text-sm max-w-xs mt-1">
          {body}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
