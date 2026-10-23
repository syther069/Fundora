import { useState } from 'react'
import { ArrowDownUp } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { toast } from 'sonner'

export function SwapView() {
  const [fromToken, setFromToken] = useState<'BTC' | 'MUSD' | 'USDC'>('MUSD')
  const [toToken, setToToken] = useState<'BTC' | 'MUSD' | 'USDC'>('USDC')
  const [amount, setAmount] = useState('1000')
  const [isSwapping, setIsSwapping] = useState(false)

  const btcPrice = 96000

  const handleFlip = () => {
    const prevFrom = fromToken
    setFromToken(toToken)
    setToToken(prevFrom)
  }

  const calculatedOutput = () => {
    const val = parseFloat(amount) || 0
    if (fromToken === 'MUSD' && toToken === 'USDC') return val.toFixed(2) // 1:1
    if (fromToken === 'USDC' && toToken === 'MUSD') return val.toFixed(2) // 1:1
    if (fromToken === 'BTC' && (toToken === 'MUSD' || toToken === 'USDC'))
      return (val * btcPrice).toFixed(2)
    if ((fromToken === 'MUSD' || fromToken === 'USDC') && toToken === 'BTC')
      return (val / btcPrice).toFixed(6)
    return val.toFixed(2)
  }

  const output = calculatedOutput()

  const handleSwap = () => {
    setIsSwapping(true)
    setTimeout(() => {
      setIsSwapping(false)
      toast.success(`Swapped ${amount} ${fromToken} for ${output} ${toToken}!`, {
        description: 'Instant transaction finality on Arc network.',
      })
    }, 1000)
  }

  return (
    <div className="max-w-md mx-auto w-full px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <Badge variant="spring" size="sm" className="mx-auto">
          Deep Liquidity Pools
        </Badge>
        <h1 className="display font-bold text-2xl sm:text-3xl text-[var(--ink)] tracking-tight">
          Swap Assets
        </h1>
        <p className="text-xs text-[var(--muted)]">
          Zero-slippage stablecoin conversions & native Bitcoin swaps on Arc.
        </p>
      </div>

      <Card padding="lg" variant="default" className="space-y-4">
        {/* From Box */}
        <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]">
          <div className="flex justify-between text-xs text-[var(--muted)] mb-1.5 font-medium">
            <span>You Pay</span>
            <span>Balance: 12,450.00</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full text-xl font-bold bg-transparent text-[var(--ink)] btn-focus tabular-nums"
              placeholder="0.00"
            />
            <select
              value={fromToken}
              onChange={e => setFromToken(e.target.value as 'BTC' | 'MUSD' | 'USDC')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--surface-strong)] border border-[var(--border)] text-[var(--ink)] btn-focus cursor-pointer"
            >
              <option value="MUSD">MUSD</option>
              <option value="USDC">USDC</option>
              <option value="BTC">BTC</option>
            </select>
          </div>
        </div>

        {/* Flip button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            type="button"
            onClick={handleFlip}
            aria-label="Switch input and output currencies"
            className="w-9 h-9 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--ink)] flex items-center justify-center hover:bg-[var(--surface-muted)] transition-transform active:rotate-180 btn-focus shadow-xs"
          >
            <ArrowDownUp size={15} />
          </button>
        </div>

        {/* To Box */}
        <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]">
          <div className="flex justify-between text-xs text-[var(--muted)] mb-1.5 font-medium">
            <span>You Receive</span>
            <span>Estimated</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xl font-bold text-[var(--spring)] tabular-nums">
              {output}
            </span>
            <select
              value={toToken}
              onChange={e => setToToken(e.target.value as 'BTC' | 'MUSD' | 'USDC')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--surface-strong)] border border-[var(--border)] text-[var(--ink)] btn-focus cursor-pointer"
            >
              <option value="USDC">USDC</option>
              <option value="MUSD">MUSD</option>
              <option value="BTC">BTC</option>
            </select>
          </div>
        </div>

        {/* Route info */}
        <div className="p-3 rounded-xl bg-[var(--surface)] text-xs text-[var(--muted)] space-y-1.5">
          <div className="flex justify-between">
            <span>Slippage Guarantee:</span>
            <span className="font-semibold text-[var(--spring)]">0.00%</span>
          </div>
          <div className="flex justify-between">
            <span>Network Fee (USDC):</span>
            <span className="tabular-nums">&lt; $0.01</span>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isSwapping}
          loadingText="Executing Swap on Arc…"
          onClick={handleSwap}
          actionOutcome={{
            action: 'Execute swap',
            outcome: `Receive ${output} ${toToken}`,
          }}
          helperText="Guaranteed 1:1 stablecoin peg • Instant confirmation"
        />
      </Card>
    </div>
  )
}
