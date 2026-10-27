import { memo } from 'react'
import { Search, X, SlidersHorizontal, Trophy, Sparkles, ExternalLink, Filter } from 'lucide-react'
import type { CategoryFilter, StatusFilter, SortOption } from '../../types/events'

interface ToolbarProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  categoryFilter: CategoryFilter
  onCategoryChange: (cat: CategoryFilter) => void
  statusFilter: StatusFilter
  onStatusChange: (status: StatusFilter) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  counts: {
    all: number
    hackathons: number
    contests: number
    external: number
  }
  statusCounts: {
    all: number
    active: number
    judging: number
    completed: number
    upcoming: number
  }
  totalMatches: number
  onResetFilters: () => void
}

export const EventDirectoryToolbar = memo(function EventDirectoryToolbar({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
  counts,
  statusCounts,
  totalMatches,
  onResetFilters,
}: ToolbarProps) {
  const isFiltered = categoryFilter !== 'all' || statusFilter !== 'all' || searchQuery.trim().length > 0

  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Search & Sort Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-lg">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by event, track, technology, or host..."
            aria-label="Search events"
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-midnight placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
              aria-label="Clear search query"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <SlidersHorizontal size={14} className="text-slate-400 hidden xs:block" aria-hidden="true" />
          <span className="text-xs font-medium text-slate-500 hidden sm:inline">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            aria-label="Sort events by"
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-midnight hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand shadow-sm cursor-pointer"
          >
            <option value="prize-desc">Prize Pool: High to Low</option>
            <option value="deadline-asc">Deadline: Soonest</option>
            <option value="recent">Recently Added</option>
          </select>
        </div>
      </div>

      {/* Category Tabs Row */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-3 overflow-x-auto tab-scroll-container">
        <div className="flex items-center gap-2" role="tablist" aria-label="Filter events by category">
          {/* All */}
          <button
            role="tab"
            aria-selected={categoryFilter === 'all'}
            onClick={() => onCategoryChange('all')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand ${
              categoryFilter === 'all'
                ? 'bg-midnight text-white shadow-sm'
                : 'text-slate-600 hover:text-midnight hover:bg-slate-100'
            }`}
          >
            All Events
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                categoryFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {counts.all}
            </span>
          </button>

          {/* Hackathons */}
          <button
            role="tab"
            aria-selected={categoryFilter === 'hackathon'}
            onClick={() => onCategoryChange('hackathon')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand ${
              categoryFilter === 'hackathon'
                ? 'bg-midnight text-white shadow-sm'
                : 'text-slate-600 hover:text-midnight hover:bg-slate-100'
            }`}
          >
            <Trophy size={13} className={categoryFilter === 'hackathon' ? 'text-amber-400' : 'text-slate-400'} />
            Hackathons
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                categoryFilter === 'hackathon' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {counts.hackathons}
            </span>
          </button>

          {/* Contests */}
          <button
            role="tab"
            aria-selected={categoryFilter === 'contest'}
            onClick={() => onCategoryChange('contest')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand ${
              categoryFilter === 'contest'
                ? 'bg-midnight text-white shadow-sm'
                : 'text-slate-600 hover:text-midnight hover:bg-slate-100'
            }`}
          >
            <Sparkles size={13} className={categoryFilter === 'contest' ? 'text-teal-300' : 'text-slate-400'} />
            Creative Contests
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                categoryFilter === 'contest' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {counts.contests}
            </span>
          </button>

          {/* External */}
          <button
            role="tab"
            aria-selected={categoryFilter === 'external'}
            onClick={() => onCategoryChange('external')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand ${
              categoryFilter === 'external'
                ? 'bg-midnight text-white shadow-sm'
                : 'text-slate-600 hover:text-midnight hover:bg-slate-100'
            }`}
          >
            <ExternalLink size={12} className={categoryFilter === 'external' ? 'text-mist' : 'text-slate-400'} />
            External Listed
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                categoryFilter === 'external' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {counts.external}
            </span>
          </button>
        </div>

        {/* Reset Filter Button if active */}
        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="text-xs font-medium text-slate-500 hover:text-coral transition-colors flex items-center gap-1 shrink-0"
            aria-label="Clear active filters"
          >
            <X size={12} />
            Reset ({totalMatches} found)
          </button>
        )}
      </div>

      {/* Secondary Status Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 uppercase tracking-wider mr-1">
          <Filter size={11} /> Status:
        </span>

        {[
          { id: 'all', label: 'All Statuses', count: statusCounts.all },
          { id: 'active', label: 'Active Submissions', count: statusCounts.active },
          { id: 'judging', label: 'In Judging', count: statusCounts.judging },
          { id: 'completed', label: 'Completed', count: statusCounts.completed },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => onStatusChange(s.id as StatusFilter)}
            className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
              statusFilter === s.id
                ? 'bg-brand-light text-brand border border-brand-border font-semibold shadow-xs'
                : 'text-slate-500 hover:bg-slate-100 border border-transparent'
            }`}
          >
            {s.label} ({s.count})
          </button>
        ))}
      </div>
    </div>
  )
})
