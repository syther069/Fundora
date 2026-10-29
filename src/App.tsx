import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAccount, useSwitchChain } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import {
  Users, Zap, ShieldCheck, TrendingUp, AlertTriangle, ArrowRight,
  Trophy, Compass, Scale, Layers, PlusCircle, LayoutGrid
} from 'lucide-react'
import { Header } from './components/Header'
import { GrantCard } from './components/GrantCard'
import { GrantDetail } from './components/GrantDetail'
import { AdminPanel } from './components/AdminPanel'
import { useContractAdmin, useIsReviewer } from './hooks/useFundora'
import { useUnifiedIsAdmin } from './hooks/useAdminRegistry'
import { ApplyAdminModal } from './components/ApplyAdminModal'
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

// Phase 3 imports
import { OrganizerCreateWizard } from './components/events/OrganizerCreateWizard'
import { usePendingPrizeWithdrawals, useClaimPrize, usePendingOrganizerRefunds, useClaimOrganizerRefund } from './hooks/useFundoraEvents'
import { formatUnits } from 'viem'

// Phase 4 imports
import { useMode } from './context/ModeContext'

type View = 'events' | 'event-detail' | 'participant' | 'reviewer' | 'organizer' | 'grants' | 'detail' | 'admin'

const _NOT_DEPLOYED = FUNDORA_ADDRESS === '0x0000000000000000000000000000000000000000'

