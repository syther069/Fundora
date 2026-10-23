import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { toast } from 'sonner'

export function EarnView() {
  const [depositAmount, setDepositAmount] = useState('5000')
  const [isStaking, setIsStaking] = useState(false)

  const numDeposit = parseFloat(depositAmount) || 0
  const estimatedAnnualBtcYield = (numDeposit * 0.084) / 96000 // 8.4% APY converted to BTC
  const estimatedAnnualUsd = numDeposit * 0.084

  const handleStake = () => {
    setIsStaking(true)
    setTimeout(() => {
      setIsStaking(false)
      toast.success(`Successfully deposited $${numDeposit.toLocaleString()} MUSD!`, {
        description: 'You are now earning automated liquidation yield in native Bitcoin.',
      })
    }, 1200)
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="spring" size="sm" className="mb-2">
            Stability Yield
          </Badge>
          <h1 className="display font-bold text-2xl sm:text-3xl text-[var(--ink)] tracking-tight">
            Earn Yield on MUSD
          </h1>
          <p className="text-sm text-[var(--muted)] max-w-xl mt-1">
            Deposit MUSD into the Stability Pool to absorb liquidations and earn continuous yield paid in native Bitcoin.
          </p>
        </div>

        <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] text-right">
          <span className="text-[11px] text-[var(--subtle)] block">Stability APY</span>
          <span className="text-xl font-bold text-[var(--spring)] tabular-nums">8.40%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-7 space-y-5">
          <Card padding="lg" variant="default" className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="earn-deposit" className="text-xs font-semibold text-[var(--ink)]">
                  Deposit Amount (MUSD)
                </label>
                <span className="text-xs text-[var(--muted)]">1 MUSD = $1.00 USD</span>
              </div>
              <div className="relative">
                <input
                  id="earn-deposit"
                  type="number"
                  step="500"
                  min="100"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  className="w-full h-12 rounded-xl pl-4 pr-16 text-lg font-bold bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--ink)] btn-focus tabular-nums"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--muted)]">
                  MUSD
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {['1000', '2500', '5000', '10000'].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDepositAmount(amt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all btn-focus ${
                    depositAmount === amt
                      ? 'bg-[#122d45] text-white dark:bg-[#34d399] dark:text-[#0b131e] border-transparent'
                      : 'border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-muted)]'
                  }`}
                >
                  ${parseInt(amt).toLocaleString()}
                </button>
              ))}
            </div>

            <div className="space-y-3 pt-3 border-t border-[var(--border)]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--subtle)]">
                Why Stability Providers Win
              </h4>
              <div className="space-y-2 text-xs text-[var(--muted)] leading-relaxed">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-[var(--spring)] shrink-0 mt-0.5" />
                  <span>
                    Buy Bitcoin at ~10% discount whenever undercollateralized vaults are liquidated.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-[var(--spring)] shrink-0 mt-0.5" />
                  <span>
                    Zero lockup period: withdraw your remaining MUSD and accumulated BTC rewards anytime.
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="md:col-span-5 space-y-4">
          <Card padding="lg" variant="elevated" className="space-y-5">
            <h3 className="display font-bold text-base text-[var(--ink)]">
              Projected Earnings
            </h3>

            <div className="space-y-3 text-sm divide-y divide-[var(--border)]">
              <div className="flex justify-between pt-1">
                <span className="text-[var(--muted)]">Annual USD Return:</span>
                <span className="font-bold text-[var(--spring)] tabular-nums">
                  +${estimatedAnnualUsd.toFixed(2)} / yr
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-[var(--muted)]">Annual Bitcoin Payout:</span>
                <span className="font-mono font-bold text-[var(--ink)] tabular-nums">
                  ~{estimatedAnnualBtcYield.toFixed(6)} BTC
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-[var(--muted)]">Payout Frequency:</span>
                <span className="text-[var(--ink)]">Real-time onchain</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isStaking}
              loadingText="Depositing MUSD…"
              onClick={handleStake}
              actionOutcome={{
                action: 'Start earning yield',
                outcome: `Deposit $${numDeposit.toLocaleString()} MUSD`,
              }}
              helperText="Earn continuous BTC rewards • No lockup period"
            />
          </Card>
        </div>
      </div>
    </div>
  )
}
