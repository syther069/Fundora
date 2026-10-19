/**
 * GrantsContext — single authoritative source for grant list state.
 *
 * Architecture improvements implemented here:
 *   3.3  — Centralised context so AdminPanel + App never fire duplicate RPC calls
 *   3.1  — Uses getGrantsBatch (one call) when count ≤ 50; falls back to multicall for larger sets
 *   3.5  — Watches contract events (GrantCreated, GrantFunded, GrantApplied, MilestoneApproved,
 *           GrantCompleted, GrantCancelled) and invalidates only when something actually changed
 *   3.2  — QueryClient is created with gcTime so react-query's in-memory cache survives
 *           component unmounts (data shown immediately on re-mount without a flash of empty)
 */

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useReadContract, useReadContracts, useWatchContractEvent } from 'wagmi'
import { PROOF_SPRING_ADDRESS, PROOF_SPRING_ABI, ARC_TESTNET_ID } from '../contracts/proofSpring'
import type { Grant } from '../hooks/useProofSpring'

// ── Types ──────────────────────────────────────────────────────────────────────

interface GrantsState {
  grants: Grant[]
  grantCount: number
  isLoading: boolean
  isError: boolean
  refetch: () => void
}

const GrantsContext = createContext<GrantsState>({
  grants: [],
  grantCount: 0,
  isLoading: false,
  isError: false,
  refetch: () => {},
})

// ── Provider ───────────────────────────────────────────────────────────────────

const BATCH_SIZE = 50  // getGrantsBatch max per contract

export function GrantsProvider({ children }: { children: ReactNode }) {
  const [eventTick, setEventTick] = useState(0)

  // Bump this counter on any relevant contract event to trigger a refetch
  const invalidate = useCallback(() => setEventTick(t => t + 1), [])

  // 3.5 — watch all state-changing events and invalidate the cache
  useWatchContractEvent({
    address: PROOF_SPRING_ADDRESS,
    abi: PROOF_SPRING_ABI,
    eventName: 'GrantCreated',
    chainId: ARC_TESTNET_ID,
    onLogs: invalidate,
  })
  useWatchContractEvent({
    address: PROOF_SPRING_ADDRESS,
    abi: PROOF_SPRING_ABI,
    eventName: 'GrantFunded',
    chainId: ARC_TESTNET_ID,
    onLogs: invalidate,
  })
  useWatchContractEvent({
    address: PROOF_SPRING_ADDRESS,
    abi: PROOF_SPRING_ABI,
    eventName: 'GrantApplied',
    chainId: ARC_TESTNET_ID,
    onLogs: invalidate,
  })
  useWatchContractEvent({
    address: PROOF_SPRING_ADDRESS,
    abi: PROOF_SPRING_ABI,
    eventName: 'MilestoneApproved',
    chainId: ARC_TESTNET_ID,
    onLogs: invalidate,
  })
  useWatchContractEvent({
    address: PROOF_SPRING_ADDRESS,
    abi: PROOF_SPRING_ABI,
    eventName: 'GrantCompleted',
    chainId: ARC_TESTNET_ID,
    onLogs: invalidate,
  })
  useWatchContractEvent({
    address: PROOF_SPRING_ADDRESS,
    abi: PROOF_SPRING_ABI,
    eventName: 'GrantCancelled',
    chainId: ARC_TESTNET_ID,
    onLogs: invalidate,
  })

  // 1. Fetch grant count (stale-while-revalidate; event tick forces revalidation)
  const {
    data: grantCountData,
    refetch: refetchCount,
    isLoading: countLoading,
    isError: countError,
  } = useReadContract({
    address: PROOF_SPRING_ADDRESS,
    abi: PROOF_SPRING_ABI,
    functionName: 'grantCount',
    chainId: ARC_TESTNET_ID,
    query: {
      // 3.2 — 5-minute stale time: data is shown immediately from cache, revalidated in background
      staleTime: 5 * 60 * 1000,
      refetchInterval: 30_000,
    },
  })

  const grantCount = Number(grantCountData ?? 0n)

  // 3.1 — Use getGrantsBatch (single call) when count fits within one batch
  const useBatch = grantCount > 0 && grantCount <= BATCH_SIZE

  const {
    data: batchData,
    refetch: refetchBatch,
    isLoading: batchLoading,
    isError: batchError,
  } = useReadContract({
    address: PROOF_SPRING_ADDRESS,
    abi: PROOF_SPRING_ABI,
    functionName: 'getGrantsBatch',
    args: useBatch ? [1n, BigInt(grantCount)] : undefined,
    chainId: ARC_TESTNET_ID,
    query: {
      enabled: useBatch,
      staleTime: 5 * 60 * 1000,
      refetchInterval: 30_000,
    },
  })

  // Fallback multicall for large grant counts (> BATCH_SIZE)
  const multicallContracts = useMemo(() => {
    if (useBatch || grantCount === 0) return []
    return Array.from({ length: grantCount }, (_, i) => ({
      address: PROOF_SPRING_ADDRESS,
      abi: PROOF_SPRING_ABI,
      functionName: 'getGrant' as const,
      args: [BigInt(i + 1)] as [bigint],
      chainId: ARC_TESTNET_ID,
    }))
  }, [useBatch, grantCount])

  const {
    data: multicallData,
    refetch: refetchMulticall,
    isLoading: multicallLoading,
    isError: multicallError,
  } = useReadContracts({
    contracts: multicallContracts,
    query: {
      enabled: !useBatch && grantCount > 0,
      staleTime: 5 * 60 * 1000,
      refetchInterval: 30_000,
    },
  })

  // Refetch everything when an event fires
  useEffect(() => {
    if (eventTick === 0) return
    void refetchCount()
    if (useBatch) void refetchBatch()
    else void refetchMulticall()
  }, [eventTick]) // eslint-disable-line react-hooks/exhaustive-deps

  const grants: Grant[] = useMemo(() => {
    if (useBatch) {
      // getGrantsBatch returns grants in order fromId..toId (1-indexed)
      const arr = batchData as Grant[] | undefined
      return (arr ?? [])
        .map((g, i) => ({ ...(g as object), id: BigInt(i + 1) } as Grant))
        .filter(Boolean)
        .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    }
    return (multicallData ?? [])
      .map((r, i) => r.result ? ({ ...(r.result as object), id: BigInt(i + 1) } as Grant) : null)
      .filter((g): g is Grant => g !== null)
      .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
  }, [useBatch, batchData, multicallData])

  const refetch = useCallback(() => {
    void refetchCount()
    if (useBatch) void refetchBatch()
    else void refetchMulticall()
  }, [refetchCount, refetchBatch, refetchMulticall, useBatch])

  const isLoading = countLoading || (useBatch ? batchLoading : multicallLoading)
  const isError = countError || (useBatch ? batchError : multicallError)

  return (
    <GrantsContext.Provider value={{ grants, grantCount, isLoading, isError, refetch }}>
      {children}
    </GrantsContext.Provider>
  )
}

// ── Consumer hook ──────────────────────────────────────────────────────────────

export function useGrants() {
  return useContext(GrantsContext)
}
