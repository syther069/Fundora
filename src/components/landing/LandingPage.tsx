import { useState } from 'react'
import {
  Coins,
  Zap,
  ArrowRight,
  TrendingUp,
  CreditCard,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Stepper } from '../ui/Stepper'

interface LandingPageProps {
  onStartBorrowing: () => void
  onOpenDocs: () => void
  onOpenApp?: () => void
  onNavigateTab: (tab: 'borrow' | 'earn' | 'swap' | 'spend' | 'grants') => void
}

export function LandingPage({
  onStartBorrowing,
  onOpenDocs,
  onOpenApp: _onOpenApp,
  onNavigateTab,
}: LandingPageProps) {
  const [calculatorBtc, setCalculatorBtc] = useState<number>(1.0)
  const [calculatorRatio, setCalculatorRatio] = useState<number>(180)

  const btcPrice = 96000
  const collateralValue = calculatorBtc * btcPrice
  const musdBorrowed = calculatorRatio > 0 ? collateralValue / (calculatorRatio / 100) : 0
  const liquidationPrice = calculatorBtc > 0 ? (musdBorrowed * 1.15) / calculatorBtc : 0

  const steps = [
    {
      number: 1,
      title: 'Deposit Bitcoin',
      description: 'Lock BTC or tBTC securely into your non-custodial onchain vault.',
    },
    {
      number: 2,
      title: 'Borrow MUSD',
      description: 'Mint dollar-pegged stablecoins at 0% recurring interest.',
    },
    {
      number: 3,
      title: 'Earn or Spend',
      description: 'Put MUSD to work earning yield or spend via payment rails worldwide.',
    },
    {
      number: 4,
      title: 'Repay & Unlock',
      description: 'Return the borrowed MUSD whenever you choose and reclaim your full Bitcoin.',
    },
  ]

  return (
    <div className="w-full space-y-16 sm:space-y-24 py-6 sm:py-12">
      {/* 1. Above the fold - Strict Hierarchy: Headline -> One Main Button -> Short Explanation -> Secondary Links */}
      <section className="max-w-4xl mx-auto text-center px-4 sm:px-6 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] text-xs font-semibold text-[var(--spring)] shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[var(--spring)] animate-pulse" />
          <span>Mezo Sovereign Banking • Built on Arc</span>
        </div>

        {/* Headline */}
        <h1 className="heading-hero tracking-tight text-[var(--ink)]">
          Bank on your Bitcoin. Borrow, earn, and spend without selling.
        </h1>

        {/* ONE Main Primary CTA */}
        <div className="pt-2 flex flex-col items-center">
          <Button
            variant="primary"
            size="lg"
            onClick={onStartBorrowing}
            actionOutcome={{
              action: 'Start borrowing',
              outcome: 'Mint MUSD against your Bitcoin',
            }}
            helperText="No recurring interest • 115% min collateral • Keep 100% Bitcoin upside"
            className="w-full sm:w-auto shadow-md hover:shadow-lg"
          />
        </div>

        {/* Short Explanation */}
        <p className="body-lg text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
          Mezo is Bitcoin banking. Deposit your Bitcoin into a non-custodial smart vault, borrow decentralized MUSD stablecoins at 0% recurring interest, and access everyday cash flow without triggering capital gains taxes or giving up ownership.
        </p>

        {/* Secondary Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs font-medium text-[var(--muted)]">
          <button
            onClick={onOpenDocs}
            className="inline-flex items-center gap-1.5 text-[var(--ink)] hover:text-[var(--accent)] font-semibold transition-colors btn-focus"
          >
            <span>Explore documentation & contract addresses</span>
            <ArrowRight size={13} />
          </button>
          <span>•</span>
          <button
            onClick={() => onNavigateTab('grants')}
            className="inline-flex items-center gap-1 text-[var(--ink)] hover:text-[var(--accent)] transition-colors btn-focus"
          >
            <span>Community Microgrants Escrow</span>
          </button>
        </div>
      </section>

      {/* 2. Official Protocol Numbers / Key Facts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <Card padding="md" variant="default" className="text-center space-y-1">
            <span className="text-xs font-semibold text-[var(--subtle)] block uppercase tracking-wider">
              Recurring Interest
            </span>
            <span className="display font-bold text-2xl sm:text-3xl text-[var(--spring)] tabular-nums">
              0.00%
            </span>
            <span className="text-[11px] text-[var(--muted)] block">
              0.5% one-time borrow fee
            </span>
          </Card>

          <Card padding="md" variant="default" className="text-center space-y-1">
            <span className="text-xs font-semibold text-[var(--subtle)] block uppercase tracking-wider">
              Minimum Collateral
            </span>
            <span className="display font-bold text-2xl sm:text-3xl text-[var(--ink)] tabular-nums">
              115%
            </span>
            <span className="text-[11px] text-[var(--muted)] block">
              Solvency backed onchain
            </span>
          </Card>

          <Card padding="md" variant="default" className="text-center space-y-1">
            <span className="text-xs font-semibold text-[var(--subtle)] block uppercase tracking-wider">
              MUSD Peg
            </span>
            <span className="display font-bold text-2xl sm:text-3xl text-[var(--ink)] tabular-nums">
              $1.00 USD
            </span>
            <span className="text-[11px] text-[var(--muted)] block">
              Redeemable decentralized stablecoin
            </span>
          </Card>

          <Card padding="md" variant="default" className="text-center space-y-1">
            <span className="text-xs font-semibold text-[var(--subtle)] block uppercase tracking-wider">
              Network Finality
            </span>
            <span className="display font-bold text-2xl sm:text-3xl text-[var(--accent)] tabular-nums">
              &lt; 1s
            </span>
            <span className="text-[11px] text-[var(--muted)] block">
              Powered by Arc & USDC gas
            </span>
          </Card>
        </div>
      </section>

      {/* 3. Four-Step Process (Requirement 7) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="spring" size="sm">
            Simple 4-Step Process
          </Badge>
          <h2 className="heading-1 text-[var(--ink)]">
            How Bitcoin Banking Works
          </h2>
          <p className="body-md text-[var(--muted)]">
            Four straightforward steps to borrow dollar liquidity against your Bitcoin.
          </p>
        </div>

        <Stepper steps={steps} currentStep={2} />
      </section>

      {/* 4. Interactive Vault & Liquidation Calculator */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <Card padding="lg" variant="elevated" className="space-y-6 border-[var(--border)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
            <div>
              <h3 className="display font-bold text-xl text-[var(--ink)]">
                Interactive Borrowing Calculator
              </h3>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Calculate your available MUSD loan amount and liquidation price before committing.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
              <span>BTC Price:</span>
              <span className="font-bold text-[var(--ink)] tabular-nums">${btcPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="calc-btc" className="text-xs font-semibold text-[var(--ink)] block mb-1">
                  Bitcoin Collateral to Deposit:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="calc-btc"
                    type="range"
                    min="0.1"
                    max="5.0"
                    step="0.1"
                    value={calculatorBtc}
                    onChange={e => setCalculatorBtc(parseFloat(e.target.value))}
                    className="w-full accent-[var(--spring)]"
                  />
                  <span className="text-sm font-bold text-[var(--ink)] tabular-nums shrink-0 w-16 text-right">
                    {calculatorBtc.toFixed(1)} BTC
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="calc-ratio" className="text-xs font-semibold text-[var(--ink)] block mb-1">
                  Target Collateral Ratio:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="calc-ratio"
                    type="range"
                    min="115"
                    max="300"
                    step="5"
                    value={calculatorRatio}
                    onChange={e => setCalculatorRatio(parseInt(e.target.value))}
                    className="w-full accent-[var(--spring)]"
                  />
                  <span className="text-sm font-bold text-[var(--spring)] tabular-nums shrink-0 w-16 text-right">
                    {calculatorRatio}%
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface-muted)] space-y-2.5 text-xs text-[var(--muted)]">
              <div className="flex justify-between">
                <span>Collateral Value (USD):</span>
                <span className="font-bold text-[var(--ink)] tabular-nums">
                  ${collateralValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>MUSD Borrow Limit:</span>
                <span className="font-bold text-base text-[var(--spring)] tabular-nums">
                  ${musdBorrowed.toLocaleString('en-US', { maximumFractionDigits: 0 })} MUSD
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[var(--border)]">
                <span>Liquidation Price:</span>
                <span className="font-bold text-[var(--danger)] tabular-nums">
                  ${liquidationPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })} / BTC
                </span>
              </div>
              <div className="text-[11px] text-[var(--subtle)] leading-relaxed pt-1">
                Recommendation: Keep collateral ratio above 160% to withstand sharp market pullbacks.
              </div>
            </div>
          </div>

          <div className="pt-2 text-center">
            <Button
              variant="primary"
              size="md"
              onClick={onStartBorrowing}
              actionOutcome={{
                action: 'Start borrowing',
                outcome: `Lock ${calculatorBtc.toFixed(1)} BTC for $${musdBorrowed.toLocaleString('en-US', { maximumFractionDigits: 0 })} MUSD`,
              }}
            />
          </div>
        </Card>
      </section>

      {/* 5. Four Product Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="neutral" size="sm">
            Ecosystem Suite
          </Badge>
          <h2 className="heading-1 text-[var(--ink)]">
            Everything your Bitcoin Needs
          </h2>
          <p className="body-md text-[var(--muted)]">
            Four integrated financial utilities to manage your wealth without ever having to liquidate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            variant="interactive"
            padding="lg"
            onClick={() => onNavigateTab('borrow')}
            className="flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Coins size={20} />
              </div>
              <h3 className="heading-3 text-[var(--ink)]">Borrow</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Deposit Bitcoin to mint MUSD stablecoins with 0% ongoing interest. Only a one-time 0.5% mint fee.
              </p>
            </div>
            <span className="text-xs font-semibold text-[var(--spring)] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Start Borrowing <ChevronRight size={14} />
            </span>
          </Card>

          <Card
            variant="interactive"
            padding="lg"
            onClick={() => onNavigateTab('earn')}
            className="flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
              <h3 className="heading-3 text-[var(--ink)]">Earn</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Provide stability liquidity to absorb liquidated vaults and earn continuous yield paid in native Bitcoin.
              </p>
            </div>
            <span className="text-xs font-semibold text-[var(--spring)] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Earn 8.4% APY <ChevronRight size={14} />
            </span>
          </Card>

          <Card
            variant="interactive"
            padding="lg"
            onClick={() => onNavigateTab('swap')}
            className="flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Zap size={20} />
              </div>
              <h3 className="heading-3 text-[var(--ink)]">Swap</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Convert smoothly between BTC, MUSD, and USDC with zero slippage and sub-second confirmation on Arc.
              </p>
            </div>
            <span className="text-xs font-semibold text-[var(--spring)] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Swap Assets <ChevronRight size={14} />
            </span>
          </Card>

          <Card
            variant="interactive"
            padding="lg"
            onClick={() => onNavigateTab('spend')}
            className="flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <CreditCard size={20} />
              </div>
              <h3 className="heading-3 text-[var(--ink)]">Spend</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Use your MUSD anywhere debit cards are accepted worldwide without triggering capital gains taxes.
              </p>
            </div>
            <span className="text-xs font-semibold text-[var(--spring)] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Explore Spend <ChevronRight size={14} />
            </span>
          </Card>
        </div>
      </section>

      {/* 6. Transparent Risk Note (Requirement 4) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="p-5 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-950 dark:text-amber-100">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <span>Risk and Liquidation Disclosure</span>
          </div>
          <p className="leading-relaxed">
            Borrowing involves risk. If the market value of your deposited Bitcoin collateral drops such that your vault falls below the 115% Minimum Collateral Ratio, your vault becomes eligible for automatic liquidation by the Stability Pool. While you retain all minted MUSD, the liquidated collateral will be forfeited. Always maintain an adequate collateral buffer and review smart contract parameters before participating.
          </p>
        </div>
      </section>
    </div>
  )
}
