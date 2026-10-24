// Fundora contract config — v2
// ABI is imported from the Foundry artifact for runtime use; the const below
// provides full TypeScript inference for wagmi/viem callsites.
// After any contract change: run `forge build` — the artifact auto-updates.
import artifact from '../../contracts/out/Fundora.sol/Fundora.json'

export const ARC_TESTNET_ID = 5042002
export const ARC_MAINNET_ID = 5042

export const CANONICAL_USDC_ADDRESS = '0x3600000000000000000000000000000000000000' as `0x${string}`

// Default fallback deployment address (Arc Testnet v2)
export const FUNDORA_ADDRESS = '0x956b9d4b1c4a5f8ec2f647bb3b0999d98c46b388' as `0x${string}`

export const FUNDORA_ADDRESSES: Record<number, `0x${string}`> = {
  [ARC_TESTNET_ID]: '0x956b9d4b1c4a5f8ec2f647bb3b0999d98c46b388',
  [ARC_MAINNET_ID]: '0x371b4b6894882082e706cd84b781bf749472a602',
}

export function getFundoraAddress(chainId?: number): `0x${string}` {
  if (chainId && FUNDORA_ADDRESSES[chainId]) {
    return FUNDORA_ADDRESSES[chainId]
  }
  return FUNDORA_ADDRESS
}

// Backward compatibility aliases
export const PROOF_SPRING_ADDRESS = FUNDORA_ADDRESS
export const PROOF_SPRING_ADDRESSES = FUNDORA_ADDRESSES
export const getProofSpringAddress = getFundoraAddress

// Cast through unknown so TypeScript accepts the wide artifact type as our strict const.
export const FUNDORA_ABI = artifact.abi as unknown as typeof FUNDORA_ABI_CONST
export const PROOF_SPRING_ABI = FUNDORA_ABI

