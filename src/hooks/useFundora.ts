import { useReadContract, useReadContracts } from 'wagmi'
import { useMemo } from 'react'
import {
  FUNDORA_ABI,
  ARC_TESTNET_ID,
  ARC_MAINNET_ID,

  getContractAddress,
} from '../contracts/fundora'

// Returns the active supported chain ID (testnet or mainnet); defaults to testnet
import { useMode } from '../context/ModeContext'
export function useActiveChainId(): number {
  const { isLive } = useMode()
  return isLive ? ARC_MAINNET_ID : ARC_TESTNET_ID



}

// Re-export for convenience
export { ARC_TESTNET_ID, ARC_MAINNET_ID }

// Grant as returned by the contract (no id field — removed from struct in v2)
// We inject `id` on the frontend from the mapping key / array index.
export interface Grant {
  id: bigint              // injected by hooks, not in the contract struct
  title: string
  description: string
  funder: string
  builder: string
  totalAmount: bigint
  releasedAmount: bigint
  milestoneCount: bigint  // uint8 onchain, bigint in ABI decode
  approvedMilestoneCount: bigint
  status: number
  createdAt: bigint       // uint40 onchain
  deadline: bigint        // uint40 onchain; 0 = no deadline
}

export interface Milestone {
  index: number            // uint8 → decoded as number
  title: string
  description: string
  amount: bigint           // uint128 → decoded as bigint
  status: number
  submittedBy: string
  evidenceHash: `0x${string}`  // bytes32 — keccak256(evidenceUri); full URI in MilestoneSubmitted event
  submittedAt: number      // uint40 → decoded as number
  approvedAt: number       // uint40 → decoded as number
}

// Arc Testnet block time ~1s; poll every 12s for a responsive but rate-limit-friendly UX
const POLL_INTERVAL = 12_000

export function useGrantCount() {
  const chainId = useActiveChainId()
  return useReadContract({
    address: getContractAddress(chainId),
    abi: FUNDORA_ABI,
    functionName: 'grantCount',
    chainId,
    query: { refetchInterval: POLL_INTERVAL },
  })
}

export function useGrant(grantId: bigint | null) {
  const chainId = useActiveChainId()
  const result = useReadContract({
    address: getContractAddress(chainId),
    abi: FUNDORA_ABI,
    functionName: 'getGrant',
    args: grantId ? [grantId] : undefined,
    query: { enabled: grantId !== null && grantId > 0n, refetchInterval: POLL_INTERVAL },
    chainId,
  })
  const data = result.data
    ? ({ ...(result.data as object), id: grantId! } as Grant)
    : undefined
  return { ...result, data }
}

export function useAllGrants(count: number) {
  const chainId = useActiveChainId()
  const contracts = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      address: getContractAddress(chainId),
      abi: FUNDORA_ABI,
      functionName: 'getGrant' as const,
      args: [BigInt(i + 1)] as [bigint],
      chainId,
    })),
    [count, chainId]
  )

  return useReadContracts({
    contracts,
    query: { enabled: count > 0, refetchInterval: POLL_INTERVAL },
  })
}

export function useMilestones(grantId: bigint | null, milestoneCount: number) {
  const chainId = useActiveChainId()
  const contracts = useMemo(() => {
    if (!grantId || milestoneCount === 0) return []
    return Array.from({ length: milestoneCount }, (_, i) => ({
      address: getContractAddress(chainId),
      abi: FUNDORA_ABI,
      functionName: 'getMilestone' as const,
      args: [grantId, BigInt(i)] as [bigint, bigint],
      chainId,
    }))
  }, [grantId, milestoneCount, chainId])

  return useReadContracts({
    contracts,
    query: { enabled: !!grantId && milestoneCount > 0, refetchInterval: POLL_INTERVAL },
  })
}

export function useContractAdmin() {
  const chainId = useActiveChainId()
  return useReadContract({
    address: getContractAddress(chainId),
    abi: FUNDORA_ABI,
    functionName: 'admin',
    chainId,
  })
}

export function useIsReviewer(address: `0x${string}` | undefined) {
  const chainId = useActiveChainId()
  return useReadContract({
    address: getContractAddress(chainId),
    abi: FUNDORA_ABI,
    functionName: 'isReviewer',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
    chainId,
  })
}

export function useRequiredApprovals() {
  const chainId = useActiveChainId()
  return useReadContract({
    address: getContractAddress(chainId),
    abi: FUNDORA_ABI,
    functionName: 'requiredApprovals',
    chainId,
  })
}

export function usePendingWithdrawal(address: `0x${string}` | undefined) {
  const chainId = useActiveChainId()
  return useReadContract({
    address: getContractAddress(chainId),
    abi: FUNDORA_ABI,
    functionName: 'pendingWithdrawals',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: POLL_INTERVAL },
    chainId,
  })
}

export function usePendingFunderRefund(address: `0x${string}` | undefined) {
  const chainId = useActiveChainId()
  return useReadContract({
    address: getContractAddress(chainId),
    abi: FUNDORA_ABI,
    functionName: 'pendingFunderRefunds',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: POLL_INTERVAL },
    chainId,
  })
}

export function useApprovalCount(grantId: bigint | null, milestoneIndex: number) {
  const chainId = useActiveChainId()
  return useReadContract({
    address: getContractAddress(chainId),
    abi: FUNDORA_ABI,
    functionName: 'getMilestoneApprovalCount',
    args: grantId !== null ? [grantId, BigInt(milestoneIndex)] : undefined,
    query: { enabled: grantId !== null, refetchInterval: POLL_INTERVAL },
    chainId,
  })
}

export function usePaused() {
  const chainId = useActiveChainId()
  return useReadContract({
    address: getContractAddress(chainId),
    abi: FUNDORA_ABI,
    functionName: 'paused',
    query: { refetchInterval: POLL_INTERVAL },
    chainId,
  })
}

export function useExpireGrantEligible(grantId: bigint | null) {
  const chainId = useActiveChainId()
  return useReadContract({
    address: getContractAddress(chainId),
    abi: FUNDORA_ABI,
    functionName: 'getGrant',
    args: grantId !== null ? [grantId] : undefined,
    query: { enabled: grantId !== null, refetchInterval: POLL_INTERVAL },
    chainId,
  })
}

export function useReviewerVote(
  grantId: bigint | null,
  milestoneIndex: number,
  reviewer: `0x${string}` | undefined,
) {
  const chainId = useActiveChainId()
  return useReadContract({
    address: getContractAddress(chainId),
    abi: FUNDORA_ABI,
    functionName: 'getReviewerVote',
    args:
      grantId !== null && reviewer
        ? [grantId, BigInt(milestoneIndex), reviewer]
        : undefined,
    query: {
      enabled: grantId !== null && !!reviewer,
      refetchInterval: POLL_INTERVAL,
    },
    chainId,
  })
}

export function useGrantCreator(grantId: bigint | null) {
  const chainId = useActiveChainId()
  return useReadContract({
    address: getContractAddress(chainId),
    abi: FUNDORA_ABI,
    functionName: 'grantCreator',
    args: grantId !== null ? [grantId] : undefined,
    query: { enabled: grantId !== null, refetchInterval: POLL_INTERVAL },
    chainId,
  })
}

