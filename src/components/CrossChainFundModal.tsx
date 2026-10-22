/**
 * CrossChainFundModal — one-click CCTP bridge from Base / Arbitrum / Ethereum → Arc.
 *
 * Flow:
 *   1. Funder selects source chain (filtered to their connected tier: testnet or mainnet).
 *   2. Modal shows the USDC amount still needed to fully fund the grant (read-only).
 *   3. On "Bridge USDC to Arc" click → appKit.bridge() via Circle App Kit.
 *   4. A 4-step stepper (Approve → Burn → Attestation → Mint) shows final step states.
 *   5. On success → modal closes; parent shows a toast prompting the user to click Fund Grant.
 *
 * Security: bridge() is only called from an explicit button click, never auto-invoked.
 * Mainnet warning is shown before bridging when destination is Arc Mainnet.
 */

import { useState } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { formatUnits } from 'viem'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Globe, CheckCircle2, Loader2, AlertTriangle, ExternalLink, Info } from 'lucide-react'
import type { EIP1193Provider } from 'viem'
import type { BridgeResult } from '@circle-fin/app-kit'
import { createViemAdapterFromProvider } from '@circle-fin/adapter-viem-v2'
import {
  CCTP_CHAINS,
  getCCTPChain,
  arcDestChain,
  executeBridge,
  normaliseSteps,
  appKit,
  type CCTPChainOption,
  type BridgeStepStatus,
  type ChainTier,
} from '../utils/cctpFunding'
import type { Grant } from '../hooks/useProofSpring'

// ── Step metadata ─────────────────────────────────────────────────────────────

const STEP_META: { name: BridgeStepStatus['name']; label: string; sublabel: string }[] = [
  { name: 'approve',          label: 'Approve USDC',         sublabel: 'Allow the CCTP contract to spend your USDC' },
  { name: 'burn',             label: 'Burn on source chain', sublabel: 'USDC is burned and a cross-chain message is sent' },
  { name: 'fetchAttestation', label: 'Circle attestation',   sublabel: 'Circle verifies the burn proof (~8–20 s)' },
  { name: 'mint',             label: 'Mint on Arc',          sublabel: 'USDC is minted to your wallet on Arc' },
]

// ── Step indicator ────────────────────────────────────────────────────────────

function StepRow({
  index,
  label,
  sublabel,
  state,
  txHash,
  explorerUrl,
  active,
}: {
  index: number
  label: string
  sublabel: string
  state: BridgeStepStatus['state'] | 'idle'
  txHash?: string
  explorerUrl?: string
  active?: boolean
}) {
  const isSuccess = state === 'success'
  const isError   = state === 'error'
  const isActive  = active === true

  const circleStyle: React.CSSProperties = {
    background: isSuccess ? 'var(--teal)' : isError ? 'var(--coral)' : isActive ? 'var(--brand)' : 'var(--border)',
    color: isSuccess || isError || isActive ? '#fff' : 'var(--subtle)',
    fontSize: '11px',
    fontWeight: 700,
    flexShrink: 0,
  }

  return (
    <div className="flex items-start gap-3">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center mt-0.5 transition-colors duration-300"
        style={circleStyle}
      >
        {isSuccess ? (
          <CheckCircle2 size={13} />
        ) : isActive ? (
          <Loader2 size={12} className="animate-spin" />
        ) : isError ? (
          <X size={11} />
        ) : (
          <span>{index + 1}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-sm font-semibold leading-tight"
          style={{ color: isActive ? 'var(--ink)' : isSuccess ? 'var(--teal)' : isError ? 'var(--coral)' : 'var(--subtle)' }}
        >
          {label}
        </div>
        {isActive && (
          <div className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>{sublabel}</div>
        )}
        {txHash && explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs mt-0.5 hover:opacity-70 transition-opacity"
            style={{ color: 'var(--brand)' }}
          >
            {txHash.slice(0, 10)}…{txHash.slice(-6)}
            <ExternalLink size={10} />
          </a>
        )}
      </div>
    </div>
  )
}

// ── Chain selector item ───────────────────────────────────────────────────────

function ChainOption({
  chain,
  selected,
  onSelect,
}: {
  chain: CCTPChainOption
  selected: boolean
  onSelect: () => void
}) {
  const emoji = chain.icon === 'base' ? '🔵' : chain.icon === 'arbitrum' ? '🔷' : '⬡'

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-left transition-all btn-focus"
      style={{
        background: selected ? 'var(--brand-light)' : 'var(--surface-raised)',
        border: `1.5px solid ${selected ? 'var(--brand-border)' : 'var(--border)'}`,
        color: selected ? 'var(--brand)' : 'var(--ink)',
      }}
      aria-pressed={selected}
    >
      <span className="text-base leading-none">{emoji}</span>
      <span className="text-sm font-semibold">{chain.label}</span>
      {selected && (
        <span
          className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: 'var(--brand)', color: '#fff' }}
        >
          Selected
        </span>
      )}
    </button>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────

