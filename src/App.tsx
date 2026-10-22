import { useState, useCallback, useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAccount, useSwitchChain } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import {
  Users, Info, AlertCircle, RefreshCw,
  Sprout, Zap, ShieldCheck, TrendingUp, AlertTriangle,
  ArrowLeft, CheckSquare, FolderGit2, Compass, Award, ExternalLink
} from 'lucide-react'
import { Header, type NavTab } from './components/Header'
import { GrantCard } from './components/GrantCard'
import { GrantSkeleton } from './components/GrantSkeleton'
import { GrantDetail } from './components/GrantDetail'
import { AdminPanel } from './components/AdminPanel'
import { GrantsToolbar, type StatusFilter } from './components/GrantsToolbar'
import { useContractAdmin, useIsReviewer } from './hooks/useProofSpring'
import { useGrants } from './context/GrantsContext'
import type { Grant } from './hooks/useProofSpring'
import { ARC_TESTNET_ID, ARC_MAINNET_ID, SUPPORTED_CHAIN_IDS } from './contracts/proofSpring'
import { useActiveChainId } from './hooks/useProofSpring'

type View = NavTab | 'detail'

// ── Hero Banner: Public state in Explore view ─────────────────────────────────
function PublicHero() {
  const features = [
    { icon: <Zap size={13} />,         label: 'Instant USDC payouts',    color: 'var(--amber)'  },
    { icon: <ShieldCheck size={13} />,  label: 'Onchain proof hashes',    color: 'var(--teal)'   },
    { icon: <Users size={13} />,        label: 'Reviewer governance',     color: 'var(--brand)'  },
    { icon: <TrendingUp size={13} />,   label: 'Milestone escrow escrow', color: 'var(--violet)' },
  ]

  return (
    <div
      className="card rounded-3xl p-6 sm:p-8 mb-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(238,242,255,0.85) 0%, rgba(240,253,250,0.85) 100%)',
        borderColor: 'var(--brand-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3 border"
          style={{ background: '#fff', color: 'var(--brand)', borderColor: 'var(--brand-border)' }}>
          <SparkleIcon />
          <span>Arc Native Microgrants • Escrowed USDC</span>
        </div>

        <h1
          className="font-jakarta font-extrabold text-2xl sm:text-3xl mb-2 tracking-tight"
          style={{ color: 'var(--ink)' }}
        >
          Fund ideas. Verify progress. Release grants with proof.
        </h1>
        <p className="text-sm sm:text-base leading-relaxed mb-5" style={{ color: 'var(--muted)' }}>
          GrantFlow is an on-chain milestone escrow platform built on Arc. Anyone can explore active microgrants, inspect milestone evidence, or connect a wallet to apply as a builder or sponsor an initiative.
        </p>

        {/* Feature badges */}
        <div className="flex flex-wrap gap-2 items-center mb-6">
          {features.map(({ icon, label, color }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border shadow-2xs"
              style={{ background: '#ffffff', color, borderColor: 'var(--border)' }}
            >
              {icon}
              {label}
            </span>
          ))}
        </div>

        <div className="inline-block">
          <ConnectKitButton label="Connect Wallet to Apply or Fund" />
        </div>
      </div>
    </div>
  )
}

function SparkleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
    </svg>
  )
}

