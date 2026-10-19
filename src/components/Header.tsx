import { ConnectKitButton } from 'connectkit'
import { Leaf } from 'lucide-react'

// Fix 11: Arc chain badge next to logo for clear network identity
function ArcBadge() {
  return (
    <span
      className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border"
      style={{ background: 'var(--spring-light)', color: 'var(--spring)', borderColor: '#a7f3d0' }}
    >
      {/* Arc chain dot */}
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--spring)' }} />
      Arc Testnet
    </span>
  )
}

export function Header() {
  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{ background: 'var(--surface-strong)', borderColor: 'var(--border)', backdropFilter: 'blur(12px)' }}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--spring)' }}>
            <Leaf size={15} className="text-white" />
          </div>
          <span className="display font-semibold text-base" style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}>
            ProofSpring
          </span>
          <ArcBadge />
        </div>
        <ConnectKitButton />
      </div>
    </header>
  )
}
