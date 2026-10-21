import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAccount, useSwitchChain } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import {
  Users, LayoutGrid, Info, AlertCircle, RefreshCw,
  Sprout, Zap, ShieldCheck, TrendingUp, AlertTriangle,
} from 'lucide-react'
import { Header } from './components/Header'
import { GrantCard } from './components/GrantCard'
import { GrantSkeleton } from './components/GrantSkeleton'
import { GrantDetail } from './components/GrantDetail'
import { AdminPanel } from './components/AdminPanel'
import { GrantsToolbar } from './components/GrantsToolbar'
import type { StatusFilter } from './components/GrantsToolbar'
import { useContractAdmin, useIsReviewer } from './hooks/useProofSpring'
import { useGrants } from './context/GrantsContext'
import type { Grant } from './hooks/useProofSpring'
import { PROOF_SPRING_ADDRESS, ARC_TESTNET_ID, ARC_MAINNET_ID, SUPPORTED_CHAIN_IDS } from './contracts/proofSpring'
import { useActiveChainId } from './hooks/useProofSpring'

type View = 'grants' | 'detail' | 'admin'

const NOT_DEPLOYED = PROOF_SPRING_ADDRESS === '0x0000000000000000000000000000000000000000'

// ── Hero: disconnected state ──────────────────────────────────────────────────
function HeroConnect() {
  const features = [
    { icon: <Zap size={12} />,        label: 'Instant USDC payouts',   color: 'var(--amber)'  },
    { icon: <ShieldCheck size={12} />, label: 'Onchain evidence',       color: 'var(--teal)'   },
    { icon: <Users size={12} />,       label: 'Reviewer governance',    color: 'var(--brand)'  },
    { icon: <TrendingUp size={12} />,  label: 'Transparent milestones', color: 'var(--violet)' },
  ]

  return (
    <div
      className="card rounded-3xl overflow-hidden max-w-lg mx-auto"
      style={{ boxShadow: 'var(--shadow-lg)' }}
    >
      {/* Gradient top bar */}
      <div
        className="h-2"
        style={{ background: 'linear-gradient(90deg, #6366f1 0%, #0d9488 50%, #d97706 100%)' }}
        aria-hidden="true"
      />

      <div className="px-5 py-8 sm:px-8 sm:py-10 text-center">
        {/* Logo */}
        <div
          className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #0d9488 100%)',
            boxShadow: '0 8px 24px rgba(99,102,241,.28)',
          }}
          aria-hidden="true"
        >
          <svg width="28" height="28" viewBox="0 0 16 16" fill="none">
            <circle cx="6"  cy="8" r="4.5" stroke="white" strokeWidth="1.5" fill="none" opacity="0.9" />
            <circle cx="10" cy="8" r="4.5" stroke="white" strokeWidth="1.5" fill="none" opacity="0.6" />
            <path d="M10 6h1.5v2H10" stroke="white" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Headline */}
        <h1
          className="font-jakarta font-extrabold text-3xl mb-3"
          style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}
        >
          GrantFlow
        </h1>
        <p className="text-base leading-relaxed max-w-sm mx-auto mb-6" style={{ color: 'var(--muted)' }}>
          Milestone-based USDC grants with onchain evidence, reviewer votes, and transparent payouts — built on Arc.
        </p>

        {/* Feature pills */}
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

        <ConnectKitButton label="Connect Wallet to Get Started" />
      </div>
    </div>
  )
}

// ── Stats strip ───────────────────────────────────────────────────────────────
function StatsStrip({ grants }: { grants: Grant[] }) {
  const total   = grants.length
  const active  = grants.filter(g => g.status === 1).length
  const done    = grants.filter(g => g.status === 2).length
  // Bigint sum first, then format once — no float arithmetic on money
  const tvlRaw  = grants.reduce((s, g) => s + BigInt(g.totalAmount), 0n)
  // Drop sub-dollar cents: divide bigint by 1_000_000 (6 decimals) to get whole dollars
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
      className="border-b py-2.5 px-4"
      style={{
        background:  isAdmin ? 'var(--brand-light)' : 'var(--teal-light)',
        borderColor: isAdmin ? 'var(--brand-border)' : 'var(--teal-border)',
      }}
    >
      <div
        className="max-w-6xl mx-auto flex items-center gap-2 text-xs font-semibold"
        style={{ color: isAdmin ? 'var(--brand)' : 'var(--teal)' }}
      >
        {isAdmin ? <ShieldCheck size={13} /> : <Info size={13} />}
        {isAdmin
          ? 'You are the grant admin — manage grants, reviewers, and settings from the Admin panel.'
          : 'You are a reviewer — open a grant to vote on submitted milestones.'}
      </div>
    </div>
  )
}

