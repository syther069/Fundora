import { ARC_MAINNET_ID } from './fundora'

// ── Onchain enum mirrors (match FundoraEvents.sol) ────────────────────────────
export const EventType = { NativeEscrow: 0, ExternalListing: 1 } as const
export type EventTypeValue = (typeof EventType)[keyof typeof EventType]

export const EventStatus = {
  Open: 0,
  SubmissionsClosed: 1,
  Finalized: 2,
  Cancelled: 3,
} as const
export type EventStatusValue = (typeof EventStatus)[keyof typeof EventStatus]

export const FUNDORA_EVENTS_ADDRESS_TESTNET = (import.meta.env?.VITE_FUNDORA_EVENTS_ADDRESS || '0xc9c7033f4736f8b6e213ea7617596c3fd7bb154a') as `0x${string}`
export const FUNDORA_EVENTS_ADDRESS_MAINNET = (import.meta.env?.VITE_FUNDORA_EVENTS_ADDRESS_MAINNET || '0x0000000000000000000000000000000000000000') as `0x${string}`

export function getFundoraEventsAddress(chainId?: number): `0x${string}` {
  return chainId === ARC_MAINNET_ID ? FUNDORA_EVENTS_ADDRESS_MAINNET : FUNDORA_EVENTS_ADDRESS_TESTNET
}

/** Convenience export used by hooks (resolves to testnet by default) */
export const FUNDORA_EVENTS_ADDRESS = FUNDORA_EVENTS_ADDRESS_TESTNET

// ── TypeScript types mirroring onchain structs ────────────────────────────────

export interface OnchainEventInfo {
  id: bigint
  title: string
  description: string
  externalUrl: string
  eventType: number      // 0 = NativeEscrow, 1 = ExternalListing
  status: number         // 0 = Open, 1 = SubmissionsClosed, 2 = Finalized, 3 = Cancelled
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
  scoreSum: number      // cumulative sum of all reviewer scores (1–100 each)
  reviewCount: number   // number of reviews submitted
  disqualified: boolean
}

export interface ReviewRecord {
  score: number       // 1–100
  notesHash: `0x${string}`
  reviewedAt: number  // unix seconds
}

// ── ABI ───────────────────────────────────────────────────────────────────────

