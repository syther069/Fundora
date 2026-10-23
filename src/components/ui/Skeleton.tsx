import React from 'react'
import { clsx } from 'clsx'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  width?: string | number
  height?: string | number
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  className,
  style,
  ...props
}: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-[var(--surface-muted)] shrink-0'

  const variantStyles: Record<string, string> = {
    text: 'h-4 w-full rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
    card: 'w-full h-44 rounded-2xl border border-[var(--border)]',
  }

  const customStyle: React.CSSProperties = {
    ...style,
    width: width !== undefined ? width : undefined,
    height: height !== undefined ? height : undefined,
  }

  return (
    <div
      aria-hidden="true"
      className={clsx(baseStyles, variantStyles[variant], className)}
      style={customStyle}
      {...props}
    />
  )
}
