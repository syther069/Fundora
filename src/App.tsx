import { useState, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import { Users, LayoutGrid, Info, AlertCircle, RefreshCw, Sprout, Zap, ShieldCheck } from 'lucide-react'
import { Header } from './components/Header'
import { GrantCard } from './components/GrantCard'
import { GrantSkeleton } from './components/GrantSkeleton'
import { GrantDetail } from './components/GrantDetail'
import { AdminPanel } from './components/AdminPanel'
import { useContractAdmin, useIsReviewer } from './hooks/useProofSpring'
import { useGrants } from './context/GrantsContext'
import type { Grant } from './hooks/useProofSpring'
import { PROOF_SPRING_ADDRESS } from './contracts/proofSpring'

type View = 'grants' | 'detail' | 'admin'

const NOT_DEPLOYED = PROOF_SPRING_ADDRESS === '0x0000000000000000000000000000000000000000'

// ── Hero disconnect state ─────────────────────────────────────────────────────
function HeroConnect() {
  return (
    <div
      className="gf-card overflow-hidden max-w-md mx-auto"
      style={{ background: 'var(--surface)' }}
    >
      {/* Brand gradient bar */}
      <div
        className="h-1"
        style={{ background: 'linear-gradient(90deg, var(--brand) 0%, var(--success) 100%)' }}
        aria-hidden="true"
      />

      <div className="px-8 py-12 text-center space-y-6">
        {/* Logo mark */}
        <div
          className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, var(--brand) 0%, var(--success) 100%)',
            boxShadow:  '0 8px 24px rgba(79,70,229,0.22)',
          }}
          aria-hidden="true"
        >
          <svg width="26" height="26" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8h7M7 5l3 3-3 3"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="13" cy="8" r="1.5" fill="white" />
          </svg>
        </div>

        <div>
          <h1
            className="t-h1 mb-2"
            style={{
              fontFamily:    '"Plus Jakarta Sans", sans-serif',
              fontSize:      '1.75rem',
              fontWeight:    800,
              letterSpacing: '-0.03em',
            }}
          >
            GrantFlow
          </h1>
          <p className="t-body text-sm leading-relaxed max-w-xs mx-auto">
            Milestone-based USDC grants with onchain evidence, reviewer votes, and transparent payouts.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { icon: <Zap size={11} />, label: 'Instant USDC payouts' },
            { icon: <ShieldCheck size={11} />, label: 'Onchain evidence' },
            { icon: <Users size={11} />, label: 'Reviewer governance' },
          ].map(({ icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border"
              style={{
                background:  'var(--surface-raised)',
                color:       'var(--text-secondary)',
                borderColor: 'var(--border)',
              }}
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

// ── Role banner ───────────────────────────────────────────────────────────────
function RoleBanner({ isAdmin, isReviewer }: { isAdmin: boolean; isReviewer: boolean | undefined }) {
  if (!isAdmin && !isReviewer) return null

  const adminStyle  = { background: 'var(--brand-light)', borderColor: 'var(--brand-border)', color: 'var(--brand)' }
  const reviewStyle = { background: 'var(--success-light)', borderColor: 'var(--success-border)', color: 'var(--success)' }
  const s = isAdmin ? adminStyle : reviewStyle

  return (
    <div
      className="border-b py-2 px-4"
      style={{ background: s.background, borderColor: s.borderColor }}
    >
      <div
        className="max-w-6xl mx-auto flex items-center gap-2 text-xs font-semibold"
        style={{ color: s.color }}
      >
        {isAdmin ? <ShieldCheck size={12} /> : <Info size={12} />}
        {isAdmin
          ? 'You are the grant admin — manage grants, reviewers, and settings from the Admin panel.'
          : 'You are a reviewer — open a grant to vote on submitted milestones.'}
      </div>
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const { address, isConnected } = useAccount()
  const [view, setView]                   = useState<View>('grants')
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null)
  const [navigating, setNavigating]       = useState<string | null>(null)

  const { grants, grantCount, isLoading: grantsLoading, isError: grantsError, refetch: refetchGrants } = useGrants()
  const grantCountData = grantCount > 0 ? BigInt(grantCount) : undefined

  const { data: contractAdmin } = useContractAdmin()
  const { data: isReviewer }    = useIsReviewer(address)

  const isAdmin = !!(address && contractAdmin && address.toLowerCase() === (contractAdmin as string).toLowerCase())

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
      <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg)' }}>
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-sm w-full text-center space-y-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
              style={{ background: 'var(--brand-light)' }}
            >
              <Sprout size={26} style={{ color: 'var(--brand)' }} />
            </div>
            <div>
              <h1
                className="font-extrabold text-2xl mb-2"
                style={{
                  fontFamily:    '"Plus Jakarta Sans", sans-serif',
                  color:         'var(--text-primary)',
                  letterSpacing: '-0.03em',
                }}
              >
                Awaiting Deployment
              </h1>
              <p className="t-body text-sm">
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
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg)' }}>
      <Header />

      {isConnected && <RoleBanner isAdmin={isAdmin} isReviewer={isReviewer} />}

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {view === 'detail' && selectedGrant ? (
          <GrantDetail
            grant={selectedGrant}
            onBack={handleBack}
            onRefresh={handleRefresh}
            isAdmin={isAdmin}
          />
        ) : (
          <div className="space-y-6">
            {/* Page header */}
            {(view === 'grants' || view === 'admin') && (
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1
                    className="font-extrabold mb-1"
                    style={{
                      fontFamily:    '"Plus Jakarta Sans", sans-serif',
                      fontSize:      '1.375rem',
                      color:         'var(--text-primary)',
                      letterSpacing: '-0.025em',
                    }}
                  >
                    {view === 'admin' ? 'Admin Panel' : 'Active Grants'}
                  </h1>
                  <p className="t-body text-sm">
                    Fund ideas. Verify progress. Release grants with proof.
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setView(view === 'admin' ? 'grants' : 'admin')}
                    className="gf-btn gf-focus shrink-0"
                    style={{
                      height:      '2.25rem',
                      padding:     '0 1rem',
                      background:  view === 'admin' ? 'var(--brand)' : 'var(--surface)',
                      border:      `1px solid ${view === 'admin' ? 'var(--brand)' : 'var(--border)'}`,
                      color:       view === 'admin' ? 'var(--text-invert)' : 'var(--text-primary)',
                      boxShadow:   view === 'admin' ? 'var(--shadow-brand)' : undefined,
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
                    {/* Error state */}
                    {grantsError && (
                      <div
                        className="gf-card p-8 text-center space-y-4"
                        style={{ borderColor: 'var(--danger-border)' }}
                      >
                        <AlertCircle size={22} className="mx-auto" style={{ color: 'var(--danger)' }} />
                        <div>
                          <p className="t-h3 mb-1">Could not load grants</p>
                          <p className="t-body text-sm">
                            A network error occurred while reading the contract. Check your connection and try again.
                          </p>
                        </div>
                        <button
                          onClick={handleRefresh}
                          className="gf-btn gf-btn-ghost gf-focus inline-flex mx-auto"
                        >
                          <RefreshCw size={13} />
                          Retry
                        </button>
                      </div>
                    )}

                    {/* Skeleton — grantCount resolving */}
                    {!grantsError && grantCountData === undefined && (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 3 }, (_, i) => <GrantSkeleton key={i} />)}
                      </div>
                    )}

                    {/* Skeleton — grants fetching */}
                    {!grantsError && grantCountData !== undefined && grantsLoading && grantCount > 0 && grants.length === 0 && (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: Math.min(grantCount, 6) }, (_, i) => (
                          <GrantSkeleton key={i} />
                        ))}
                      </div>
                    )}

                    {/* Empty state */}
                    {!grantsError && grantCountData !== undefined && !grantsLoading && grants.length === 0 && (
                      <div className="gf-card p-12 text-center space-y-3">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
                          style={{ background: 'var(--surface-raised)' }}
                        >
                          <Sprout size={22} style={{ color: 'var(--text-tertiary)' }} />
                        </div>
                        <p className="t-h3">No grants yet</p>
                        <p className="t-body text-sm">
                          {isAdmin
                            ? 'Open the Admin panel to create the first grant.'
                            : 'Check back soon — grants will appear here once created by the admin.'}
                        </p>
                      </div>
                    )}

                    {/* Grants grid */}
                    {!grantsError && grants.length > 0 && (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {grants.map(grant => (
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
        )}
      </main>

      {/* Footer */}
      <footer
        className="py-4 px-4 border-t mt-auto"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <span className="t-meta">GrantFlow — built on Arc Testnet</span>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Need test USDC? Use the{' '}
            <strong style={{ color: 'var(--brand)' }}>Get test USDC</strong>
            {' '}button in the sidebar.
          </span>
        </div>
      </footer>
    </div>
  )
}
