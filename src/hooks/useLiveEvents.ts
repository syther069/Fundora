/**
 * useLiveEvents — reads real events from the FundoraEvents contract on Arc Mainnet.
 * Maps OnchainEventInfo → frontend Event type.
 * Used exclusively in Live mode; Demo mode keeps using MOCK_EVENTS.
 */
import { useReadContract } from 'wagmi'
import { http, createPublicClient } from 'viem'
import { arc } from 'viem/chains'
import { useEffect, useState } from 'react'
import {
  FUNDORA_EVENTS_ABI,
  getFundoraEventsAddress,
  type OnchainEventInfo,
  EventStatus,
} from '../contracts/fundoraEvents'
import { ARC_MAINNET_ID } from '../contracts/fundora'
import type { Event, EventStatus as FrontendStatus, Track, RubricCriterion } from '../types/events'

const MAINNET_ADDRESS = getFundoraEventsAddress(ARC_MAINNET_ID)

// Standalone public client for mainnet reads that bypass the connected wallet's chain.
// This lets Live mode work regardless of which chain the user is connected to.
const mainnetClient = createPublicClient({
  chain: arc,
  transport: http('https://rpc.mainnet.arc.io'),
})

/** Derive a frontend EventStatus label from the onchain status + deadlines */
function deriveStatus(ev: OnchainEventInfo): FrontendStatus {
  const now = Math.floor(Date.now() / 1000)
  if (ev.status === EventStatus.Finalized || ev.status === EventStatus.Cancelled) return 'completed'
  if (ev.status === EventStatus.SubmissionsClosed) return 'judging'
  // Open — check deadlines
  if (ev.submissionDeadline > 0 && now > ev.submissionDeadline) return 'judging'
  if (ev.submissionDeadline > 0 && now < ev.submissionDeadline) {
    // If startDate is in the future we treat as upcoming; otherwise active
    return 'active'
  }
  return 'active'
}

/** Map an onchain event struct to the frontend Event interface */
function mapOnchainEvent(ev: OnchainEventInfo): Event {
  const isExternal = ev.eventType === 1
  return {
    id: ev.id.toString(),
    title: ev.title || 'Untitled Event',
    tagline: ev.description?.slice(0, 120) || '',
    description: ev.description || '',
    category: 'hackathon',          // Contract stores no category — default; enrich via metadata URI later
    modality: isExternal ? 'external_listing' : 'native_escrow',
    status: deriveStatus(ev),
    hostName: `${ev.organizer.slice(0, 6)}…${ev.organizer.slice(-4)}`,
    hostAddress: ev.organizer,
    externalUrl: ev.externalUrl || undefined,
    totalPrizePoolUsdc: ev.totalPrizePool,
    contractAddress: MAINNET_ADDRESS,
    chainId: ARC_MAINNET_ID,
    tags: [],
    startDate: ev.createdAt,
    submissionDeadline: ev.submissionDeadline,
    judgingDeadline: ev.judgingDeadline,
    tracks: [] as Track[],
    rubric: [] as RubricCriterion[],
    submissionsCount: ev.submissionCount,
  }
}

interface LiveEventsResult {
  events: Event[]
  isLoading: boolean
  isError: boolean
  error: string | null
  refetch: () => void
}

export function useLiveEvents(): LiveEventsResult {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      // Reset state at the top of the async function (not the sync effect body)
      if (!cancelled) { setIsLoading(true); setIsError(false); setError(null) }
      if (!MAINNET_ADDRESS || MAINNET_ADDRESS === '0x0000000000000000000000000000000000000000') {
        if (!cancelled) { setEvents([]); setIsLoading(false) }
        return
      }
      try {
        // 1. Read total event count
        const count = await mainnetClient.readContract({
          address: MAINNET_ADDRESS,
          abi: FUNDORA_EVENTS_ABI,
          functionName: 'eventCount',
        })

        if (count === 0n) {
          if (!cancelled) { setEvents([]); setIsLoading(false) }
          return
        }

        // 2. Fetch all events in one batch (cap at 100 to be safe)
        const batchSize = count > 100n ? 100n : count
        const raw = await mainnetClient.readContract({
          address: MAINNET_ADDRESS,
          abi: FUNDORA_EVENTS_ABI,
          functionName: 'getEventsBatch',
          args: [0n, batchSize],
        }) as OnchainEventInfo[]

        if (!cancelled) {
          setEvents(raw.map(mapOnchainEvent))
          setIsLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setIsError(true)
          setError(err instanceof Error ? err.message : 'Failed to load live events')
          setEvents([])
          setIsLoading(false)
        }
      }
    }

    void load()
    return () => { cancelled = true }
  }, [tick])

  return {
    events,
    isLoading,
    isError,
    error,
    refetch: () => setTick((t) => t + 1),
  }
}

// Re-export for components that want the wagmi hook variant (used in hooks that already have a provider)
export function useLiveEventCount() {
  return useReadContract({
    address: MAINNET_ADDRESS,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'eventCount',
  })
}
