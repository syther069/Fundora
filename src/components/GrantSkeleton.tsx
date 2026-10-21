// Skeleton card matching new GrantCard proportions

export function GrantSkeleton() {
  return (
    <div className="card rounded-2xl overflow-hidden" aria-hidden="true">
      {/* Accent bar */}
      <div className="h-1.5 skeleton" />

      <div className="p-5">
        {/* Title + badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 space-y-2">
            <div className="skeleton h-5 w-3/4 rounded-md" />
            <div className="skeleton h-3.5 w-full rounded-md" />
            <div className="skeleton h-3.5 w-2/3 rounded-md" />
          </div>
          <div className="skeleton h-6 w-20 rounded-full shrink-0" />
        </div>

        {/* Amount */}
        <div className="skeleton h-8 w-28 rounded-md mb-4" />

        {/* Progress bar */}
        <div className="skeleton h-1.5 w-full rounded-full mb-1" />
        <div className="flex justify-between">
          <div className="skeleton h-3 w-16 rounded-md" />
          <div className="skeleton h-3 w-24 rounded-md" />
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between mt-4 pt-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div className="skeleton h-3.5 w-20 rounded-md" />
            <div className="skeleton h-3.5 w-28 rounded-md" />
          </div>
          <div className="skeleton h-3.5 w-16 rounded-md" />
        </div>
      </div>
    </div>
  )
}
