import { useState, useMemo } from 'react'
import { ShieldCheck, HelpCircle } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Tooltip } from '../ui/Tooltip'
import { toast } from 'sonner'

export function BorrowView() {
  const [btcDeposit, setBtcDeposit] = useState<string>('0.5')
  const [collateralRatio, setCollateralRatio] = useState<number>(180)
  const [isMinting, setIsMinting] = useState(false)

  // Current Bitcoin price benchmark
  const btcPrice = 96000

  const calculations = useMemo(() => {
    const btc = parseFloat(btcDeposit) || 0
    const collateralValueUsd = btc * btcPrice
    // MUSD borrowed = Collateral Value / (Collateral Ratio / 100)
    const musdBorrowed = collateralRatio > 0 ? collateralValueUsd / (collateralRatio / 100) : 0
    const feeUsd = musdBorrowed * 0.005 // 0.5% one-time mint fee
    const netMusd = Math.max(0, musdBorrowed - feeUsd)
    // Liquidation price = (MUSD debt * 1.15) / btc
    const liquidationPrice = btc > 0 ? (musdBorrowed * 1.15) / btc : 0

    const healthStatus: 'safe' | 'moderate' | 'risky' =
      collateralRatio >= 170 ? 'safe' : collateralRatio >= 130 ? 'moderate' : 'risky'

    return {
      collateralValueUsd: collateralValueUsd.toLocaleString('en-US', { maximumFractionDigits: 2 }),
      musdBorrowed: musdBorrowed.toLocaleString('en-US', { maximumFractionDigits: 2 }),
      netMusd: netMusd.toLocaleString('en-US', { maximumFractionDigits: 2 }),
      feeUsd: feeUsd.toLocaleString('en-US', { maximumFractionDigits: 2 }),
      liquidationPrice: liquidationPrice.toLocaleString('en-US', { maximumFractionDigits: 0 }),
      healthStatus,
    }
  }, [btcDeposit, collateralRatio])

  const handleOpenVault = () => {
    setIsMinting(true)
    setTimeout(() => {
      setIsMinting(false)
      toast.success(
        `Vault initialized! ${calculations.netMusd} MUSD minted and queued for transfer.`,
        {
          description: 'Collateral locked in non-custodial smart contract on Arc.',
        }
      )
    }, 1200)
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="spring" size="sm" className="mb-2">
            Bitcoin-Backed Lending
          </Badge>
          <h1 className="display font-bold text-2xl sm:text-3xl text-[var(--ink)] tracking-tight">
            Borrow MUSD
          </h1>
          <p className="text-sm text-[var(--muted)] max-w-xl mt-1">
            Deposit native Bitcoin or tBTC collateral to mint MUSD stablecoins. Zero ongoing interest, non-custodial vaults on Arc.
          </p>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] text-xs">
          <span className="text-[var(--subtle)]">BTC Index Price:</span>
          <span className="font-bold text-[var(--ink)] tabular-nums">${btcPrice.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Input parameters */}
        <div className="md:col-span-7 space-y-5">
          <Card padding="lg" variant="default" className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="btc-input" className="text-xs font-semibold text-[var(--ink)]">
                  Deposit Collateral (BTC)
                </label>
                <span className="text-xs text-[var(--muted)] tabular-nums">
                  ≈ ${calculations.collateralValueUsd} USD
                </span>
              </div>
              <div className="relative">
                <input
                  id="btc-input"
                  type="number"
                  step="0.05"
                  min="0.01"
                  value={btcDeposit}
                  onChange={e => setBtcDeposit(e.target.value)}
                  className="w-full h-12 rounded-xl pl-4 pr-16 text-lg font-bold bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--ink)] btn-focus tabular-nums"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--muted)] select-none">
                  BTC
                </span>
              </div>
            </div>

            {/* Collateral Ratio Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <label htmlFor="ratio-slider" className="text-xs font-semibold text-[var(--ink)]">
                    Target Collateral Ratio
                  </label>
                  <Tooltip content="Minimum ratio is 115%. Higher ratios give safer buffer against BTC price swings.">
                    <HelpCircle size={13} className="text-[var(--subtle)]" />
                  </Tooltip>
                </div>
                <span
                  className={`text-sm font-bold tabular-nums ${
                    calculations.healthStatus === 'safe'
                      ? 'text-[var(--spring)]'
                      : calculations.healthStatus === 'moderate'
                      ? 'text-amber-500'
                      : 'text-[var(--danger)]'
                  }`}
                >
                  {collateralRatio}%
                </span>
              </div>
              <input
                id="ratio-slider"
                type="range"
                min="115"
                max="300"
                step="5"
                value={collateralRatio}
                onChange={e => setCollateralRatio(Number(e.target.value))}
                className="w-full accent-[var(--spring)] h-2 bg-[var(--surface-muted)] rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[var(--subtle)] mt-1 font-mono">
                <span>115% (Min MCR)</span>
                <span>180% (Recommended)</span>
                <span>300%</span>
              </div>
            </div>

            {/* Quick buttons */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-[var(--muted)]">Presets:</span>
              {[130, 150, 180, 220].map(ratio => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setCollateralRatio(ratio)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all btn-focus ${
                    collateralRatio === ratio
                      ? 'bg-[#122d45] text-white dark:bg-[#34d399] dark:text-[#0b131e] border-transparent'
                      : 'border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-muted)]'
                  }`}
                >
                  {ratio}%
                </button>
              ))}
            </div>
          </Card>

          {/* Rate Highlights */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-strong)]">
              <span className="text-[11px] text-[var(--subtle)] block mb-1">Recurring Interest</span>
              <span className="text-base font-bold text-[var(--spring)]">0.00%</span>
            </div>
            <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-strong)]">
              <span className="text-[11px] text-[var(--subtle)] block mb-1">One-Time Fee</span>
              <span className="text-base font-bold text-[var(--ink)]">0.50%</span>
            </div>
            <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-strong)]">
              <span className="text-[11px] text-[var(--subtle)] block mb-1">Liquidation Buffer</span>
              <span className="text-base font-bold text-[var(--ink)]">115% MCR</span>
            </div>
          </div>
        </div>

        {/* Right: Summary card */}
        <div className="md:col-span-5 space-y-4">
          <Card padding="lg" variant="elevated" className="space-y-5 border-[var(--border)]">
            <h3 className="display font-bold text-base text-[var(--ink)]">
              Vault Summary
            </h3>

            <div className="space-y-3 text-sm divide-y divide-[var(--border)]">
              <div className="flex justify-between pt-1">
                <span className="text-[var(--muted)]">MUSD to Borrow:</span>
                <span className="font-bold text-lg text-[var(--ink)] tabular-nums">
                  ${calculations.musdBorrowed}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-[var(--muted)]">0.5% Borrowing Fee:</span>
                <span className="text-[var(--ink)] tabular-nums">${calculations.feeUsd}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-[var(--muted)]">Net MUSD Received:</span>
                <span className="font-bold text-[var(--spring)] tabular-nums">
                  ${calculations.netMusd} MUSD
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-[var(--muted)]">Liquidation Price:</span>
                <span className="font-bold text-[var(--danger)] tabular-nums">
                  ${calculations.liquidationPrice} / BTC
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--surface-muted)] flex items-start gap-2.5 text-xs text-[var(--muted)] leading-relaxed">
              <ShieldCheck size={16} className="text-[var(--spring)] shrink-0 mt-0.5" />
              <span>
                Your Bitcoin remains in a segregated onchain smart vault. Reclaim your full BTC anytime by repaying the borrowed MUSD.
              </span>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isMinting}
              loadingText="Creating Vault on Arc…"
              onClick={handleOpenVault}
              actionOutcome={{
                action: 'Start borrowing',
                outcome: `Mint ${calculations.netMusd} MUSD`,
              }}
              helperText="Instant finality on Arc • No recurring interest"
            />
          </Card>

          {/* Risk footnote */}
          <p className="text-[11px] text-[var(--subtle)] leading-relaxed text-center px-2">
            Liquidation Notice: If BTC price drops below ${calculations.liquidationPrice}, your vault is eligible for stability pool liquidation.
          </p>
        </div>
      </div>
    </div>
  )
}
