import { useState, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import { Leaf, Sprout, Users, LayoutGrid, Info, AlertCircle, RefreshCw } from 'lucide-react'
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

export default function App() {
  const { address, isConnected } = useAccount()
  const [view, setView] = useState<View>('grants')
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null)
  const [navigating, setNavigating] = useState<string | null>(null)

  // 3.3 — consume from GrantsContext; no duplicate RPC calls
  const { grants, grantCount, isLoading: grantsLoading, isError: grantsError, refetch: refetchGrants } = useGrants()
  const grantCountData = grantCount > 0 ? BigInt(grantCount) : undefined

  const { data: contractAdmin } = useContractAdmin()
  const { data: isReviewer } = useIsReviewer(address)

  const isAdmin = !!(address && contractAdmin && address.toLowerCase() === (contractAdmin as string).toLowerCase())

  const handleRefresh = useCallback(() => {
    refetchGrants()
  }, [refetchGrants])

  // Fix 16: click feedback — brief navigating state before showing detail
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

  if (NOT_DEPLOYED) {
    return (
      <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg-gradient)' }}>
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto" style={{ background: 'var(--spring-light)' }}>
              <Sprout size={28} style={{ color: 'var(--spring)' }} />
            </div>
            <h1 className="display font-bold text-2xl" style={{ color: 'var(--ink)' }}>Awaiting Deployment</h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              The ProofSpring contract is not yet deployed. Deploy it from the Contracts panel to activate the platform.
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg-gradient)' }}>
      <Header />

      {/* Role banner */}
      {isConnected && (isAdmin || isReviewer) && (
        <div
          className="border-b py-2 px-4"
          style={{ background: isAdmin ? '#f0fdf4' : '#eff6ff', borderColor: isAdmin ? '#bbf7d0' : '#bfdbfe' }}
        >
          <div className="max-w-6xl mx-auto flex items-center gap-2 text-xs font-medium" style={{ color: isAdmin ? 'var(--spring)' : '#1d4ed8' }}>
            {isAdmin ? <Users size={12} /> : <Info size={12} />}
            {isAdmin
              ? 'You are the grant admin — manage grants, reviewers, and settings from the Admin panel.'
              : 'You are a reviewer — open a grant to vote on submitted milestones.'}
          </div>
        </div>
      )}

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
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
                    className="display font-bold text-2xl mb-1"
                    style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}
                  >
                    {view === 'admin' ? 'Admin Panel' : 'Active Grants'}
                  </h1>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    Fund ideas. Verify progress. Release grants with proof.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isAdmin && (
                    <button
                      onClick={() => setView(view === 'admin' ? 'grants' : 'admin')}
                      className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-sm font-medium border transition-all hover:opacity-80"
                      style={{
                        background: view === 'admin' ? 'var(--accent)' : 'var(--surface-strong)',
                        borderColor: view === 'admin' ? 'var(--accent)' : 'var(--border)',
                        color: view === 'admin' ? 'white' : 'var(--ink)',
                      }}
                    >
                      <LayoutGrid size={13} />
                      {view === 'admin' ? 'Back to Grants' : 'Admin'}
                    </button>
                  )}
                </div>
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
                  <div
                    className="rounded-2xl border p-10 text-center space-y-4"
                    style={{ background: 'var(--surface-strong)', borderColor: 'var(--border)' }}
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
                      style={{ background: 'var(--spring-light)' }}
                    >
                      <Leaf size={22} style={{ color: 'var(--spring)' }} />
                    </div>
                    <div>
                      <h2 className="display font-bold text-xl mb-1" style={{ color: 'var(--ink)' }}>ProofSpring</h2>
                      <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--muted)' }}>
                        Milestone-based USDC grants with onchain evidence, reviewer votes, and transparent payouts.
                      </p>
                    </div>
                    <ConnectKitButton label="Connect Wallet to Get Started" />
                  </div>
                ) : (
                  <>
                    {/* C8: RPC/network error — clearly distinct from "no grants yet" */}
                    {grantsError && (
                      <div
                        className="rounded-2xl border p-8 text-center space-y-3"
                        style={{ background: 'var(--surface-strong)', borderColor: '#fecaca' }}
                      >
                        <AlertCircle size={22} className="mx-auto" style={{ color: 'var(--danger)' }} />
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                            Could not load grants
                          </p>
                          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                            A network error occurred while reading the contract. Check your connection
                            and try again — the page retries automatically.
                          </p>
                        </div>
                        <button
                          onClick={handleRefresh}
                          className="inline-flex items-center gap-1.5 px-4 h-9 rounded-xl text-sm font-medium border transition-all hover:opacity-80"
                          style={{ borderColor: 'var(--border)', color: 'var(--ink)', background: 'var(--surface-strong)' }}
                        >
                          <RefreshCw size={13} />
                          Retry
                        </button>
                      </div>
                    )}

                    {/* A3: skeletons while grantCount itself hasn't resolved yet */}
                    {!grantsError && grantCountData === undefined && (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 3 }, (_, i) => <GrantSkeleton key={i} />)}
                      </div>
                    )}

                    {/* Loading skeletons while grants fetch (count known but results pending) */}
                    {!grantsError && grantCountData !== undefined && grantsLoading && grantCount > 0 && grants.length === 0 && (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: Math.min(grantCount, 6) }, (_, i) => (
                          <GrantSkeleton key={i} />
                        ))}
                      </div>
                    )}

                    {/* True empty state — no grants exist yet */}
                    {!grantsError && grantCountData !== undefined && !grantsLoading && grants.length === 0 && (
                      <div
                        className="rounded-2xl border p-10 text-center space-y-3"
                        style={{ background: 'var(--surface-strong)', borderColor: 'var(--border)' }}
                      >
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
                          style={{ background: 'var(--surface-muted)' }}
                        >
                          <Sprout size={22} style={{ color: 'var(--subtle)' }} />
                        </div>
                        <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>No grants yet</p>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>
                          {isAdmin
                            ? 'Open the Admin panel to create the first grant.'
                            : 'Check back soon — grants will appear here once created by the admin.'}
                        </p>
                      </div>
                    )}

                    {!grantsError && grants.length > 0 && (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Footer — Fix 8: removed external faucet link, point to sidebar instead */}
      <footer className="py-4 px-4 border-t mt-auto" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--subtle)' }}>ProofSpring — built on Arc Testnet</span>
          {/* C3: faucet hint always visible — connected users need test USDC too */}
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            Need test USDC? Use the{' '}
            <strong style={{ color: 'var(--spring)' }}>Get test USDC</strong>
            {' '}button in the sidebar.
          </span>
        </div>
      </footer>
    </div>
  )
}
