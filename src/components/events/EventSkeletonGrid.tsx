export function EventSkeletonGrid() {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      role="status"
      aria-label="Loading events directory"
    >
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200/80 bg-white p-5 flex flex-col justify-between shadow-sm overflow-hidden"
          style={{ minHeight: '340px' }}
        >
          {/* Top badges */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="skeleton h-6 w-24 rounded-full" />
              <div className="skeleton h-6 w-32 rounded-full" />
            </div>

            {/* Host row */}
            <div className="flex items-center gap-2 mb-3">
              <div className="skeleton w-6 h-6 rounded-full" />
              <div className="skeleton h-4 w-28 rounded" />
            </div>

            {/* Title & Tagline */}
            <div className="skeleton h-6 w-4/5 rounded mb-2" />
            <div className="skeleton h-4 w-full rounded mb-1.5" />
            <div className="skeleton h-4 w-2/3 rounded mb-5" />

            {/* Tags */}
            <div className="flex gap-1.5 mb-6">
              <div className="skeleton h-5 w-14 rounded-md" />
              <div className="skeleton h-5 w-16 rounded-md" />
              <div className="skeleton h-5 w-12 rounded-md" />
            </div>
          </div>

          {/* Bottom section: Prize & Footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <div className="skeleton h-3.5 w-16 rounded" />
              <div className="skeleton h-6 w-28 rounded" />
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="skeleton h-4 w-24 rounded" />
              <div className="skeleton h-4 w-20 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
