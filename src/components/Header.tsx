import { useState } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import { Compass, FolderGit2, CheckSquare, ShieldCheck, Fingerprint, LogOut } from 'lucide-react'
import { ARC_TESTNET_ID, ARC_MAINNET_ID } from '../contracts/proofSpring'
import { usePasskey } from '../context/PasskeyContext'
import { PasskeyAuthModal } from './PasskeyAuthModal'

export type NavTab = 'explore' | 'my-activity' | 'reviews' | 'admin'

interface HeaderProps {
  activeTab: NavTab | 'detail'
  onSelectTab: (tab: NavTab) => void
  isAdmin: boolean
  isReviewer?: boolean
  myActivityCount?: number
  pendingReviewsCount?: number
}

function LogoMark() {
  return (
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
      style={{
        background: 'linear-gradient(135deg, #014BAA 0%, #27187E 100%)',
      }}
      aria-hidden="true"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="6" cy="8" r="4.5" stroke="white" strokeWidth="1.5" fill="none" opacity="0.9" />
        <circle cx="10" cy="8" r="4.5" stroke="white" strokeWidth="1.5" fill="none" opacity="0.6" />
        <path d="M10 6h1.5v2H10" stroke="white" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function NetworkSwitcher() {
  const { chainId, isConnected } = useAccount()
  const { switchChain } = useSwitchChain()
  if (!isConnected) return null

  const isMainnet = chainId === ARC_MAINNET_ID
  const isTestnet = chainId === ARC_TESTNET_ID

  return (
    <div
      className="flex items-center gap-0.5 rounded-full border p-0.5"
      style={{
        background: 'var(--warm-bg-2)',
        borderColor: 'var(--border)',
      }}
      role="group"
      aria-label="Arc Network Switcher"
    >
      <button
        type="button"
        onClick={() => switchChain?.({ chainId: ARC_TESTNET_ID })}
        className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all cursor-pointer ${
          isTestnet ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
        }`}
        style={{
          background: isTestnet ? 'var(--teal)' : 'transparent',
          color: isTestnet ? '#ffffff' : 'var(--muted)',
        }}
        aria-pressed={isTestnet}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${isTestnet ? 'bg-white animate-pulse' : 'bg-stone-400'}`}
          aria-hidden="true"
        />
        Testnet
      </button>

      <button
        type="button"
        onClick={() => switchChain?.({ chainId: ARC_MAINNET_ID })}
        className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all cursor-pointer ${
          isMainnet ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
        }`}
        style={{
          background: isMainnet ? 'var(--brand)' : 'transparent',
          color: isMainnet ? '#ffffff' : 'var(--muted)',
        }}
        aria-pressed={isMainnet}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${isMainnet ? 'bg-white animate-pulse' : 'bg-stone-400'}`}
          aria-hidden="true"
        />
        Mainnet
      </button>
    </div>
  )
}

