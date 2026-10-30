import { useState, useMemo } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { AnimatedGroup } from './components/ui/animated-group'
import { TextEffect } from './components/ui/text-effect'
import { useAccount, useSwitchChain } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import {
  Users, Zap, ShieldCheck, TrendingUp, AlertTriangle, ArrowRight,
  Trophy, Compass, Layers, PlusCircle, LayoutGrid, CheckCircle2
} from 'lucide-react'
import { Header } from './components/Header'
import { GrantCard } from './components/GrantCard'
import { GrantDetail } from './components/GrantDetail'
import { AdminPanel } from './components/AdminPanel'
import { ApplyAdminModal } from './components/ApplyAdminModal'
import { useContractAdmin, useIsReviewer } from './hooks/useFundora'
import { useUnifiedIsAdmin } from './hooks/useAdminRegistry'
import { OrganizerTypeModal } from './components/events/OrganizerTypeModal'
import { OrganizerReviewPanel } from './components/events/OrganizerReviewPanel'
import { useGrants } from './context/GrantsContext'
import type { Grant } from './hooks/useFundora'
import { FUNDORA_ADDRESS, ARC_TESTNET_ID, ARC_MAINNET_ID, SUPPORTED_CHAIN_IDS } from './contracts/fundora'
import { useActiveChainId } from './hooks/useFundora'

// New Phase 2 Event Directory Components & Context
import { useEvents } from './context/EventsContext'
import { EventCard } from './components/events/EventCard'
import { EventDirectoryToolbar } from './components/events/EventDirectoryToolbar'
import { EventSkeletonGrid } from './components/events/EventSkeletonGrid'
import { EventDetailView } from './components/events/EventDetailView'
import { ParticipantSubmitWizard } from './components/events/ParticipantSubmitWizard'
import { SubmissionReceiptModal } from './components/events/SubmissionReceiptModal'
import { EventPublishedModal } from './components/events/EventPublishedModal'
import type { Submission, Event } from './types/events'

// Phase 3 imports
import { OrganizerCreateWizard } from './components/events/OrganizerCreateWizard'
import {
  usePendingPrizeWithdrawals,
  useClaimPrize,
  usePendingOrganizerRefunds,
  useClaimOrganizerRefund,
  useUserSubmissionId,
} from './hooks/useFundoraEvents'
import { formatUnits } from 'viem'

// Phase 4 imports
import { useMode } from './context/ModeContext'

// Phase 5 imports
import { ReviewerWorkspace } from './components/events/ReviewerWorkspace'
import { DeliberationLeaderboard } from './components/events/DeliberationLeaderboard'
import { SettlementConsole } from './components/events/SettlementConsole'
import type { WinnerMapping } from './components/events/DeliberationLeaderboard'

type View = 'events' | 'event-detail' | 'participant' | 'reviewer' | 'organizer' | 'grants' | 'detail' | 'admin'

const _NOT_DEPLOYED = FUNDORA_ADDRESS === '0x0000000000000000000000000000000000000000'

