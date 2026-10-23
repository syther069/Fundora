import React, { forwardRef } from 'react'
import { clsx } from 'clsx'

export type CardVariant = 'default' | 'interactive' | 'elevated' | 'glass'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  padding?: CardPadding
  as?: React.ElementType
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', as: Component = 'div', className, children, ...props }, ref) => {
    const baseStyles = 'rounded-2xl transition-all duration-200 border text-[var(--ink)]'

    const variantStyles: Record<CardVariant, string> = {
      default: 'bg-[var(--surface-strong)] border-[var(--border)] shadow-2xs',
      interactive:
        'bg-[var(--surface-strong)] border-[var(--border)] hover:border-[var(--border-strong)] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer btn-focus',
      elevated: 'bg-[var(--surface-elevated)] border-[var(--border)] shadow-md',
      glass: 'bg-[var(--surface)] backdrop-blur-md border-[var(--border)] shadow-sm',
    }

    const paddingStyles: Record<CardPadding, string> = {
      none: 'p-0',
      sm: 'p-3 sm:p-4',
      md: 'p-5 sm:p-6',
      lg: 'p-6 sm:p-8',
    }

    return (
      <Component
        ref={ref}
        className={clsx(baseStyles, variantStyles[variant], paddingStyles[padding], className)}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Card.displayName = 'Card'
