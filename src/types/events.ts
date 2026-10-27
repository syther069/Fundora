export type EventCategory = 'hackathon' | 'contest'
export type EventModality = 'native_escrow' | 'external_listing'
export type EventStatus = 'upcoming' | 'active' | 'judging' | 'completed'

export interface PrizeTier {
  id: string
  place: string // e.g. "1st Place", "2nd Place", "3rd Place", "Track Winner"
  amountUsdc: bigint
  winnerSubmissionId?: string
  winnerAddress?: string
  isClaimed?: boolean
}

export interface Track {
  id: string
  name: string
  description: string
  prizePoolUsdc: bigint
  prizeTiers: PrizeTier[]
}

export interface RubricCriterion {
  id: string
  name: string
  description: string
  weightPercentage: number // e.g. 40 for 40%
  maxScore: number // default 10
}

export interface TeamMember {
  name: string
  role: string
  handle?: string // e.g. @builder_arc
  avatar?: string
  address?: string
}

export interface Submission {
  id: string
  eventId: string
  trackId?: string
  title: string
  tagline: string
  description: string
  submitterAddress: string
  submitterName: string
  teamMembers: TeamMember[]
  demoUrl?: string
  repoUrl?: string
  socialPostUrl?: string
  mediaUrls: string[]
  submittedAt: number // unix timestamp in seconds
  totalScore?: number // out of 10 or 100
  rank?: number // 1, 2, 3
  prizeAmountUsdc?: bigint
  claimTxHash?: string
}

export interface Event {
  id: string
  title: string
  tagline: string
  description: string
  category: EventCategory
  modality: EventModality
  status: EventStatus
  hostName: string
  hostAvatar?: string
  hostAddress?: string
  externalUrl?: string // For external_listing events (Devpost, DoraHacks, X)
  externalPlatformName?: string // e.g. "Devpost", "DoraHacks", "X / Twitter"
  totalPrizePoolUsdc: bigint
  contractAddress?: string // Arc Verified Escrow address
  chainId?: number // 5042002 for testnet, 5042 for mainnet
  bannerUrl?: string
  tags: string[]
  startDate: number // unix timestamp (seconds)
  submissionDeadline: number // unix timestamp (seconds)
  judgingDeadline: number // unix timestamp (seconds)
  winnersAnnouncedDate?: number // unix timestamp (seconds)
  tracks: Track[]
  rubric: RubricCriterion[]
  submissionsCount: number
  isBlindJudging?: boolean
}

export type CategoryFilter = 'all' | 'hackathon' | 'contest' | 'external'
export type StatusFilter = 'all' | 'active' | 'judging' | 'completed' | 'upcoming'
export type SortOption = 'prize-desc' | 'deadline-asc' | 'recent'
