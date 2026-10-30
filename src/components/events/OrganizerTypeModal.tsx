import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, Trophy } from 'lucide-react'

interface OrganizerTypeModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (category: 'hackathon' | 'contest') => void
}

const choices = [
  {
    id: 'hackathon' as const,
    label: 'Organize a Hackathon',
    icon: Zap,
    desc: 'Multi-track build sprint with USDC prize escrow. Teams compete to build the best project in a fixed time window.',
    accent: 'var(--brand)',
    accentLight: 'var(--brand-light)',
    accentBorder: 'var(--brand-border)',
  },
  {
    id: 'contest' as const,
    label: 'Organize a Contest',
    icon: Trophy,
    desc: 'Single-track submission challenge or design competition. Award prizes to standout entries.',
    accent: 'var(--teal)',
    accentLight: 'var(--teal-light)',
    accentBorder: 'var(--teal-border)',
  },
]

export function OrganizerTypeModal({ isOpen, onClose, onSelect }: OrganizerTypeModalProps) {
  const firstCardRef = useRef<HTMLButtonElement>(null)

  // Focus first card on open; Escape to close
  useEffect(() => {
    if (!isOpen) return
    const frame = requestAnimationFrame(() => firstCardRef.current?.focus())
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKey)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="type-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,34,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="type-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="org-type-title"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', stiffness: 460, damping: 36 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-lg rounded-3xl border overflow-hidden"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              {/* Header accent bar */}
              <div
                className="h-1"
                style={{ background: 'linear-gradient(90deg, #1A3F75 0%, #0F766E 100%)' }}
                aria-hidden="true"
              />

              <div className="p-6 sm:p-7">
                {/* Title row */}
                <div className="flex items-start justify-between gap-3 mb-6">
                  <div>
                    <h2
                      id="org-type-title"
                      className="font-jakarta font-extrabold text-xl tracking-tight"
                      style={{ color: 'var(--midnight)', letterSpacing: '-0.02em' }}
                    >
                      What would you like to organize?
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                      Choose the format that best fits your event.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    aria-label="Close"
                  >
                    <X size={16} style={{ color: 'var(--muted)' }} />
                  </button>
                </div>

                {/* Choice cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {choices.map(({ id, label, icon: Icon, desc, accent, accentLight, accentBorder }, idx) => (
                    <button
                      key={id}
                      ref={idx === 0 ? firstCardRef : undefined}
                      onClick={() => onSelect(id)}
                      className="group text-left rounded-2xl border p-5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand hover:shadow-md"
                      style={{
                        background: 'var(--warm-bg)',
                        borderColor: 'var(--border)',
                      }}
                      onMouseEnter={e => {
                        ;(e.currentTarget).style.borderColor = accentBorder
                        ;(e.currentTarget).style.background = accentLight
                      }}
                      onMouseLeave={e => {
                        ;(e.currentTarget).style.borderColor = 'var(--border)'
                        ;(e.currentTarget).style.background = 'var(--warm-bg)'
                      }}
                    >
                      <span
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                        style={{ background: accentLight, color: accent }}
                        aria-hidden="true"
                      >
                        <Icon size={18} />
                      </span>
                      <div
                        className="font-jakarta font-bold text-sm mb-1.5"
                        style={{ color: 'var(--midnight)' }}
                      >
                        {label}
                      </div>
                      <div className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                        {desc}
                      </div>
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-center mt-5" style={{ color: 'var(--muted)' }}>
                  All events enter{' '}
                  <span className="font-semibold" style={{ color: 'var(--ink)' }}>
                    pending review
                  </span>{' '}
                  before going live. You&apos;ll be notified at your contact email.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
