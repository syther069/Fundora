// Fundora & AdminRegistry contract configuration
// ABI is exported as a strict typed const for full TypeScript inference with wagmi/viem.

export const ARC_TESTNET_ID = 5042002
export const ARC_MAINNET_ID = 5042

export const ARC_USDC_ADDRESS = '0x3600000000000000000000000000000000000000' as `0x${string}`

// Registration fees: 10 USDC on Testnet, 1 USDC on Mainnet
export const ADMIN_FEE_TESTNET = 10_000_000n // 10 USDC (6 decimals)
export const ADMIN_FEE_MAINNET = 1_000_000n  // 1 USDC (6 decimals)

export function getAdminRegistrationFee(chainId: number): bigint {
  return chainId === ARC_MAINNET_ID ? ADMIN_FEE_MAINNET : ADMIN_FEE_TESTNET
}

// Deployed contract addresses per network
export const FUNDORA_ADDRESS = (import.meta.env?.VITE_FUNDORA_ADDRESS || '0xef34036dda3960a1cd57b1368329bfcf29700259') as `0x${string}` // Arc Testnet v4/v5
export const FUNDORA_ADDRESS_MAINNET = (import.meta.env?.VITE_FUNDORA_ADDRESS_MAINNET || '0x371b4b6894882082e706cd84b781bf749472a602') as `0x${string}` // Arc Mainnet

export const ADMIN_REGISTRY_ADDRESS = (import.meta.env?.VITE_ADMIN_REGISTRY_ADDRESS || '0x9bf7d4681410f7db14490cc67d517e3621d73fe6') as `0x${string}`
export const ADMIN_REGISTRY_ADDRESS_MAINNET = (import.meta.env?.VITE_ADMIN_REGISTRY_ADDRESS_MAINNET || '0x0000000000000000000000000000000000000000') as `0x${string}`

export function getContractAddress(chainId: number): `0x${string}` {
  return chainId === ARC_MAINNET_ID ? FUNDORA_ADDRESS_MAINNET : FUNDORA_ADDRESS
}

export function getAdminRegistryAddress(chainId: number): `0x${string}` {
  return chainId === ARC_MAINNET_ID ? ADMIN_REGISTRY_ADDRESS_MAINNET : ADMIN_REGISTRY_ADDRESS
}

export const SUPPORTED_CHAIN_IDS = [ARC_TESTNET_ID, ARC_MAINNET_ID] as const

// ── AdminRegistry ABI ──────────────────────────────────────────────────────────
export const ADMIN_REGISTRY_ABI = [
  {
    type: 'constructor',
    inputs: [
      { name: '_usdc', type: 'address' },
      { name: '_initialTreasury', type: 'address' },
      { name: '_registrationFee', type: 'uint128' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', name: 'AlreadyRegistered', inputs: [] },
  { type: 'error', name: 'EmptyField', inputs: [] },
  { type: 'error', name: 'NotOwner', inputs: [] },
  { type: 'error', name: 'NotRegistered', inputs: [] },
  { type: 'error', name: 'ZeroAddress', inputs: [] },
  { type: 'error', name: 'ZeroAmount', inputs: [] },
  {
    type: 'event',
    name: 'AdminRegistered',
    inputs: [
      { name: 'admin', type: 'address', indexed: true },
      { name: 'arcHouseUsername', type: 'string', indexed: false },
      { name: 'orgName', type: 'string', indexed: false },
      { name: 'feePaid', type: 'uint128', indexed: false },
      { name: 'registeredAt', type: 'uint40', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'OwnershipTransferred',
    inputs: [
      { name: 'oldOwner', type: 'address', indexed: true },
      { name: 'newOwner', type: 'address', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'RegistrationFeeUpdated',
    inputs: [
      { name: 'oldFee', type: 'uint128', indexed: false },
      { name: 'newFee', type: 'uint128', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'TreasuryUpdated',
    inputs: [
      { name: 'oldTreasury', type: 'address', indexed: true },
      { name: 'newTreasury', type: 'address', indexed: true },
    ],
  },
  {
    type: 'function',
    name: 'adminCount',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'adminProfiles',
    inputs: [{ name: '', type: 'address' }],
    outputs: [
      { name: 'arcHouseUsername', type: 'string' },
      { name: 'orgName', type: 'string' },
      { name: 'grantDescription', type: 'string' },
      { name: 'estimatedBudget', type: 'uint128' },
      { name: 'numWinners', type: 'uint32' },
      { name: 'prizePoolDetails', type: 'string' },
      { name: 'registeredAt', type: 'uint40' },
      { name: 'feePaid', type: 'uint128' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAdminProfile',
    inputs: [{ name: 'admin', type: 'address' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'arcHouseUsername', type: 'string' },
          { name: 'orgName', type: 'string' },
          { name: 'grantDescription', type: 'string' },
          { name: 'estimatedBudget', type: 'uint128' },
          { name: 'numWinners', type: 'uint32' },
          { name: 'prizePoolDetails', type: 'string' },
          { name: 'registeredAt', type: 'uint40' },
          { name: 'feePaid', type: 'uint128' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getRegisteredAdmins',
    inputs: [],
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isAdmin',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'registerAdmin',
    inputs: [
      { name: 'arcHouseUsername', type: 'string' },
      { name: 'orgName', type: 'string' },
      { name: 'grantDescription', type: 'string' },
      { name: 'estimatedBudget', type: 'uint128' },
      { name: 'numWinners', type: 'uint32' },
      { name: 'prizePoolDetails', type: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'registeredAdmins',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'registrationFee',
    inputs: [],
    outputs: [{ name: '', type: 'uint128' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'setRegistrationFee',
    inputs: [{ name: 'newFee', type: 'uint128' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setTreasury',
    inputs: [{ name: 'newTreasury', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [{ name: 'newOwner', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'treasury',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'usdc',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
] as const

// ── Fundora ABI const ──────────────────────────────────────────────────────────
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
  { type: 'event', name: 'AdminRegistrySet', inputs: [{ name: 'adminRegistry', type: 'address', indexed: true }] },
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

  // ── View functions ──────────────────────────────────────────────────────────
  { type: 'function', name: 'admin', inputs: [], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'adminRegistry', inputs: [], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'isAuthorizedAdmin', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'grantCreator', inputs: [{ name: '', type: 'uint256' }], outputs: [{ name: '', type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'grantCount', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'reviewerCount', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'requiredApprovals', inputs: [], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'paused', inputs: [], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'totalFunded', inputs: [], outputs: [{ name: '', type: 'uint128' }], stateMutability: 'view' },
  { type: 'function', name: 'isReviewer', inputs: [{ name: '', type: 'address' }], outputs: [{ name: '', type: 'bool' }], stateMutability: 'view' },
  { type: 'function', name: 'pendingWithdrawals', inputs: [{ name: '', type: 'address' }], outputs: [{ name: '', type: 'uint128' }], stateMutability: 'view' },
  { type: 'function', name: 'pendingFunderRefunds', inputs: [{ name: '', type: 'address' }], outputs: [{ name: '', type: 'uint128' }], stateMutability: 'view' },

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
  { type: 'function', name: 'setAdminRegistry', inputs: [{ name: '_adminRegistry', type: 'address' }], outputs: [], stateMutability: 'nonpayable' },

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

export const FUNDORA_ABI = FUNDORA_ABI_CONST
