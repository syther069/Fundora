import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from 'wagmi'
import {
  FUNDORA_EVENTS_ABI,
  getFundoraEventsAddress,
  type OnchainEventInfo,
  type OnchainSubmission,
  type ReviewRecord,
} from '../contracts/fundoraEvents'
import { ARC_MAINNET_ID, ARC_TESTNET_ID } from '../contracts/fundora'
import { useMode } from '../context/ModeContext'
import type { Address } from 'viem'

/**
 * Returns the currently active FundoraEvents contract address based on
 * the app's mode (Live vs Demo) and the user's active wallet network.
 */
export function useActiveEventsAddress(): `0x${string}` {
  const { isLive } = useMode()
  const { chainId } = useAccount()
  const targetChain = isLive || chainId === ARC_MAINNET_ID ? ARC_MAINNET_ID : ARC_TESTNET_ID
  return getFundoraEventsAddress(targetChain)
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

// ── Read hooks ────────────────────────────────────────────────────────────────

export function useEvent(eventId: bigint | undefined) {
  const contractAddress = useActiveEventsAddress()
  const isValidAddress = contractAddress && contractAddress !== ZERO_ADDRESS

  return useReadContract({
    address: contractAddress,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'getEvent',
    args: eventId !== undefined ? [eventId] : undefined,
    query: { enabled: !!isValidAddress && eventId !== undefined && eventId > 0n },
  })
}

export function useEventsBatch(offset: number, limit: number) {
  const contractAddress = useActiveEventsAddress()
  const isValidAddress = contractAddress && contractAddress !== ZERO_ADDRESS

  return useReadContract({
    address: contractAddress,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'getEventsBatch',
    args: [BigInt(offset), BigInt(limit)],
    query: { enabled: !!isValidAddress },
  })
}

export function useEventCount() {
  const contractAddress = useActiveEventsAddress()
  const isValidAddress = contractAddress && contractAddress !== ZERO_ADDRESS

  return useReadContract({
    address: contractAddress,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'eventCount',
    query: { enabled: !!isValidAddress },
  })
}

export function useSubmission(eventId: bigint | undefined, submissionId: bigint | undefined) {
  const contractAddress = useActiveEventsAddress()
  const isValidAddress = contractAddress && contractAddress !== ZERO_ADDRESS

  return useReadContract({
    address: contractAddress,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'getSubmission',
    args: eventId !== undefined && submissionId !== undefined ? [eventId, submissionId] : undefined,
    query: { enabled: !!isValidAddress && !!eventId && !!submissionId },
  })
}

/**
 * Two-step read: first look up the submissionId for this wallet+event, then
 * fetch the full submission if one exists.
 */
export function useSubmissionByAddress(eventId: bigint | undefined, submitter: Address | undefined) {
  const contractAddress = useActiveEventsAddress()
  const isValidAddress = contractAddress && contractAddress !== ZERO_ADDRESS

  const idResult = useReadContract({
    address: contractAddress,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'userSubmissionId',
    args: eventId !== undefined && submitter ? [eventId, submitter] : undefined,
    query: { enabled: !!isValidAddress && !!eventId && !!submitter },
  })

  const submissionId = idResult.data
  const hasSubmission = submissionId !== undefined && submissionId > 0n

  const submissionResult = useReadContract({
    address: contractAddress,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'getSubmission',
    args: eventId !== undefined && submissionId !== undefined && hasSubmission
      ? [eventId, submissionId]
      : undefined,
    query: { enabled: !!isValidAddress && hasSubmission },
  })

  return {
    submissionId: hasSubmission ? submissionId : undefined,
    data: submissionResult.data,
    isLoading: idResult.isLoading || (hasSubmission ? submissionResult.isLoading : false),
    error: idResult.error ?? submissionResult.error,
    hasSubmission,
  }
}

export function useSubmissionsBatch(eventId: bigint | undefined, offset: number, limit: number) {
  const contractAddress = useActiveEventsAddress()
  const isValidAddress = contractAddress && contractAddress !== ZERO_ADDRESS

  return useReadContract({
    address: contractAddress,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'getSubmissionsBatch',
    args: eventId !== undefined ? [eventId, BigInt(offset), BigInt(limit)] : undefined,
    query: { enabled: !!isValidAddress && !!eventId },
  })
}

export function usePendingPrizeWithdrawals(address: Address | undefined) {
  const contractAddress = useActiveEventsAddress()
  const isValidAddress = contractAddress && contractAddress !== ZERO_ADDRESS

  return useReadContract({
    address: contractAddress,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'pendingPrizeWithdrawals',
    args: address ? [address] : undefined,
    query: { enabled: !!isValidAddress && !!address },
  })
}

export function usePendingOrganizerRefunds(address: Address | undefined) {
  const contractAddress = useActiveEventsAddress()
  const isValidAddress = contractAddress && contractAddress !== ZERO_ADDRESS

  return useReadContract({
    address: contractAddress,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'pendingOrganizerRefunds',
    args: address ? [address] : undefined,
    query: { enabled: !!isValidAddress && !!address },
  })
}

export function useIsEventReviewer(eventId: bigint | undefined, address: Address | undefined) {
  const contractAddress = useActiveEventsAddress()
  const isValidAddress = contractAddress && contractAddress !== ZERO_ADDRESS

  return useReadContract({
    address: contractAddress,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'isEventReviewer',
    args: eventId !== undefined && address ? [eventId, address] : undefined,
    query: { enabled: !!isValidAddress && !!eventId && !!address },
  })
}

export function useUserSubmissionId(eventId: bigint | undefined, address: Address | undefined) {
  const contractAddress = useActiveEventsAddress()
  const isValidAddress = contractAddress && contractAddress !== ZERO_ADDRESS

  return useReadContract({
    address: contractAddress,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'userSubmissionId',
    args: eventId !== undefined && address ? [eventId, address] : undefined,
    query: { enabled: !!isValidAddress && !!eventId && !!address },
  })
}

export function useEventsPaused() {
  const contractAddress = useActiveEventsAddress()
  const isValidAddress = contractAddress && contractAddress !== ZERO_ADDRESS

  return useReadContract({
    address: contractAddress,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'paused',
    query: { enabled: !!isValidAddress },
  })
}

export function useGetReview(
  eventId: bigint | undefined,
  submissionId: bigint | undefined,
  reviewer: Address | undefined,
) {
  const contractAddress = useActiveEventsAddress()
  const isValidAddress = contractAddress && contractAddress !== ZERO_ADDRESS

  return useReadContract({
    address: contractAddress,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'getReview',
    args: eventId !== undefined && submissionId !== undefined && reviewer
      ? [eventId, submissionId, reviewer]
      : undefined,
    query: { enabled: !!isValidAddress && !!eventId && !!submissionId && !!reviewer },
  })
}

export function useHasReviewed(
  eventId: bigint | undefined,
  submissionId: bigint | undefined,
  reviewer: Address | undefined,
) {
  const contractAddress = useActiveEventsAddress()
  const isValidAddress = contractAddress && contractAddress !== ZERO_ADDRESS

  return useReadContract({
    address: contractAddress,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'hasReviewed',
    args: eventId !== undefined && submissionId !== undefined && reviewer
      ? [eventId, submissionId, reviewer]
      : undefined,
    query: { enabled: !!isValidAddress && !!eventId && !!submissionId && !!reviewer },
  })
}

// ── Write hooks ───────────────────────────────────────────────────────────────

function useContractWrite(functionName: string) {
  const contractAddress = useActiveEventsAddress()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const receipt = useWaitForTransactionReceipt({ hash })
  return {
    write: (args: unknown[]) =>
      writeContract({
        address: contractAddress,
        abi: FUNDORA_EVENTS_ABI,
        functionName: functionName as never,
        args: args,
      }),
    hash,
    isPending,
    isConfirming: receipt.isLoading,
    isSuccess: receipt.isSuccess,
    error: error ?? receipt.error,
  }
}

export function useCreateEvent() {
  const contractAddress = useActiveEventsAddress()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const receipt = useWaitForTransactionReceipt({ hash })

  const createEvent = (params: {
    title: string
    description: string
    externalUrl: string
    eventType: number
    totalPrizePool: bigint
    submissionDeadline: number
    judgingDeadline: number
  }) => {
    writeContract({
      address: contractAddress,
      abi: FUNDORA_EVENTS_ABI,
      functionName: 'createEvent',
      args: [
        params.title,
        params.description,
        params.externalUrl,
        params.eventType,
        params.totalPrizePool,
        params.submissionDeadline,
        params.judgingDeadline,
      ],
    })
  }

  return {
    createEvent,
    hash,
    isPending,
    isConfirming: receipt.isLoading,
    isSuccess: receipt.isSuccess,
    error: error ?? receipt.error,
  }
}

export function useSubmitEntry() {
  const c = useContractWrite('submitEntry')
  return {
    ...c,
    submitEntry: (eventId: bigint, metadataUri: string, submissionHash: `0x${string}`) =>
      c.write([eventId, metadataUri, submissionHash]),
  }
}

export function useClaimPrize() {
  const contractAddress = useActiveEventsAddress()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const receipt = useWaitForTransactionReceipt({ hash })

  const claimPrize = () => {
    writeContract({
      address: contractAddress,
      abi: FUNDORA_EVENTS_ABI,
      functionName: 'claimPrize',
      args: [],
    })
  }

  return {
    claimPrize,
    hash,
    isPending,
    isConfirming: receipt.isLoading,
    isSuccess: receipt.isSuccess,
    error: error ?? receipt.error,
  }
}

export function useClaimOrganizerRefund() {
  const c = useContractWrite('claimOrganizerRefund')
  return {
    ...c,
    claimOrganizerRefund: () => c.write([]),
  }
}

export function useAddReviewer() {
  const c = useContractWrite('addReviewer')
  return {
    ...c,
    addReviewer: (eventId: bigint, reviewer: Address) => c.write([eventId, reviewer]),
  }
}

export function useRemoveReviewer() {
  const c = useContractWrite('removeReviewer')
  return {
    ...c,
    removeReviewer: (eventId: bigint, reviewer: Address) => c.write([eventId, reviewer]),
  }
}

export function useCloseSubmissions() {
  const c = useContractWrite('closeSubmissions')
  return {
    ...c,
    closeSubmissions: (eventId: bigint) => c.write([eventId]),
  }
}

export function useFinalizeWinners() {
  const c = useContractWrite('finalizeWinners')
  return {
    ...c,
    finalizeWinners: (eventId: bigint, winners: Address[], amounts: bigint[]) =>
      c.write([eventId, winners, amounts]),
  }
}

export function useCancelEvent() {
  const c = useContractWrite('cancelEvent')
  return {
    ...c,
    cancelEvent: (eventId: bigint) => c.write([eventId]),
  }
}

export function useSubmitReview() {
  const c = useContractWrite('submitReview')
  return {
    ...c,
    /**
     * @param score 1–100 integer score
     * @param notesHash keccak256 of the reviewer's notes text (bytes32)
     */
    submitReview: (
      eventId: bigint,
      submissionId: bigint,
      score: number,
      notesHash: `0x${string}`,
    ) => c.write([eventId, submissionId, score, notesHash]),
  }
}

// ── Type exports ──────────────────────────────────────────────────────────────
export type { OnchainEventInfo, OnchainSubmission, ReviewRecord }