// ── Hero: disconnected state (legacy grants) ──────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function HeroConnect({ onOpenApplyAdmin }: { onOpenApplyAdmin?: () => void }) {
  const shouldReduce = useReducedMotion()
  const features = [
    { icon: <Zap size={12} />, label: 'Instant USDC payouts', color: 'var(--amber)' },
    { icon: <ShieldCheck size={12} />, label: 'Onchain evidence', color: 'var(--teal)' },
    { icon: <Users size={12} />, label: 'Reviewer governance', color: 'var(--brand)' },
    { icon: <TrendingUp size={12} />, label: 'Transparent milestones', color: 'var(--violet)' },
  ]

  return (
    <div
      className="card rounded-3xl overflow-hidden max-w-lg mx-auto"
      style={{ boxShadow: 'var(--shadow-lg)' }}
    >
      <div
        className="h-2"
        style={{ background: 'linear-gradient(90deg, #1A3F75 0%, #0F766E 50%, #B45309 100%)' }}
        aria-hidden="true"
      />

      <div className="px-5 py-8 sm:px-8 sm:py-10 text-center">
        <div
          className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #1A3F75 0%, #0F766E 100%)',
            boxShadow: '0 8px 24px rgba(26,63,117,.28)',
          }}
          aria-hidden="true"
        >
          <svg width="28" height="28" viewBox="0 0 16 16" fill="none">
            <circle cx="6" cy="8" r="4.5" stroke="white" strokeWidth="1.5" fill="none" opacity="0.9" />
            <circle cx="10" cy="8" r="4.5" stroke="white" strokeWidth="1.5" fill="none" opacity="0.6" />
            <path d="M10 6h1.5v2H10" stroke="white" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <TextEffect
          as="h1"
          per="word"
          preset={shouldReduce ? 'fade' : 'fade-in-blur'}
          className="font-jakarta font-extrabold text-3xl mb-3 text-midnight"
          style={{ letterSpacing: '-0.03em' }}
        >
          Fundora
        </TextEffect>
        <p className="text-base leading-relaxed max-w-sm mx-auto mb-6" style={{ color: 'var(--muted)' }}>
          Milestone-based USDC grants with onchain evidence, reviewer votes, and transparent payouts — built on Arc.
        </p>

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {features.map(({ icon, label, color }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border"
              style={{ background: 'var(--warm-bg-2)', color, borderColor: 'var(--border)' }}
            >
              {icon}
              {label}
            </span>
          ))}
        </div>

        <div className="flex flex-col items-center gap-3">
          <ConnectKitButton label="Connect Wallet to Get Started" />
          {onOpenApplyAdmin && (
            <button
              id="hero-apply-admin-btn"
              onClick={onOpenApplyAdmin}
              className="text-xs font-semibold flex items-center gap-1.5 transition-all hover:opacity-80 py-1 px-3 rounded-full border btn-focus"
              style={{
                color: 'var(--brand)',
                borderColor: 'var(--brand-border)',
                background: 'var(--brand-light)',
              }}
            >
              <ShieldCheck size={13} aria-hidden="true" />
              Apply as a Grant Admin
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Legacy Grants Stats Strip ─────────────────────────────────────────────────
function StatsStrip({ grants }: { grants: Grant[] }) {
  const total = grants.length
  const active = grants.filter(g => g.status === 1).length
  const done = grants.filter(g => g.status === 2).length
  const tvlRaw = grants.reduce((s, g) => s + BigInt(g.totalAmount), 0n)
  const tvlDollars = tvlRaw / 1_000_000n

  const stats = [
    { label: 'Total Grants', value: total.toString(), color: 'var(--brand)' },
    { label: 'Active', value: active.toString(), color: 'var(--teal)' },
    { label: 'Completed', value: done.toString(), color: 'var(--teal)' },
    { label: 'Total USDC', value: `$${tvlDollars.toString()}`, color: 'var(--amber)' },
  ]

  if (total === 0) return null

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl p-4 border"
      style={{ background: 'var(--warm-surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}
    >
      {stats.map(({ label, value, color }) => (
        <div key={label} className="text-center">
          <div className="font-jakarta font-bold text-xl tabular-nums" style={{ color }}>
            {value}
          </div>
          <div className="label-caps mt-0.5">{label}</div>
        </div>
      ))}
    </div>
  )
}

// ── Role banner ───────────────────────────────────────────────────────────────
function RoleBanner({ isAdmin, isReviewer }: { isAdmin: boolean; isReviewer: boolean }) {
  if (!isAdmin && !isReviewer) return null
  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-4">
      <div
        className="rounded-xl px-4 py-2.5 flex items-center justify-between text-xs font-medium border"
        style={{
          background: isAdmin ? 'var(--brand-light)' : 'var(--teal-light)',
          borderColor: isAdmin ? 'var(--brand-border)' : 'var(--teal-border)',
          color: isAdmin ? 'var(--brand)' : 'var(--teal)',
        }}
      >
        <span className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: isAdmin ? 'var(--brand)' : 'var(--teal)' }}
            aria-hidden="true"
          />
          {isAdmin && isReviewer
            ? 'Connected as Contract Admin & Reviewer'
            : isAdmin
              ? 'Connected as Contract Admin'
              : 'Connected as Assigned Reviewer'}
        </span>
        <span className="font-mono text-[11px] opacity-75 hidden sm:inline">
          {isAdmin ? 'Full governance access' : 'Reviewer access enabled'}
        </span>
      </div>
    </div>
  )
}

// ── Wrong-chain banner ────────────────────────────────────────────────────────
function WrongChainBanner({ chainId }: { chainId: number | undefined }) {
  const { switchChain } = useSwitchChain()
  const { isLive } = useMode()

  // 1. Completely unsupported chain
  const isUnsupported = chainId !== undefined && !(SUPPORTED_CHAIN_IDS as readonly number[]).includes(chainId)

  // 2. Network mismatch between app mode and connected wallet chain
  const isMismatch = chainId !== undefined && (
    (isLive && chainId !== ARC_MAINNET_ID) ||
    (!isLive && chainId === ARC_MAINNET_ID)
  )

  if (!isUnsupported && !isMismatch) return null

  const targetChainId = isLive ? ARC_MAINNET_ID : ARC_TESTNET_ID
  const targetChainName = isLive ? 'Arc Mainnet' : 'Arc Testnet'

  return (
    <div
      className="border-b px-4 py-2.5 text-center text-xs font-medium flex items-center justify-center gap-2 flex-wrap"
      style={{
        background: 'var(--coral-light)',
        borderColor: 'var(--coral-border)',
        color: 'var(--coral)',
      }}
      role="alert"
    >
      <AlertTriangle size={14} className="shrink-0" aria-hidden="true" />
      <span>
        {isUnsupported
          ? `Unsupported network (Chain ID: ${chainId}).`
          : `Network Mismatch: You are viewing ${isLive ? 'Live Mode' : 'Demo Mode'}, but your wallet is connected to ${chainId === ARC_MAINNET_ID ? 'Arc Mainnet' : 'Arc Testnet'}.`}
        {' '}Switch to <strong>{targetChainName}</strong> to interact.
      </span>
      {switchChain && (
        <button
          onClick={() => switchChain({ chainId: targetChainId })}
          className="underline font-bold ml-1.5 hover:opacity-80 btn-focus px-2 py-0.5 rounded bg-white/60 border border-coral-border shadow-xs"
        >
          Switch to {targetChainName}
        </button>
      )}
    </div>
  )
}