// ── ABI const ─────────────────────────────────────────────────────────────────
// Reflects the Fundora v2 contract: Grant struct has no `id` field, amounts are uint128,
// Milestone has evidenceHash (bytes32) instead of evidenceUri (string),
// createGrant takes a `deadline` (uint40) parameter, and new functions are added.
const FUNDORA_ABI_CONST = [
  // Constructor
  { type: 'constructor', inputs: [{ name: '_usdc', type: 'address' }, { name: '_initialAdmin', type: 'address' }, { name: '_requiredApprovals', type: 'uint256' }], stateMutability: 'nonpayable' },

  // ── Custom errors ───────────────────────────────────────────────────────────
  { type: 'error', name: 'AlreadyVoted', inputs: [] },
  { type: 'error', name: 'ArrayLengthMismatch', inputs: [] },
  { type: 'error', name: 'InsufficientApprovers', inputs: [] },
  { type: 'error', name: 'InvalidGrant', inputs: [] },
  { type: 'error', name: 'InvalidMilestone', inputs: [] },
  { type: 'error', name: 'InvalidStatus', inputs: [] },
  { type: 'error', name: 'NotAdmin', inputs: [] },
  { type: 'error', name: 'NotBuilder', inputs: [] },
  { type: 'error', name: 'NotReviewer', inputs: [] },
  { type: 'error', name: 'ZeroAddress', inputs: [] },
  { type: 'error', name: 'ZeroAmount', inputs: [] },
  { type: 'error', name: 'Paused', inputs: [] },
  { type: 'error', name: 'DeadlineExpired', inputs: [] },
  { type: 'error', name: 'MaxMilestonesExceeded', inputs: [] },
  { type: 'error', name: 'NoRefundDue', inputs: [] },
  { type: 'error', name: 'AdminCannotBeBuilder', inputs: [] },
  { type: 'error', name: 'NotExpired', inputs: [] },
  { type: 'error', name: 'BatchTooLarge', inputs: [] },

  // ── Events ──────────────────────────────────────────────────────────────────
  { type: 'event', name: 'AdminSet', inputs: [{ name: 'admin', type: 'address', indexed: true }] },
  { type: 'event', name: 'AdminTransferred', inputs: [{ name: 'oldAdmin', type: 'address', indexed: true }, { name: 'newAdmin', type: 'address', indexed: true }] },
  { type: 'event', name: 'ReviewerAdded', inputs: [{ name: 'reviewer', type: 'address', indexed: true }] },
  { type: 'event', name: 'ReviewerRemoved', inputs: [{ name: 'reviewer', type: 'address', indexed: true }] },
  { type: 'event', name: 'RequiredApprovalsChanged', inputs: [{ name: 'oldVal', type: 'uint256', indexed: false }, { name: 'newVal', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'GrantCreated', inputs: [{ name: 'grantId', type: 'uint256', indexed: true }, { name: 'title', type: 'string', indexed: false }, { name: 'creator', type: 'address', indexed: true }] },
  { type: 'event', name: 'GrantFunded', inputs: [{ name: 'grantId', type: 'uint256', indexed: true }, { name: 'amount', type: 'uint256', indexed: false }, { name: 'funder', type: 'address', indexed: true }] },
  { type: 'event', name: 'GrantApplied', inputs: [{ name: 'grantId', type: 'uint256', indexed: true }, { name: 'builder', type: 'address', indexed: true }] },
  { type: 'event', name: 'MilestoneSubmitted', inputs: [{ name: 'grantId', type: 'uint256', indexed: true }, { name: 'milestoneIndex', type: 'uint256', indexed: true }, { name: 'evidenceUri', type: 'string', indexed: false }, { name: 'builder', type: 'address', indexed: true }] },
  { type: 'event', name: 'MilestoneReviewCast', inputs: [{ name: 'grantId', type: 'uint256', indexed: true }, { name: 'milestoneIndex', type: 'uint256', indexed: true }, { name: 'reviewer', type: 'address', indexed: true }, { name: 'approved', type: 'bool', indexed: false }] },
  { type: 'event', name: 'MilestoneApproved', inputs: [{ name: 'grantId', type: 'uint256', indexed: true }, { name: 'milestoneIndex', type: 'uint256', indexed: true }, { name: 'amount', type: 'uint256', indexed: false }, { name: 'builder', type: 'address', indexed: true }] },
  { type: 'event', name: 'MilestonePaymentQueued', inputs: [{ name: 'grantId', type: 'uint256', indexed: true }, { name: 'milestoneIndex', type: 'uint256', indexed: true }, { name: 'amount', type: 'uint256', indexed: false }, { name: 'builder', type: 'address', indexed: true }] },
  { type: 'event', name: 'PaymentClaimed', inputs: [{ name: 'builder', type: 'address', indexed: true }, { name: 'amount', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'GrantCompleted', inputs: [{ name: 'grantId', type: 'uint256', indexed: true }, { name: 'builder', type: 'address', indexed: true }] },
  { type: 'event', name: 'GrantCancelled', inputs: [{ name: 'grantId', type: 'uint256', indexed: true }, { name: 'admin', type: 'address', indexed: true }] },
  { type: 'event', name: 'ContractPaused', inputs: [{ name: 'by', type: 'address', indexed: true }] },
  { type: 'event', name: 'ContractUnpaused', inputs: [{ name: 'by', type: 'address', indexed: true }] },
  { type: 'event', name: 'GrantExpired', inputs: [{ name: 'grantId', type: 'uint256', indexed: true }] },
  { type: 'event', name: 'BuilderReassigned', inputs: [{ name: 'grantId', type: 'uint256', indexed: true }, { name: 'oldBuilder', type: 'address', indexed: true }, { name: 'newBuilder', type: 'address', indexed: true }] },
  { type: 'event', name: 'FunderRefundQueued', inputs: [{ name: 'grantId', type: 'uint256', indexed: true }, { name: 'amount', type: 'uint256', indexed: false }, { name: 'funder', type: 'address', indexed: true }] },
  { type: 'event', name: 'FunderRefundClaimed', inputs: [{ name: 'funder', type: 'address', indexed: true }, { name: 'amount', type: 'uint256', indexed: false }] },
  { type: 'event', name: 'GrantDeadlineSet', inputs: [{ name: 'grantId', type: 'uint256', indexed: true }, { name: 'deadline', type: 'uint40', indexed: false }] },

  // ── Read functions ──────────────────────────────────────────────────────────
  { type: 'function', name: 'admin', inputs: [], outputs: [{ type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'usdc', inputs: [], outputs: [{ type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'grantCount', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'reviewerCount', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'requiredApprovals', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'totalFunded', inputs: [], outputs: [{ type: 'uint128' }], stateMutability: 'view' },
  { type: 'function', name: 'paused', inputs: [], outputs: [{ type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'isReviewer', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'pendingWithdrawals', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint128' }], stateMutability: 'view' },
  { type: 'function', name: 'pendingFunderRefunds', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint128' }], stateMutability: 'view' },

  // getGrant: returns Grant struct without `id`
  {
    type: 'function', name: 'getGrant',
    inputs: [{ name: 'grantId', type: 'uint256' }],
    outputs: [{
      type: 'tuple', components: [
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'funder', type: 'address' },
        { name: 'builder', type: 'address' },
        { name: 'totalAmount', type: 'uint128' },
        { name: 'releasedAmount', type: 'uint128' },
        { name: 'milestoneCount', type: 'uint8' },
        { name: 'approvedMilestoneCount', type: 'uint8' },
        { name: 'status', type: 'uint8' },
        { name: 'createdAt', type: 'uint40' },
        { name: 'deadline', type: 'uint40' },
      ],
    }],
    stateMutability: 'view',
  },

  // getMilestone: evidenceHash (bytes32) instead of evidenceUri
  {
    type: 'function', name: 'getMilestone',
    inputs: [{ name: 'grantId', type: 'uint256' }, { name: 'milestoneIndex', type: 'uint256' }],
    outputs: [{
      type: 'tuple', components: [
        { name: 'index', type: 'uint8' },
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'amount', type: 'uint128' },
        { name: 'status', type: 'uint8' },
        { name: 'submittedBy', type: 'address' },
        { name: 'evidenceHash', type: 'bytes32' },
        { name: 'submittedAt', type: 'uint40' },
        { name: 'approvedAt', type: 'uint40' },
      ],
    }],
    stateMutability: 'view',
  },

  { type: 'function', name: 'getReviewerVote', inputs: [{ name: 'grantId', type: 'uint256' }, { name: 'milestoneIndex', type: 'uint256' }, { name: 'reviewer', type: 'address' }], outputs: [{ type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'getMilestoneRound', inputs: [{ name: 'grantId', type: 'uint256' }, { name: 'milestoneIndex', type: 'uint256' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'getMilestoneApprovalCount', inputs: [{ name: 'grantId', type: 'uint256' }, { name: 'milestoneIndex', type: 'uint256' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  {
    type: 'function', name: 'getMilestoneVoteCounts',
    inputs: [{ name: 'grantId', type: 'uint256' }, { name: 'milestoneIndex', type: 'uint256' }],
    outputs: [{ name: 'approvals', type: 'uint128' }, { name: 'rejections', type: 'uint128' }],
    stateMutability: 'view',
  },
  {
    type: 'function', name: 'getGrantsBatch',
    inputs: [{ name: 'fromId', type: 'uint256' }, { name: 'toId', type: 'uint256' }],
    outputs: [{
      type: 'tuple[]', components: [
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'funder', type: 'address' },
        { name: 'builder', type: 'address' },
        { name: 'totalAmount', type: 'uint128' },
        { name: 'releasedAmount', type: 'uint128' },
        { name: 'milestoneCount', type: 'uint8' },
        { name: 'approvedMilestoneCount', type: 'uint8' },
        { name: 'status', type: 'uint8' },
        { name: 'createdAt', type: 'uint40' },
        { name: 'deadline', type: 'uint40' },
      ],
    }],
    stateMutability: 'view',
  },

  // ── Write functions ─────────────────────────────────────────────────────────
  { type: 'function', name: 'addReviewer', inputs: [{ name: 'reviewer', type: 'address' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'removeReviewer', inputs: [{ name: 'reviewer', type: 'address' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'setRequiredApprovals', inputs: [{ name: 'n', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },

  // createGrant now takes `deadline` (uint40) as last parameter; 0 = no deadline
  {
    type: 'function', name: 'createGrant',
    inputs: [
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'milestoneCount', type: 'uint256' },
      { name: 'milestoneTitles', type: 'string[]' },
      { name: 'milestoneDescs', type: 'string[]' },
      { name: 'milestoneAmounts', type: 'uint256[]' },
      { name: 'deadline', type: 'uint40' },
    ],
    outputs: [{ name: 'grantId', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  { type: 'function', name: 'fundGrant', inputs: [{ name: 'grantId', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'applyForGrant', inputs: [{ name: 'grantId', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'submitMilestoneEvidence', inputs: [{ name: 'grantId', type: 'uint256' }, { name: 'milestoneIndex', type: 'uint256' }, { name: 'evidenceUri', type: 'string' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'reviewMilestone', inputs: [{ name: 'grantId', type: 'uint256' }, { name: 'milestoneIndex', type: 'uint256' }, { name: 'approve', type: 'bool' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'claimPayment', inputs: [], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'claimFunderRefund', inputs: [], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'cancelGrant', inputs: [{ name: 'grantId', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'expireGrant', inputs: [{ name: 'grantId', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'adminReassignBuilder', inputs: [{ name: 'grantId', type: 'uint256' }, { name: 'newBuilder', type: 'address' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'pause', inputs: [], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'unpause', inputs: [], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'transferAdmin', inputs: [{ name: 'newAdmin', type: 'address' }], outputs: [], stateMutability: 'nonpayable' },
] as const
