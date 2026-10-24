import { useState, useEffect } from 'react'
import { usePublicClient, useChainId } from 'wagmi'
import { parseAbiItem, keccak256, stringToBytes } from 'viem'
import { getFundoraAddress } from '../contracts/fundora'

const ZERO_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'

export function evidenceCacheKey(chainId: number, grantId: bigint, milestoneIndex: number): string {
  return `fundora:evidence:${chainId}:${grantId}:${milestoneIndex}`
}

export function saveEvidenceToCache(chainId: number, grantId: bigint, milestoneIndex: number, uri: string) {
  try {
    localStorage.setItem(evidenceCacheKey(chainId, grantId, milestoneIndex), uri)
  } catch {
    // LocalStorage might be blocked or full
  }
}

export function readEvidenceFromCache(chainId: number, grantId: bigint, milestoneIndex: number): string | null {
  try {
    return localStorage.getItem(evidenceCacheKey(chainId, grantId, milestoneIndex))
  } catch {
    return null
  }
}

export interface UseEvidenceResolverResult {
  evidenceUri: string | null
  isLoading: boolean
  isVerified: boolean
  error: Error | null
}

const MILESTONE_SUBMITTED_EVENT = parseAbiItem(
  'event MilestoneSubmitted(uint256 indexed grantId, uint256 indexed milestoneIndex, string evidenceUri, address indexed builder)'
)

/**
 * useEvidenceResolver
 *
 * Resolves plaintext evidence string for a milestone:
 * 1. Fast path: checks localStorage cache for instantaneous display.
 * 2. Fallback path: queries on-chain event logs via viem `getLogs` for cross-device support (reviewers, other browsers).
 * 3. Cryptographically verifies that `keccak256(bytes(evidenceUri)) == milestone.evidenceHash`.
 * 4. Caches verified result locally so subsequent views require zero RPC requests.
 */
export function useEvidenceResolver(
  grantId: bigint | undefined,
  milestoneIndex: number | undefined,
  expectedHash: `0x${string}` | undefined,
  submittedAt?: number | undefined,
): UseEvidenceResolverResult {
  const chainId = useChainId()
  const publicClient = usePublicClient()

  const [evidenceUri, setEvidenceUri] = useState<string | null>(() => {
    if (!grantId || milestoneIndex === undefined) return null
    return readEvidenceFromCache(chainId, grantId, milestoneIndex)
  })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isVerified, setIsVerified] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!grantId || milestoneIndex === undefined || !expectedHash || expectedHash === ZERO_HASH) {
      queueMicrotask(() => {
        setEvidenceUri(null)
        setIsVerified(false)
        setIsLoading(false)
      })
      return
    }

    // 1. Check local device cache first
    const cached = readEvidenceFromCache(chainId, grantId, milestoneIndex)
    if (cached) {
      const computedHash = keccak256(stringToBytes(cached))
      if (computedHash.toLowerCase() === expectedHash.toLowerCase()) {
        queueMicrotask(() => {
          setEvidenceUri(cached)
          setIsVerified(true)
          setIsLoading(false)
        })
        return
      }
    }

    if (!publicClient) {
      return
    }

    // 2. Query event logs for MilestoneSubmitted within a bounded block window (<5,000 blocks to satisfy Arc RPC)
    let isCancelled = false
    queueMicrotask(() => {
      if (!isCancelled) {
        setIsLoading(true)
        setError(null)
      }
    })

    const targetAddress = getFundoraAddress(chainId)

    const fetchLogs = async () => {
      try {
        const latestBlock = await publicClient.getBlockNumber()
        const now = Math.floor(Date.now() / 1000)

        // Arc block time is ~0.5s (~2 blocks/sec)
        // Clamp each query window to 4,000 blocks max (Arc RPC max is ~9,000)
        const CHUNK_SIZE = 4000n

        let fromBlock: bigint
        let toBlock: bigint

        if (submittedAt && submittedAt > 0) {
          const secondsAgo = Math.max(0, now - submittedAt)
          const estimatedBlocksAgo = BigInt(secondsAgo) * 2n // 2 blocks per second
          const estimatedBlock = latestBlock > estimatedBlocksAgo ? latestBlock - estimatedBlocksAgo : 0n

          // Center a 4,000 block window around the estimated block
          fromBlock = estimatedBlock > (CHUNK_SIZE / 2n) ? estimatedBlock - (CHUNK_SIZE / 2n) : 0n
          toBlock = fromBlock + CHUNK_SIZE > latestBlock ? latestBlock : fromBlock + CHUNK_SIZE
        } else {
          // Fall back to most recent 4,000 blocks
          fromBlock = latestBlock > CHUNK_SIZE ? latestBlock - CHUNK_SIZE : 0n
          toBlock = latestBlock
        }

        let logs = await publicClient.getLogs({
          address: targetAddress,
          event: MILESTONE_SUBMITTED_EVENT,
          args: {
            grantId,
            milestoneIndex: BigInt(milestoneIndex),
          },
          fromBlock,
          toBlock,
        })

        // If not found in estimated window and window didn't cover latest blocks, do a recent chunk check
        if (logs.length === 0 && toBlock < latestBlock) {
          const recentFrom = latestBlock > CHUNK_SIZE ? latestBlock - CHUNK_SIZE : 0n
          if (recentFrom > fromBlock) {
            logs = await publicClient.getLogs({
              address: targetAddress,
              event: MILESTONE_SUBMITTED_EVENT,
              args: {
                grantId,
                milestoneIndex: BigInt(milestoneIndex),
              },
              fromBlock: recentFrom,
              toBlock: latestBlock,
            })
          }
        }

        if (isCancelled) return

        if (logs.length > 0) {
          // Select the latest log for this milestone (reflecting current round)
          const latestLog = logs[logs.length - 1]
          const resolvedUri = latestLog.args.evidenceUri as string

          if (resolvedUri) {
            const computedHash = keccak256(stringToBytes(resolvedUri))
            const matches = computedHash.toLowerCase() === expectedHash.toLowerCase()

            if (matches) {
              saveEvidenceToCache(chainId, grantId, milestoneIndex, resolvedUri)
              setEvidenceUri(resolvedUri)
              setIsVerified(true)
            } else {
              setEvidenceUri(resolvedUri)
              setIsVerified(false)
            }
          }
        }
        setIsLoading(false)
      } catch (err) {
        if (isCancelled) return
        console.warn('Could not query MilestoneSubmitted logs within bounded block window:', err)
        setError(err instanceof Error ? err : new Error(String(err)))
        setIsLoading(false)
      }
    }

    void fetchLogs()

    return () => {
      isCancelled = true
    }
  }, [grantId, milestoneIndex, expectedHash, submittedAt, chainId, publicClient])

  return { evidenceUri, isLoading, isVerified, error }
}
