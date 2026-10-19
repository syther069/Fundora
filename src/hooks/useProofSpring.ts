import { useReadContract, useReadContracts } from 'wagmi'
import { useMemo } from 'react'
import { PROOF_SPRING_ADDRESS, PROOF_SPRING_ABI } from '../contracts/proofSpring'
import { ARC_TESTNET_ID } from '../contracts/proofSpring'

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
  return useReadContract({
    address: PROOF_SPRING_ADDRESS,
    abi: PROOF_SPRING_ABI,
    functionName: 'grantCount',
    chainId: ARC_TESTNET_ID,
    query: { refetchInterval: POLL_INTERVAL },
  })
}

export function useGrant(grantId: bigint | null) {
  const result = useReadContract({
    address: PROOF_SPRING_ADDRESS,
    abi: PROOF_SPRING_ABI,
    functionName: 'getGrant',
    args: grantId ? [grantId] : undefined,
    query: { enabled: grantId !== null && grantId > 0n, refetchInterval: POLL_INTERVAL },
    chainId: ARC_TESTNET_ID,
  })
  // Inject `id` from the argument since the struct no longer stores it
  const data = result.data
    ? ({ ...(result.data as object), id: grantId! } as Grant)
    : undefined
  return { ...result, data }
}

export function useAllGrants(count: number) {
  const contracts = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      address: PROOF_SPRING_ADDRESS,
      abi: PROOF_SPRING_ABI,
      functionName: 'getGrant' as const,
      args: [BigInt(i + 1)] as [bigint],
      chainId: ARC_TESTNET_ID,
    })),
    [count]
  )

  return useReadContracts({
    contracts,
    query: { enabled: count > 0, refetchInterval: POLL_INTERVAL },
  })
}

export function useMilestones(grantId: bigint | null, milestoneCount: number) {
  const contracts = useMemo(() => {
    if (!grantId || milestoneCount === 0) return []
    return Array.from({ length: milestoneCount }, (_, i) => ({
      address: PROOF_SPRING_ADDRESS,
      abi: PROOF_SPRING_ABI,
      functionName: 'getMilestone' as const,
      args: [grantId, BigInt(i)] as [bigint, bigint],
      chainId: ARC_TESTNET_ID,
    }))
  }, [grantId, milestoneCount])

  return useReadContracts({
    contracts,
    query: { enabled: !!grantId && milestoneCount > 0, refetchInterval: POLL_INTERVAL },
  })
}

export function useContractAdmin() {
  return useReadContract({
    address: PROOF_SPRING_ADDRESS,
    abi: PROOF_SPRING_ABI,
    functionName: 'admin',
    chainId: ARC_TESTNET_ID,
  })
}

export function useIsReviewer(address: `0x${string}` | undefined) {
  return useReadContract({
    address: PROOF_SPRING_ADDRESS,
    abi: PROOF_SPRING_ABI,
    functionName: 'isReviewer',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
    chainId: ARC_TESTNET_ID,
  })
}

export function useRequiredApprovals() {
  return useReadContract({
    address: PROOF_SPRING_ADDRESS,
    abi: PROOF_SPRING_ABI,
    functionName: 'requiredApprovals',
    chainId: ARC_TESTNET_ID,
  })
}

export function usePendingWithdrawal(address: `0x${string}` | undefined) {
  return useReadContract({
    address: PROOF_SPRING_ADDRESS,
    abi: PROOF_SPRING_ABI,
    functionName: 'pendingWithdrawals',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: POLL_INTERVAL },
    chainId: ARC_TESTNET_ID,
  })
}

export function usePendingFunderRefund(address: `0x${string}` | undefined) {
  return useReadContract({
    address: PROOF_SPRING_ADDRESS,
    abi: PROOF_SPRING_ABI,
    functionName: 'pendingFunderRefunds',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: POLL_INTERVAL },
    chainId: ARC_TESTNET_ID,
  })
}

export function useApprovalCount(grantId: bigint | null, milestoneIndex: number) {
  return useReadContract({
    address: PROOF_SPRING_ADDRESS,
    abi: PROOF_SPRING_ABI,
    functionName: 'getMilestoneApprovalCount',
    args: grantId !== null ? [grantId, BigInt(milestoneIndex)] : undefined,
    query: { enabled: grantId !== null, refetchInterval: POLL_INTERVAL },
    chainId: ARC_TESTNET_ID,
  })
}

// A1: check whether a specific reviewer already voted on a milestone in the current round
export function useReviewerVote(
  grantId: bigint | null,
  milestoneIndex: number,
  reviewer: `0x${string}` | undefined,
) {
  return useReadContract({
    address: PROOF_SPRING_ADDRESS,
    abi: PROOF_SPRING_ABI,
    functionName: 'getReviewerVote',
    args:
      grantId !== null && reviewer
        ? [grantId, BigInt(milestoneIndex), reviewer]
        : undefined,
    query: {
      enabled: grantId !== null && !!reviewer,
      refetchInterval: POLL_INTERVAL,
    },
    chainId: ARC_TESTNET_ID,
  })
}
