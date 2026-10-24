import { useState } from 'react'
import { ConnectKitButton } from 'connectkit'
import { Sparkles, AlertTriangle, Menu, X, ArrowUpRight } from 'lucide-react'
import { useChainId, useAccount } from 'wagmi'
import { ARC_MAINNET_ID, ARC_TESTNET_ID } from '../contracts/fundora'
import { ThemeToggle } from './ThemeToggle'
import { Button } from './ui/Button'

export type NavTab = 'home' | 'borrow' | 'earn' | 'swap' | 'spend' | 'learn' | 'grants'

interface HeaderProps {
  currentTab: NavTab
  onSelectTab: (tab: NavTab) => void
}

function ArcBadge() {
  const chainId = useChainId()
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <span
        className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border shadow-2xs"
        style={{ background: 'var(--spring-light)', color: 'var(--spring)', borderColor: 'rgba(52, 211, 153, 0.4)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--spring)] animate-pulse" />
        Arc Network
      </span>
    )
  }

  const isMainnet = chainId === ARC_MAINNET_ID
  const isTestnet = chainId === ARC_TESTNET_ID
  const isSupported = isMainnet || isTestnet

  if (!isSupported) {
    return (
      <span
        className="hidden md:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"
      >
        <AlertTriangle size={12} className="shrink-0" />
        Wrong Network
      </span>
    )
  }

  return (
    <span
      className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border shadow-2xs"
      style={{
        background: 'var(--spring-light)',
        color: 'var(--spring)',
        borderColor: 'rgba(52, 211, 153, 0.4)',
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--spring)]" />
      {isMainnet ? 'Arc Mainnet' : 'Arc Testnet'}
    </span>
  )
}

export function Header({ currentTab, onSelectTab }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks: { id: NavTab; label: string }[] = [
    { id: 'borrow', label: 'Borrow' },
    { id: 'earn', label: 'Earn' },
    { id: 'swap', label: 'Swap' },
    { id: 'spend', label: 'Spend' },
    { id: 'learn', label: 'Learn' },
  ]

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab)
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface-strong)] backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 btn-focus text-left"
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-xs text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--spring) 0%, #059669 100%)' }}
            >
              <Sparkles size={16} />
            </div>
            <div className="flex flex-col">
              <span className="display font-bold text-lg leading-tight tracking-tight text-[var(--ink)]">
                Fundora
              </span>
              <span className="hidden sm:inline text-[10px] font-medium tracking-wide uppercase text-[var(--subtle)]">
                Onchain Grants & Escrow
              </span>
            </div>
          </button>

          <ArcBadge />
        </div>

        {/* Desktop Navigation Links in simple English: Borrow, Earn, Swap, Spend, Learn */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
          {navLinks.map(link => {
            const isActive = currentTab === link.id
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all btn-focus ${
                  isActive
                    ? 'text-[var(--ink)] bg-[var(--surface-muted)] shadow-2xs font-bold'
                    : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)]'
                }`}
              >
                {link.label}
              </button>
            )
          })}
        </nav>

        {/* Actions: One main button "Open app", ThemeToggle, ConnectKit */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {/* One button: Open app (Requirement 5) */}
          <Button
            variant={currentTab === 'grants' ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => handleNavClick('grants')}
            actionOutcome={{
              action: currentTab === 'grants' ? 'In app' : 'Open app',
            }}
            rightIcon={<ArrowUpRight size={14} />}
            className="hidden sm:inline-flex"
          />

          <ConnectKitButton />

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
            className="lg:hidden touch-target w-10 h-10 rounded-xl flex items-center justify-center border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--ink)] btn-focus"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-4 space-y-2 animate-in fade-in-0 duration-150">
          <div className="grid grid-cols-2 gap-2 pb-2">
            {navLinks.map(link => {
              const isActive = currentTab === link.id
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold text-left transition-colors btn-focus ${
                    isActive
                      ? 'bg-[#122d45] text-white dark:bg-[#34d399] dark:text-[#0b131e]'
                      : 'text-[var(--ink)] bg-[var(--surface-muted)] hover:bg-[var(--surface)]'
                  }`}
                >
                  {link.label}
                </button>
              )
            })}
          </div>

          <div className="pt-2 border-t border-[var(--border)]">
            <Button
              variant="primary"
              size="md"
              onClick={() => handleNavClick('grants')}
              className="w-full"
              actionOutcome={{
                action: 'Open app',
                outcome: 'Onchain microgrants & escrow',
              }}
            />
          </div>
        </div>
      )}
    </header>
  )
}
