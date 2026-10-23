import React, { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  helperText?: string
  actionOutcome?: {
    action: string
    outcome?: string
  }
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      helperText,
      actionOutcome,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading

    const baseStyles =
      'relative inline-flex flex-col items-center justify-center font-medium transition-all duration-150 btn-focus interactive-press rounded-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none text-center'

    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'min-h-[40px] px-3 py-1.5 text-xs',
      md: 'min-h-[44px] px-4 py-2 text-sm',
      lg: 'min-h-[52px] px-6 py-3 text-base font-semibold',
    }

    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-[#122d45] text-white hover:bg-[#1061a6] active:bg-[#0c4b82] dark:bg-[#34d399] dark:text-[#0b131e] dark:hover:bg-[#22c55e] shadow-sm hover:shadow',
      secondary:
        'bg-[var(--surface-strong)] text-[var(--ink)] border border-[var(--border)] hover:bg-[var(--surface-muted)] hover:border-[var(--border-strong)] shadow-2xs',
      ghost:
        'bg-transparent text-[var(--ink)] hover:bg-[var(--surface-muted)] active:bg-[var(--surface-muted)]',
      danger:
        'bg-[#ba2b4c] text-white hover:bg-[#991b36] active:bg-[#7f1d2f] dark:bg-[#f87171] dark:text-[#0b131e] dark:hover:bg-[#ef4444] shadow-sm',
    }

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={clsx(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        <span className="inline-flex items-center gap-2 justify-center w-full">
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin shrink-0" aria-hidden="true" />
              <span>{loadingText || 'Processing…'}</span>
            </>
          ) : (
            <>
              {leftIcon && <span className="shrink-0">{leftIcon}</span>}
              {actionOutcome ? (
                <span className="inline-flex items-baseline gap-1.5">
                  <span className="font-semibold">{actionOutcome.action}</span>
                  {actionOutcome.outcome && (
                    <span className="opacity-80 text-xs font-normal">
                      — {actionOutcome.outcome}
                    </span>
                  )}
                </span>
              ) : (
                children
              )}
              {rightIcon && <span className="shrink-0">{rightIcon}</span>}
            </>
          )}
        </span>
        {helperText && !isLoading && (
          <span className="text-[11px] font-normal opacity-70 mt-0.5 tracking-normal">
            {helperText}
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
