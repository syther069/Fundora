import React from 'react'
import { clsx } from 'clsx'
import { CheckCircle2, AlertTriangle, XCircle, Info, Circle, Zap, DollarSign } from 'lucide-react'

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'spring' | 'usdc'
export type BadgeSize = 'sm' | 'md'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  icon?: React.ReactNode
  showDefaultIcon?: boolean
}

export function Badge({
  variant = 'neutral',
  size = 'md',
  icon,
  showDefaultIcon = true,
  children,
  className,
  ...props
}: BadgeProps) {
  const defaultIcons: Record<BadgeVariant, React.ReactNode> = {
    success: <CheckCircle2 size={12} className="shrink-0" aria-hidden="true" />,
    warning: <AlertTriangle size={12} className="shrink-0" aria-hidden="true" />,
    danger: <XCircle size={12} className="shrink-0" aria-hidden="true" />,
    info: <Info size={12} className="shrink-0" aria-hidden="true" />,
    neutral: <Circle size={10} className="shrink-0" aria-hidden="true" />,
    spring: <Zap size={12} className="shrink-0" aria-hidden="true" />,
    usdc: <DollarSign size={12} className="shrink-0" aria-hidden="true" />,
  }

  const variantStyles: Record<BadgeVariant, string> = {
    success:
      'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
    warning:
      'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
    danger:
      'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60',
    info:
      'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60',
    neutral:
      'bg-[var(--surface-muted)] text-[var(--muted)] border-[var(--border)] dark:bg-[var(--surface-muted)] dark:text-[var(--ink-2)]',
    spring:
      'bg-[var(--spring-light)] text-[var(--spring)] border-emerald-200 dark:border-emerald-700/50',
    usdc:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',
  }

  const sizeStyles: Record<BadgeSize, string> = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  }

  const displayIcon = icon ?? (showDefaultIcon ? defaultIcons[variant] : null)

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full border tabular-nums select-none shrink-0',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {displayIcon}
      <span>{children}</span>
    </span>
  )
}
