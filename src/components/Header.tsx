import { ConnectKitButton } from 'connectkit'

function LogoMark() {
  return (
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
      style={{
        background: 'linear-gradient(135deg, var(--brand) 0%, var(--success) 100%)',
        boxShadow: '0 2px 8px rgba(79,70,229,0.28)',
      }}
      aria-hidden="true"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
  )
}

function ArcBadge() {
  return (
    <span
      className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
      style={{
        background:   'var(--success-light)',
        color:        'var(--success)',
        borderColor:  'var(--success-border)',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ background: 'var(--success)' }}
        aria-hidden="true"
      />
      Arc Testnet
    </span>
  )
}

export function Header() {
  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        background:        'rgba(253,252,251,0.92)',
        borderColor:       'var(--border)',
        backdropFilter:    'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <LogoMark />
          <span
            className="font-bold text-base"
            style={{
              fontFamily:    '"Plus Jakarta Sans", sans-serif',
              color:         'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            GrantFlow
          </span>
          <ArcBadge />
        </div>
        <ConnectKitButton />
      </div>
    </header>
  )
}
