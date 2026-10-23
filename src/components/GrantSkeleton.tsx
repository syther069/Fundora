// Skeleton card shown while grants are loading, mirroring exact GrantCard geometry
export function GrantSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="rounded-2xl border border-[var(--border)] p-5 space-y-4 animate-pulse bg-[var(--surface-strong)] min-h-[160px] flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 space-y-2">
            <div className="h-4 rounded-full w-3/4 bg-[var(--surface-muted)]" />
            <div className="h-3 rounded-full w-full bg-[var(--surface-muted)]" />
            <div className="h-3 rounded-full w-2/3 bg-[var(--surface-muted)]" />
          </div>
          <div className="h-6 w-16 rounded-full shrink-0 bg-[var(--surface-muted)]" />
        </div>

        <div className="w-24 h-6 rounded-full bg-[var(--surface-muted)] mb-3" />

        <div className="space-y-1.5">
          <div className="flex justify-between">
            <div className="h-3 rounded-full w-20 bg-[var(--surface-muted)]" />
            <div className="h-3 rounded-full w-24 bg-[var(--surface-muted)]" />
          </div>
          <div className="h-2 rounded-full w-full bg-[var(--surface-muted)]" />
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
        <div className="h-3 rounded-full w-28 bg-[var(--surface-muted)]" />
        <div className="h-3 w-12 rounded-full bg-[var(--surface-muted)]" />
      </div>
    </div>
  )
}
