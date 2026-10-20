// Skeleton matching GrantCard anatomy exactly:
// accent bar (3px) → header row → amount → progress → meta row
export function GrantSkeleton() {
  return (
    <div
      className="gf-card overflow-hidden"
      style={{ background: 'var(--surface)' }}
      aria-hidden="true"
    >
      {/* Accent bar */}
      <div className="gf-accent-bar gf-skeleton" style={{ borderRadius: 0 }} />

      <div className="p-5 space-y-4">
        {/* Title + badge row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="gf-skeleton h-[15px] w-3/4" />
            <div className="gf-skeleton h-[13px] w-full" />
            <div className="gf-skeleton h-[13px] w-2/3" />
          </div>
          <div className="gf-skeleton h-6 w-20 shrink-0" style={{ borderRadius: '9999px' }} />
        </div>

        {/* USDC amount */}
        <div className="gf-skeleton h-[22px] w-32" />

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between gap-2">
            <div className="gf-skeleton h-[11px] w-14" />
            <div className="gf-skeleton h-[11px] w-24" />
          </div>
          <div className="gf-skeleton h-[6px] w-full" style={{ borderRadius: '9999px' }} />
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between">
          <div className="gf-skeleton h-5 w-24" style={{ borderRadius: '9999px' }} />
          <div className="gf-skeleton h-4 w-4" style={{ borderRadius: '9999px' }} />
        </div>
      </div>
    </div>
  )
}
