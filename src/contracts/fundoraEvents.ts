import artifact from '../../contracts/out/FundoraEvents.sol/FundoraEvents.json'

// Deployed on Arc Testnet — update after each redeployment
export const FUNDORA_EVENTS_ADDRESS =
  (import.meta.env.VITE_FUNDORA_EVENTS_ADDRESS as `0x${string}` | undefined) ??
  ('0x0000000000000000000000000000000000000000')

export const FUNDORA_EVENTS_ABI = artifact.abi

// EventType enum values
export const EventType = {
  NativeEscrow: 0,
  ExternalListing: 1,
} as const

// EventStatus enum values
export const EventStatus = {
  Open: 0,
  SubmissionsClosed: 1,
  Finalized: 2,
  Cancelled: 3,
} as const

export type EventTypeValue = (typeof EventType)[keyof typeof EventType]
export type EventStatusValue = (typeof EventStatus)[keyof typeof EventStatus]

export interface OnchainEventInfo {
  id: bigint
  title: string
  description: string
  externalUrl: string
  eventType: EventTypeValue
  status: EventStatusValue
  organizer: `0x${string}`
  totalPrizePool: bigint
  allocatedPrizePool: bigint
  submissionDeadline: number
  judgingDeadline: number
  submissionCount: number
  reviewerCount: number
  createdAt: number
}

export interface OnchainSubmission {
  id: bigint
  eventId: bigint
  submitter: `0x${string}`
  metadataUri: string
  submissionHash: `0x${string}`
  submittedAt: number
  scoreSum: number
  reviewCount: number
  disqualified: boolean
}
