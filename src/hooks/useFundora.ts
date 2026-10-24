import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { useMemo } from 'react'
import {
  FUNDORA_ABI,
  ARC_TESTNET_ID,
  ARC_MAINNET_ID,
  getFundoraAddress,
} from '../contracts/fundora'

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

// Arc block time ~0.5s; poll every 12s for a responsive UX
const POLL_INTERVAL = 12_000

export function useActiveChainId(): number {
  const { chainId } = useAccount()
  return chainId === ARC_MAINNET_ID ? ARC_MAINNET_ID : ARC_TESTNET_ID
}

export function useContractAddress(): `0x${string}` {
  const chainId = useActiveChainId()
  return getFundoraAddress(chainId)
}

export function useGrantCount() {
  const chainId = useActiveChainId()
  return useReadContract({
    address: getFundoraAddress(chainId),
    abi: FUNDORA_ABI,
    functionName: 'grantCount',
    chainId,
    query: { refetchInterval: POLL_INTERVAL },
  })
}

export function useGrant(grantId: bigint | null) {
  const chainId = useActiveChainId()
  const result = useReadContract({
    address: getFundoraAddress(chainId),
    abi: FUNDORA_ABI,
    functionName: 'getGrant',
    args: grantId ? [grantId] : undefined,
    query: { enabled: grantId !== null && grantId > 0n, refetchInterval: POLL_INTERVAL },
    chainId,
  })
  // Inject `id` from the argument since the struct no longer stores it
  const data = result.data
    ? ({ ...(result.data as object), id: grantId! } as Grant)
    : undefined
  return { ...result, data }
}

export function useAllGrants(count: number) {
  const chainId = useActiveChainId()
  const contracts = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      address: getFundoraAddress(chainId),
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
      address: getFundoraAddress(chainId),
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

export function useContractUsdc() {
  const chainId = useActiveChainId()
  return useReadContract({
    address: getFundoraAddress(chainId),
    abi: FUNDORA_ABI,
    functionName: 'usdc',
    chainId,
  })
}

export function useContractAdmin() {
  const chainId = useActiveChainId()
  return useReadContract({
    address: getFundoraAddress(chainId),
    abi: FUNDORA_ABI,
    functionName: 'admin',
    chainId,
  })
}

export const useFundoraAdmin = useContractAdmin

export function useIsReviewer(address: `0x${string}` | undefined) {
  const chainId = useActiveChainId()
  return useReadContract({
    address: getFundoraAddress(chainId),
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
    address: getFundoraAddress(chainId),
    abi: FUNDORA_ABI,
    functionName: 'requiredApprovals',
    chainId,
  })
}

export function usePendingWithdrawal(address: `0x${string}` | undefined) {
  const chainId = useActiveChainId()
  return useReadContract({
    address: getFundoraAddress(chainId),
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
    address: getFundoraAddress(chainId),
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
    address: getFundoraAddress(chainId),
    abi: FUNDORA_ABI,
    functionName: 'getMilestoneApprovalCount',
    args: grantId !== null ? [grantId, BigInt(milestoneIndex)] : undefined,
    query: { enabled: grantId !== null, refetchInterval: POLL_INTERVAL },
    chainId,
  })
}

// Check whether a specific reviewer already voted on a milestone in the current round
export function useReviewerVote(
  grantId: bigint | null,
  milestoneIndex: number,
  reviewer: `0x${string}` | undefined,
) {
  const chainId = useActiveChainId()
  return useReadContract({
    address: getFundoraAddress(chainId),
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
