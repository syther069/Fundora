import { formatUnits } from 'viem'
import { Trophy, Medal, Award, Gift } from 'lucide-react'
import type { OnchainEventInfo } from '../contracts/fundoraEvents'

const TIER_CONFIGS = [
  { rank: '1st Place', icon: Trophy, color: 'var(--amber)',  bg: 'var(--amber-light)',  border: 'var(--amber-border)' },
  { rank: '2nd Place', icon: Medal,  color: 'var(--slate)',  bg: 'var(--slate-light)',  border: 'var(--slate-border)' },
  { rank: '3rd Place', icon: Award,  color: 'var(--teal)',   bg: 'var(--teal-light)',   border: 'var(--teal-border)'  },
]

interface PrizeTierListProps {
  event: OnchainEventInfo
}

export function PrizeTierList({ event: ev }: PrizeTierListProps) {
  // For now we display the total prize pool and a note that tiers are set at finalization.
  // When the contract stores per-tier amounts, this will be extended.
  const prizeUSDC = ev.totalPrizePool > 0n
    ? Number(formatUnits(ev.totalPrizePool, 6)).toLocaleString()
    : null

  if (!prizeUSDC) {
    return (
      <div className="rounded-2xl border p-8 text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <Gift size={28} style={{ color: 'var(--subtle)' }} className="mx-auto mb-3" aria-hidden="true" />
        <p className="font-jakarta font-bold text-base mb-1" style={{ color: 'var(--ink)' }}>External Prize Details</p>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          This event is hosted externally. Prize details are available on the host platform.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Total prize pool */}
      <div
        className="rounded-2xl border p-5 space-y-1"
        style={{ background: 'var(--teal-light)', borderColor: 'var(--teal-border)' }}
      >
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--teal)' }}>
          Total Prize Pool — Arc Verified Escrow
        </div>
        <div
          className="font-jakarta font-extrabold text-3xl tabular-nums"
          style={{ color: 'var(--teal)', letterSpacing: '-0.03em' }}
        >
          ${prizeUSDC}
          <span className="text-base font-semibold ml-1.5" style={{ color: 'var(--muted)' }}>USDC</span>
        </div>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          Locked onchain until the organizer finalizes winners.
        </p>
      </div>

      {/* Prize tiers — illustrative until organizer finalizes */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--subtle)' }}>
          Prize Tiers
        </p>
        {TIER_CONFIGS.map(tier => {
          const Icon = tier.icon
          return (
            <div
              key={tier.rank}
              className="flex items-center gap-3 rounded-xl border p-4"
              style={{ background: tier.bg, borderColor: tier.border }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(255,255,255,0.6)' }}
                aria-hidden="true"
              >
                <Icon size={16} style={{ color: tier.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-jakarta font-bold text-sm" style={{ color: 'var(--ink)' }}>
                  {tier.rank}
                </p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  Allocation set by organizer at finalization
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs" style={{ color: 'var(--subtle)' }}>
        Winners pull-claim their allocated prize directly from the contract. No third party holds your funds.
      </p>
    </div>
  )
}
