import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import { useReadContract } from 'wagmi'
import {
  FUNDORA_EVENTS_ADDRESS,
  FUNDORA_EVENTS_ABI,
  EventType,
  EventStatus,
  type OnchainEventInfo,
} from '../contracts/fundoraEvents'

// ── Filter / sort types ───────────────────────────────────────────────────────

export type CategoryFilter = 'all' | 'hackathons' | 'contests' | 'external'
export type StatusFilter = 'all' | 'active' | 'judging' | 'completed' | 'upcoming'
export type SortOption = 'prizePool' | 'deadline' | 'recent'

// ── Context shape ─────────────────────────────────────────────────────────────

interface EventsContextValue {
  events: OnchainEventInfo[]
  filteredEvents: OnchainEventInfo[]
  isLoading: boolean
  isError: boolean
  refetch: () => void

  // Filters & sort
  categoryFilter: CategoryFilter
  setCategoryFilter: (f: CategoryFilter) => void
  statusFilter: StatusFilter
  setStatusFilter: (f: StatusFilter) => void
  sortBy: SortOption
  setSortBy: (s: SortOption) => void
  search: string
  setSearch: (s: string) => void
}

const EventsContext = createContext<EventsContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────

const BATCH_SIZE = 50

export function EventsProvider({ children }: { children: ReactNode }) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [search, setSearch] = useState('')

  // Fetch event count
  const { data: eventCount, refetch: refetchCount } = useReadContract({
    address: FUNDORA_EVENTS_ADDRESS,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'eventCount',
  })

  // Fetch first batch (offset 0, limit BATCH_SIZE)
  const {
    data: batchData,
    isLoading,
    isError,
    refetch: refetchBatch,
  } = useReadContract({
    address: FUNDORA_EVENTS_ADDRESS,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'getEventsBatch',
    args: [0n, BigInt(BATCH_SIZE)],
    query: {
      enabled: eventCount !== undefined && (eventCount as bigint) > 0n,
    },
  })

  const refetch = useCallback(() => {
    void refetchCount()
    void refetchBatch()
  }, [refetchCount, refetchBatch])

  // Normalise raw tuple array into typed objects
  const events = useMemo<OnchainEventInfo[]>(() => {
    if (!batchData) return []
    return (batchData as OnchainEventInfo[]).map((ev) => ({
      id: ev.id,
      title: ev.title,
      description: ev.description,
      externalUrl: ev.externalUrl,
      eventType: ev.eventType,
      status: ev.status,
      organizer: ev.organizer,
      totalPrizePool: ev.totalPrizePool,
      allocatedPrizePool: ev.allocatedPrizePool,
      submissionDeadline: Number(ev.submissionDeadline),
      judgingDeadline: Number(ev.judgingDeadline),
      submissionCount: Number(ev.submissionCount),
      reviewerCount: Number(ev.reviewerCount),
      createdAt: Number(ev.createdAt),
    }))
  }, [batchData])

  // ── Current time (refreshed every 30s so deadline filters stay live) ─────
  const [nowSecs, setNowSecs] = useState(() => Math.floor(Date.now() / 1000))
  useEffect(() => {
    const id = setInterval(() => setNowSecs(Math.floor(Date.now() / 1000)), 30_000)
    return () => clearInterval(id)
  }, [])

  // ── Filter + sort pipeline ────────────────────────────────────────────────

  const filteredEvents = useMemo(() => {
    const now = nowSecs

    let result = events.filter((ev) => {
      // Category filter
      if (categoryFilter !== 'all') {
        if (categoryFilter === 'external' && ev.eventType !== EventType.ExternalListing) return false
        if (categoryFilter !== 'external' && ev.eventType !== EventType.NativeEscrow) return false
        // hackathons vs contests are both NativeEscrow — distinguish by title keyword for now
        if (categoryFilter === 'hackathons' && !ev.title.toLowerCase().includes('hack')) return false
        if (categoryFilter === 'contests' && ev.title.toLowerCase().includes('hack')) return false
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'active') {
          if (ev.status !== EventStatus.Open) return false
          if (ev.submissionDeadline !== 0 && ev.submissionDeadline < now) return false
        }
        if (statusFilter === 'judging') {
          if (ev.status !== EventStatus.SubmissionsClosed) return false
        }
        if (statusFilter === 'completed') {
          if (ev.status !== EventStatus.Finalized) return false
        }
        if (statusFilter === 'upcoming') {
          if (ev.status !== EventStatus.Open) return false
          if (ev.submissionDeadline === 0 || ev.submissionDeadline > now) {
            // open with a future deadline — treat as upcoming only if not yet started
            // (all open events without a past deadline are upcoming)
          } else {
            return false
          }
        }
      }

      // Search
      if (search) {
        const q = search.toLowerCase()
        if (!ev.title.toLowerCase().includes(q) && !ev.description.toLowerCase().includes(q)) {
          return false
        }
      }

      return true
    })

    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === 'prizePool') {
        // Descending by prize pool
        if (b.totalPrizePool > a.totalPrizePool) return 1
        if (b.totalPrizePool < a.totalPrizePool) return -1
        return 0
      }
      if (sortBy === 'deadline') {
        // Ascending by submission deadline (soonest first); 0 = no deadline, goes last
        if (a.submissionDeadline === 0 && b.submissionDeadline === 0) return 0
        if (a.submissionDeadline === 0) return 1
        if (b.submissionDeadline === 0) return -1
        return a.submissionDeadline - b.submissionDeadline
      }
      // recent: descending by createdAt
      return b.createdAt - a.createdAt
    })

    return result
  }, [events, categoryFilter, statusFilter, sortBy, search, nowSecs])

  return (
    <EventsContext.Provider
      value={{
        events,
        filteredEvents,
        isLoading: isLoading && events.length === 0,
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
      }}
    >
      {children}
    </EventsContext.Provider>
  )
}

export function useEventsContext() {
  const ctx = useContext(EventsContext)
  if (!ctx) throw new Error('useEventsContext must be used within EventsProvider')
  return ctx
}
