import { useState, useCallback, useMemo, useEffect } from 'react'
import { useAccount } from 'wagmi'
import {
  LayoutGrid,
  Info,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react'
import { formatUnits } from 'viem'
import { Header, NavTab } from './components/Header'
import { GrantCard } from './components/GrantCard'
import { GrantSkeleton } from './components/GrantSkeleton'
import { GrantDetail } from './components/GrantDetail'
import { AdminPanel } from './components/AdminPanel'
import { LandingPage } from './components/landing/LandingPage'
import { BorrowView } from './components/features/BorrowView'
import { EarnView } from './components/features/EarnView'
import { SwapView } from './components/features/SwapView'
import { SpendView } from './components/features/SpendView'
import { DocsPage } from './components/docs/DocsPage'
import { Card } from './components/ui/Card'
import { Button } from './components/ui/Button'
import { EmptyState } from './components/ui/EmptyState'
import { useContractAdmin, useIsReviewer } from './hooks/useFundora'
import { useGrants } from './context/GrantsContext'
import type { Grant } from './hooks/useFundora'
import { FUNDORA_ADDRESS } from './contracts/fundora'

type GrantsSubView = 'list' | 'detail' | 'admin'

const NOT_DEPLOYED = FUNDORA_ADDRESS === '0x0000000000000000000000000000000000000000'

export default function App() {
  const { address, isConnected } = useAccount()
  const [currentTab, setCurrentTab] = useState<NavTab>('home')
  const [grantsView, setGrantsView] = useState<GrantsSubView>('list')
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null)
  const [navigating, setNavigating] = useState<string | null>(null)

  // Centralized grants context
  const {
    grants,
    grantCount,
    isLoading: grantsLoading,
    isError: grantsError,
    refetch: refetchGrants,
  } = useGrants()

  const grantCountData = grantCount > 0 ? BigInt(grantCount) : undefined

  const { data: contractAdmin } = useContractAdmin()
  const { data: isReviewer } = useIsReviewer(address)

  const isAdmin = !!(
    address &&
    contractAdmin &&
    address.toLowerCase() === (contractAdmin as string).toLowerCase()
  )

  const handleRefresh = useCallback(() => {
    refetchGrants()
  }, [refetchGrants])

  const handleSelectGrant = (grant: Grant) => {
    setNavigating(grant.id.toString())
    setTimeout(() => {
      setSelectedGrant(grant)
      setGrantsView('detail')
      setNavigating(null)
    }, 80)
  }

  const handleBackToGrants = () => {
    setSelectedGrant(null)
    setGrantsView('list')
    handleRefresh()
  }

  // Summary statistics for grants escrow
  const stats = useMemo(() => {
    let totalUsdc = 0
    let totalReleased = 0
    let activeGrants = 0
    for (const g of grants) {
      totalUsdc += parseFloat(formatUnits(g.totalAmount, 6))
      totalReleased += parseFloat(formatUnits(g.releasedAmount, 6))
      if (g.status === 1 || g.status === 2) activeGrants++
    }
    return {
      totalGrants: grants.length,
      activeGrants,
      totalUsdc: totalUsdc.toFixed(2),
      totalReleased: totalReleased.toFixed(2),
    }
  }, [grants])

  // Scroll reveal observer for light motion
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          }
        })
      },
      { threshold: 0.1 }
    )

    const revealElements = document.querySelectorAll('.fade-up')
    revealElements.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [currentTab, grantsView])

  if (NOT_DEPLOYED) {
    return (
      <div className="min-h-dvh flex flex-col bg-[var(--bg)] text-[var(--ink)]">
        <Header currentTab={currentTab} onSelectTab={setCurrentTab} />
        <main className="flex-1 flex items-center justify-center px-4">
          <EmptyState
            type="error"
            title="Awaiting Smart Contract Deployment"
            description="The Fundora smart contracts are not yet deployed on this network. Configure deployment to activate."
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--bg)] text-[var(--ink)]">
      <Header currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Role banner for Admin / Reviewer */}
      {isConnected && (isAdmin || isReviewer) && (
        <div
          role="status"
          className="border-b py-2.5 px-4 backdrop-blur-xs transition-colors"
          style={{
            background: isAdmin ? 'rgba(240, 253, 244, 0.92)' : 'rgba(239, 246, 255, 0.92)',
            borderColor: isAdmin ? '#86efac' : '#93c5fd',
          }}
        >
          <div
            className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs font-medium"
            style={{ color: isAdmin ? '#166534' : '#1e40af' }}
          >
            <div className="flex items-center gap-2">
              {isAdmin ? <ShieldCheck size={15} /> : <Info size={15} />}
              <span>
                {isAdmin
                  ? 'Admin Access Verified — Create milestone grants, fund escrow, and assign reviewers.'
                  : 'Reviewer Access Active — Review milestone proof-of-work submissions.'}
              </span>
            </div>
            {isAdmin && (
              <button
                onClick={() => {
                  setCurrentTab('grants')
                  setGrantsView('admin')
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 transition-colors shadow-2xs btn-focus shrink-0"
              >
                Open Admin Dashboard
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab 1: Landing Page */}
        {currentTab === 'home' && (
          <LandingPage
            onStartBorrowing={() => setCurrentTab('borrow')}
            onOpenDocs={() => setCurrentTab('learn')}
            onOpenApp={() => setCurrentTab('grants')}
            onNavigateTab={tab => {
              if (tab === 'grants') {
                setCurrentTab('grants')
                setGrantsView('list')
              } else {
                setCurrentTab(tab)
              }
            }}
          />
        )}

        {/* Tab 2: Borrow View */}
        {currentTab === 'borrow' && <BorrowView />}

        {/* Tab 3: Earn View */}
        {currentTab === 'earn' && <EarnView />}

        {/* Tab 4: Swap View */}
        {currentTab === 'swap' && <SwapView />}

        {/* Tab 5: Spend View */}
        {currentTab === 'spend' && <SpendView />}

        {/* Tab 6: Learn / Docs View */}
        {currentTab === 'learn' && <DocsPage />}

        {/* Tab 7: Grants & Onchain Banking App Mode */}
        {currentTab === 'grants' && (
          <div className="space-y-6">
            {grantsView === 'detail' && selectedGrant ? (
              <GrantDetail
                grant={selectedGrant}
                onBack={handleBackToGrants}
                onRefresh={handleRefresh}
                isAdmin={isAdmin}
              />
            ) : (
              <div className="space-y-6">
                {/* Header & Sub-view toggle */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
                  <div>
                    <h1 className="heading-1 text-[var(--ink)] mb-1">
                      {grantsView === 'admin' ? 'Admin Dashboard' : 'Explore Microgrants'}
                    </h1>
                    <p className="text-sm text-[var(--muted)] max-w-2xl leading-relaxed">
                      Milestone-gated USDC grants on Arc. Fund builders with cryptographic proof-of-work, peer reviewer approval, and pull-payment escrow.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {isAdmin && (
                      <Button
                        variant={grantsView === 'admin' ? 'primary' : 'secondary'}
                        size="md"
                        onClick={() =>
                          setGrantsView(grantsView === 'admin' ? 'list' : 'admin')
                        }
                        leftIcon={<LayoutGrid size={15} />}
                        actionOutcome={{
                          action: grantsView === 'admin' ? 'Explore grants' : 'Admin panel',
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Summary Metrics */}
                {grantsView === 'list' && isConnected && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <Card padding="md" variant="default">
                      <span className="text-xs font-semibold text-[var(--subtle)] block mb-1 uppercase tracking-wider">
                        Total Grants
                      </span>
                      <span className="text-xl font-bold text-[var(--ink)] tabular-nums">
                        {stats.totalGrants}
                      </span>
                    </Card>

                    <Card padding="md" variant="default">
                      <span className="text-xs font-semibold text-[var(--subtle)] block mb-1 uppercase tracking-wider">
                        Active Programs
                      </span>
                      <span className="text-xl font-bold text-[var(--spring)] tabular-nums">
                        {stats.activeGrants}
                      </span>
                    </Card>

                    <Card padding="md" variant="default">
                      <span className="text-xs font-semibold text-[var(--subtle)] block mb-1 uppercase tracking-wider">
                        Committed Escrow
                      </span>
                      <span className="text-xl font-bold text-[var(--ink)] tabular-nums">
                        ${stats.totalUsdc} <span className="text-xs font-normal text-[var(--muted)]">USDC</span>
                      </span>
                    </Card>

                    <Card padding="md" variant="default">
                      <span className="text-xs font-semibold text-[var(--subtle)] block mb-1 uppercase tracking-wider">
                        Released Payouts
                      </span>
                      <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                        ${stats.totalReleased} <span className="text-xs font-normal text-[var(--muted)]">USDC</span>
                      </span>
                    </Card>
                  </div>
                )}

                {/* Admin sub-panel */}
                {grantsView === 'admin' && isAdmin && (
                  <AdminPanel onGrantCreated={handleRefresh} />
                )}

                {/* Grants list */}
                {grantsView === 'list' && (
                  <>
                    {!isConnected ? (
                      <EmptyState
                        type="first-use"
                        title="Connect Wallet to View Grants"
                        description="Connect your wallet to browse milestone-gated grants, submit proof-of-work, and claim approved USDC payouts."
                        actionLabel="Connect Wallet"
                        onAction={() => {
                          const btn = document.querySelector('button[data-testid="rk-connect-button"]') as HTMLButtonElement
                          btn?.click()
                        }}
                      />
                    ) : (
                      <>
                        {grantsError && (
                          <EmptyState
                            type="error"
                            title="Could Not Load Grants from Network"
                            description="A network error occurred while reading the Fundora contract. Check your connection to Arc Testnet or retry."
                            actionLabel="Retry"
                            onAction={handleRefresh}
                          />
                        )}

                        {/* Loading skeletons */}
                        {!grantsError && grantCountData === undefined && (
                          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 3 }, (_, i) => (
                              <GrantSkeleton key={i} />
                            ))}
                          </div>
                        )}

                        {!grantsError &&
                          grantCountData !== undefined &&
                          grantsLoading &&
                          grantCount > 0 &&
                          grants.length === 0 && (
                            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                              {Array.from({ length: Math.min(grantCount, 6) }, (_, i) => (
                                <GrantSkeleton key={i} />
                              ))}
                            </div>
                          )}

                        {/* Empty state */}
                        {!grantsError &&
                          grantCountData !== undefined &&
                          !grantsLoading &&
                          grants.length === 0 && (
                            <EmptyState
                              type="first-use"
                              title="No Grants Found on Network"
                              description={
                                isAdmin
                                  ? 'Open the Admin Panel to create your first milestone grant and fund escrow.'
                                  : 'No grants are currently active on this network. Connect as an administrator to create one.'
                              }
                              actionLabel={isAdmin ? 'Create First Grant' : undefined}
                              onAction={isAdmin ? () => setGrantsView('admin') : undefined}
                            />
                          )}

                        {/* Grants Grid */}
                        {!grantsError && grants.length > 0 && (
                          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-[var(--border)] bg-[var(--surface-strong)] transition-colors mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--ink)]">Fundora</span>
            <span>—</span>
            <span>Onchain milestone-gated USDC microgrants & escrow on Arc</span>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-[var(--subtle)]">
            <button
              onClick={() => setCurrentTab('learn')}
              className="hover:text-[var(--ink)] transition-colors btn-focus"
            >
              Docs & Contracts
            </button>
            <span>•</span>
            <button
              onClick={() => setCurrentTab('borrow')}
              className="hover:text-[var(--ink)] transition-colors btn-focus"
            >
              Borrow Calculator
            </button>
            <span>•</span>
            <a
              href="https://explorer.testnet.arc.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--ink)] inline-flex items-center gap-1 transition-colors btn-focus"
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
