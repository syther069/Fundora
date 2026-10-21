// GrantFlow — search + status filter toolbar (A2)
import { Search, X } from 'lucide-react'

export type StatusFilter = 'all' | 'open' | 'active' | 'completed' | 'cancelled'

interface Props {
  search: string
  onSearchChange: (v: string) => void
  statusFilter: StatusFilter
  onStatusFilterChange: (v: StatusFilter) => void
  totalCount: number
  filteredCount: number
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all',       label: 'All'       },
  { value: 'open',      label: 'Open'      },
  { value: 'active',    label: 'Active'    },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function GrantsToolbar({
  search, onSearchChange,
  statusFilter, onStatusFilterChange,
  totalCount, filteredCount,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--subtle)' }}
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search grants…"
          aria-label="Search grants by title or description"
          className="w-full h-9 rounded-full border pl-8 pr-8 text-sm outline-none transition-all"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--ink)',
            boxShadow: 'var(--shadow-sm)',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--brand)')}
          onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full btn-focus"
            aria-label="Clear search"
            style={{ color: 'var(--subtle)' }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Status filter pills */}
      <div
        className="flex items-center gap-1 p-1 rounded-full border"
        role="group"
        aria-label="Filter by status"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {STATUS_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onStatusFilterChange(value)}
            className="btn btn-xs btn-focus"
            aria-pressed={statusFilter === value}
            style={{
              background:  statusFilter === value ? 'var(--brand)'  : 'transparent',
              color:       statusFilter === value ? '#fff'           : 'var(--muted)',
              boxShadow:   statusFilter === value ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Count */}
      {(search || statusFilter !== 'all') && (
        <span className="label-caps shrink-0">
          {filteredCount} / {totalCount}
        </span>
      )}
    </div>
  )
}
