import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement
      document.body.style.overflow = 'hidden'

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      // Focus modal container
      dialogRef.current?.focus()

      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', handleKeyDown)
        previousActiveElement.current?.focus()
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const maxWidthStyles: Record<string, string> = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-2xl',
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={clsx(
          'w-full bg-[var(--surface-elevated)] border-t sm:border border-[var(--border)] sm:rounded-2xl shadow-xl',
          'max-h-[90dvh] flex flex-col overflow-hidden',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          maxWidthStyles[maxWidth],
          className
        )}
      >
        {/* Mobile handle indicator */}
        <div className="w-12 h-1 rounded-full bg-[var(--subtle)]/40 mx-auto mt-2.5 sm:hidden" />

        <div className="p-5 sm:p-6 flex items-start justify-between border-b border-[var(--border)] shrink-0">
          <div>
            {title && (
              <h2
                id="modal-title"
                className="display font-bold text-lg text-[var(--ink)] tracking-tight"
              >
                {title}
              </h2>
            )}
            {description && (
              <p id="modal-description" className="text-xs text-[var(--muted)] mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-colors btn-focus"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null
}
