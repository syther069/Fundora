import { useState, useRef, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import {
  Fingerprint, Compass, Users, Scale,
  LayoutDashboard, Archive, FlaskConical, Radio,
  ChevronDown, BookOpen,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { ARC_TESTNET_ID, ARC_MAINNET_ID } from '../contracts/fundora'
import { usePasskeyContext } from '../context/PasskeyContext'
import { PasskeyAuthModal } from './PasskeyAuthModal'
import { useMode } from '../context/ModeContext'

interface HeaderProps {
  isAdmin?: boolean
  isReviewer?: boolean
  currentView?: string
  onViewChange?: (view: string) => void
}

// ── Logo mark ────────────────────────────────────────────────────────────────
function LogoMark() {
  return (
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
      style={{ background: 'linear-gradient(135deg, #1A3F75 0%, #0F766E 100%)' }}
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

// ── Chain / Demo badge ────────────────────────────────────────────────────────
function ChainBadge() {
  const { chainId } = useAccount()
  const { isLive } = useMode()
  const isMainnet = chainId === ARC_MAINNET_ID
  const isTestnet = chainId === ARC_TESTNET_ID
  if (isLive) return null
  if (chainId && !isMainnet && !isTestnet) return null
  return (
    <span
      className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
      style={isMainnet ? {
        background: 'var(--brand-light)', color: 'var(--brand)', borderColor: 'var(--brand-border)',
      } : {
        background: 'var(--teal-light)', color: 'var(--teal)', borderColor: 'var(--teal-border)',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ background: isMainnet ? 'var(--brand)' : 'var(--teal)' }}
        aria-hidden="true"
      />
      Demo
    </span>
  )
}

// ── Demo / Live mode switcher ─────────────────────────────────────────────────
function ModeSwitcher() {
  const { mode, setMode } = useMode()
  return (
    <div
      className="hidden md:inline-flex items-center rounded-full border p-0.5 gap-0.5"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      role="group"
      aria-label="Switch between Demo and Live mode"
    >
      <button
        onClick={() => setMode('demo')}
        className="relative flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-teal"
        style={mode === 'demo' ? { background: 'var(--teal-light)', color: 'var(--teal)' } : { color: 'var(--muted)' }}
        aria-pressed={mode === 'demo'}
      >
        {mode === 'demo' && (
          <motion.span layoutId="mode-indicator" className="absolute inset-0 rounded-full"
            style={{ background: 'var(--teal-light)' }}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
        )}
        <FlaskConical size={11} className="relative z-10" aria-hidden="true" />
        <span className="relative z-10">Demo</span>
      </button>
      <button
        onClick={() => setMode('live')}
        className="relative flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand"
        style={mode === 'live' ? { background: 'var(--brand-light)', color: 'var(--brand)' } : { color: 'var(--muted)' }}
        aria-pressed={mode === 'live'}
      >
        {mode === 'live' && (
          <motion.span layoutId="mode-indicator" className="absolute inset-0 rounded-full"
            style={{ background: 'var(--brand-light)' }}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
        )}
        <Radio size={11} className="relative z-10" aria-hidden="true" />
        <span className="relative z-10">Live</span>
        {mode === 'live' && (
          <span className="relative z-10 w-1.5 h-1.5 rounded-full bg-brand animate-pulse" aria-hidden="true" />
        )}
      </button>
    </div>
  )
}

// ── Consoles dropdown (Organizer + Reviewer) ──────────────────────────────────
interface ConsolesDropdownProps {
  isReviewer?: boolean
  currentView?: string
  onViewChange: (view: string) => void
}

function ConsolesDropdown({ isReviewer, currentView, onViewChange }: ConsolesDropdownProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Close on outside click / Escape — hooks must be before any early return
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus() }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const first = menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')
        first?.focus()
      }
    }
    const onOutside = (e: MouseEvent) => {
      if (
        !menuRef.current?.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onOutside)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onOutside)
    }
  }, [open])

  // Keyboard navigation inside menu items
  const handleMenuKey = useCallback((e: React.KeyboardEvent, idx: number) => {
    const btns = menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')
    if (!btns) return
    if (e.key === 'ArrowDown') { e.preventDefault(); btns[Math.min(idx + 1, btns.length - 1)]?.focus() }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (idx === 0) { setOpen(false); triggerRef.current?.focus() }
      else btns[idx - 1]?.focus()
    }
    if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus() }
    if (e.key === 'Tab') setOpen(false)
  }, [])

  // Organizer Console always shown; Reviewer Console only to reviewers
  const isActive = currentView === 'organizer' || currentView === 'reviewer'

  const items = [
    { id: 'organizer', label: 'Organizer Console', icon: LayoutDashboard, desc: 'Create hackathons and contests on Arc' },
    ...(isReviewer ? [{ id: 'reviewer', label: 'Reviewer Console', icon: Scale, desc: 'Evaluate submissions and score entries' }] : []),
  ]

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpen(true)
  }
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }
  const toggleMenu = () => setOpen(v => !v)

  const handleSelect = (id: string) => {
    setOpen(false)
    onViewChange(id)
    triggerRef.current?.focus()
  }

  return (
    <div
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      {/* Trigger */}
      <button
        ref={triggerRef}
        onClick={toggleMenu}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="consoles-menu"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand ${
          isActive
            ? 'bg-white text-midnight shadow-sm'
            : 'text-slate-600 hover:text-midnight hover:bg-white/60'
        }`}
      >
        <BookOpen
          size={13}
          className={isActive ? 'text-brand' : 'text-slate-400'}
          aria-hidden="true"
        />
        Consoles
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          className="inline-flex"
        >
          <ChevronDown size={11} aria-hidden="true" />
        </motion.span>
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="consoles-menu"
            ref={menuRef}
            role="menu"
            aria-label="Consoles navigation"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
            className="absolute left-0 top-[calc(100%+6px)] w-64 rounded-2xl border shadow-lg overflow-hidden z-50"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {/* Top accent line */}
            <div
              className="h-0.5"
              style={{ background: 'linear-gradient(90deg, #1A3F75 0%, #0F766E 100%)' }}
              aria-hidden="true"
            />
            <div className="p-1.5 space-y-0.5">
              {items.map(({ id, label, icon: Icon, desc }, idx) => {
                const isItemActive = currentView === id
                return (
                  <button
                    key={id}
                    role="menuitem"
                    onClick={() => handleSelect(id)}
                    onKeyDown={(e) => handleMenuKey(e, idx)}
                    className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                      isItemActive
                        ? 'bg-brand/8 text-midnight'
                        : 'hover:bg-slate-100/80 text-slate-700 hover:text-midnight'
                    }`}
                  >
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        background: isItemActive ? 'var(--brand-light)' : 'var(--warm-bg-2)',
                        color: isItemActive ? 'var(--brand)' : 'var(--muted)',
                      }}
                    >
                      <Icon size={13} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold leading-tight">{label}</div>
                      <div className="text-[11px] leading-snug mt-0.5" style={{ color: 'var(--muted)' }}>{desc}</div>
                    </div>
                    {isItemActive && (
                      <span
                        className="ml-auto w-1.5 h-1.5 rounded-full shrink-0 mt-2"
                        style={{ background: 'var(--brand)' }}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main Header ───────────────────────────────────────────────────────────────
export function Header({
  isAdmin: _isAdmin,
  isReviewer,
  currentView = 'events',
  onViewChange,
}: HeaderProps = {}) {
  const { isConnected } = useAccount()
  const { isPasskeyConnected, smartAccountAddress, disconnect: passkeyDisconnect } = usePasskeyContext()
  const [showPasskeyModal, setShowPasskeyModal] = useState(false)

  const shortAddr = smartAccountAddress
    ? `${smartAccountAddress.slice(0, 6)}…${smartAccountAddress.slice(-4)}`
    : ''

  // Flat nav items — Organizer Console and Reviewer Console are in the dropdown
  const navItems = [
    { id: 'events', label: 'Explore Events', icon: Compass },
    { id: 'participant', label: 'Participant Hub', icon: Users },
  ]

  // Mobile nav — Organizer always shown, Reviewer only to reviewers
  const mobileNavItems = [
    { id: 'events', label: 'Explore', icon: Compass },
    { id: 'participant', label: 'Participant', icon: Users },
    { id: 'organizer', label: 'Organizer', icon: LayoutDashboard },
    ...(isReviewer ? [{ id: 'reviewer', label: 'Reviewer', icon: Scale }] : []),
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

          {/* ── Left: Brand + Nav ───────────────────────────────────────────── */}
          <div className="flex items-center gap-5 min-w-0">
            {/* Logo + wordmark */}
            <button
              onClick={() => onViewChange?.('events')}
              className="flex items-center gap-2.5 shrink-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg"
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
                <ModeSwitcher />
              </div>
            </button>

            {/* Desktop navigation */}
            {onViewChange && (
              <nav
                className="hidden lg:flex items-center gap-0.5 bg-slate-100/70 p-1 rounded-xl border border-slate-200/60"
                aria-label="Main navigation"
              >
                {navItems.map(({ id, label, icon: Icon }) => {
                  const isActive = currentView === id || (id === 'events' && currentView === 'event-detail')
                  return (
                    <button
                      key={id}
                      onClick={() => onViewChange(id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                        isActive
                          ? 'bg-white text-midnight shadow-sm'
                          : 'text-slate-600 hover:text-midnight hover:bg-white/60'
                      }`}
                    >
                      <Icon
                        size={13}
                        className={isActive ? 'text-brand' : 'text-slate-400'}
                        aria-hidden="true"
                      />
                      {label}
                    </button>
                  )
                })}

                {/* Consoles dropdown */}
                <ConsolesDropdown
                  isReviewer={isReviewer}
                  currentView={currentView}
                  onViewChange={onViewChange}
                />
              </nav>
            )}
          </div>

          {/* ── Right: Wallet & Actions ──────────────────────────────────────── */}
          <div className="shrink-0 flex items-center gap-2">
            {/* Legacy Microgrants toggle */}
            {onViewChange && (
              <button
                onClick={() => onViewChange(currentView === 'grants' ? 'events' : 'grants')}
                className="hidden xl:inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-midnight px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand"
                title="Toggle between Hackathons and legacy Microgrants"
              >
                <Archive size={12} aria-hidden="true" />
                {currentView === 'grants' ? 'Hackathons' : 'Microgrants'}
              </button>
            )}

            {/* ConnectKit wallet button */}
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

        {/* ── Mobile bottom nav bar ──────────────────────────────────────────── */}
        {onViewChange && (
          <div
            className="lg:hidden relative border-t"
            style={{ borderColor: 'var(--border)' }}
          >
            {/* Fade-out gradient on right edge to signal scroll */}
            <div
              className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10"
              style={{ background: 'linear-gradient(to left, rgba(255,255,255,0.95), transparent)' }}
              aria-hidden="true"
            />
          <div
            className="flex items-center gap-1 px-4 py-2 overflow-x-auto scrollbar-none"
            style={{ background: 'rgba(255,255,255,0.8)' }}
            role="navigation"
            aria-label="Mobile navigation"
          >
            {mobileNavItems.map(({ id, label, icon: Icon }) => {
              const isActive = currentView === id || (id === 'events' && currentView === 'event-detail')
              return (
                <button
                  key={id}
                  onClick={() => onViewChange(id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                    isActive
                      ? 'bg-midnight text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={12} aria-hidden="true" />
                  {label}
                </button>
              )
            })}
          </div>
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