interface Props {
  grant: Grant
  activeChainId: number
  onClose: () => void
  onBridgeComplete: () => void
}

type ModalPhase = 'select' | 'bridging' | 'success' | 'error'

export function CrossChainFundModal({ grant, activeChainId, onClose, onBridgeComplete }: Props) {
  const { chainId: connectedChainId, connector } = useAccount()
  const { switchChainAsync } = useSwitchChain()

  // Determine tier from connected chain or active Arc chain
  const connectedCCTP    = connectedChainId !== undefined ? getCCTPChain(connectedChainId) : undefined
  const tier: ChainTier  = connectedCCTP?.tier ?? (activeChainId === 5042 ? 'mainnet' : 'testnet')
  const sourceCandidates = CCTP_CHAINS.filter(c => c.tier === tier)

  // Auto-select the connected chain if it is a valid CCTP source, else first candidate
  const [selectedSource, setSelectedSource] = useState<CCTPChainOption | null>(
    connectedCCTP ?? sourceCandidates[0] ?? null,
  )

  const [phase, setPhase]       = useState<ModalPhase>('select')
  const [steps, setSteps]       = useState<BridgeStepStatus[]>([])
  const [errorMsg, setErrorMsg] = useState('')
  const [lastResult, setLastResult] = useState<BridgeResult | null>(null)

  // Amount still needed: totalAmount - releasedAmount (bigint, 6-dec USDC)
  const neededWei     = BigInt(grant.totalAmount) - BigInt(grant.releasedAmount)
  const amountDecimal = formatUnits(neededWei > 0n ? neededWei : BigInt(grant.totalAmount), 6)
  const destChain  = arcDestChain(tier)
  const destLabel  = tier === 'mainnet' ? 'Arc Mainnet' : 'Arc Testnet'
  const isMainnet     = tier === 'mainnet'

  // Map step name → status for the stepper
  const stepMap = new Map<string, BridgeStepStatus>(steps.map(s => [s.name, s]))

  const handleBridge = async () => {
    if (!selectedSource || !connector) return

    setPhase('bridging')
    setSteps([])
    setErrorMsg('')

    try {
      // Switch wallet to source chain before bridging (required by App Kit wagmi adapter)
      if (connectedChainId !== selectedSource.chainId) {
        await switchChainAsync({ chainId: selectedSource.chainId })
      }

      const provider = (await connector.getProvider()) as EIP1193Provider

      const result = await executeBridge({
        provider,
        sourceChain: selectedSource.appKitChain,
        destChain,
        amountDecimal,
      })

      setLastResult(result)
      setSteps(normaliseSteps(result))

      if (result.state === 'success') {
        setPhase('success')
      } else {
        setErrorMsg(`Bridge ended with state: ${result.state ?? 'unknown'}`)
        setPhase('error')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setErrorMsg(msg)
      setPhase('error')
    }
  }

  const handleRetry = async () => {
    if (!lastResult || !connector) return

    setPhase('bridging')
    setErrorMsg('')

    try {
      const provider        = (await connector.getProvider()) as EIP1193Provider
      const adapterInstance = await createViemAdapterFromProvider({ provider })

      // retryBridge resumes from the failed step — never re-runs completed steps
      const result = await appKit.retryBridge(lastResult, {
        from: adapterInstance,
        to:   adapterInstance,
      })

      setLastResult(result)
      setSteps(normaliseSteps(result))

      if (result.state === 'success') {
        setPhase('success')
      } else {
        setErrorMsg(`Retry ended with state: ${result.state ?? 'unknown'}`)
        setPhase('error')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setErrorMsg(msg)
      setPhase('error')
    }
  }

  const handleSuccess = () => {
    onClose()
    onBridgeComplete()
  }

  // Prevent backdrop close during an active bridge
  const handleBackdropClick = () => {
    if (phase !== 'bridging') onClose()
  }

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="cctp-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-label="Bridge USDC to Arc"
      >
        {/* Modal card */}
        <motion.div
          key="cctp-modal"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="relative w-full max-w-md rounded-2xl overflow-hidden"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <Globe size={16} style={{ color: 'var(--brand)' }} />
              <span className="font-bold text-sm" style={{ color: 'var(--ink)' }}>
                Bridge USDC to Arc
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'var(--teal-light)', color: 'var(--teal)' }}
              >
                CCTP Fast ~15s
              </span>
            </div>
            {phase !== 'bridging' && (
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors btn-focus"
                style={{ background: 'var(--surface-raised)' }}
                aria-label="Close"
              >
                <X size={14} style={{ color: 'var(--muted)' }} />
              </button>
            )}
          </div>

          <div className="px-5 py-4 space-y-4">

            {/* ── Select phase ───────────────────────────────────────────── */}
            {phase === 'select' && (
              <>
                {/* Amount card */}
                <div
                  className="rounded-xl px-4 py-3 flex items-center justify-between"
                  style={{ background: 'var(--brand-light)', border: '1px solid var(--brand-border)' }}
                >
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--brand)' }}>
                      Amount to bridge
                    </div>
                    <div className="text-2xl font-bold tabular-nums mt-0.5" style={{ color: 'var(--ink)' }}>
                      ${parseFloat(amountDecimal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      <span className="text-sm font-semibold ml-1.5" style={{ color: 'var(--muted)' }}>USDC</span>
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>
                      Grant funding needed · destination: {destLabel}
                    </div>
                  </div>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'var(--brand)', color: '#fff' }}
                  >
                    <Globe size={18} />
                  </div>
                </div>

                {/* Route preview */}
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                  <span
                    className="px-2 py-1 rounded-lg font-semibold"
                    style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--ink)' }}
                  >
                    {selectedSource?.label ?? '—'}
                  </span>
                  <span style={{ color: 'var(--subtle)' }}>→ CCTP v2 →</span>
                  <span
                    className="px-2 py-1 rounded-lg font-semibold"
                    style={{ background: 'var(--brand-light)', border: '1px solid var(--brand-border)', color: 'var(--brand)' }}
                  >
                    {destLabel}
                  </span>
                </div>

                {/* Source chain selector */}
                <div>
                  <div
                    className="text-xs font-semibold uppercase tracking-wide mb-2"
                    style={{ color: 'var(--subtle)' }}
                  >
                    Source network
                  </div>
                  <div className="space-y-1.5">
                    {sourceCandidates.map(chain => (
                      <ChainOption
                        key={chain.chainId}
                        chain={chain}
                        selected={selectedSource?.chainId === chain.chainId}
                        onSelect={() => setSelectedSource(chain)}
                      />
                    ))}
                  </div>
                  {sourceCandidates.length === 0 && (
                    <div
                      className="rounded-xl px-3 py-2.5 text-sm"
                      style={{ background: 'var(--amber-light)', color: 'var(--amber)', border: '1px solid var(--amber-border)' }}
                    >
                      No supported CCTP source chains found for your network tier.
                    </div>
                  )}
                </div>

                {/* Mainnet safety warning */}
                {isMainnet && (
                  <div
                    className="rounded-xl px-3 py-2.5 flex items-start gap-2 text-xs"
                    style={{ background: 'var(--amber-light)', color: 'var(--amber)', border: '1px solid var(--amber-border)' }}
                    role="alert"
                  >
                    <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                    <span>
                      <strong>Mainnet transfer.</strong> Real USDC will be burned on {selectedSource?.label ?? 'the source chain'} and minted on Arc Mainnet. This cannot be undone. Verify the grant details before proceeding.
                    </span>
                  </div>
                )}

                {/* What happens next */}
                <div
                  className="rounded-xl px-3 py-2.5 flex items-start gap-2 text-xs"
                  style={{ background: 'var(--surface-raised)', color: 'var(--muted)', border: '1px solid var(--border)' }}
                >
                  <Info size={12} className="shrink-0 mt-0.5" style={{ color: 'var(--subtle)' }} />
                  <span>
                    After the bridge completes (~15 s), your USDC will be on Arc. You will then click{' '}
                    <strong style={{ color: 'var(--ink)' }}>Fund Grant</strong> on Arc to deposit it into the grant escrow.
                  </span>
                </div>

                {/* CTA */}
                <button
                  type="button"
                  onClick={() => { void handleBridge() }}
                  disabled={!selectedSource}
                  className="w-full h-11 rounded-full text-sm font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 btn-focus"
                  style={{
                    background: 'var(--brand)',
                    boxShadow: selectedSource ? '0 4px 14px rgba(79,70,229,0.30)' : 'none',
                  }}
                >
                  <Globe size={14} />
                  Bridge USDC to {destLabel}
                </button>
              </>
            )}

            {/* ── Bridging phase ─────────────────────────────────────────── */}
            {phase === 'bridging' && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                    Bridging USDC via CCTP…
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                    {selectedSource?.label} → {destLabel} · Fast transfer (~15 s)
                  </div>
                </div>

                <div
                  className="rounded-xl px-4 py-4 space-y-3.5"
                  style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}
                >
                  {STEP_META.map((meta, i) => {
                    const stepStatus = stepMap.get(meta.name)
                    return (
                      <StepRow
                        key={meta.name}
                        index={i}
                        label={meta.label}
                        sublabel={meta.sublabel}
                        state={stepStatus?.state ?? 'idle'}
                        txHash={stepStatus?.txHash}
                        explorerUrl={stepStatus?.explorerUrl}
                        active={stepStatus === undefined && i === 0}
                      />
                    )
                  })}
                </div>

                <div
                  className="text-xs text-center flex items-center justify-center gap-1.5"
                  style={{ color: 'var(--subtle)' }}
                >
                  <Loader2 size={11} className="animate-spin" />
                  Do not close this window during the transfer
                </div>
              </div>
            )}

            {/* ── Success phase ──────────────────────────────────────────── */}
            {phase === 'success' && (
              <div className="space-y-4">
                <div
                  className="rounded-xl px-4 py-4 flex flex-col items-center gap-2 text-center"
                  style={{ background: 'var(--teal-light)', border: '1px solid var(--teal-border)' }}
                >
                  <CheckCircle2 size={32} style={{ color: 'var(--teal)' }} />
                  <div className="font-bold text-sm" style={{ color: 'var(--teal)' }}>
                    USDC arrived on {destLabel}!
                  </div>
                  <div className="text-xs" style={{ color: 'var(--teal)' }}>
                    ${parseFloat(amountDecimal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC is now in your wallet on Arc.
                  </div>
                </div>

                {/* Step receipt */}
                <div
                  className="rounded-xl px-4 py-3 space-y-2.5"
                  style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}
                >
                  {STEP_META.map((meta, i) => {
                    const stepStatus = stepMap.get(meta.name)
                    return (
                      <StepRow
                        key={meta.name}
                        index={i}
                        label={meta.label}
                        sublabel={meta.sublabel}
                        state={stepStatus?.state ?? 'idle'}
                        txHash={stepStatus?.txHash}
                        explorerUrl={stepStatus?.explorerUrl}
                      />
                    )
                  })}
                </div>

                <div
                  className="rounded-xl px-3 py-2.5 flex items-start gap-2 text-xs"
                  style={{ background: 'var(--brand-light)', color: 'var(--brand)', border: '1px solid var(--brand-border)' }}
                >
                  <Globe size={12} className="shrink-0 mt-0.5" />
                  <span>
                    Switch your wallet to <strong>{destLabel}</strong> and click{' '}
                    <strong>Fund Grant</strong> to deposit the USDC into the grant escrow.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSuccess}
                  className="w-full h-11 rounded-full text-sm font-bold text-white transition-all flex items-center justify-center gap-2 btn-focus"
                  style={{ background: 'var(--teal)', boxShadow: '0 4px 14px rgba(15,118,110,0.30)' }}
                >
                  <CheckCircle2 size={14} />
                  Done — go to Fund Grant
                </button>
              </div>
            )}

            {/* ── Error phase ────────────────────────────────────────────── */}
            {phase === 'error' && (
              <div className="space-y-4">
                <div
                  className="rounded-xl px-4 py-3 flex items-start gap-2 text-sm"
                  style={{ background: 'var(--coral-light)', color: 'var(--coral)', border: '1px solid var(--coral-border)' }}
                  role="alert"
                >
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold mb-0.5">Bridge transfer failed</div>
                    <div className="text-xs opacity-80 break-all">{errorMsg}</div>
                  </div>
                </div>

                {/* Show completed steps */}
                {steps.length > 0 && (
                  <div
                    className="rounded-xl px-4 py-3 space-y-2.5"
                    style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}
                  >
                    {STEP_META.map((meta, i) => {
                      const stepStatus = stepMap.get(meta.name)
                      return (
                        <StepRow
                          key={meta.name}
                          index={i}
                          label={meta.label}
                          sublabel={meta.sublabel}
                          state={stepStatus?.state ?? 'idle'}
                          txHash={stepStatus?.txHash}
                          explorerUrl={stepStatus?.explorerUrl}
                        />
                      )
                    })}
                  </div>
                )}

                <div className="flex gap-2">
                  {lastResult && (
                    <button
                      type="button"
                      onClick={() => { void handleRetry() }}
                      className="flex-1 h-10 rounded-full text-sm font-bold text-white transition-all flex items-center justify-center gap-1.5 btn-focus"
                      style={{ background: 'var(--brand)' }}
                    >
                      <Loader2 size={13} />
                      Retry from last step
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 h-10 rounded-full text-sm font-semibold transition-all flex items-center justify-center btn-focus"
                    style={{
                      background: 'var(--surface-raised)',
                      border: '1px solid var(--border)',
                      color: 'var(--muted)',
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
