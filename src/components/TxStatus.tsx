/**
 * TxStatus — reusable transaction state display.
 *
 * Covers the 4 real states of an onchain write:
 *   idle       → nothing shown
 *   pending    → wallet prompt open (spinner + label)
 *   confirming → submitted, awaiting block (spinner + label)
 *   confirmed  → block confirmed (success row + explorer link)
 *
 * Never reports success before isConfirmed is true.
 * Never fabricates progress or percentages.
 * Explorer link only rendered when a real hash exists.
 */

import { Loader2, CheckCircle2, ExternalLink } from 'lucide-react'

interface TxStatusProps {
  /** Wallet signature pending (wallet prompt open) */
  isPending: boolean
  /** Submitted to network, waiting for block confirmation */
  isConfirming: boolean
  /** Block-confirmed receipt arrived — safe to show success */
  isConfirmed: boolean
  /** Transaction hash — only rendered when it actually exists */
  hash: `0x${string}` | undefined
  /** Explorer base URL for the chain */
  explorerUrl: string
  /** Label overrides */
  labels?: {
    pending?:    string
    confirming?: string
    confirmed?:  string
  }
}

export function TxStatus({
  isPending,
  isConfirming,
  isConfirmed,
  hash,
  explorerUrl,
  labels = {},
}: TxStatusProps) {
  const {
    pending    = 'Confirm in wallet…',
    confirming = 'Waiting for block confirmation…',
    confirmed  = 'Transaction confirmed',
  } = labels

  if (!isPending && !isConfirming && !isConfirmed) return null

  return (
    <div className="space-y-1 mt-2" role="status" aria-live="polite">
      {(isPending || isConfirming) && (
        <div
          className="flex items-center gap-2 text-xs"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Loader2 size={12} className="animate-spin shrink-0" aria-hidden="true" />
          {isPending ? pending : confirming}
        </div>
      )}

      {isConfirmed && (
        <div
          className="flex items-center gap-2 text-xs font-medium"
          style={{ color: 'var(--success)' }}
        >
          <CheckCircle2 size={12} aria-hidden="true" />
          {confirmed}
        </div>
      )}

      {hash && (
        <a
          href={`${explorerUrl}/tx/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs gf-focus rounded"
          style={{ color: 'var(--brand)' }}
          aria-label={`View transaction on explorer`}
        >
          <ExternalLink size={10} aria-hidden="true" />
          {isConfirmed ? 'View on explorer' : 'Track pending transaction'}
        </a>
      )}
    </div>
  )
}

/**
 * TxButton — button that:
 * - shows spinner while pending/confirming (prevents duplicate submissions)
 * - shows optional confirmed-dwell label after success
 * - is disabled while busy or when disabled prop is set
 */
interface TxButtonProps {
  onClick: () => void
  disabled?: boolean
  isPending: boolean
  isConfirming: boolean
  isConfirmed?: boolean
  label: string
  pendingLabel?:    string
  confirmingLabel?: string
  confirmedLabel?:  string
  className?: string
  style?: React.CSSProperties
  'aria-label'?: string
  icon?: React.ReactNode
}

export function TxButton({
  onClick,
  disabled,
  isPending,
  isConfirming,
  isConfirmed = false,
  label,
  pendingLabel    = 'Confirm in wallet…',
  confirmingLabel = 'Confirming…',
  confirmedLabel,
  className = 'gf-btn gf-btn-primary gf-focus w-full',
  style,
  'aria-label': ariaLabel,
  icon,
}: TxButtonProps) {
  const busy = isPending || isConfirming

  const currentLabel = busy
    ? (isPending ? pendingLabel : confirmingLabel)
    : isConfirmed && confirmedLabel
    ? confirmedLabel
    : label

  return (
    <button
      onClick={onClick}
      disabled={disabled || busy}
      className={className}
      style={style}
      aria-label={ariaLabel}
      aria-busy={busy}
    >
      {busy && <Loader2 size={14} className="animate-spin shrink-0" aria-hidden="true" />}
      {!busy && icon}
      {currentLabel}
    </button>
  )
}