// ── Network toggle ────────────────────────────────────────────────────────────
function NetworkToggle({ chainId }: { chainId: number | undefined }) {
  const { switchChain } = useSwitchChain()
  const isMainnet = chainId === ARC_MAINNET_ID
  const isTestnet = chainId === ARC_TESTNET_ID
  if (!isMainnet && !isTestnet) return null

  return (
    <div
      className="inline-flex items-center p-0.5 rounded-full border text-xs"
      style={{ background: 'var(--warm-bg-2)', borderColor: 'var(--border)' }}
      role="group"
      aria-label="Network selector"
    >
      <button
        onClick={() => switchChain && switchChain({ chainId: ARC_TESTNET_ID })}
        className="px-2.5 py-1 rounded-full font-medium transition-all"
        style={isTestnet ? {
          background: 'var(--warm-surface)',
          color: 'var(--teal)',
          boxShadow: 'var(--shadow-sm)',
          fontWeight: 600,
        } : {
          color: 'var(--muted)',
        }}
        aria-pressed={isTestnet}
      >
        Testnet
      </button>
      <button
        onClick={() => switchChain && switchChain({ chainId: ARC_MAINNET_ID })}
        className="px-2.5 py-1 rounded-full font-medium transition-all"
        style={isMainnet ? {
          background: 'var(--warm-surface)',
          color: 'var(--brand)',
          boxShadow: 'var(--shadow-sm)',
          fontWeight: 600,
        } : {
          color: 'var(--muted)',
        }}
        aria-pressed={isMainnet}
      >
        Mainnet
      </button>
    </div>
  )
}