export function Header({
  activeTab,
  onSelectTab,
  isAdmin,
  isReviewer,
  myActivityCount = 0,
  pendingReviewsCount = 0,
}: HeaderProps) {
  const [showPasskeyModal, setShowPasskeyModal] = useState(false)
  const { isPasskeyConnected, smartAccountAddress, username, disconnect } = usePasskey()

  const tabs = [
    {
      id: 'explore' as NavTab,
      label: 'Explore',
      icon: Compass,
      badge: null,
      visible: true,
    },
    {
      id: 'my-activity' as NavTab,
      label: 'My Activity',
      icon: FolderGit2,
      badge: myActivityCount > 0 ? myActivityCount : null,
      visible: true,
    },
    {
      id: 'reviews' as NavTab,
      label: 'Review Queue',
      icon: CheckSquare,
      badge: pendingReviewsCount > 0 ? pendingReviewsCount : null,
      visible: true,
    },
    {
      id: 'admin' as NavTab,
      label: 'Admin',
      icon: ShieldCheck,
      badge: null,
      visible: isAdmin,
    },
  ]

  return (
    <header
      className="sticky top-0 z-40 border-b transition-colors"
      style={{
        background: 'rgba(248, 243, 240, 0.92)',
        borderColor: 'var(--border)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Left: Brand */}
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => onSelectTab('explore')}
              className="flex items-center gap-2.5 text-left cursor-pointer group focus:outline-none"
              title="GrantFlow Home"
            >
              <LogoMark />
              <div className="flex flex-col">
                <span
                  className="font-jakarta font-extrabold text-lg tracking-tight leading-none"
                  style={{ color: 'var(--ink)', letterSpacing: '-0.025em' }}
                >
                  GrantFlow
                </span>
                <span className="text-[10px] font-semibold text-muted tracking-wider uppercase">
                  on Arc
                </span>
              </div>
            </button>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 ml-4" aria-label="Main Navigation">
              {tabs
                .filter(t => t.visible)
                .map(tab => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onSelectTab(tab.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer btn-focus"
                      style={{
                        background: isActive ? 'var(--brand-light)' : 'transparent',
                        color: isActive ? 'var(--brand)' : 'var(--muted)',
                        border: isActive ? '1px solid var(--brand-border)' : '1px solid transparent',
                      }}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon size={14} style={{ color: isActive ? 'var(--brand)' : 'currentColor' }} />
                      <span>{tab.label}</span>
                      {tab.badge !== null && (
                        <span
                          className="px-1.5 py-0.2 rounded-full text-[10px] font-bold"
                          style={{
                            background: isActive ? 'var(--brand)' : 'var(--border)',
                            color: isActive ? '#fff' : 'var(--ink)',
                          }}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
            </nav>
          </div>

          {/* Right: Passkey / Network toggle & Wallet */}
          <div className="flex items-center gap-2 shrink-0">
            {isPasskeyConnected ? (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs"
                style={{
                  background: 'var(--brand-light)',
                  borderColor: 'var(--brand-border)',
                  color: 'var(--brand)',
                }}
              >
                <Fingerprint size={13} className="shrink-0" />
                <span className="font-bold text-[11px] truncate max-w-[80px] sm:max-w-[110px]">
                  {username || `${smartAccountAddress?.slice(0, 6)}…${smartAccountAddress?.slice(-4)}`}
                </span>
                <span className="hidden sm:inline-block px-1 py-0.2 rounded text-[9px] font-extrabold uppercase bg-brand text-white">
                  Gasless
                </span>
                <button
                  type="button"
                  onClick={disconnect}
                  className="ml-0.5 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                  title="Disconnect Passkey"
                  aria-label="Disconnect Passkey"
                >
                  <LogOut size={12} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowPasskeyModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold transition-all cursor-pointer shadow-xs hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, rgba(1, 75, 170, 0.08) 0%, rgba(39, 24, 126, 0.08) 100%)',
                  borderColor: 'var(--brand-border)',
                  color: 'var(--brand)',
                }}
                title="Create or sign in with biometric Passkey (Gasless)"
              >
                <Fingerprint size={13} />
                <span className="hidden sm:inline">Passkey</span>
                <span className="px-1 py-0.2 rounded text-[9px] font-extrabold uppercase bg-brand text-white">
                  Gasless
                </span>
              </button>
            )}

            <NetworkSwitcher />
            <ConnectKitButton />
          </div>
        </div>

        {/* Mobile Navigation Bar (< md) */}
        <div className="md:hidden pb-3 pt-1 overflow-x-auto no-scrollbar flex items-center gap-1 border-t" style={{ borderColor: 'var(--border)' }}>
          {tabs
            .filter(t => t.visible)
            .map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer"
                  style={{
                    background: isActive ? 'var(--brand-light)' : 'var(--warm-bg-2)',
                    color: isActive ? 'var(--brand)' : 'var(--muted)',
                    border: `1px solid ${isActive ? 'var(--brand-border)' : 'var(--border)'}`,
                  }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={13} style={{ color: isActive ? 'var(--brand)' : 'currentColor' }} />
                  <span>{tab.label}</span>
                  {tab.badge !== null && (
                    <span
                      className="px-1.5 py-0.2 rounded-full text-[10px] font-bold"
                      style={{
                        background: isActive ? 'var(--brand)' : 'var(--border)',
                        color: isActive ? '#fff' : 'var(--ink)',
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
        </div>
      </div>

      <PasskeyAuthModal
        isOpen={showPasskeyModal}
        onClose={() => setShowPasskeyModal(false)}
      />
    </header>
  )
}