// ── Network toggle (testnet ↔ mainnet) ───────────────────────────────────────
function NetworkToggle({ chainId }: { chainId: number | undefined }) {
  const { switchChain } = useSwitchChain()
  if (!chainId) return null
  const isTestnet = chainId === ARC_TESTNET_ID
  const isMainnet = chainId === ARC_MAINNET_ID
  // Only show toggle when on a supported Arc network
  if (!isTestnet && !isMainnet) return null
  return (
    <div className="flex items-center gap-1 rounded-full border p-0.5" style={{ borderColor: 'var(--border)', background: 'var(--surface-raised)' }}>
      <button
        onClick={() => switchChain?.({ chainId: ARC_TESTNET_ID })}
        className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-all btn-focus ${isTestnet ? 'text-white' : ''}`}
        style={isTestnet ? { background: 'var(--teal)', color: '#fff' } : { color: 'var(--muted)' }}
        aria-pressed={isTestnet}
      >
        Testnet
      </button>
      <button
        onClick={() => switchChain?.({ chainId: ARC_MAINNET_ID })}
        className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-all btn-focus ${isMainnet ? 'text-white' : ''}`}
        style={isMainnet ? { background: 'var(--brand)', color: '#fff' } : { color: 'var(--muted)' }}
        aria-pressed={isMainnet}
      >
        Mainnet
      </button>
    </div>
  )
}

// ── Wrong-chain banner (A7: proactive, shown before user tries to act) ────────
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
          <AlertTriangle size={13} />
          Connected to an unsupported network. Switch to Arc Testnet or Arc Mainnet.
        </span>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-xs btn-focus text-white font-semibold"
            style={{ background: 'var(--teal)' }}
            onClick={() => switchChain?.({ chainId: ARC_TESTNET_ID })}
          >
            Switch to Testnet
          </button>
          <button
            className="btn btn-xs btn-focus text-white font-semibold"
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

