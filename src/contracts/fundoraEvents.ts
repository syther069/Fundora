import { ARC_TESTNET_ID, ARC_MAINNET_ID } from './fundora'

export const FUNDORA_EVENTS_ADDRESS_TESTNET = (import.meta.env?.VITE_FUNDORA_EVENTS_ADDRESS || '0xef34036dda3960a1cd57b1368329bfcf29700259') as `0x${string}`
export const FUNDORA_EVENTS_ADDRESS_MAINNET = (import.meta.env?.VITE_FUNDORA_EVENTS_ADDRESS_MAINNET || '0x371b4b6894882082e706cd84b781bf749472a602') as `0x${string}`

export function getFundoraEventsAddress(chainId?: number): `0x${string}` {
  return chainId === ARC_MAINNET_ID ? FUNDORA_EVENTS_ADDRESS_MAINNET : FUNDORA_EVENTS_ADDRESS_TESTNET
}

export const FUNDORA_EVENTS_ABI = [
  {
    type: 'function',
    name: 'createEvent',
    inputs: [
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'externalUrl', type: 'string' },
      { name: 'eventType', type: 'uint8' }, // 0: NativeEscrow, 1: ExternalListing
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
] as const
