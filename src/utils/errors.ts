import { ContractFunctionRevertedError } from 'viem'

// Map viem custom error names to human-readable messages
const CUSTOM_ERROR_MAP: Record<string, string> = {
  AlreadyVoted: 'You already voted on this milestone.',
  NotAdmin: 'Only the admin can do this.',
  NotReviewer: 'Only reviewers can vote.',
  NotBuilder: 'Only the assigned builder can do this.',
  InvalidGrant: 'Grant does not exist.',
  InvalidMilestone: 'Milestone does not exist.',
  InvalidStatus: 'Action not allowed in the current state.',
  ZeroAddress: 'Address cannot be zero.',
  ZeroAmount: 'Amount must be greater than zero.',
  ArrayLengthMismatch: 'Milestone arrays must have the same length.',
  InsufficientApprovers: 'Not enough reviewers for that approval threshold.',
}

export function parseOnchainError(error: unknown): string {
  // 1. viem ContractFunctionRevertedError — check errorName first
  if (error instanceof ContractFunctionRevertedError) {
    const name = error.data?.errorName ?? ''
    if (name && CUSTOM_ERROR_MAP[name]) return CUSTOM_ERROR_MAP[name]
  }

  // 2. Fallback: scan the stringified message for known patterns
  const msg = (error as { message?: string; shortMessage?: string })
  const raw = ((msg?.shortMessage ?? '') + ' ' + (msg?.message ?? '')).toLowerCase()

  if (raw.includes('user rejected') || raw.includes('user denied') || raw.includes('action_rejected')) return 'Transaction cancelled.'
  if (raw.includes('insufficient')) return 'Insufficient balance.'
  if (raw.includes('alreadyvoted')) return CUSTOM_ERROR_MAP.AlreadyVoted
  if (raw.includes('notadmin')) return CUSTOM_ERROR_MAP.NotAdmin
  if (raw.includes('notreviewer')) return CUSTOM_ERROR_MAP.NotReviewer
  if (raw.includes('notbuilder')) return CUSTOM_ERROR_MAP.NotBuilder
  if (raw.includes('invalidstatus')) return CUSTOM_ERROR_MAP.InvalidStatus
  if (raw.includes('zeroaddress')) return CUSTOM_ERROR_MAP.ZeroAddress
  if (raw.includes('zeroamount')) return CUSTOM_ERROR_MAP.ZeroAmount
  if (raw.includes('insufficientapprovers')) return CUSTOM_ERROR_MAP.InsufficientApprovers
  if (raw.includes('reverted')) return 'Transaction failed. Check contract state and try again.'

  return 'Something went wrong. Please try again.'
}