// ── Hero: disconnected state (legacy grants) ──────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _HeroConnect({ onOpenApplyAdmin }: { onOpenApplyAdmin?: () => void }) {
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

        <h1
          className="font-jakarta font-extrabold text-3xl mb-3 text-midnight"
          style={{ letterSpacing: '-0.03em' }}
        >
          Fundora
        </h1>
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
  const isWrongChain = chainId !== undefined && !SUPPORTED_CHAIN_IDS.includes(chainId as 5042 | 5042002)

  if (!isWrongChain) return null

  return (
    <div
      className="border-b px-4 py-2 text-center text-xs font-medium flex items-center justify-center gap-2"
      style={{
        background: 'var(--coral-light)',
        borderColor: 'var(--coral-border)',
        color: 'var(--coral)',
      }}
      role="alert"
    >
      <AlertTriangle size={13} className="shrink-0" aria-hidden="true" />
      <span>
        Unsupported network (Chain ID: {chainId}). Switch to <strong>Arc Testnet</strong> or <strong>Arc Mainnet</strong> to interact.
      </span>
      {switchChain && (
        <button
          onClick={() => switchChain({ chainId: ARC_TESTNET_ID })}
          className="underline font-semibold ml-1 hover:opacity-80 btn-focus"
        >
          Switch to Arc Testnet
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
  const [showApplyModal, setShowApplyModal] = useState(false)

  // Phase 4 — Demo / Live mode
  const { isLive } = useMode()

  // Events Context (Phase 2 Hackathons & Contests)
  const {
    events,
    activeEvent,
    setActiveEventId,
    getSubmissionsForEvent,
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
        onOpenApplyAdmin={() => setShowApplyModal(true)}
        isAdmin={isAdmin}
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
                    <h1 className="font-jakarta font-extrabold text-2xl sm:text-4xl text-midnight tracking-tight mb-2">
                      Build With Arc. Win Onchain USDC.
                    </h1>
                    <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                      Discover community competitions with verified smart contract escrow. Submit prototypes, media, or tools, and pull-claim rewards directly to your wallet.
                    </p>
                  </div>

                  {/* High-Contrast Metrics Strip */}
                  <div className="flex items-center gap-3 sm:gap-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm shrink-0">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Total Escrowed
                      </div>
                      <div className="font-mono font-extrabold text-lg sm:text-xl text-midnight tabular-nums">
                        ${totalEscrowUsdc} <span className="text-xs font-semibold text-slate-500">USDC</span>
                      </div>
                    </div>
                    <div className="w-px h-8 bg-slate-200" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Active Events
                      </div>
                      <div className="font-mono font-extrabold text-lg sm:text-xl text-teal tabular-nums">
                        {statusCounts.active}
                      </div>
                    </div>
                    <div className="w-px h-8 bg-slate-200" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Submissions
                      </div>
                      <div className="font-mono font-extrabold text-lg sm:text-xl text-brand tabular-nums">
                        {totalEntriesCount}
                      </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onSelect={handleSelectEvent}
                      />
                    ))}
                  </div>
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
                onOpenSubmitModal={() => setView('participant')}
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
              <div className="flex items-center justify-between">
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
                  className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-semibold text-white bg-brand hover:bg-brand-hover shadow-sm"
                >
                  <Compass size={14} />
                  Browse Open Hackathons
                </button>
              </div>

              {/* Earnings & Claims Vault Card */}
              <div className="rounded-2xl border border-teal-200/80 bg-gradient-to-r from-teal-50/70 via-white to-teal-50/40 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 block mb-1">
                      Available to Claim
                    </span>
                    <div className="font-mono font-extrabold text-3xl text-teal tabular-nums">
                      ${formatUsdcAmount(pendingPrizeBig)}{' '}
                      <span className="text-sm font-semibold text-teal-700">USDC</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Rewards on Arc are pull-based: funds are deposited into smart contract escrow and pulled directly to your wallet.
                    </p>
                    {claimPrizeSuccess && (
                      <p className="text-xs text-teal font-semibold mt-1">Prize claimed successfully!</p>
                    )}
                    {claimPrizeError && (
                      <p className="text-xs text-coral font-medium mt-1">
                        {(claimPrizeError as Error).message?.slice(0, 80) || 'Claim failed.'}
                      </p>
                    )}
                  </div>
                  {pendingPrizeBig > 0n ? (
                    <button
                      onClick={() => claimPrize()}
                      disabled={claimPrizeWallet || claimPrizeConfirming}
                      className="py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-teal hover:opacity-90 disabled:opacity-60 shrink-0 transition-all shadow-sm"
                    >
                      {claimPrizeWallet ? 'Confirm in Wallet…' : claimPrizeConfirming ? 'Confirming…' : `Claim $${formatUsdcAmount(pendingPrizeBig)} USDC`}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="py-2.5 px-5 rounded-xl text-xs font-bold text-slate-400 bg-slate-200 cursor-not-allowed shrink-0"
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
                  Your Active & Historical Submissions
                </h3>
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-500 text-xs">
                  <Users size={24} className="text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700 mb-1">No active submissions found for this wallet</p>
                  <p className="text-slate-500 mb-4">Connect the wallet you used to enter or submit a project to an open event.</p>
                  <button
                    onClick={() => setView('events')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                  >
                    Explore open hackathons <ArrowRight size={12} />
                  </button>
                </div>
              </div>
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
              className="space-y-6"
            >
              <div>
                <h1 className="font-jakarta font-extrabold text-2xl text-midnight tracking-tight mb-1">
                  Reviewer Judging Workspace
                </h1>
                <p className="text-sm text-slate-600">
                  Evaluate assigned hackathon submissions using published criteria rubrics.
                </p>
              </div>

              {/* Assigned Judging Queue Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-jakarta font-bold text-base text-midnight">
                      Assigned Event: Arc Nanopayments & Agent Sprint
                    </h3>
                    <p className="text-xs text-slate-500">
                      Judging closes in 3 days. Your scores inform the deliberation leaderboard.
                    </p>
                  </div>
                  <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    12 of 19 Evaluated (63%)
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
                  <div className="bg-brand h-full rounded-full" style={{ width: '63%' }} />
                </div>

                <button
                  onClick={() => handleSelectEvent('arc-nanopayments-sprint')}
                  className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-brand hover:bg-brand-hover shadow-sm"
                >
                  <Scale size={14} />
                  Continue Evaluating Queue
                </button>
              </div>
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
                  <h1 className="font-jakarta font-extrabold text-2xl text-midnight tracking-tight mb-1">
                    Organizer Operations Console
                  </h1>
                  <p className="text-sm text-slate-600">
                    Create events, lock escrow prize pools on Arc, invite judges, and confirm final payouts.
                  </p>
                </div>
                {isLive ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border border-brand-border bg-brand-light text-brand">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                    Connect on Arc Mainnet to create events
                  </span>
                ) : (
                  <button
                    onClick={() => setOrganizerWizardOpen(true)}
                    className="inline-flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold text-white bg-midnight hover:bg-slate-800 shadow-sm"
                  >
                    <PlusCircle size={14} />
                    Create New Event
                  </button>
                )}
              </div>

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
                      {claimRefundSuccess ? (
                        <p className="text-xs text-teal font-semibold mt-2">Refund claimed!</p>
                      ) : (
                        <button
                          onClick={() => claimOrganizerRefund()}
                          disabled={claimRefundWallet || claimRefundConfirming}
                          className="mt-2 inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold text-white bg-teal hover:opacity-90 disabled:opacity-60 transition-all"
                        >
                          {claimRefundWallet ? 'Confirm…' : claimRefundConfirming ? 'Confirming…' : 'Claim Refund'}
                        </button>
                      )}
                      {claimRefundError && (
                        <p className="text-xs text-coral font-medium mt-1">
                          {(claimRefundError as Error).message?.slice(0, 60) || 'Claim failed.'}
                        </p>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 mt-1 block">No pending organizer refunds</span>
                  )}
                </div>
              </div>
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
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {grants.map((grant) => (
                          <GrantCard
                            key={grant.id.toString()}
                            grant={grant}
                            onClick={() => handleSelectGrant(grant)}
                            isNavigating={navigating === grant.id.toString()}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Admin Application Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <ApplyAdminModal
            onClose={() => setShowApplyModal(false)}
            onSuccessRedirect={() => {
              refetchIsAdmin()
              setShowApplyModal(false)
            }}
          />
        )}

        {/* Phase 3 — Organizer Create Wizard */}
        {organizerWizardOpen && (
          <OrganizerCreateWizard
            isOpen={organizerWizardOpen}
            onClose={() => setOrganizerWizardOpen(false)}
            onSuccess={(_eventId, _txHash) => {
              setOrganizerWizardOpen(false)
              setView('events')
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
