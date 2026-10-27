import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, Trophy, Sprout } from 'lucide-react'
import { EventCard } from './EventCard'
import { EventSkeleton } from './EventSkeleton'
import { useEventsContext, type CategoryFilter, type StatusFilter, type SortOption } from '../context/EventsContext'
import type { OnchainEventInfo } from '../contracts/fundoraEvents'

interface EventsDirectoryProps {
  onSelectEvent: (ev: OnchainEventInfo) => void
}

const CATEGORY_TABS: { value: CategoryFilter; label: string }[] = [
  { value: 'all',       label: 'All Events' },
  { value: 'hackathons', label: 'Hackathons' },
  { value: 'contests',  label: 'Contests' },
  { value: 'external',  label: 'External' },
]

const STATUS_PILLS: { value: StatusFilter; label: string }[] = [
  { value: 'all',       label: 'All Status' },
  { value: 'active',    label: 'Active' },
  { value: 'judging',   label: 'In Judging' },
  { value: 'completed', label: 'Completed' },
  { value: 'upcoming',  label: 'Upcoming' },
]

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recent',    label: 'Recently Added' },
  { value: 'prizePool', label: 'Prize Pool' },
  { value: 'deadline',  label: 'Deadline' },
]

export function EventsDirectory({ onSelectEvent }: EventsDirectoryProps) {
  const {
    events,
    filteredEvents,
    isLoading,
    isError,
    refetch,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    search,
    setSearch,
  } = useEventsContext()

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1
          className="font-jakarta font-extrabold text-2xl mb-1"
          style={{ color: 'var(--ink)', letterSpacing: '-0.025em' }}
        >
          Hackathons & Contests
        </h1>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Compete for USDC prizes, get scored by reviewers, and claim rewards onchain.
        </p>
      </div>

      {/* Search + sort bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--subtle)' }}
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search events…"
            className="w-full h-10 pl-9 pr-4 rounded-xl border text-sm focus:outline-none"
            style={{
              background: 'var(--surface-overlay)',
              borderColor: 'var(--border)',
              color: 'var(--ink)',
            }}
            aria-label="Search events"
          />
        </div>

        {/* Sort */}
        <div className="relative flex items-center gap-1.5">
          <SlidersHorizontal size={13} style={{ color: 'var(--subtle)' }} aria-hidden="true" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
            className="h-10 pl-2 pr-8 rounded-xl border text-sm appearance-none focus:outline-none"
            style={{
              background: 'var(--surface-overlay)',
              borderColor: 'var(--border)',
              color: 'var(--ink)',
            }}
            aria-label="Sort events"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Category tabs */}
      <div
        className="flex gap-1 border-b overflow-x-auto pb-0 no-scrollbar"
        role="tablist"
        aria-label="Event categories"
        style={{ borderColor: 'var(--border)' }}
      >
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={categoryFilter === tab.value}
            onClick={() => setCategoryFilter(tab.value)}
            className="relative shrink-0 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors focus-visible:outline-none"
            style={{
              color: categoryFilter === tab.value ? 'var(--brand)' : 'var(--muted)',
              borderBottom: categoryFilter === tab.value ? '2px solid var(--brand)' : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {STATUS_PILLS.map(pill => {
          const active = statusFilter === pill.value
          return (
            <button
              key={pill.value}
              onClick={() => setStatusFilter(pill.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all focus-visible:outline-none"
              style={active ? {
                background: 'var(--brand)',
                color: '#fff',
                borderColor: 'var(--brand)',
              } : {
                background: 'var(--surface-overlay)',
                color: 'var(--muted)',
                borderColor: 'var(--border)',
              }}
              aria-pressed={active}
            >
              {pill.label}
            </button>
          )
        })}
      </div>

      {/* Error state */}
      {isError && (
        <div
          className="rounded-2xl border p-8 text-center space-y-3"
          style={{ background: 'var(--coral-light)', borderColor: 'var(--coral-border)' }}
          role="alert"
        >
          <p className="font-jakarta font-bold text-base" style={{ color: 'var(--ink)' }}>
            Could not load events
          </p>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            A network error occurred. Check your connection and try again.
          </p>
          <button
            onClick={refetch}
            className="btn btn-focus text-sm font-semibold px-4 py-2 rounded-xl border transition-all"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--ink)' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Skeleton grid */}
      {!isError && isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => <EventSkeleton key={i} />)}
        </div>
      )}

      {/* Empty — no events on chain */}
      {!isError && !isLoading && events.length === 0 && (
        <div className="rounded-2xl border p-12 text-center space-y-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: 'var(--brand-light)' }}
          >
            <Trophy size={24} style={{ color: 'var(--brand)' }} aria-hidden="true" />
          </div>
          <div>
            <p className="font-jakarta font-bold text-lg mb-1" style={{ color: 'var(--ink)' }}>
              No events yet
            </p>
            <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--muted)' }}>
              The first hackathon or contest will appear here once an organizer creates one.
            </p>
          </div>
        </div>
      )}

      {/* Empty — filter returned nothing */}
      {!isError && !isLoading && events.length > 0 && filteredEvents.length === 0 && (
        <div className="rounded-2xl border p-10 text-center space-y-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <Sprout size={28} style={{ color: 'var(--subtle)' }} className="mx-auto" />
          <p className="font-jakarta font-bold text-base" style={{ color: 'var(--ink)' }}>
            No events match your filters
          </p>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Try a different category, status, or search term.</p>
          <button
            onClick={() => { setSearch(''); setCategoryFilter('all'); setStatusFilter('all') }}
            className="text-sm font-semibold px-4 py-2 rounded-xl border transition-all focus-visible:outline-none"
            style={{ background: 'var(--surface-overlay)', borderColor: 'var(--border)', color: 'var(--brand)' }}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Events grid */}
      <AnimatePresence mode="wait">
        {!isError && !isLoading && filteredEvents.length > 0 && (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredEvents.map(ev => (
              <EventCard
                key={ev.id.toString()}
                event={ev}
                onClick={() => onSelectEvent(ev)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
