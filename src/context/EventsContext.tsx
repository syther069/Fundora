import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'
import type { Event, Submission, CategoryFilter, StatusFilter, SortOption } from '../types/events'
import { MOCK_EVENTS, MOCK_SUBMISSIONS } from '../data/mockEvents'

interface EventsContextValue {
  events: Event[]
  activeEventId: string | null
  setActiveEventId: (id: string | null) => void
  activeEvent: Event | undefined
  submissions: Record<string, Submission[]>
  getSubmissionsForEvent: (eventId: string) => Submission[]
  addSubmission: (submission: Submission) => void
  addEvent: (event: Event) => void
  isLoading: boolean
  error: string | null
  categoryFilter: CategoryFilter
  setCategoryFilter: (cat: CategoryFilter) => void
  statusFilter: StatusFilter
  setStatusFilter: (stat: StatusFilter) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  sortBy: SortOption
  setSortBy: (sort: SortOption) => void
  filteredEvents: Event[]
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
  resetFilters: () => void
}

const EventsContext = createContext<EventsContextValue | null>(null)

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS)
  const [submissions, setSubmissions] = useState<Record<string, Submission[]>>(MOCK_SUBMISSIONS)
  const [activeEventId, setActiveEventId] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('prize-desc')
  const [isLoading] = useState(false)
  const [error] = useState<string | null>(null)

  const addSubmission = (newSub: Submission) => {
    setSubmissions((prev) => {
      const existing = prev[newSub.eventId] || []
      return {
        ...prev,
        [newSub.eventId]: [newSub, ...existing],
      }
    })
    // Also increment event's submissionCount
    setEvents((prev) =>
      prev.map((e) =>
        e.id === newSub.eventId ? { ...e, submissionsCount: e.submissionsCount + 1 } : e
      )
    )
  }

  const addEvent = (newEvent: Event) => {
    setEvents((prev) => [newEvent, ...prev])
  }

  const activeEvent = useMemo(() => {
    if (!activeEventId) return undefined
    return events.find((e) => e.id === activeEventId)
  }, [events, activeEventId])

  const getSubmissionsForEvent = (eventId: string): Submission[] => {
    return submissions[eventId] || []
  }

  // Precomputed category counts
  const counts = useMemo(() => {
    return {
      all: events.length,
      hackathons: events.filter((e) => e.category === 'hackathon' && e.modality === 'native_escrow').length,
      contests: events.filter((e) => e.category === 'contest' && e.modality === 'native_escrow').length,
      external: events.filter((e) => e.modality === 'external_listing').length,
    }
  }, [events])

  // Precomputed status counts
  const statusCounts = useMemo(() => {
    return {
      all: events.length,
      active: events.filter((e) => e.status === 'active').length,
      judging: events.filter((e) => e.status === 'judging').length,
      completed: events.filter((e) => e.status === 'completed').length,
      upcoming: events.filter((e) => e.status === 'upcoming').length,
    }
  }, [events])

  // Filter & sort logic
  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => {
        // Category filtering
        if (categoryFilter === 'hackathon') {
          if (event.category !== 'hackathon' || event.modality !== 'native_escrow') return false
        } else if (categoryFilter === 'contest') {
          if (event.category !== 'contest' || event.modality !== 'native_escrow') return false
        } else if (categoryFilter === 'external') {
          if (event.modality !== 'external_listing') return false
        }

        // Status filtering
        if (statusFilter !== 'all') {
          if (event.status !== statusFilter) return false
        }

        // Search filtering (title, tagline, hostName, tags)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim()
          const matchesTitle = event.title.toLowerCase().includes(q)
          const matchesTagline = event.tagline.toLowerCase().includes(q)
          const matchesHost = event.hostName.toLowerCase().includes(q)
          const matchesTags = event.tags.some((t) => t.toLowerCase().includes(q))
          if (!matchesTitle && !matchesTagline && !matchesHost && !matchesTags) return false
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'prize-desc') {
          return b.totalPrizePoolUsdc > a.totalPrizePoolUsdc ? 1 : -1
        }
        if (sortBy === 'deadline-asc') {
          return a.submissionDeadline - b.submissionDeadline
        }
        if (sortBy === 'recent') {
          return b.startDate - a.startDate
        }
        return 0
      })
  }, [events, categoryFilter, statusFilter, searchQuery, sortBy])

  const resetFilters = () => {
    setCategoryFilter('all')
    setStatusFilter('all')
    setSearchQuery('')
    setSortBy('prize-desc')
  }

  return (
    <EventsContext.Provider
      value={{
        events,
        activeEventId,
        setActiveEventId,
        activeEvent,
        submissions,
        getSubmissionsForEvent,
        addSubmission,
        addEvent,
        isLoading,
        error,
        categoryFilter,
        setCategoryFilter,
        statusFilter,
        setStatusFilter,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        filteredEvents,
        counts,
        statusCounts,
        resetFilters,
      }}
    >
      {children}
    </EventsContext.Provider>
  )
}

export function useEvents() {
  const context = useContext(EventsContext)
  if (!context) {
    throw new Error('useEvents must be used within an EventsProvider')
  }
  return context
}
