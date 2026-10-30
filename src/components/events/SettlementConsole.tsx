import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatUnits } from 'viem'
import { Trophy, CheckCircle2, AlertTriangle, ExternalLink, ShieldCheck } from 'lucide-react'
import type { Event } from '../../types/events'
import { useFinalizeWinners } from '../../hooks/useFundoraEvents'
import { useMode } from '../../context/ModeContext'
import type { WinnerMapping } from './DeliberationLeaderboard'
import type { Address } from 'viem'

// ── Types ─────────────────────────────────────────────────────────────────────

interface SettlementConsoleProps {
  event: Event
  winnerMapping: WinnerMapping
  onSettled: () => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatUsdc(raw: bigint): string {
  return Number(formatUnits(raw, 6)).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function shortAddr(addr: string) {
  return addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr
}

// ── Main component ────────────────────────────────────────────────────────────
export function SettlementConsole({ event, winnerMapping, onSettled }: SettlementConsoleProps) {
  const { isLive } = useMode()
  const [confirmStep, setConfirmStep] = useState(false)
  const [settled, setSettled] = useState(false)

  const { finalizeWinners, isPending, isConfirming, isSuccess, error, hash } = useFinalizeWinners()

  // Build winners and amounts arrays from mapping (filter out empty entries)
  const mappedEntries = useMemo(
    () => Object.values(winnerMapping).filter(m => m.submissionId && m.address && m.amountUsdc > 0n),
    [winnerMapping],
  )

  const allocatedTotal = useMemo(
    () => mappedEntries.reduce((s, m) => s + m.amountUsdc, 0n),
    [mappedEntries],
  )

  const escrowed = event.totalPrizePoolUsdc
  const unallocated = escrowed > allocatedTotal ? escrowed - allocatedTotal : 0n
  const overAllocated = allocatedTotal > escrowed

  const isAlreadyFinalized = event.status === 'completed'

  const canSettle =
    mappedEntries.length > 0 &&
    !overAllocated &&
    !isAlreadyFinalized &&
    !settled &&
    event.modality === 'native_escrow'

  // Handle success — defer state updates to avoid synchronous setState-in-effect
  useEffect(() => {
    if (!isSuccess) return
    const t = setTimeout(() => {
      setSettled(true)
      setConfirmStep(false)
      onSettled()
    }, 0)
    return () => clearTimeout(t)
  }, [isSuccess, onSettled])

  const handleFinalize = () => {
    if (!canSettle) return
    const eventIdBig = (() => {
      try { return BigInt(event.id.replace(/\D/g, '') || '0') } catch { return 0n }
    })()
    const winners = mappedEntries.map(m => m.address as Address)
    // amounts must be uint128 (bigint), capped to MAX_UINT128 as safety guard
    const amounts = mappedEntries.map(m => m.amountUsdc)
    finalizeWinners(eventIdBig, winners, amounts)
  }

  // Explorer link
  const explorerBase = isLive
    ? 'https://explorer.mainnet.arc.io/tx/'
    : 'https://explorer.testnet.arc.io/tx/'

  // ── Post-settlement banner ─────────────────────────────────────────────────
  if (settled || isAlreadyFinalized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border p-6 text-center space-y-3"
        style={{ background: 'var(--teal-light)', borderColor: 'var(--teal-border)' }}
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 size={32} className="mx-auto" style={{ color: 'var(--teal)' }} aria-hidden="true" />
        <h3 className="font-jakarta font-bold text-lg text-midnight">
          Escrow Settled
        </h3>
        <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: 'var(--ink)' }}>
          Winners have been allocated their prizes from the onchain escrow. Funds are now queued in pull-escrow — each winner can claim their USDC directly from the <strong>Participant Workspace</strong>.
        </p>
        {hash && (
          <a
            href={`${explorerBase}${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors hover:opacity-80 outline-none focus-visible:ring-2 focus-visible:ring-teal"
            style={{ borderColor: 'var(--teal-border)', color: 'var(--teal)', background: 'white' }}
          >
            <ExternalLink size={12} aria-hidden="true" />
            View Settlement Transaction
          </a>
        )}
      </motion.div>
    )
  }

  return (
    <div className="rounded-2xl border bg-white overflow-hidden shadow-sm"
      style={{ borderColor: 'var(--border)' }}>
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center gap-3"
        style={{ borderColor: 'var(--border)', background: 'var(--warm-bg)' }}>
        <ShieldCheck size={16} style={{ color: 'var(--brand)' }} aria-hidden="true" />
        <div>
          <h3 className="font-jakarta font-bold text-base text-midnight">Onchain Settlement Console</h3>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Finalize winners and release escrow allocations on Arc
          </p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Winner allocation table */}
        {mappedEntries.length > 0 ? (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--warm-bg)' }}>
                  <th className="text-left px-4 py-2.5 font-bold uppercase tracking-wider" style={{ color: 'var(--subtle)' }}>Prize Tier</th>
                  <th className="text-left px-4 py-2.5 font-bold uppercase tracking-wider" style={{ color: 'var(--subtle)' }}>Winner Address</th>
                  <th className="text-right px-4 py-2.5 font-bold uppercase tracking-wider" style={{ color: 'var(--subtle)' }}>Amount (USDC)</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {Object.entries(winnerMapping)
                  .filter(([, m]) => m.submissionId && m.address && m.amountUsdc > 0n)
                  .map(([tierId, mapping]) => {
                    const tier = event.tracks.flatMap(t => t.prizeTiers).find(p => p.id === tierId)
                    return (
                      <tr key={tierId}>
                        <td className="px-4 py-2.5 font-semibold text-midnight">
                          <span className="flex items-center gap-1.5">
                            <Trophy size={11} style={{ color: 'var(--amber)' }} aria-hidden="true" />
                            {tier?.place || tierId}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-mono" style={{ color: 'var(--muted)' }}>
                          <span title={mapping.address}>{shortAddr(mapping.address)}</span>
                        </td>
                        <td className="px-4 py-2.5 font-mono font-bold text-right tabular-nums text-midnight">
                          ${formatUsdc(mapping.amountUsdc)}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
            No prize tiers assigned yet. Use the leaderboard above to map winners to prize tiers.
          </div>
        )}

        {/* USDC Reconciliation */}
        <div className="rounded-xl border p-4 space-y-3"
          style={{
            borderColor: overAllocated ? 'var(--coral-border)' : 'var(--border)',
            background: overAllocated ? 'var(--coral-light)' : 'var(--warm-bg)',
          }}>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold" style={{ color: 'var(--ink)' }}>Total Allocated</span>
            <span className={`font-mono font-bold tabular-nums ${overAllocated ? 'text-coral' : 'text-midnight'}`}>
              ${formatUsdc(allocatedTotal)} USDC
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span style={{ color: 'var(--muted)' }}>Total Escrowed</span>
            <span className="font-mono tabular-nums" style={{ color: 'var(--muted)' }}>
              ${formatUsdc(escrowed)} USDC
            </span>
          </div>
          {!overAllocated && unallocated > 0n && (
            <div className="flex items-center justify-between text-xs border-t pt-2" style={{ borderColor: 'var(--border)' }}>
              <span style={{ color: 'var(--muted)' }}>Unallocated → returned to organizer</span>
              <span className="font-mono tabular-nums" style={{ color: 'var(--teal)' }}>
                ${formatUsdc(unallocated)} USDC
              </span>
            </div>
          )}
          {overAllocated && (
            <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--coral)' }}>
              <AlertTriangle size={13} aria-hidden="true" />
              Allocated total exceeds escrowed pool — reduce prize amounts before settling.
            </div>
          )}
          {/* Progress bar */}
          <div className="h-2 rounded-full overflow-hidden bg-slate-200" role="presentation">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Number(allocatedTotal * 100n / (escrowed || 1n)))}%`,
                background: overAllocated ? 'var(--coral)' : 'var(--brand)',
              }}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs font-medium rounded-xl px-4 py-3 border"
            style={{ background: 'var(--coral-light)', borderColor: 'var(--coral-border)', color: 'var(--coral)' }}>
            {(error as Error).message?.includes('User rejected')
              ? 'Transaction cancelled.'
              : (error as Error).message?.slice(0, 120) || 'Settlement failed. Please try again.'}
          </p>
        )}