export const FUNDORA_EVENTS_ABI = [
  // ── State-changing ────────────────────────────────────────────────────────
  {
    type: 'function',
    name: 'createEvent',
    inputs: [
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'externalUrl', type: 'string' },
      { name: 'eventType', type: 'uint8' },
      { name: 'totalPrizePool', type: 'uint128' },
      { name: 'submissionDeadline', type: 'uint40' },
      { name: 'judgingDeadline', type: 'uint40' },
    ],
    outputs: [{ name: 'eventId', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'submitEntry',
    inputs: [
      { name: 'eventId', type: 'uint256' },
      { name: 'metadataUri', type: 'string' },
      { name: 'submissionHash', type: 'bytes32' },
    ],
    outputs: [{ name: 'submissionId', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'addReviewer',
    inputs: [
      { name: 'eventId', type: 'uint256' },
      { name: 'reviewer', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'removeReviewer',
    inputs: [
      { name: 'eventId', type: 'uint256' },
      { name: 'reviewer', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'closeSubmissions',
    inputs: [{ name: 'eventId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'submitReview',
    inputs: [
      { name: 'eventId', type: 'uint256' },
      { name: 'submissionId', type: 'uint256' },
      { name: 'score', type: 'uint8' },
      { name: 'notesHash', type: 'bytes32' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'finalizeWinners',
    inputs: [
      { name: 'eventId', type: 'uint256' },
      { name: 'winners', type: 'address[]' },
      { name: 'amounts', type: 'uint128[]' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'cancelEvent',
    inputs: [{ name: 'eventId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claimPrize',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claimOrganizerRefund',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  // ── Read functions ────────────────────────────────────────────────────────
  {
    type: 'function',
    name: 'eventCount',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getEvent',
    inputs: [{ name: 'eventId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'title', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'externalUrl', type: 'string' },
          { name: 'eventType', type: 'uint8' },
          { name: 'status', type: 'uint8' },
          { name: 'organizer', type: 'address' },
          { name: 'totalPrizePool', type: 'uint128' },
          { name: 'allocatedPrizePool', type: 'uint128' },
          { name: 'submissionDeadline', type: 'uint40' },
          { name: 'judgingDeadline', type: 'uint40' },
          { name: 'submissionCount', type: 'uint32' },
          { name: 'reviewerCount', type: 'uint32' },
          { name: 'createdAt', type: 'uint40' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getEventsBatch',
    inputs: [
      { name: 'offset', type: 'uint256' },
      { name: 'limit', type: 'uint256' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'title', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'externalUrl', type: 'string' },
          { name: 'eventType', type: 'uint8' },
          { name: 'status', type: 'uint8' },
          { name: 'organizer', type: 'address' },
          { name: 'totalPrizePool', type: 'uint128' },
          { name: 'allocatedPrizePool', type: 'uint128' },
          { name: 'submissionDeadline', type: 'uint40' },
          { name: 'judgingDeadline', type: 'uint40' },
          { name: 'submissionCount', type: 'uint32' },
          { name: 'reviewerCount', type: 'uint32' },
          { name: 'createdAt', type: 'uint40' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getSubmission',
    inputs: [
      { name: 'eventId', type: 'uint256' },
      { name: 'submissionId', type: 'uint256' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'eventId', type: 'uint256' },
          { name: 'submitter', type: 'address' },
          { name: 'metadataUri', type: 'string' },
          { name: 'submissionHash', type: 'bytes32' },
          { name: 'submittedAt', type: 'uint40' },
          { name: 'scoreSum', type: 'uint32' },
          { name: 'reviewCount', type: 'uint16' },
          { name: 'disqualified', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getSubmissionsBatch',
    inputs: [
      { name: 'eventId', type: 'uint256' },
      { name: 'offset', type: 'uint256' },
      { name: 'limit', type: 'uint256' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'eventId', type: 'uint256' },
          { name: 'submitter', type: 'address' },
          { name: 'metadataUri', type: 'string' },
          { name: 'submissionHash', type: 'bytes32' },
          { name: 'submittedAt', type: 'uint40' },
          { name: 'scoreSum', type: 'uint32' },
          { name: 'reviewCount', type: 'uint16' },
          { name: 'disqualified', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getReview',
    inputs: [
      { name: 'eventId', type: 'uint256' },
      { name: 'submissionId', type: 'uint256' },
      { name: 'reviewer', type: 'address' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'score', type: 'uint16' },
          { name: 'notesHash', type: 'bytes32' },
          { name: 'reviewedAt', type: 'uint40' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'hasReviewed',
    inputs: [
      { name: 'eventId', type: 'uint256' },
      { name: 'submissionId', type: 'uint256' },
      { name: 'reviewer', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'userSubmissionId',
    inputs: [
      { name: '', type: 'uint256' },
      { name: '', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isEventReviewer',
    inputs: [
      { name: '', type: 'uint256' },
      { name: '', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'pendingPrizeWithdrawals',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'uint128' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'pendingOrganizerRefunds',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'uint128' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'paused',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  // ── Legacy mapping accessor (kept for backward compat with existing hooks) ──
  {
    type: 'function',
    name: 'events',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [
      { name: 'id', type: 'uint256' },
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'externalUrl', type: 'string' },
      { name: 'eventType', type: 'uint8' },
      { name: 'status', type: 'uint8' },
      { name: 'organizer', type: 'address' },
      { name: 'totalPrizePool', type: 'uint128' },
      { name: 'allocatedPrizePool', type: 'uint128' },
      { name: 'submissionDeadline', type: 'uint40' },
      { name: 'judgingDeadline', type: 'uint40' },
      { name: 'submissionCount', type: 'uint32' },
      { name: 'reviewerCount', type: 'uint32' },
      { name: 'createdAt', type: 'uint40' },
    ],
    stateMutability: 'view',
  },
  // ── Events ────────────────────────────────────────────────────────────────
  {
    type: 'event',
    name: 'EventCreated',
    inputs: [
      { name: 'eventId', type: 'uint256', indexed: true },
      { name: 'organizer', type: 'address', indexed: true },
      { name: 'eventType', type: 'uint8', indexed: false },
      { name: 'totalPrizePool', type: 'uint128', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'EntrySubmitted',
    inputs: [
      { name: 'eventId', type: 'uint256', indexed: true },
      { name: 'submissionId', type: 'uint256', indexed: true },
      { name: 'submitter', type: 'address', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'PrizeClaimed',
    inputs: [
      { name: 'eventId', type: 'uint256', indexed: true },
      { name: 'winner', type: 'address', indexed: true },
      { name: 'amount', type: 'uint128', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'OrganizerRefundClaimed',
    inputs: [
      { name: 'organizer', type: 'address', indexed: true },
      { name: 'amount', type: 'uint128', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'WinnersFinalized',
    inputs: [
      { name: 'eventId', type: 'uint256', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'EventCancelled',
    inputs: [
      { name: 'eventId', type: 'uint256', indexed: true },
    ],
  },
] as const
