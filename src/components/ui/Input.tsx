import React, { forwardRef, useId } from 'react'
import { clsx } from 'clsx'
import { AlertCircle } from 'lucide-react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  errorText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  containerClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      errorText,
      leftIcon,
      rightIcon,
      id: customId,
      className,
      containerClassName,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const inputId = customId || generatedId
    const helperId = `${inputId}-helper`
    const errorId = `${inputId}-error`

    return (
      <div className={clsx('w-full flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold tracking-wide text-[var(--ink)] flex items-center justify-between"
          >
            <span>
              {label}
              {required && <span className="text-[var(--danger)] ml-0.5">*</span>}
            </span>
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 pointer-events-none text-[var(--subtle)] flex items-center justify-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={!!errorText}
            aria-describedby={
              errorText ? errorId : helperText ? helperId : undefined
            }
            className={clsx(
              'w-full min-h-[44px] rounded-xl px-3.5 text-base sm:text-sm bg-[var(--surface-strong)] text-[var(--ink)] border transition-all duration-150 btn-focus',
              'placeholder:text-[var(--subtle)] disabled:opacity-50 disabled:cursor-not-allowed',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              errorText
                ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-1 focus:ring-[var(--danger)]'
                : 'border-[var(--border)] focus:border-[var(--focus)] hover:border-[var(--border-strong)]',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 pointer-events-none text-[var(--subtle)] flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>

        {errorText && (
          <p id={errorId} role="alert" className="text-xs text-[var(--danger)] flex items-center gap-1 mt-0.5 font-medium">
            <AlertCircle size={13} className="shrink-0" />
            <span>{errorText}</span>
          </p>
        )}

        {helperText && !errorText && (
          <p id={helperId} className="text-xs text-[var(--muted)] mt-0.5">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