// ── Main App Component ────────────────────────────────────────────────────────
export default function App() {
  const { address, isConnected, chainId } = useAccount()
  const activeChainId = useActiveChainId()
  const [view, setView] = useState<View>('events')
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null)
  const [navigating, setNavigating] = useState<string | null>(null)

  // Legacy Grants State
  // Grant search/filter state (reserved for toolbar wiring in a future phase)
  const [_grantSearch, _setGrantSearch] = useState('')
  const [_grantStatusFilter, _setGrantStatusFilter] = useState<'all' | 'active' | 'pending' | 'completed' | 'cancelled'>('all')
  const { grants, refetch: refetchGrants } = useGrants()

  const { data: _contractAdmin } = useContractAdmin()
  const { data: isReviewer } = useIsReviewer(address)
  const { isAdmin, refetch: refetchIsAdmin } = useUnifiedIsAdmin()
  const shouldReduce = useReducedMotion()
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [organizerTypeModalOpen, setOrganizerTypeModalOpen] = useState(false)
  const [selectedOrgCategory, setSelectedOrgCategory] = useState<'hackathon' | 'contest' | null>(null)
  const [publishedEvent, setPublishedEvent] = useState<Event | null>(null)

  // Phase 4 — Demo / Live mode
  const { isLive } = useMode()

  // Events Context (Phase 2 Hackathons & Contests)
  const {
    events,
    activeEvent,
    setActiveEventId,
    getSubmissionsForEvent,
    addSubmission,
    submissions,
    isLoading: eventsLoading,
    categoryFilter,
    setCategoryFilter,
    statusFilter: eventStatusFilter,
    setStatusFilter: setEventStatusFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filteredEvents,
    counts,
    statusCounts,
    resetFilters,
  } = useEvents()

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [receiptSubmission, setReceiptSubmission] = useState<Submission | null>(null)

  const activeUserAddress = address

  const activeEventIdBig = activeEvent
    ? (() => {
        try {
          return BigInt(activeEvent.id.replace(/\D/g, '') || '0')
        } catch {
          return 0n
        }
      })()
    : 0n

  const { data: activeUserSubmissionId } = useUserSubmissionId(
    activeEvent && activeEvent.modality === 'native_escrow' && activeEventIdBig > 0n ? activeEventIdBig : undefined,
    activeUserAddress as `0x${string}` | undefined,
  )

  const _userSubmissions = useMemo(() => {
    if (!activeUserAddress) return []
    const all = Object.values(submissions).flat()
    return all.filter(
      (s) => s.submitterAddress?.toLowerCase() === activeUserAddress.toLowerCase()
    )
  }, [submissions, activeUserAddress])

  const handleSubmissionSuccess = (newSub: Submission) => {
    addSubmission(newSub)
    setIsSubmitModalOpen(false)
    setReceiptSubmission(newSub)
  }

  // Precomputed event metrics for hero strip
  const totalEscrowUsdc = useMemo(() => {
    const raw = events.reduce((sum, e) => sum + e.totalPrizePoolUsdc, 0n)
    return Number(raw / 1_000_000n).toLocaleString('en-US')
  }, [events])

  const totalEntriesCount = useMemo(() => {
    return events.reduce((sum, e) => sum + e.submissionsCount, 0)
  }, [events])

  const handleSelectEvent = (eventId: string) => {
    setActiveEventId(eventId)
    setView('event-detail')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSelectGrant = (grant: Grant) => {
    setNavigating(grant.id.toString())
    setTimeout(() => {
      setSelectedGrant(grant)
      setView('detail')
      setNavigating(null)
    }, 80)
  }

  const handleBackToGrants = () => {
    setSelectedGrant(null)
    setView('grants')
    refetchGrants()
  }

  // ── Phase 3: Organizer Create Wizard ──────────────────────────────────────
  const [organizerWizardOpen, setOrganizerWizardOpen] = useState(false)

  // Phase 5: winner mapping for deliberation + settlement
  const [winnerMapping, setWinnerMapping] = useState<WinnerMapping>({})
  const handleWinnerMapped = (tierId: string, submissionId: string, address: string, amountUsdc: bigint) => {
    if (!tierId || !submissionId) {
      // clear the existing mapping for this submission
      setWinnerMapping(prev => {
        const next = { ...prev }
        for (const [k, v] of Object.entries(next)) {
          if (v.submissionId === submissionId) delete next[k]
        }
        return next
      })
      return
    }
    setWinnerMapping(prev => ({ ...prev, [tierId]: { submissionId, address, amountUsdc } }))
  }

  // ── Phase 3: Real onchain data for participant hub ────────────────────────
  const { data: pendingPrize } = usePendingPrizeWithdrawals(address ?? undefined)
  const {
    claimPrize,
    isPending: claimPrizeWallet,
    isConfirming: claimPrizeConfirming,
    isSuccess: claimPrizeSuccess,
    error: claimPrizeError,
  } = useClaimPrize()

  // ── Phase 3: Real onchain data for organizer hub ──────────────────────────
  const { data: pendingRefund } = usePendingOrganizerRefunds(address ?? undefined)
  const {
    claimOrganizerRefund,
    isPending: claimRefundWallet,
    isConfirming: claimRefundConfirming,
    isSuccess: claimRefundSuccess,
    error: claimRefundError,
  } = useClaimOrganizerRefund()

  const pendingPrizeBig = (pendingPrize) ?? 0n
  const pendingRefundBig = (pendingRefund) ?? 0n

  const formatUsdcAmount = (raw: bigint) =>
    Number(formatUnits(raw, 6)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--warm-bg)' }}>
      {/* Skip link — WCAG 2.4.1 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 btn btn-primary btn-sm"
      >
        Skip to main content
      </a>

      {/* Main Header with Workspace Switcher */}
      <Header
        currentView={view}
        onViewChange={(v) => setView(v as View)}
        isAdmin={isAdmin}
        isReviewer={!!isReviewer}
      />

      {/* Proactive Network & Role Banners */}
      {isConnected && <WrongChainBanner chainId={chainId} />}
      {isConnected && <RoleBanner isAdmin={!!isAdmin} isReviewer={!!isReviewer} />}

      {/* Network toggle pill */}
      {isConnected && (
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-3 flex justify-end">
          <NetworkToggle chainId={chainId} />
        </div>
      )}

      {/* Main View Port */}
      <main id="main-content" className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        <AnimatePresence mode="wait" initial={false}>
          {/* ═════════════════════════════════════════════════════════════════════
              VIEW 1: PUBLIC EVENT DIRECTORY (Phase 2 Default)
          ══════════════════════════════════════════════════════════════════════ */}
          {view === 'events' && (
            <motion.div
              key="events-directory"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {/* Directory Hero Header */}
              <div className="mb-8">
                {/* Live mode banner */}
                {isLive && (
                  <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border mb-4 text-xs font-medium"
                    style={{ background: 'var(--brand-light)', borderColor: 'var(--brand-border)', color: 'var(--brand)' }}>
                    <span className="w-2 h-2 rounded-full bg-brand animate-pulse shrink-0" />
                    <span>You are viewing <strong>live mainnet events</strong> from the Arc blockchain. Connect your wallet on Arc Mainnet to submit or create events.</span>
                  </div>
                )}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-light text-brand border border-brand-border mb-3">
                      <Trophy size={12} />
                      {isLive ? 'Live Mainnet Events' : 'Arc Community Hackathons & Contests'}
                    </span>
                    <TextEffect
                      as="h1"
                      per="word"
                      preset={shouldReduce ? 'fade' : 'fade-in-blur'}
                      className="font-jakarta font-extrabold text-2xl sm:text-4xl text-midnight tracking-tight mb-2"
                    >
                      Build With Arc. Win Onchain USDC.
                    </TextEffect>
                    <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                      Discover community competitions with verified smart contract escrow. Submit prototypes, media, or tools, and pull-claim rewards directly to your wallet.
                    </p>
                  </div>

                  {/* Metrics Strip — flat, no nested card */}
                  <div className="flex items-center gap-5 sm:gap-8 shrink-0 flex-wrap">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--subtle)' }}>
                        Total Escrowed
                      </span>
                      <span className="font-mono font-extrabold text-xl text-midnight tabular-nums leading-tight">
                        ${totalEscrowUsdc} <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>USDC</span>
                      </span>
                    </div>
                    <div className="w-px h-8 border-l" style={{ borderColor: 'var(--border)' }} aria-hidden="true" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--subtle)' }}>
                        Active Events
                      </span>
                      <span className="font-mono font-extrabold text-xl tabular-nums leading-tight" style={{ color: 'var(--teal)' }}>
                        {statusCounts.active}
                      </span>
                    </div>
                    <div className="w-px h-8 border-l" style={{ borderColor: 'var(--border)' }} aria-hidden="true" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--subtle)' }}>
                        Submissions
                      </span>
                      <span className="font-mono font-extrabold text-xl tabular-nums leading-tight" style={{ color: 'var(--brand)' }}>
                        {totalEntriesCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Filter Toolbar */}
                <EventDirectoryToolbar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  categoryFilter={categoryFilter}
                  onCategoryChange={setCategoryFilter}
                  statusFilter={eventStatusFilter}
                  onStatusChange={setEventStatusFilter}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  counts={counts}
                  statusCounts={statusCounts}
                  totalMatches={filteredEvents.length}
                  onResetFilters={resetFilters}
                />

                {/* Event Cards Grid / Loading / Empty */}
                {eventsLoading ? (
                  <EventSkeletonGrid />
                ) : filteredEvents.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center max-w-md mx-auto shadow-sm space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                      <Trophy size={24} />
                    </div>
                    {isLive ? (
                      <div>
                        <h3 className="font-jakarta font-bold text-lg text-midnight mb-1">
                          No Live Events Yet
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          No events have been published to the Arc Mainnet contract yet. Switch to <strong>Demo</strong> to explore mock events, or be the first to create a live event.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-jakarta font-bold text-lg text-midnight mb-1">
                          No Events Found
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          No hackathons or contests match your current search and filter settings.
                        </p>
                      </div>
                    )}
                    {!isLive && (
                      <button
                        onClick={resetFilters}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-brand bg-brand-light border border-brand-border hover:bg-brand-light/80 transition-colors"
                      >
                        Reset All Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <AnimatedGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onSelect={handleSelectEvent}
                      />
                    ))}
                  </AnimatedGroup>
                )}
              </div>
            </motion.div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════
              VIEW 2: EVENT DETAIL SURFACE (Phase 2 Multi-Tab)
          ══════════════════════════════════════════════════════════════════════ */}
          {view === 'event-detail' && activeEvent && (
            <motion.div
              key="event-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <EventDetailView
                event={activeEvent}
                submissions={getSubmissionsForEvent(activeEvent.id)}
                onBack={() => setView('events')}
                onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
              />
            </motion.div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════
              VIEW 3: PARTICIPANT WORKSPACE HUB
          ══════════════════════════════════════════════════════════════════════ */}
          {view === 'participant' && (
            <motion.div
              key="participant-hub"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h1 className="font-jakarta font-extrabold text-2xl text-midnight tracking-tight mb-1">
                    Participant Workspace
                  </h1>
                  <p className="text-sm text-slate-600">
                    Track your hackathon submissions, reviewer progress, and claim onchain USDC awards.
                  </p>
                </div>
                <button
                  onClick={() => setView('events')}
                  className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-semibold text-white bg-brand hover:bg-brand-hover shadow-sm shrink-0"
                >
                  <Compass size={14} />
                  Browse Open Events
                </button>
              </div>

              {/* Wallet-disconnected gate */}
              {!isConnected ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                    <Users size={22} />
                  </div>
                  <div>
                    <h3 className="font-jakarta font-bold text-base text-midnight mb-1">Connect your wallet</h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                      Connect the wallet you used to submit a project to see your submission status and claim any USDC awards.
                    </p>
                  </div>
                  <ConnectKitButton label="Connect to view your workspace" />
                </div>
              ) : (
                <>
                  {/* Earnings & Claims Vault Card */}
                  <div
                    className="rounded-2xl border p-6 shadow-sm"
                    style={{ borderColor: 'var(--teal-border)', background: 'var(--teal-light)' }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--teal)' }}>
                          Available to Claim
                        </span>
                        <div className="font-mono font-extrabold text-3xl tabular-nums" style={{ color: 'var(--teal)' }}>
                          ${formatUsdcAmount(pendingPrizeBig)}{' '}
                          <span className="text-sm font-semibold" style={{ color: 'var(--teal)' }}>USDC</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-sm">
                          Rewards on Arc are pull-based: funds are held in smart contract escrow and transferred directly to your wallet when you claim.
                        </p>
                        {/* Claim status — aria-live for screen readers */}
                        <div aria-live="polite" aria-atomic="true" className="mt-1.5">
                          {claimPrizeSuccess && (
                            <p className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--teal)' }}>
                              <CheckCircle2 size={13} />
                              Prize claimed successfully!
                            </p>
                          )}
                          {claimPrizeError && (
                            <p className="text-xs font-medium" style={{ color: 'var(--coral)' }}>
                              {(claimPrizeError as Error).message?.includes('User rejected')
                                ? 'Claim cancelled — you rejected the transaction in your wallet.'
                                : (claimPrizeError as Error).message?.slice(0, 100) || 'Claim failed — please try again.'}
                            </p>
                          )}
                        </div>
                      </div>
                      {pendingPrizeBig > 0n ? (
                        <button
                          onClick={() => claimPrize()}
                          disabled={claimPrizeWallet || claimPrizeConfirming}
                          className="py-2.5 px-5 rounded-xl text-xs font-bold text-white disabled:opacity-60 shrink-0 transition-all shadow-sm"
                          style={{ background: 'var(--teal)' }}
                          aria-busy={claimPrizeWallet || claimPrizeConfirming}
                        >
                          {claimPrizeWallet ? 'Confirm in wallet…' : claimPrizeConfirming ? 'Confirming on Arc…' : `Claim $${formatUsdcAmount(pendingPrizeBig)} USDC`}
                        </button>
                      ) : (
                        <button
                          disabled
                          className="py-2.5 px-5 rounded-xl text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed shrink-0"
                        >
                          No Pending Claims
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Submissions Tracker */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="font-jakarta font-bold text-base text-midnight mb-4 flex items-center gap-2">
                      <Layers size={16} className="text-brand" />
                      Your Submission History
                    </h3>
                    {/* Per-event submission lookup — shows events where this wallet has a submission */}
                    {(() => {
                      const myEvents = events.filter(e => e.submissionsCount > 0)
                      return myEvents.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center space-y-2">
                          <Users size={22} className="text-slate-300 mx-auto" />
                          <p className="font-semibold text-sm text-slate-600">No submissions yet</p>
                          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                            Find an open hackathon or contest, connect this wallet, and submit your project.
                          </p>
                          <button
                            onClick={() => setView('events')}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline mt-2"
                          >
                            Browse open events <ArrowRight size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {myEvents.map(ev => (
                            <button
                              key={ev.id}
                              onClick={() => handleSelectEvent(ev.id)}
                              className="w-full text-left flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors group"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-midnight truncate">{ev.title}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{ev.hostName}</p>
                              </div>
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                                style={{
                                  background: ev.status === 'completed' ? 'var(--teal-light)' : 'var(--brand-light)',
                                  color: ev.status === 'completed' ? 'var(--teal)' : 'var(--brand)',
                                }}>
                                {ev.status === 'completed' ? 'Completed' : ev.status === 'judging' ? 'In Judging' : 'Active'}
                              </span>
                              <ArrowRight size={14} className="text-slate-300 group-hover:text-brand transition-colors shrink-0" />
                            </button>
                          ))}
                          <p className="text-[11px] text-slate-400 text-center pt-1">
                            Showing events with submissions — open an event to view your specific entry status.
                          </p>
                        </div>
                      )
                    })()}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════
              VIEW 4: REVIEWER WORKSPACE HUB
          ══════════════════════════════════════════════════════════════════════ */}
          {view === 'reviewer' && (
            <motion.div
              key="reviewer-portal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ReviewerWorkspace onSelectEvent={handleSelectEvent} />
            </motion.div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════
              VIEW 5: ORGANIZER CONSOLE HUB
          ══════════════════════════════════════════════════════════════════════ */}
          {view === 'organizer' && (
            <motion.div
              key="organizer-console"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="font-jakarta font-extrabold text-2xl text-midnight tracking-tight">
                      Organizer Operations Console
                    </h1>
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                        <ShieldCheck size={11} /> Verified Organizer
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Verification Required
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">
                    Create events, lock escrow prize pools on Arc, invite judges, and confirm final payouts.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  {isLive && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-brand-border bg-brand-light text-brand">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                      Live Mainnet
                    </span>
                  )}
                  <button
                    onClick={() => {
                      if (!isAdmin) {
                        setShowApplyModal(true)
                      } else {
                        setOrganizerTypeModalOpen(true)
                      }
                    }}
                    className="inline-flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold text-white bg-midnight hover:bg-slate-800 shadow-sm transition-all"
                  >
                    <PlusCircle size={14} />
                    Create New Event
                  </button>
                </div>
              </div>

              {/* Organizer Verification Card when not verified */}
              {!isAdmin && (
                <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/40 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-jakarta font-bold text-sm text-amber-900">
                      <ShieldCheck size={16} className="text-amber-700" />
                      Apply for Verified Organizer Rights
                    </div>
                    <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                      To lock smart contract prize escrow and publish competitions on Arc, register your wallet as a verified organizer via AdminRegistry.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 transition-all shrink-0 shadow-sm"
                  >
                    <ShieldCheck size={13} />
                    Apply as Organizer
                  </button>
                </div>
              )}

              {/* Event Operations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Hosted Events
                  </span>
                  <div className="font-mono font-extrabold text-2xl text-midnight">
                    {events.filter(e => e.hostAddress === address).length} Published
                  </div>
                  <span className="text-xs text-teal font-medium mt-1 block">
                    {events.filter(e => e.hostAddress === address && e.modality === 'native_escrow').length} with Verified Escrow
                  </span>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Total Locked Escrow
                  </span>
                  <div className="font-mono font-extrabold text-2xl text-midnight tabular-nums">
                    ${formatUsdcAmount(
                      events
                        .filter(e => e.hostAddress === address && e.modality === 'native_escrow')
                        .reduce((s, e) => s + e.totalPrizePoolUsdc, 0n)
                    )} USDC
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">Secured in pull-escrow on Arc</span>
                </div>

                {/* Refund / Reclaim Card */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Reclaimable Escrow
                  </span>
                  <div className="font-mono font-extrabold text-2xl tabular-nums" style={{ color: pendingRefundBig > 0n ? 'var(--teal)' : 'var(--ink)' }}>
                    ${formatUsdcAmount(pendingRefundBig)} USDC
                  </div>
                  {pendingRefundBig > 0n ? (
                    <>
                      <span className="text-xs text-slate-500 mt-1 block">From cancelled or finalized events</span>
                      {!claimRefundSuccess && (
                        <button
                          onClick={() => claimOrganizerRefund()}
                          disabled={claimRefundWallet || claimRefundConfirming}
                          className="mt-2 inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold text-white disabled:opacity-60 transition-all"
                          style={{ background: 'var(--teal)' }}
                          aria-busy={claimRefundWallet || claimRefundConfirming}
                        >
                          {claimRefundWallet ? 'Confirm in wallet…' : claimRefundConfirming ? 'Confirming…' : 'Claim Refund'}
                        </button>
                      )}
                      <div aria-live="polite" aria-atomic="true" className="mt-1">
                        {claimRefundSuccess && (
                          <p className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--teal)' }}>
                            <CheckCircle2 size={12} />
                            Refund claimed successfully.
                          </p>
                        )}
                        {claimRefundError && (
                          <p className="text-xs font-medium" style={{ color: 'var(--coral)' }}>
                            {(claimRefundError as Error).message?.includes('User rejected')
                              ? 'Claim cancelled — you rejected the transaction.'
                              : (claimRefundError as Error).message?.slice(0, 80) || 'Claim failed — please try again.'}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 mt-1 block">No pending organizer refunds</span>
                  )}
                </div>
              </div>

              {/* Organizer Review Panel */}
              <OrganizerReviewPanel isAdmin={!!isAdmin} />

              {/* ── Phase 5: Deliberation Leaderboard + Settlement Console ─── */}
              {/* Only render for the organizer of this specific event */}
              {activeEvent && !!address && activeEvent.hostAddress === address && (
                <DeliberationLeaderboard
                  event={activeEvent}
                  isOrganizer={true}
                  winnerMapping={winnerMapping}
                  onWinnerMapped={handleWinnerMapped}
                />
              )}
              {activeEvent && !!address && activeEvent.hostAddress === address && activeEvent.modality === 'native_escrow' && (
                <SettlementConsole
                  event={activeEvent}
                  winnerMapping={winnerMapping}
                  onSettled={() => {
                    setWinnerMapping({})
                    setView('events')
                  }}
                />
              )}
            </motion.div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════
              VIEW 6 & 7: LEGACY MICROGRANTS & ADMIN (Fully preserved!)
          ══════════════════════════════════════════════════════════════════════ */}
          {(view === 'grants' || view === 'detail' || view === 'admin') && (
            <motion.div
              key="legacy-grants"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {view === 'detail' && selectedGrant ? (
                <GrantDetail
                  grant={selectedGrant}
                  onBack={handleBackToGrants}
                  onRefresh={refetchGrants}
                  isAdmin={isAdmin}
                  activeChainId={activeChainId}
                />
              ) : (
                <div className="space-y-6">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <h1 className="font-jakarta font-extrabold text-2xl mb-1 text-midnight">
                        {view === 'admin' ? 'Admin Panel' : 'Microgrants Directory'}
                      </h1>
                      <p className="text-sm text-slate-600">
                        {view === 'admin'
                          ? 'Manage grants, reviewers, and settings.'
                          : 'Milestone-based 1-to-1 microgrants.'}
                      </p>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => setView(view === 'admin' ? 'grants' : 'admin')}
                        className="btn btn-focus shrink-0"
                        style={{
                          background: view === 'admin' ? 'var(--brand)' : 'var(--warm-surface)',
                          border: `1px solid ${view === 'admin' ? 'var(--brand)' : 'var(--border)'}`,
                          color: view === 'admin' ? '#fff' : 'var(--ink)',
                          padding: '0.5rem 1.125rem',
                        }}
                      >
                        <LayoutGrid size={13} />
                        {view === 'admin' ? 'Back to Grants' : 'Admin'}
                      </button>
                    )}
                  </div>

                  {view === 'admin' && isAdmin && (
                    <AdminPanel onGrantCreated={refetchGrants} />
                  )}

                  {view === 'grants' && (
                    <>
                      {grants.length > 0 && <StatsStrip grants={grants} />}

                      {/* Grants Grid */}
                      <AnimatedGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {grants.map((grant) => (
                          <GrantCard
                            key={grant.id.toString()}
                            grant={grant}
                            onClick={() => handleSelectGrant(grant)}
                            isNavigating={navigating === grant.id.toString()}
                          />
                        ))}
                      </AnimatedGroup>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Organizer type selection → create wizard flow */}
      <AnimatePresence>
        {organizerTypeModalOpen && (
          <OrganizerTypeModal
            isOpen={organizerTypeModalOpen}
            onSelect={(cat) => {
              setSelectedOrgCategory(cat)
              setOrganizerTypeModalOpen(false)
              setOrganizerWizardOpen(true)
            }}
            onClose={() => setOrganizerTypeModalOpen(false)}
          />
        )}

        {organizerWizardOpen && (
          <OrganizerCreateWizard
            isOpen={organizerWizardOpen}
            initialCategory={selectedOrgCategory ?? 'hackathon'}
            onClose={() => { setOrganizerWizardOpen(false); setSelectedOrgCategory(null) }}
            onSuccess={(_eventId, _txHash, createdEvent) => {
              setOrganizerWizardOpen(false)
              setSelectedOrgCategory(null)
              if (createdEvent) {
                setPublishedEvent(createdEvent)
              }
              setView('organizer')
            }}
          />
        )}
      </AnimatePresence>

      {/* Event Published Celebration Modal */}
      <AnimatePresence>
        {publishedEvent && (
          <EventPublishedModal
            event={publishedEvent}
            onClose={() => setPublishedEvent(null)}
            onViewEvent={(eventId) => {
              setPublishedEvent(null)
              handleSelectEvent(eventId)
            }}
          />
        )}
      </AnimatePresence>

      {/* Participant Submit Wizard Modal */}
      <AnimatePresence>
        {isSubmitModalOpen && activeEvent && (
          <ParticipantSubmitWizard
            event={activeEvent}
            isOpen={isSubmitModalOpen}
            onClose={() => setIsSubmitModalOpen(false)}
            onSuccess={handleSubmissionSuccess}
            alreadySubmittedId={activeUserSubmissionId}
          />
        )}
      </AnimatePresence>

      {/* Submission Receipt Modal */}
      <AnimatePresence>
        {receiptSubmission && activeEvent && (
          <SubmissionReceiptModal
            submission={receiptSubmission}
            eventTitle={activeEvent.title}
            onClose={() => setReceiptSubmission(null)}
            onViewShowcase={() => {
              setReceiptSubmission(null)
              setView('event-detail')
            }}
          />
        )}
      </AnimatePresence>

      {/* Admin / Organizer Application Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <ApplyAdminModal
            onClose={() => setShowApplyModal(false)}
            onSuccessRedirect={() => {
              void refetchIsAdmin()
              setShowApplyModal(false)
              setOrganizerTypeModalOpen(true)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