// ── Main app ──────────────────────────────────────────────────────────────────
export default function App() {
  const { address, isConnected, chainId } = useAccount()
  const activeChainId = useActiveChainId()
  const [view, setView]                   = useState<View>('grants')
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null)
  const [navigating, setNavigating]       = useState<string | null>(null)
  const [search, setSearch]               = useState('')
  const [statusFilter, setStatusFilter]   = useState<StatusFilter>('all')

  const { grants, grantCount, isLoading: grantsLoading, isError: grantsError, refetch: refetchGrants } = useGrants()

  const { data: contractAdmin } = useContractAdmin()
  const { data: isReviewer }    = useIsReviewer(address)

  const isAdmin = !!(address && contractAdmin &&
    address.toLowerCase() === (contractAdmin as string).toLowerCase())

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

  const handleRefresh = useCallback(() => { refetchGrants() }, [refetchGrants])

  const handleSelectGrant = (grant: Grant) => {
    setNavigating(grant.id.toString())
    setTimeout(() => {
      setSelectedGrant(grant)
      setView('detail')
      setNavigating(null)
    }, 80)
  }

  const handleBack = () => {
    setSelectedGrant(null)
    setView('grants')
    handleRefresh()
  }

  // ── Not deployed ──────────────────────────────────────────────────────────
  if (NOT_DEPLOYED) {
    return (
      <div className="min-h-dvh flex flex-col" style={{ background: 'var(--warm-bg)' }}>
        {/* Skip link — WCAG 2.4.1 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 btn btn-primary btn-sm"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-sm w-full text-center space-y-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
              style={{ background: 'var(--brand-light)' }}
            >
              <Sprout size={26} style={{ color: 'var(--brand)' }} />
            </div>
            <div>
              <h1
                className="font-jakarta font-extrabold text-2xl mb-2"
                style={{ color: 'var(--ink)', letterSpacing: '-0.03em' }}
              >
                Awaiting Deployment
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                The GrantFlow contract is not yet deployed. Deploy it from the Contracts panel to activate the platform.
              </p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ── Main layout ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--warm-bg)' }}>
      {/* Skip link — WCAG 2.4.1 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 btn btn-primary btn-sm"
      >
        Skip to main content
      </a>

      <Header />

      {/* Wrong-chain banner — proactive, before user tries to act (A7) */}
      {isConnected && <WrongChainBanner chainId={chainId} />}

      {isConnected && <RoleBanner isAdmin={isAdmin} isReviewer={isReviewer} />}

      {/* Network toggle — between banners and content */}
      {isConnected && (
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-4 flex justify-end">
          <NetworkToggle chainId={chainId} />
        </div>
      )}

      <main id="main-content" className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-8">
        <AnimatePresence mode="wait" initial={false}>
        {/* Grant detail view */}
        {view === 'detail' && selectedGrant ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
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
            key="grants"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
          <div className="space-y-6">
            {/* Page header */}
            {(view === 'grants' || view === 'admin') && (
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="min-w-0 flex-1">
                  <h1
                    className="font-jakarta font-extrabold text-2xl mb-1"
                    style={{ color: 'var(--ink)', letterSpacing: '-0.025em' }}
                  >
                    {view === 'admin' ? 'Admin Panel' : 'Active Grants'}
                  </h1>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    {view === 'admin'
                      ? 'Manage grants, reviewers, and settings.'
                      : 'Fund ideas. Verify progress. Release grants with proof.'}
                  </p>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => setView(view === 'admin' ? 'grants' : 'admin')}
                    className="btn btn-focus shrink-0"
                    style={{
                      background:  view === 'admin' ? 'var(--brand)' : 'var(--warm-surface)',
                      border:      `1px solid ${view === 'admin' ? 'var(--brand)' : 'var(--border)'}`,
                      color:       view === 'admin' ? '#fff' : 'var(--ink)',
                      padding:     '0.5rem 1.125rem',
                      boxShadow:   view === 'admin' ? '0 4px 14px rgba(99,102,241,.3)' : 'var(--shadow-sm)',
                    }}
                  >
                    <LayoutGrid size={13} />
                    {view === 'admin' ? 'Back to Grants' : 'Admin'}
                  </button>
                )}
              </div>
            )}

            {/* Admin panel */}
            {view === 'admin' && isAdmin && (
              <AdminPanel onGrantCreated={handleRefresh} />
            )}

            {/* Grants list */}
            {view === 'grants' && (
              <>
                {!isConnected ? (
                  <HeroConnect />
                ) : (
                  <>
                    {/* Stats strip — shown when grants exist */}
                    {grants.length > 0 && <StatsStrip grants={grants} />}

                    {/* Error state */}
                    {grantsError && (
                      <div
                        className="card rounded-2xl p-8 text-center space-y-4"
                        style={{ borderColor: 'var(--coral-border)' }}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center mx-auto"
                          style={{ background: 'var(--coral-light)' }}
                        >
                          <AlertCircle size={18} style={{ color: 'var(--coral)' }} />
                        </div>
                        <div>
                          <p className="font-jakarta font-bold text-base mb-1" style={{ color: 'var(--ink)' }}>
                            Could not load grants
                          </p>
                          <p className="text-sm" style={{ color: 'var(--muted)' }}>
                            A network error occurred while reading the contract. Check your connection and try again.
                          </p>
                        </div>
                        <button
                          onClick={handleRefresh}
                          className="btn btn-ghost btn-sm btn-focus inline-flex mx-auto"
                        >
                          <RefreshCw size={13} />
                          Retry
                        </button>
                      </div>
                    )}

                    {/* Skeleton — grants loading */}
                    {!grantsError && grantsLoading && grants.length === 0 && (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: grantCount > 0 ? Math.min(grantCount, 6) : 3 }, (_, i) => (
                          <GrantSkeleton key={i} />
                        ))}
                      </div>
                    )}

                    {/* Empty state */}
                    {!grantsError && !grantsLoading && grants.length === 0 && (
                      <div
                        className="card rounded-2xl p-12 text-center space-y-4"
                      >
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                          style={{ background: 'var(--brand-light)' }}
                        >
                          <Sprout size={24} style={{ color: 'var(--brand)' }} />
                        </div>
                        <div>
                          <p className="font-jakarta font-bold text-lg mb-1" style={{ color: 'var(--ink)' }}>
                            No grants yet
                          </p>
                          <p className="text-sm" style={{ color: 'var(--muted)' }}>
                            {isAdmin
                              ? 'Open the Admin panel to create the first grant.'
                              : 'Check back soon — grants will appear here once created by the admin.'}
                          </p>
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => setView('admin')}
                            className="btn btn-primary btn-sm btn-focus inline-flex mx-auto"
                          >
                            Create First Grant
                          </button>
                        )}
                      </div>
                    )}

                    {/* Toolbar — shown when grants exist */}
                    {!grantsError && grants.length > 0 && (
                      <GrantsToolbar
                        search={search}
                        onSearchChange={setSearch}
                        statusFilter={statusFilter}
                        onStatusFilterChange={setStatusFilter}
                        totalCount={grants.length}
                        filteredCount={filteredGrants.length}
                      />
                    )}

                    {/* No results after filter */}
                    {!grantsError && grants.length > 0 && filteredGrants.length === 0 && (
                      <div className="card rounded-2xl p-10 text-center space-y-2">
                        <p className="font-jakarta font-bold text-base" style={{ color: 'var(--ink)' }}>
                          No grants match your search
                        </p>
                        <p className="text-sm" style={{ color: 'var(--muted)' }}>
                          Try a different keyword or filter.
                        </p>
                        <button
                          onClick={() => { setSearch(''); setStatusFilter('all') }}
                          className="btn btn-ghost btn-sm btn-focus inline-flex mx-auto mt-1"
                        >
                          Clear filters
                        </button>
                      </div>
                    )}

                    {/* Grants grid */}
                    {!grantsError && filteredGrants.length > 0 && (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
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
              </>
            )}
          </div>
          </motion.div>
        )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer
        className="py-4 px-4 sm:px-6 border-t mt-auto"
        style={{ borderColor: 'var(--border)', background: 'var(--warm-surface)' }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-medium" style={{ color: 'var(--subtle)' }}>
            GrantFlow — built on Arc Testnet
          </span>
          <span className="text-xs" style={{ color: 'var(--subtle)' }}>
            Need test USDC?{' '}
            <a
              href="https://faucet.circle.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--brand)' }}
              className="font-semibold hover:underline"
            >
              Get test USDC ↗
            </a>
          </span>
        </div>
      </footer>
    </div>
  )
}
