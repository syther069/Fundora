/**
 * InlineError — field-level and section-level error display.
 *
 * - Never exposes stack traces, internal codes, or raw API responses.
 * - role="alert" so screen readers announce immediately.
 * - variant="field": small, below an input
 * - variant="section": full-width danger panel
 */

import { AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'

interface InlineErrorProps {
  message: string
  className?: string
  variant?: 'field' | 'section'
}

export function InlineError({ message, className, variant = 'field' }: InlineErrorProps) {
  if (!message) return null

  if (variant === 'section') {
    return (
      <div
        className={clsx('gf-panel gf-panel-danger flex items-start gap-2.5', className)}
        role="alert"
        aria-live="assertive"
      >
        <AlertCircle
          size={15}
          className="shrink-0 mt-0.5"
          style={{ color: 'var(--danger)' }}
          aria-hidden="true"
        />
        <p className="text-sm" style={{ color: 'var(--danger)' }}>
          {message}
        </p>
      </div>
    )
  }

  return (
    <p
      className={clsx('flex items-center gap-1 text-xs mt-1', className)}
      style={{ color: 'var(--danger)' }}
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle size={11} aria-hidden="true" />
      {message}
    </p>
  )
}
