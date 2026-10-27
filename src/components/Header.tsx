import { useState } from 'react'
import { useAccount } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import { Fingerprint, ShieldCheck, Compass, Users, Scale, LayoutDashboard, Archive } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { ARC_TESTNET_ID, ARC_MAINNET_ID } from '../contracts/fundora'
import { usePasskeyContext } from '../context/PasskeyContext'
import { PasskeyAuthModal } from './PasskeyAuthModal'

interface HeaderProps {
  onOpenApplyAdmin?: () => void
  isAdmin?: boolean
  currentView?: string
  onViewChange?: (view: string) => void
}

function LogoMark() {
  return (
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
      style={{
        background: 'linear-gradient(135deg, #1A3F75 0%, #0F766E 100%)',
      }}
      aria-hidden="true"
    >
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="6" cy="8" r="4.5" stroke="white" strokeWidth="1.5" fill="none" opacity="0.95" />
        <circle cx="10" cy="8" r="4.5" stroke="white" strokeWidth="1.5" fill="none" opacity="0.7" />
        <path d="M10 6h1.5v2H10" stroke="white" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function ChainBadge() {
  const { chainId } = useAccount()
  const isMainnet = chainId === ARC_MAINNET_ID
  const isTestnet = chainId === ARC_TESTNET_ID
  // Show nothing for unsupported chains — WrongChainBanner handles that
  if (chainId && !isMainnet && !isTestnet) return null

  return (
    <span
      className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
      style={isMainnet ? {
        background: 'var(--brand-light)',
        color: 'var(--brand)',
        borderColor: 'var(--brand-border)',
      } : {
        background: 'var(--teal-light)',
        color: 'var(--teal)',
        borderColor: 'var(--teal-border)',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ background: isMainnet ? 'var(--brand)' : 'var(--teal)' }}
        aria-hidden="true"
      />
      {isMainnet ? 'Arc Mainnet' : 'Arc Testnet'}
    </span>
  )
}

export function Header({ onOpenApplyAdmin, isAdmin, currentView = 'events', onViewChange }: HeaderProps = {}) {
  const { isConnected } = useAccount()
  const { isPasskeyConnected, smartAccountAddress, disconnect: passkeyDisconnect } = usePasskeyContext()
  const [showPasskeyModal, setShowPasskeyModal] = useState(false)

  // Short address display: 0x1234…abcd
  const shortAddr = smartAccountAddress
    ? `${smartAccountAddress.slice(0, 6)}…${smartAccountAddress.slice(-4)}`
    : ''

  const navItems = [
    { id: 'events', label: 'Explore Events', icon: Compass },
    { id: 'participant', label: 'Participant Hub', icon: Users },
    { id: 'reviewer', label: 'Reviewer Portal', icon: Scale },
    { id: 'organizer', label: 'Organizer Console', icon: LayoutDashboard },
  ]

  return (
    <>
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: 'rgba(247, 248, 246, 0.92)',
          borderColor: 'var(--border)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand Logo + Name + Workspace Switcher */}
          <div className="flex items-center gap-6 min-w-0">
            <button
              onClick={() => onViewChange?.('events')}
              className="flex items-center gap-2.5 shrink-0 text-left outline-none group"
              aria-label="Fundora home"
            >
              <LogoMark />
              <div className="flex items-center gap-2">
                <span
                  className="font-jakarta font-extrabold text-xl tracking-tight"
                  style={{ color: 'var(--midnight)', letterSpacing: '-0.03em' }}
                >
                  Fundora
                </span>
                <ChainBadge />
              </div>
            </button>

            {/* Role / Workspace Switcher */}
            {onViewChange && (
              <nav className="hidden lg:flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl" aria-label="Main Navigation">
                {navItems.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => onViewChange(id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all outline-none ${
                      currentView === id || (id === 'events' && currentView === 'event-detail')
                        ? 'bg-white text-midnight shadow-xs'
                        : 'text-slate-600 hover:text-midnight hover:bg-white/50'
                    }`}
                  >
                    <Icon size={13} className={currentView === id ? 'text-brand' : 'text-slate-400'} />
                    {label}
                  </button>
                ))}
              </nav>
            )}
          </div>

          {/* Right: Wallet & Action Area */}
          <div className="shrink-0 flex items-center gap-2">
            {/* View Legacy Grants Link */}
            {onViewChange && (
              <button
                onClick={() => onViewChange(currentView === 'grants' ? 'events' : 'grants')}
                className="hidden xl:inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-midnight px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                title="Toggle between Hackathons directory and Microgrants view"
              >
                <Archive size={12} />
                {currentView === 'grants' ? 'Hackathons' : 'Microgrants'}
              </button>
            )}

            {/* Apply as Admin button */}
            {!isAdmin && onOpenApplyAdmin && (
              <button
                id="header-apply-admin-btn"
                onClick={onOpenApplyAdmin}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full border transition-all hover:opacity-85 btn-focus"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--ink)',
                }}
                aria-label="Apply to launch grants as an Admin"
              >
                <ShieldCheck size={13} style={{ color: 'var(--brand)' }} aria-hidden="true" />
                Apply as Admin
              </button>
            )}

            {/* ConnectKit button */}
            <ConnectKitButton />

            {/* Passkey: connected state */}
            {isPasskeyConnected && smartAccountAddress && (
              <div className="flex items-center gap-1.5">
                <div
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold"
                  style={{
                    background: 'var(--brand-light)',
                    borderColor: 'var(--brand-border)',
                    color: 'var(--brand)',
                  }}
                >
                  <Fingerprint size={11} aria-hidden="true" />
                  Smart Account (Gasless)
                </div>
                <span
                  className="hidden md:block text-xs font-mono px-2 py-1 rounded-lg border"
                  style={{
                    background: 'var(--warm-bg-2)',
                    borderColor: 'var(--border)',
                    color: 'var(--ink)',
                  }}
                  title={smartAccountAddress}
                >
                  {shortAddr}
                </span>
                <button
                  onClick={passkeyDisconnect}
                  className="text-xs font-semibold px-2.5 py-1 rounded-full border transition-all hover:opacity-70 btn-focus"
                  style={{
                    color: 'var(--muted)',
                    borderColor: 'var(--border)',
                    background: 'var(--surface)',
                  }}
                  aria-label="Disconnect passkey account"
                >
                  Disconnect
                </button>
              </div>
            )}

            {/* Passkey: sign-in button */}
            {!isConnected && !isPasskeyConnected && (
              <button
                onClick={() => setShowPasskeyModal(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full border transition-all hover:opacity-80 btn-focus"
                style={{
                  background: 'var(--brand-light)',
                  borderColor: 'var(--brand-border)',
                  color: 'var(--brand)',
                }}
                aria-label="Sign in with passkey — gasless account"
              >
                <Fingerprint size={13} aria-hidden="true" />
                <span className="hidden sm:inline">Passkey (Gasless)</span>
                <span className="sm:hidden">Passkey</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        {onViewChange && (
          <div className="lg:hidden flex items-center gap-1 px-4 py-2 border-t border-slate-200/80 overflow-x-auto tab-scroll-container bg-white/70">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onViewChange(id)}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  currentView === id || (id === 'events' && currentView === 'event-detail')
                    ? 'bg-midnight text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Passkey modal */}
      <AnimatePresence>
        {showPasskeyModal && (
          <PasskeyAuthModal onClose={() => setShowPasskeyModal(false)} />
        )}
      </AnimatePresence>
    </>
  )
}
