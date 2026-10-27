export function EventSkeleton() {
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
      aria-busy="true"
      aria-label="Loading event"
    >
      {/* Accent bar */}
      <div className="h-0.5 w-full animate-pulse" style={{ background: 'var(--surface-overlay)' }} />

      <div className="p-5 space-y-3">
        {/* Badges */}
        <div className="flex gap-2">
          <div className="h-5 w-28 rounded-full animate-pulse" style={{ background: 'var(--surface-overlay)' }} />
          <div className="h-5 w-16 rounded-full animate-pulse" style={{ background: 'var(--surface-overlay)' }} />
        </div>

        {/* Title + description */}
        <div className="space-y-2">
          <div className="h-5 w-3/4 rounded-lg animate-pulse" style={{ background: 'var(--surface-overlay)' }} />
          <div className="h-4 w-full rounded-lg animate-pulse" style={{ background: 'var(--surface-overlay)' }} />
          <div className="h-4 w-5/6 rounded-lg animate-pulse" style={{ background: 'var(--surface-overlay)' }} />
        </div>

        {/* Prize */}
        <div className="h-8 w-32 rounded-lg animate-pulse" style={{ background: 'var(--surface-overlay)' }} />

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <div className="h-4 w-20 rounded animate-pulse" style={{ background: 'var(--surface-overlay)' }} />
          <div className="h-4 w-24 rounded animate-pulse" style={{ background: 'var(--surface-overlay)' }} />
        </div>
      </div>
    </div>
  )
}
