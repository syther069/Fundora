import { useState } from 'react'
import { useAccount } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import { Fingerprint } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { ARC_TESTNET_ID, ARC_MAINNET_ID } from '../contracts/fundora'
import { usePasskeyContext } from '../context/PasskeyContext'
import { PasskeyAuthModal } from './PasskeyAuthModal'

function LogoMark() {
  return (
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
      style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #0d9488 100%)',
        boxShadow: '0 2px 8px rgba(99,102,241,.35)',
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

function ChainBadge() {
  const { chainId } = useAccount()
  const isMainnet = chainId === ARC_MAINNET_ID
  const isTestnet = chainId === ARC_TESTNET_ID
  // Show nothing for unsupported chains — WrongChainBanner handles that
  if (chainId && !isMainnet && !isTestnet) return null

  return (
    <span
      className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
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

export function Header() {
  const { isConnected } = useAccount()
  const { isPasskeyConnected, smartAccountAddress, disconnect: passkeyDisconnect } = usePasskeyContext()
  const [showPasskeyModal, setShowPasskeyModal] = useState(false)

  // Short address display: 0x1234…abcd
  const shortAddr = smartAccountAddress
    ? `${smartAccountAddress.slice(0, 6)}…${smartAccountAddress.slice(-4)}`
    : ''

  return (
    <>
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: 'rgba(255,251,245,0.85)',
          borderColor: 'var(--border)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: logo + name + badge */}
          <div className="flex items-center gap-3 min-w-0">
            <LogoMark />
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="font-jakarta font-bold text-lg tracking-tight shrink-0"
                style={{ color: 'var(--ink)', letterSpacing: '-0.025em' }}
              >
                Fundora
              </span>
              <ChainBadge />
            </div>
          </div>

          {/* Right: wallet area */}
          <div className="shrink-0 flex items-center gap-2">
            {/* ConnectKit button — always present */}
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
                    background: 'var(--warm-surface)',
                  }}
                  aria-label="Disconnect passkey account"
                >
                  Disconnect
                </button>
              </div>
            )}

            {/* Passkey: sign-in button — only when no wallet AND no passkey */}
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
      </header>

      {/* Passkey modal — AnimatePresence for enter/exit animation */}
      <AnimatePresence>
        {showPasskeyModal && (
          <PasskeyAuthModal onClose={() => setShowPasskeyModal(false)} />
        )}
      </AnimatePresence>
    </>
  )
}
