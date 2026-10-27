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

export function useSubmissionByAddress(eventId: bigint | undefined, submitter: Address | undefined) {
  return useReadContract({
    address: FUNDORA_EVENTS_ADDRESS,
    abi: FUNDORA_EVENTS_ABI,
    functionName: 'getSubmissionByAddress',
    args: eventId !== undefined && submitter ? [eventId, submitter] : undefined,
    query: { enabled: !!eventId && !!submitter },
  })
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

// ── Write hooks ───────────────────────────────────────────────────────────────

function useContractWrite(functionName: string) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const receipt = useWaitForTransactionReceipt({ hash })
  return {
    write: (args: unknown[]) =>
      writeContract({
        address: FUNDORA_EVENTS_ADDRESS,
        abi: FUNDORA_EVENTS_ABI,
        functionName: functionName,
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

export function useUpdateSubmission() {
  const c = useContractWrite('updateSubmission')
  return {
    ...c,
    updateSubmission: (eventId: bigint, metadataUri: string, submissionHash: `0x${string}`) =>
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

// ── Type exports ──────────────────────────────────────────────────────────────
export type { OnchainEventInfo, OnchainSubmission }
