// Fix 12: skeleton card shown while grants are loading
export function GrantSkeleton() {
  return (
    <div
      className="rounded-2xl border p-5 space-y-4 animate-pulse"
      style={{ background: 'var(--surface-strong)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 rounded-full w-3/4" style={{ background: 'var(--surface-muted)' }} />
          <div className="h-3 rounded-full w-full" style={{ background: 'var(--surface-muted)' }} />
          <div className="h-3 rounded-full w-2/3" style={{ background: 'var(--surface-muted)' }} />
        </div>
        <div className="h-5 w-16 rounded-full shrink-0" style={{ background: 'var(--surface-muted)' }} />
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <div className="h-3 rounded-full w-16" style={{ background: 'var(--surface-muted)' }} />
          <div className="h-3 rounded-full w-24" style={{ background: 'var(--surface-muted)' }} />
        </div>
        <div className="h-1.5 rounded-full w-full" style={{ background: 'var(--surface-muted)' }} />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-3 rounded-full w-28" style={{ background: 'var(--surface-muted)' }} />
        <div className="h-3 w-3 rounded-full" style={{ background: 'var(--surface-muted)' }} />
      </div>
    </div>
  )
}
