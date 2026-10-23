import React from 'react'
import { FolderOpen, Search, RefreshCw, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from './Button'

export type EmptyStateType = 'first-use' | 'filtered-zero' | 'error'

export interface EmptyStateProps {
  type?: EmptyStateType
  title: string
  description: string
  actionLabel?: string
  actionOutcome?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  icon?: React.ReactNode
  className?: string
}

export function EmptyState({
  type = 'first-use',
  title,
  description,
  actionLabel,
  actionOutcome,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  icon,
  className,
}: EmptyStateProps) {
  const defaultIcons: Record<EmptyStateType, React.ReactNode> = {
    'first-use': <FolderOpen size={24} className="text-[var(--subtle)]" />,
    'filtered-zero': <Search size={24} className="text-[var(--subtle)]" />,
    error: <AlertCircle size={24} className="text-[var(--danger)]" />,
  }

  return (
    <div
      className={clsx(
        'rounded-2xl border border-[var(--border)] p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto bg-[var(--surface-strong)] shadow-2xs',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-[var(--surface-muted)] text-[var(--ink)]">
        {icon ?? defaultIcons[type]}
      </div>

      <h3 className="display font-bold text-lg text-[var(--ink)] mb-1">
        {title}
      </h3>
      <p className="text-sm text-[var(--muted)] leading-relaxed max-w-sm mb-6">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full justify-center">
          {actionLabel && onAction && (
            <Button
              variant="primary"
              size="md"
              onClick={onAction}
              actionOutcome={{
                action: actionLabel,
                outcome: actionOutcome,
              }}
            />
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <Button
              variant="secondary"
              size="md"
              onClick={onSecondaryAction}
              leftIcon={<RefreshCw size={14} />}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
