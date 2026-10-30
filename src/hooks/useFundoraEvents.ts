import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import {
  FUNDORA_EVENTS_ADDRESS,
  FUNDORA_EVENTS_ABI,
  type OnchainEventInfo,
  type OnchainSubmission,
  type ReviewRecord,
} from '../contracts/fundoraEvents'
import type { Address } from 'viem'

// ── Read hooks ────────────────────────────────────────────────────────────────

export function useEvent(eventId: bigint | undefined) {
  return useReadContract({
    address: FUNDORA_EVENTS_ADDRESS,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'getEvent',
    args: eventId !== undefined ? [eventId] : undefined,
    query: { enabled: eventId !== undefined && eventId > 0n },
  })
}

export function useEventsBatch(offset: number, limit: number) {
  return useReadContract({
    address: FUNDORA_EVENTS_ADDRESS,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'getEventsBatch',
    args: [BigInt(offset), BigInt(limit)],
  })
}

export function useEventCount() {
  return useReadContract({
    address: FUNDORA_EVENTS_ADDRESS,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'eventCount',
  })
}

export function useSubmission(eventId: bigint | undefined, submissionId: bigint | undefined) {
  return useReadContract({
    address: FUNDORA_EVENTS_ADDRESS,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'getSubmission',
    args: eventId !== undefined && submissionId !== undefined ? [eventId, submissionId] : undefined,
    query: { enabled: !!eventId && !!submissionId },
  })
}

/**
 * Two-step read: first look up the submissionId for this wallet+event, then
 * fetch the full submission if one exists.
 * Replaces the defunct `getSubmissionByAddress` (which does not exist onchain).
 */
export function useSubmissionByAddress(eventId: bigint | undefined, submitter: Address | undefined) {
  const idResult = useReadContract({
    address: FUNDORA_EVENTS_ADDRESS,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'userSubmissionId',
    args: eventId !== undefined && submitter ? [eventId, submitter] : undefined,
    query: { enabled: !!eventId && !!submitter },
  })

  const submissionId = idResult.data
  const hasSubmission = submissionId !== undefined && submissionId > 0n

  const submissionResult = useReadContract({
    address: FUNDORA_EVENTS_ADDRESS,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'getSubmission',
    args: eventId !== undefined && submissionId !== undefined && hasSubmission
      ? [eventId, submissionId]
      : undefined,
    query: { enabled: hasSubmission },
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
  return useReadContract({
    address: FUNDORA_EVENTS_ADDRESS,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'getSubmissionsBatch',
    args: eventId !== undefined ? [eventId, BigInt(offset), BigInt(limit)] : undefined,
    query: { enabled: !!eventId },
  })
}

export function usePendingPrizeWithdrawals(address: Address | undefined) {
  return useReadContract({
    address: FUNDORA_EVENTS_ADDRESS,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'pendingPrizeWithdrawals',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })
}

export function usePendingOrganizerRefunds(address: Address | undefined) {
  return useReadContract({
    address: FUNDORA_EVENTS_ADDRESS,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'pendingOrganizerRefunds',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })
}

export function useIsEventReviewer(eventId: bigint | undefined, address: Address | undefined) {
  return useReadContract({
    address: FUNDORA_EVENTS_ADDRESS,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'isEventReviewer',
    args: eventId !== undefined && address ? [eventId, address] : undefined,
    query: { enabled: !!eventId && !!address },
  })
}

export function useUserSubmissionId(eventId: bigint | undefined, address: Address | undefined) {
  return useReadContract({
    address: FUNDORA_EVENTS_ADDRESS,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'userSubmissionId',
    args: eventId !== undefined && address ? [eventId, address] : undefined,
    query: { enabled: !!eventId && !!address },
  })
}

export function useEventsPaused() {
  return useReadContract({
    address: FUNDORA_EVENTS_ADDRESS,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'paused',
  })
}

export function useGetReview(
  eventId: bigint | undefined,
  submissionId: bigint | undefined,
  reviewer: Address | undefined,
) {
  return useReadContract({
    address: FUNDORA_EVENTS_ADDRESS,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'getReview',
    args: eventId !== undefined && submissionId !== undefined && reviewer
      ? [eventId, submissionId, reviewer]
      : undefined,
    query: { enabled: !!eventId && !!submissionId && !!reviewer },
  })
}

export function useHasReviewed(
  eventId: bigint | undefined,
  submissionId: bigint | undefined,
  reviewer: Address | undefined,
) {
  return useReadContract({
    address: FUNDORA_EVENTS_ADDRESS,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'hasReviewed',
    args: eventId !== undefined && submissionId !== undefined && reviewer
      ? [eventId, submissionId, reviewer]
      : undefined,
    query: { enabled: !!eventId && !!submissionId && !!reviewer },
  })
}

// ── Write hooks ───────────────────────────────────────────────────────────────

function useContractWrite(functionName: string) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const receipt = useWaitForTransactionReceipt({ hash })
  return {
    write: (args: unknown[]) =>
      writeContract({
        address: FUNDORA_EVENTS_ADDRESS,
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
      address: FUNDORA_EVENTS_ADDRESS,
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
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const receipt = useWaitForTransactionReceipt({ hash })

  const claimPrize = () => {
    writeContract({
      address: FUNDORA_EVENTS_ADDRESS,
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
