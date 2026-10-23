import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { toast } from 'sonner'

export function SpendView() {
  const [cardFrozen, setCardFrozen] = useState(false)

  const handleToggleFreeze = () => {
    setCardFrozen(prev => !prev)
    toast.info(cardFrozen ? 'Card unfrozen' : 'Card frozen for security')
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
      <div>
        <Badge variant="spring" size="sm" className="mb-2">
          Real-World Commerce
        </Badge>
        <h1 className="display font-bold text-2xl sm:text-3xl text-[var(--ink)] tracking-tight">
          Spend Without Selling Bitcoin
        </h1>
        <p className="text-sm text-[var(--muted)] max-w-xl mt-1">
          Connect your MUSD balance directly to virtual and physical debit cards. Spend at 60M+ merchants globally while keeping your long-term Bitcoin upside.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Card visual & controls */}
        <div className="md:col-span-6 space-y-4">
          <div className="relative w-full aspect-[1.58/1] rounded-2xl p-6 text-white overflow-hidden shadow-xl flex flex-col justify-between bg-gradient-to-br from-[#122d45] via-[#1a3d5e] to-[#0c4b82] dark:from-[#112233] dark:to-[#1a3855] border border-white/10">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold tracking-widest uppercase opacity-75">
                  Mezo Sovereign Card
                </span>
                <span className="block text-xl font-bold tracking-tight">
                  MUSD Debit
                </span>
              </div>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-white/20">
                {cardFrozen ? 'FROZEN' : 'ACTIVE'}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs opacity-75">Available to Spend</span>
              <span className="font-mono text-2xl font-bold tracking-tight block">
                $14,850.00 <span className="text-xs font-normal opacity-80">MUSD</span>
              </span>
            </div>

            <div className="flex justify-between items-end text-xs font-mono opacity-80">
              <span>•••• •••• •••• 4092</span>
              <span>EXP 08/29</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="md"
              className="flex-1"
              onClick={handleToggleFreeze}
              actionOutcome={{
                action: cardFrozen ? 'Unfreeze card' : 'Freeze card',
              }}
            />
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              onClick={() => toast.success('New virtual card generated!')}
              actionOutcome={{
                action: 'Generate new card',
                outcome: 'Instant Apple/Google Pay',
              }}
            />
          </div>
        </div>

        {/* Right: Benefits & recent activity */}
        <div className="md:col-span-6 space-y-4">
          <Card padding="lg" variant="default" className="space-y-4">
            <h3 className="display font-bold text-base text-[var(--ink)]">
              Spend Benefits
            </h3>

            <div className="space-y-3 text-xs text-[var(--muted)] leading-relaxed">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[var(--spring)] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[var(--ink)] block mb-0.5">
                    No Capital Gains Tax Triggered
                  </span>
                  Borrowing dollars against Bitcoin is non-taxable in most jurisdictions because you are not disposing of your asset.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[var(--spring)] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[var(--ink)] block mb-0.5">
                    Zero Foreign Exchange Fees
                  </span>
                  Spend abroad in local fiat converted at wholesale interbank rates directly from your MUSD pool.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[var(--spring)] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[var(--ink)] block mb-0.5">
                    Self-Custodial Auto-Liquidation Protection
                  </span>
                  Set automated repayment triggers from your MUSD yield to keep your vault ratio bulletproof.
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
