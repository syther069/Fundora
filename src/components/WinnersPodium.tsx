import { motion } from 'framer-motion'
import { formatUnits } from 'viem'
import { Trophy, ExternalLink } from 'lucide-react'
import { useAccount } from 'wagmi'
import { toast } from 'sonner'
import { usePendingPrizeWithdrawals, useClaimPrize } from '../hooks/useFundoraEvents'
import type { OnchainEventInfo } from '../contracts/fundoraEvents'
import { EventStatus } from '../contracts/fundoraEvents'

const ARC_TESTNET_EXPLORER = 'https://explorer.testnet.arc.io'

interface WinnersPodiumProps {
  event: OnchainEventInfo
}

export function WinnersPodium({ event: ev }: WinnersPodiumProps) {
  const { address } = useAccount()
  const { data: pendingRaw, refetch } = usePendingPrizeWithdrawals(address)
  const { claimPrize, isPending, isConfirming, isSuccess, error, hash } = useClaimPrize()

  const pending = typeof pendingRaw === 'bigint' ? pendingRaw : 0n
  const hasPending = pending > 0n
  const pendingFormatted = hasPending ? Number(formatUnits(pending, 6)).toLocaleString() : null

  if (ev.status !== EventStatus.Finalized) {
    return (
      <div className="rounded-2xl border p-10 text-center space-y-2" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <Trophy size={28} style={{ color: 'var(--subtle)' }} className="mx-auto" aria-hidden="true" />
        <p className="font-jakarta font-bold text-base" style={{ color: 'var(--ink)' }}>Winners not yet announced</p>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          The organizer will finalize winners once judging is complete.
        </p>
      </div>
    )
  }

  const handleClaim = () => {
    claimPrize()
  }

  // Toast on success
  if (isSuccess && hash) {
    toast.success('Prize claimed!', {
      description: `${pendingFormatted} USDC sent to your wallet`,
      action: {
        label: 'Explorer',
        onClick: () => window.open(`${ARC_TESTNET_EXPLORER}/tx/${hash}`, '_blank'),
      },
    })
    void refetch()
  }

  return (
    <div className="space-y-5">
      {/* Finalized header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border p-5 text-center space-y-1"
        style={{ background: 'var(--teal-light)', borderColor: 'var(--teal-border)' }}
      >
        <Trophy size={28} style={{ color: 'var(--teal)' }} className="mx-auto" aria-hidden="true" />
        <p className="font-jakarta font-bold text-lg" style={{ color: 'var(--teal)' }}>Winners Announced!</p>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          {Number(formatUnits(ev.allocatedPrizePool, 6)).toLocaleString()} USDC allocated to winners.
        </p>
      </motion.div>

      {/* Claim section — shown when connected wallet has a pending prize */}
      {address && hasPending && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border p-5 space-y-4"
          style={{ background: 'var(--brand-light)', borderColor: 'var(--brand-border)' }}
        >
          <div>
            <p className="font-jakarta font-bold text-base mb-0.5" style={{ color: 'var(--brand)' }}>
              You won a prize!
            </p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              <span className="font-bold tabular-nums" style={{ color: 'var(--teal)' }}>
                ${pendingFormatted} USDC
              </span>
              {' '}is waiting in escrow for you to claim.
            </p>
          </div>

          {error && (
            <p className="text-xs rounded-lg px-3 py-2 border" style={{ background: 'var(--coral-light)', borderColor: 'var(--coral-border)', color: 'var(--coral)' }}>
              {error.message?.split('\n')[0] ?? 'Transaction failed. Please try again.'}
            </p>
          )}

          <button
            onClick={handleClaim}
            disabled={isPending || isConfirming}
            className="w-full h-10 rounded-full font-semibold text-sm transition-all focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: 'var(--brand)', color: '#fff' }}
          >
            {isPending && 'Confirm in wallet…'}
            {isConfirming && 'Claiming…'}
            {!isPending && !isConfirming && `Claim $${pendingFormatted} USDC`}
          </button>

          {hash && (
            <a
              href={`${ARC_TESTNET_EXPLORER}/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium"
              style={{ color: 'var(--brand)' }}
            >
              <ExternalLink size={10} aria-hidden="true" />
              View on Arc Explorer
            </a>
          )}
        </motion.div>
      )}

      {/* No pending prize */}
      {address && !hasPending && (
        <p className="text-sm text-center py-4" style={{ color: 'var(--muted)' }}>
          No claimable prize found for your connected wallet.
        </p>
      )}

      {!address && (
        <p className="text-sm text-center py-4" style={{ color: 'var(--muted)' }}>
          Connect your wallet to check if you have a claimable prize.
        </p>
      )}
    </div>
  )
}
