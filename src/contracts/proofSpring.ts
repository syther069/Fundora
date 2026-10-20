// ProofSpring contract config — v2
// ABI is imported from the Foundry artifact for runtime use; the const below
// provides full TypeScript inference for wagmi/viem callsites.
// After any contract change: run `forge build` — the artifact auto-updates.
import artifact from '../../contracts/out/ProofSpring.sol/ProofSpring.json'

export const ARC_TESTNET_ID = 5042002

export const PROOF_SPRING_ADDRESS = '0x433cc087e4daf08f7875c9621c7a3efd950ef016' as `0x${string}`

// Cast through unknown so TypeScript accepts the wide artifact type as our strict const.
export const PROOF_SPRING_ABI = artifact.abi as unknown as typeof PROOF_SPRING_ABI_CONST

// ── ABI const ─────────────────────────────────────────────────────────────────
// Reflects the v2 contract: Grant struct has no `id` field, amounts are uint128,
// Milestone has evidenceHash (bytes32) instead of evidenceUri (string),
// createGrant takes a `deadline` (uint40) parameter, and new functions are added.
const PROOF_SPRING_ABI_CONST = [
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
  // MilestoneSubmitted emits the full evidenceUri string (not stored in contract storage)
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

  // ── View functions ──────────────────────────────────────────────────────────
  { type: 'function', name: 'admin', inputs: [], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'grantCount', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'reviewerCount', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'requiredApprovals', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'paused', inputs: [], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'totalFunded', inputs: [], outputs: [{ name: '', type: 'uint128' }], stateMutability: 'view' },
  { type: 'function', name: 'isReviewer', inputs: [{ name: '', type: 'address' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'pendingWithdrawals', inputs: [{ name: '', type: 'address' }], outputs: [{ name: '', type: 'uint128' }], stateMutability: 'view' },
  { type: 'function', name: 'pendingFunderRefunds', inputs: [{ name: '', type: 'address' }], outputs: [{ name: '', type: 'uint128' }], stateMutability: 'view' },

  // Grant struct — v2: no `id`, packed amounts (uint128), uint8 counts, uint40 timestamps, deadline
  {
    type: 'function', name: 'getGrant',
    inputs: [{ name: 'grantId', type: 'uint256' }],
    outputs: [{
      name: '', type: 'tuple',
      components: [
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

  // Batch fetch — single call replaces N multicalls (3.1)
  {
    type: 'function', name: 'getGrantsBatch',
    inputs: [{ name: 'fromId', type: 'uint256' }, { name: 'toId', type: 'uint256' }],
    outputs: [{
      name: '', type: 'tuple[]',
      components: [
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

  // Milestone struct — v2: evidenceHash (bytes32) instead of evidenceUri, packed types
  {
    type: 'function', name: 'getMilestone',
    inputs: [{ name: 'grantId', type: 'uint256' }, { name: 'milestoneIndex', type: 'uint256' }],
    outputs: [{
      name: '', type: 'tuple',
      components: [
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

  { type: 'function', name: 'getReviewerVote', inputs: [{ name: 'grantId', type: 'uint256' }, { name: 'milestoneIndex', type: 'uint256' }, { name: 'reviewer', type: 'address' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'getMilestoneRound', inputs: [{ name: 'grantId', type: 'uint256' }, { name: 'milestoneIndex', type: 'uint256' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'getMilestoneApprovalCount', inputs: [{ name: 'grantId', type: 'uint256' }, { name: 'milestoneIndex', type: 'uint256' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'getMilestoneVoteCounts', inputs: [{ name: 'grantId', type: 'uint256' }, { name: 'milestoneIndex', type: 'uint256' }], outputs: [{ name: 'approvals', type: 'uint128' }, { name: 'rejections', type: 'uint128' }], stateMutability: 'view' },

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