        {/* Inline confirmation step */}
        <AnimatePresence mode="wait">
          {confirmStep ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="rounded-2xl border p-4 space-y-3"
              style={{ borderColor: 'var(--amber-border, #fde68a)', background: 'var(--amber-light)' }}
              role="alertdialog"
              aria-labelledby="settle-confirm-title"
            >
              <p id="settle-confirm-title" className="text-sm font-bold text-midnight flex items-center gap-2">
                <AlertTriangle size={15} style={{ color: 'var(--amber)' }} aria-hidden="true" />
                Confirm Onchain Settlement
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--ink)' }}>
                You are about to finalize <strong>{mappedEntries.length} winner{mappedEntries.length !== 1 ? 's' : ''}</strong> and
                release <strong>${formatUsdc(allocatedTotal)} USDC</strong> from escrow.
                This transaction <strong>cannot be undone</strong>.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmStep(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold border transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  style={{ borderColor: 'var(--border)', color: 'var(--ink)', background: 'white' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinalize}
                  disabled={isPending || isConfirming}
                  aria-busy={isPending || isConfirming}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-60 outline-none focus-visible:ring-2 focus-visible:ring-brand inline-flex items-center justify-center gap-2"
                  style={{ background: 'var(--brand)' }}
                >
                  {isPending ? (
                    <>
                      <span className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />
                      Confirm in Wallet…
                    </>
                  ) : isConfirming ? (
                    <>
                      <span className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />
                      Settling on Arc…
                    </>
                  ) : (
                    'Confirm & Finalize'
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="settle-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              onClick={() => setConfirmStep(true)}
              disabled={!canSettle}
              className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-brand"
              style={{ background: canSettle ? 'var(--brand)' : 'var(--subtle)' }}
            >
              <ShieldCheck size={16} aria-hidden="true" />
              {isAlreadyFinalized ? 'Already Finalized' : 'Finalize Winners on Arc'}
            </motion.button>
          )}
        </AnimatePresence>

        <p className="text-[11px] text-center" style={{ color: 'var(--subtle)' }}>
          Only the event organizer or platform admin can finalize winners.
          {event.modality !== 'native_escrow' && (
            <span className="block text-amber-600 font-semibold mt-0.5">
              External listing events have no onchain escrow to settle.
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
