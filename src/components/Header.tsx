import { useAccount, useSwitchChain } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import { ARC_TESTNET_ID, ARC_MAINNET_ID } from '../contracts/proofSpring'

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
  const { switchChain } = useSwitchChain()
  const isMainnet = chainId === ARC_MAINNET_ID
  const isTestnet = chainId === ARC_TESTNET_ID
  // Show nothing for unsupported chains — WrongChainBanner handles that
  if (chainId && !isMainnet && !isTestnet) return null

  const targetChainId = isMainnet ? ARC_TESTNET_ID : ARC_MAINNET_ID
  const targetName = isMainnet ? 'Arc Testnet' : 'Arc Mainnet'

  return (
    <button
      type="button"
      onClick={() => switchChain?.({ chainId: targetChainId })}
      title={`Connected to ${isMainnet ? 'Arc Mainnet' : 'Arc Testnet'}. Click to switch to ${targetName}.`}
      className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-transform hover:scale-105 active:scale-95 cursor-pointer btn-focus"
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
    </button>
  )
}

export function Header() {
  return (
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
              GrantFlow
            </span>
            <ChainBadge />
          </div>
        </div>

        {/* Right: wallet connect */}
        <div className="shrink-0">
          <ConnectKitButton />
        </div>
      </div>
    </header>
  )
}