// ── Stats strip ───────────────────────────────────────────────────────────────
function StatsStrip({ grants }: { grants: Grant[] }) {
  const total   = grants.length
  const active  = grants.filter(g => g.status === 1).length
  const done    = grants.filter(g => g.status === 2).length
  const tvlRaw  = grants.reduce((s, g) => s + BigInt(g.totalAmount), 0n)
  const tvlDollars = tvlRaw / 1_000_000n

  const stats = [
    { label: 'Total Grants', value: total.toString(),                  color: 'var(--brand)' },
    { label: 'Active',       value: active.toString(),                 color: 'var(--teal)'  },
    { label: 'Completed',    value: done.toString(),                   color: 'var(--teal)'  },
    { label: 'Total USDC',   value: `$${tvlDollars.toString()}`,       color: 'var(--amber)' },
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
function RoleBanner({ isAdmin, isReviewer }: { isAdmin: boolean; isReviewer: boolean | undefined }) {
  if (!isAdmin && !isReviewer) return null

  return (
    <div
      className="border-b py-2 px-4 transition-colors"
      style={{
        background:  isAdmin ? 'var(--brand-light)' : 'var(--teal-light)',
        borderColor: isAdmin ? 'var(--brand-border)' : 'var(--teal-border)',
      }}
    >
      <div
        className="max-w-6xl mx-auto flex items-center justify-between gap-2 text-xs font-semibold"
        style={{ color: isAdmin ? 'var(--brand)' : 'var(--teal)' }}
      >
        <div className="flex items-center gap-2">
          {isAdmin ? <ShieldCheck size={14} /> : <Info size={14} />}
          <span>
            {isAdmin
              ? 'Admin Mode Active — You are the contract administrator for this network.'
              : 'Authorized Reviewer — You have permission to evaluate milestones and approve USDC payouts.'}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Wrong-chain banner ────────────────────────────────────────────────────────
function WrongChainBanner({ chainId }: { chainId: number | undefined }) {
  const { switchChain } = useSwitchChain()
  const isSupported = chainId !== undefined && (SUPPORTED_CHAIN_IDS as readonly number[]).includes(chainId)
  if (!chainId || isSupported) return null

  return (
    <div
      className="border-b py-2.5 px-4"
      style={{ background: 'var(--amber-light)', borderColor: 'var(--amber-border)' }}
      role="alert"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        <span className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--amber)' }}>
          <AlertTriangle size={14} />
          Connected to an unsupported network. Switch to Arc Testnet or Arc Mainnet.
        </span>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-xs btn-focus text-white font-semibold cursor-pointer"
            style={{ background: 'var(--teal)' }}
            onClick={() => switchChain?.({ chainId: ARC_TESTNET_ID })}
          >
            Switch to Testnet
          </button>
          <button
            className="btn btn-xs btn-focus text-white font-semibold cursor-pointer"
            style={{ background: 'var(--brand)' }}
            onClick={() => switchChain?.({ chainId: ARC_MAINNET_ID })}
          >
            Switch to Mainnet
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main App Component ────────────────────────────────────────────────────────
export default function App() {
  const { address, isConnected, chainId } = useAccount()
  const activeChainId = useActiveChainId()

  const [activeTab, setActiveTab]         = useState<NavTab>('explore')
  const [previousTab, setPreviousTab]     = useState<NavTab>('explore')
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null)
  const [navigating, setNavigating]       = useState<string | null>(null)
  const [search, setSearch]               = useState('')
  const [statusFilter, setStatusFilter]   = useState<StatusFilter>('all')
  const [activityRole, setActivityRole]   = useState<'all' | 'building' | 'funded'>('all')

  const { grants, grantCount, isLoading: grantsLoading, isError: grantsError, refetch: refetchGrants } = useGrants()
  const { data: contractAdmin } = useContractAdmin()
  const { data: isReviewer }    = useIsReviewer(address)

  const isAdmin = !!(address && contractAdmin &&
    address.toLowerCase() === (contractAdmin as string).toLowerCase())

  // Hash-based deep linking (#grant-1)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash
      const match = hash.match(/^#grant-(\d+)$/)
      if (match) {
        const id = BigInt(match[1])
        const found = grants.find(g => g.id === id)
        if (found) {
          setSelectedGrant(found)
        }
      } else if (!hash) {
        setSelectedGrant(null)
      }
    }
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [grants])

  // Categorize grants for user activity
  const myGrants = useMemo(() => {
    if (!address) return []
    const addr = address.toLowerCase()
    return grants.filter(g =>
      g.funder.toLowerCase() === addr ||
      g.builder.toLowerCase() === addr
    )
  }, [grants, address])

  const myBuildingGrants = useMemo(() => {
    if (!address) return []
    const addr = address.toLowerCase()
    return grants.filter(g => g.builder.toLowerCase() === addr)
  }, [grants, address])

  const myFundedGrants = useMemo(() => {
    if (!address) return []
    const addr = address.toLowerCase()
    return grants.filter(g => g.funder.toLowerCase() === addr)
  }, [grants, address])

  // Review queue: active grants with milestones waiting on review
  const pendingReviewGrants = useMemo(() => {
    return grants.filter(g => g.status === 1 && g.approvedMilestoneCount < g.milestoneCount)
  }, [grants])

  const handleSelectTab = (tab: NavTab) => {
    if (selectedGrant) {
      window.location.hash = ''
      setSelectedGrant(null)
    }
    setActiveTab(tab)
    setPreviousTab(tab)
  }

  const handleSelectGrant = (grant: Grant) => {
    setNavigating(grant.id.toString())
    setPreviousTab(activeTab)
    setTimeout(() => {
      window.location.hash = `grant-${grant.id.toString()}`
      setSelectedGrant(grant)
      setNavigating(null)
    }, 60)
  }

  const handleBack = () => {
    window.location.hash = ''
    setSelectedGrant(null)
    refetchGrants()
  }

  const handleRefresh = useCallback(() => { refetchGrants() }, [refetchGrants])

  // Filter explore grants
  const STATUS_MAP: Record<StatusFilter, number | null> = {
    all: null, open: 0, active: 1, completed: 2, cancelled: 3,
  }
  const filteredGrants = grants.filter(g => {
    const matchesStatus = statusFilter === 'all' || g.status === STATUS_MAP[statusFilter]
    const q = search.toLowerCase()
    const matchesSearch = !q ||
      g.title.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q)
    return matchesStatus && matchesSearch
  })

  // Filter activity grants
  const filteredActivityGrants = useMemo(() => {
    if (activityRole === 'building') return myBuildingGrants
    if (activityRole === 'funded')   return myFundedGrants
    return myGrants
  }, [activityRole, myGrants, myBuildingGrants, myFundedGrants])

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--warm-bg)' }}>
      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 btn btn-primary btn-sm"
      >
        Skip to main content
      </a>

      {/* Main Global Header with Tabbed Hub */}
      <Header
        activeTab={selectedGrant ? 'detail' : activeTab}
        onSelectTab={handleSelectTab}
        isAdmin={isAdmin}
        isReviewer={isReviewer}
        myActivityCount={myGrants.length}
        pendingReviewsCount={pendingReviewGrants.length}
      />

      {/* Chain & Role Banners */}
      {isConnected && <WrongChainBanner chainId={chainId} />}
      {isConnected && <RoleBanner isAdmin={isAdmin} isReviewer={isReviewer} />}

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        <AnimatePresence mode="wait" initial={false}>
          {/* VIEW: GRANT DETAIL */}
          {selectedGrant ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {/* Breadcrumb strip */}
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold mb-5">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 cursor-pointer transition-colors btn-focus px-2.5 py-1 rounded-full border"
                  style={{
                    background: 'var(--warm-surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--brand)',
                  }}
                >
                  <ArrowLeft size={13} />
                  <span>
                    Back to {previousTab === 'my-activity' ? 'My Activity' : previousTab === 'reviews' ? 'Review Queue' : 'Explore Grants'}
                  </span>
                </button>
                <span className="text-muted">/</span>
                <span className="text-ink font-bold truncate max-w-xs sm:max-w-md">
                  Grant #{selectedGrant.id.toString()}: {selectedGrant.title}
                </span>
              </nav>

              <GrantDetail
                grant={selectedGrant}
                onBack={handleBack}
                onRefresh={handleRefresh}
                isAdmin={isAdmin}
                activeChainId={activeChainId}
              />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* TAB 1: EXPLORE GRANTS */}
              {activeTab === 'explore' && (
                <>
                  {/* Public Hero banner if disconnected */}
                  {!isConnected && <PublicHero />}

                  {/* Page Title & Stats */}
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <h1 className="font-jakarta font-extrabold text-2xl mb-1 tracking-tight" style={{ color: 'var(--ink)' }}>
                        Explore Microgrants
                      </h1>
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>
                        Discover open initiatives, review ongoing milestones, and inspect onchain proof.
                      </p>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => handleSelectTab('admin')}
                        className="btn btn-primary btn-sm btn-focus"
                      >
                        <ShieldCheck size={14} />
                        Admin Panel
                      </button>
                    )}
                  </div>

                  {/* Stats Strip */}
                  {grants.length > 0 && <StatsStrip grants={grants} />}

                  {/* Grants Toolbar (Search & Filter) */}
                  {!grantsError && (
                    <GrantsToolbar
                      search={search}
                      onSearchChange={setSearch}
                      statusFilter={statusFilter}
                      onStatusFilterChange={setStatusFilter}
                      totalCount={grants.length}
                      filteredCount={filteredGrants.length}
                    />
                  )}

                  {/* Loading Skeletons */}
                  {!grantsError && grantsLoading && grants.length === 0 && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {Array.from({ length: grantCount > 0 ? Math.min(grantCount, 6) : 3 }, (_, i) => (
                        <GrantSkeleton key={i} />
                      ))}
                    </div>
                  )}

                  {/* Network / Contract Error */}
                  {grantsError && (
                    <div className="card rounded-2xl p-8 text-center space-y-4" style={{ borderColor: 'var(--coral-border)' }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto" style={{ background: 'var(--coral-light)' }}>
                        <AlertCircle size={18} style={{ color: 'var(--coral)' }} />
                      </div>
                      <div>
                        <p className="font-jakarta font-bold text-base mb-1" style={{ color: 'var(--ink)' }}>
                          Could not read contract data
                        </p>
                        <p className="text-sm" style={{ color: 'var(--muted)' }}>
                          A network error occurred while querying the Arc RPC. Verify your connection and retry.
                        </p>
                      </div>
                      <button onClick={handleRefresh} className="btn btn-ghost btn-sm btn-focus inline-flex mx-auto">
                        <RefreshCw size={13} />
                        Retry
                      </button>
                    </div>
                  )}

                  {/* Clean Empty State */}
                  {!grantsError && !grantsLoading && grants.length === 0 && (
                    <div className="card rounded-2xl p-12 text-center space-y-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto" style={{ background: 'var(--brand-light)' }}>
                        <Sprout size={26} style={{ color: 'var(--brand)' }} />
                      </div>
                      <div>
                        <p className="font-jakarta font-bold text-lg mb-1" style={{ color: 'var(--ink)' }}>
                          No grants yet on this network
                        </p>
                        <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--muted)' }}>
                          {isAdmin
                            ? 'You are the contract admin. Open the Admin Console to create the first grant.'
                            : 'Grants will appear here once created and funded on this chain.'}
                        </p>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => handleSelectTab('admin')}
                          className="btn btn-primary btn-sm btn-focus inline-flex mx-auto"
                        >
                          Create First Grant
                        </button>
                      )}
                    </div>
                  )}

                  {/* No Results from Filter */}
                  {!grantsError && grants.length > 0 && filteredGrants.length === 0 && (
                    <div className="card rounded-2xl p-10 text-center space-y-2">
                      <p className="font-jakarta font-bold text-base" style={{ color: 'var(--ink)' }}>
                        No grants match your filter
                      </p>
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>
                        Try another status or search term.
                      </p>
                      <button
                        onClick={() => { setSearch(''); setStatusFilter('all') }}
                        className="btn btn-ghost btn-sm btn-focus inline-flex mx-auto mt-2"
                      >
                        Clear filters
                      </button>
                    </div>
                  )}

                  {/* Grant Cards Grid */}
                  {!grantsError && filteredGrants.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredGrants.map(grant => (
                        <GrantCard
                          key={grant.id.toString()}
                          grant={grant}
                          onClick={() => handleSelectGrant(grant)}
                          isNavigating={navigating === grant.id.toString()}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* TAB 2: MY ACTIVITY */}
              {activeTab === 'my-activity' && (
                <div className="space-y-6">
                  <div>
                    <h1 className="font-jakarta font-extrabold text-2xl mb-1 tracking-tight" style={{ color: 'var(--ink)' }}>
                      My Grants & Activity
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      Track grants you are building or funding, monitor milestone progress, and manage claims.
                    </p>
                  </div>

                  {!isConnected ? (
                    <div className="card rounded-2xl p-10 text-center max-w-md mx-auto space-y-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto" style={{ background: 'var(--brand-light)' }}>
                        <FolderGit2 size={22} style={{ color: 'var(--brand)' }} />
                      </div>
                      <div>
                        <h2 className="font-jakarta font-bold text-lg mb-1" style={{ color: 'var(--ink)' }}>
                          Connect Your Wallet
                        </h2>
                        <p className="text-sm" style={{ color: 'var(--muted)' }}>
                          Connect to view grants associated with your address, submit progress reports, and claim payouts.
                        </p>
                      </div>
                      <div className="pt-2">
                        <ConnectKitButton />
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Filter pills for role */}
                      <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
                        <button
                          onClick={() => setActivityRole('all')}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                            activityRole === 'all' ? 'text-white' : 'text-muted hover:text-ink'
                          }`}
                          style={{
                            background: activityRole === 'all' ? 'var(--brand)' : 'var(--warm-surface)',
                            borderColor: activityRole === 'all' ? 'var(--brand)' : 'var(--border)',
                          }}
                        >
                          All My Grants ({myGrants.length})
                        </button>
                        <button
                          onClick={() => setActivityRole('building')}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                            activityRole === 'building' ? 'text-white' : 'text-muted hover:text-ink'
                          }`}
                          style={{
                            background: activityRole === 'building' ? 'var(--teal)' : 'var(--warm-surface)',
                            borderColor: activityRole === 'building' ? 'var(--teal)' : 'var(--border)',
                          }}
                        >
                          Building ({myBuildingGrants.length})
                        </button>
                        <button
                          onClick={() => setActivityRole('funded')}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                            activityRole === 'funded' ? 'text-white' : 'text-muted hover:text-ink'
                          }`}
                          style={{
                            background: activityRole === 'funded' ? 'var(--brand)' : 'var(--warm-surface)',
                            borderColor: activityRole === 'funded' ? 'var(--brand)' : 'var(--border)',
                          }}
                        >
                          Funded by Me ({myFundedGrants.length})
                        </button>
                      </div>

                      {/* Empty state for Activity */}
                      {filteredActivityGrants.length === 0 ? (
                        <div className="card rounded-2xl p-10 text-center space-y-4">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto" style={{ background: 'var(--warm-bg-2)' }}>
                            <FolderGit2 size={20} style={{ color: 'var(--muted)' }} />
                          </div>
                          <div>
                            <p className="font-jakarta font-bold text-base mb-1" style={{ color: 'var(--ink)' }}>
                              No grants found for this filter
                            </p>
                            <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--muted)' }}>
                              {activityRole === 'building'
                                ? 'You are not assigned as a builder on any active grants yet.'
                                : activityRole === 'funded'
                                ? 'You have not sponsored or created any grants yet.'
                                : 'You currently have no grants associated with this wallet address.'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleSelectTab('explore')}
                            className="btn btn-primary btn-sm btn-focus inline-flex mx-auto"
                          >
                            Explore Grants Directory
                          </button>
                        </div>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {filteredActivityGrants.map(grant => (
                            <GrantCard
                              key={grant.id.toString()}
                              grant={grant}
                              onClick={() => handleSelectGrant(grant)}
                              isNavigating={navigating === grant.id.toString()}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* TAB 3: REVIEW QUEUE */}
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <h1 className="font-jakarta font-extrabold text-2xl mb-1 tracking-tight" style={{ color: 'var(--ink)' }}>
                        Reviewer Workspace
                      </h1>
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>
                        Evaluate submitted evidence and vote to release milestone USDC payments.
                      </p>
                    </div>

                    {isReviewer && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ background: 'var(--teal-light)', color: 'var(--teal)', border: '1px solid var(--teal-border)' }}>
                        <ShieldCheck size={13} />
                        Authorized Reviewer
                      </span>
                    )}
                  </div>

                  {!isConnected ? (
                    <div className="card rounded-2xl p-10 text-center max-w-md mx-auto space-y-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto" style={{ background: 'var(--teal-light)' }}>
                        <CheckSquare size={22} style={{ color: 'var(--teal)' }} />
                      </div>
                      <div>
                        <h2 className="font-jakarta font-bold text-lg mb-1" style={{ color: 'var(--ink)' }}>
                          Reviewer Authentication
                        </h2>
                        <p className="text-sm" style={{ color: 'var(--muted)' }}>
                          Connect your authorized reviewer wallet to verify submitted milestones and approve payouts.
                        </p>
                      </div>
                      <div className="pt-2">
                        <ConnectKitButton />
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Review Queue Grants */}
                      {pendingReviewGrants.length === 0 ? (
                        <div className="card rounded-2xl p-10 text-center space-y-4">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto" style={{ background: 'var(--teal-light)' }}>
                            <Award size={22} style={{ color: 'var(--teal)' }} />
                          </div>
                          <div>
                            <p className="font-jakarta font-bold text-base mb-1" style={{ color: 'var(--ink)' }}>
                              Review Queue is Clear!
                            </p>
                            <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--muted)' }}>
                              There are currently no submitted milestones awaiting verification on this network.
                            </p>
                          </div>
                          <button
                            onClick={() => handleSelectTab('explore')}
                            className="btn btn-ghost btn-sm btn-focus inline-flex mx-auto"
                          >
                            Browse All Grants
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted">
                              Awaiting Review ({pendingReviewGrants.length})
                            </span>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {pendingReviewGrants.map(grant => (
                              <GrantCard
                                key={grant.id.toString()}
                                grant={grant}
                                onClick={() => handleSelectGrant(grant)}
                                isNavigating={navigating === grant.id.toString()}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Information block on Review Governance */}
                      <div
                        className="card rounded-2xl p-5 border"
                        style={{ background: 'var(--warm-bg-2)', borderColor: 'var(--border)' }}
                      >
                        <div className="flex items-start gap-3">
                          <Info size={18} style={{ color: 'var(--brand)', marginTop: 2 }} />
                          <div className="text-xs leading-relaxed space-y-1">
                            <p className="font-bold text-sm" style={{ color: 'var(--ink)' }}>
                              How Reviewer Verification Works on Arc
                            </p>
                            <p style={{ color: 'var(--muted)' }}>
                              When a builder completes a milestone, they submit proof (GitHub repo, deployment URL, or IPFS CID) hashed with <code className="mono">keccak256</code> onchain. Reviewers vote to confirm delivery. Once the required threshold (1 approval) is reached, escrowed USDC is immediately released via pull-payment.
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 4: ADMIN CONSOLE */}
              {activeTab === 'admin' && (
                <div className="space-y-6">
                  {isAdmin ? (
                    <AdminPanel onGrantCreated={handleRefresh} />
                  ) : (
                    <div className="card rounded-2xl p-10 text-center max-w-md mx-auto space-y-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto" style={{ background: 'var(--brand-light)' }}>
                        <ShieldCheck size={22} style={{ color: 'var(--brand)' }} />
                      </div>
                      <div>
                        <h2 className="font-jakarta font-bold text-lg mb-1" style={{ color: 'var(--ink)' }}>
                          Admin Console Restricted
                        </h2>
                        <p className="text-sm" style={{ color: 'var(--muted)' }}>
                          This section is restricted to the contract administrator address.
                        </p>
                        {contractAdmin && (
                          <div className="mt-3 p-2 rounded-xl text-xs font-mono break-all" style={{ background: 'var(--warm-bg-2)', color: 'var(--ink)' }}>
                            Admin: {contractAdmin as string}
                          </div>
                        )}
                      </div>
                      {!isConnected && (
                        <div className="pt-2">
                          <ConnectKitButton />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer
        className="py-4 px-4 sm:px-6 border-t mt-auto"
        style={{ borderColor: 'var(--border)', background: 'var(--warm-surface)' }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="font-medium" style={{ color: 'var(--subtle)' }}>
            GrantFlow — built on {activeChainId === ARC_MAINNET_ID ? 'Arc Mainnet' : 'Arc Testnet'}
          </span>
          <div className="flex items-center gap-4 text-muted">
            {activeChainId === ARC_TESTNET_ID && (
              <a
                href="https://faucet.circle.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--brand)' }}
                className="font-semibold hover:underline"
              >
                Get test USDC ↗
              </a>
            )}
            <a
              href={activeChainId === ARC_MAINNET_ID ? 'https://explorer.arc.io' : 'https://explorer.testnet.arc.io'}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex items-center gap-1"
            >
              <span>Arc Explorer</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
