import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount, useSwitchChain } from 'wagmi'
import { formatUnits, type EIP1193Provider } from 'viem'
import {
  X, Globe, ArrowRight, Loader2, CheckCircle2, AlertCircle,
  ExternalLink, Zap, ShieldCheck
} from 'lucide-react'
import { toast } from 'sonner'
import {
  getCCTPSources,
  getArcCCTPChainName,
  executeCCTPBridge,
  type CCTPSourceChain,
  type BridgeStepName,
} from '../utils/cctpFunding'
import type { Grant } from '../hooks/useProofSpring'
import { ARC_TESTNET_ID, ARC_MAINNET_ID } from '../contracts/proofSpring'

interface Props {
  grant: Grant
  isOpen: boolean
  onClose: () => void
  activeChainId: number
  onSuccessOnArc: () => void
}

const STEP_LABELS: Record<BridgeStepName, { title: string; desc: string }> = {
  approve:          { title: '1. Approve USDC',       desc: 'Authorizing CCTP contract to spend USDC on source chain' },
  burn:             { title: '2. Burn on Source',     desc: 'USDC burned and CCTP message dispatched' },
  fetchAttestation: { title: '3. Circle Attestation', desc: 'Circle Iris verifies burn proof (~15s)' },
  mint:             { title: '4. Mint on Arc',        desc: 'Native USDC minted directly to your address on Arc' },
}

export function CrossChainFundModal({ grant, isOpen, onClose, activeChainId, onSuccessOnArc }: Props) {
  const { connector, chainId: currentChainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()

  const sourceChains = getCCTPSources(activeChainId)
  const defaultSource = sourceChains[0]

  const totalAmountStr = formatUnits(grant.totalAmount, 6)
  const [amountInput, setAmountInput] = useState(totalAmountStr)
  const [selectedSource, setSelectedSource] = useState<CCTPSourceChain>(defaultSource)
  const [isBridging, setIsBridging] = useState(false)
  const [currentStep, setCurrentStep] = useState<BridgeStepName | null>(null)
  const [bridgeTxHash, setBridgeTxHash] = useState<string | undefined>()
  const [bridgeComplete, setBridgeComplete] = useState(false)
  const [bridgeError, setBridgeError] = useState<string | null>(null)

  if (!isOpen) return null

  const destCCTPName = getArcCCTPChainName(activeChainId)
  const isDestMainnet = activeChainId === ARC_MAINNET_ID

  const handleStartBridge = async () => {
    if (!connector) {
      toast.error('Wallet not connected.')
      return
    }

    const trimmed = amountInput.trim()
    const num = parseFloat(trimmed)
    if (isNaN(num) || num <= 0) {
      toast.error('Please enter a valid USDC amount.')
      return
    }

    setBridgeError(null)
    setIsBridging(true)
    setBridgeComplete(false)
    setCurrentStep('approve')

    try {
      // 1. Switch wallet to source chain if not already on it
      if (currentChainId !== selectedSource.id) {
        await switchChainAsync({ chainId: selectedSource.id })
      }

      // 2. Obtain EIP-1193 provider from wagmi connector
      const provider = (await connector.getProvider()) as EIP1193Provider

      // 3. Execute Circle CCTP bridge
      const result = await executeCCTPBridge({
        provider,
        sourceChainName: selectedSource.cctpChainName,
        destChainName: destCCTPName,
        amountUsdc: trimmed,
        onStepChange: (step, hash) => {
          setCurrentStep(step)
          if (hash) setBridgeTxHash(hash)
        },
      })

      if (result && result.state === 'success') {
        setBridgeComplete(true)
        setCurrentStep(null)
        toast.success(`Successfully bridged $${trimmed} USDC to Arc!`)
      } else {
        throw new Error('Bridge transaction did not complete successfully.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cross-chain transfer failed.'
      setBridgeError(msg)
      toast.error(msg)
    } finally {
      setIsBridging(false)
    }
  }

  const handleSwitchToArcAndFund = async () => {
    try {
      await switchChainAsync({ chainId: activeChainId })
      onClose()
      onSuccessOnArc()
    } catch (e) {
      toast.error('Could not switch back to Arc network.')
    }
  }

  const handleReset = () => {
    setIsBridging(false)
    setBridgeComplete(false)
    setCurrentStep(null)
    setBridgeError(null)
    setBridgeTxHash(undefined)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cctp-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="card w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border"
        style={{ background: 'var(--warm-surface)', borderColor: 'var(--brand-border)' }}
      >
        {/* Header Strip */}
        <div
          className="p-5 border-b flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, rgba(234, 242, 253, 0.7) 0%, rgba(248, 243, 240, 0.7) 100%)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
              <Globe size={18} />
            </div>
            <div>
              <h2 id="cctp-modal-title" className="font-jakarta font-bold text-base" style={{ color: 'var(--ink)' }}>
                Cross-Chain Funding (Circle CCTP)
              </h2>
              <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--muted)' }}>
                <span>Domain {selectedSource.domainId}</span>
                <span>➔</span>
                <span style={{ color: 'var(--brand)' }}>Arc (Domain 26)</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isBridging}
            className="p-1.5 rounded-full hover:bg-black/5 text-muted hover:text-ink transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {!bridgeComplete ? (
            <>
              {/* Grant Target Info */}
              <div className="rounded-2xl p-3.5 border flex items-center justify-between" style={{ background: 'var(--warm-bg-2)', borderColor: 'var(--border)' }}>
                <div className="truncate max-w-[280px]">
                  <div className="label-caps mb-0.5">Sponsoring Grant</div>
                  <div className="font-bold text-sm truncate" style={{ color: 'var(--ink)' }}>
                    #{grant.id.toString()} — {grant.title}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="label-caps mb-0.5">Total Grant</div>
                  <div className="font-bold text-sm" style={{ color: 'var(--teal)' }}>
                    ${totalAmountStr} USDC
                  </div>
                </div>
              </div>

              {/* Step 1: Select Source Chain */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted">
                  1. Select Source Network
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {sourceChains.map((chain) => {
                    const isSelected = selectedSource.id === chain.id
                    return (
                      <button
                        key={chain.id}
                        type="button"
                        disabled={isBridging}
                        onClick={() => setSelectedSource(chain)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected ? 'shadow-sm ring-2 ring-brand' : 'hover:border-ink/20 opacity-80'
                        }`}
                        style={{
                          background: isSelected ? 'var(--brand-light)' : 'var(--warm-surface)',
                          borderColor: isSelected ? 'var(--brand)' : 'var(--border)',
                        }}
                      >
                        <div className="font-bold text-xs truncate" style={{ color: isSelected ? 'var(--brand)' : 'var(--ink)' }}>
                          {chain.name}
                        </div>
                        <div className="text-[10px] text-muted mt-0.5">
                          Domain {chain.domainId}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Step 2: USDC Amount (Pre-filled, editable) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label htmlFor="usdc-amount" className="font-bold uppercase tracking-wider text-muted">
                    2. USDC Amount to Bridge
                  </label>
                  <button
                    type="button"
                    disabled={isBridging}
                    onClick={() => setAmountInput(totalAmountStr)}
                    className="text-xs font-semibold hover:underline"
                    style={{ color: 'var(--brand)' }}
                  >
                    Reset to Full Grant (${totalAmountStr})
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="usdc-amount"
                    type="text"
                    value={amountInput}
                    disabled={isBridging}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-11 rounded-2xl border px-3.5 pr-16 font-jakarta font-bold text-lg outline-none btn-focus"
                    style={{ background: 'var(--warm-bg-2)', borderColor: 'var(--border)', color: 'var(--ink)' }}
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-muted pointer-events-none">
                    USDC
                  </div>
                </div>
              </div>

              {/* Transfer Details Banner */}
              <div className="rounded-2xl p-3.5 border text-xs space-y-1.5" style={{ background: 'var(--warm-bg-2)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-muted flex items-center gap-1">
                    <Zap size={12} style={{ color: 'var(--amber)' }} />
                    Protocol & Speed
                  </span>
                  <span className="font-semibold text-ink">Circle CCTP Fast Mode (~15s)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted flex items-center gap-1">
                    <ShieldCheck size={12} style={{ color: 'var(--teal)' }} />
                    Destination Asset
                  </span>
                  <span className="font-semibold text-ink">Native USDC on Arc (0x3600...0000)</span>
                </div>
              </div>

              {/* Stepper if Bridging */}
              {isBridging && (
                <div className="space-y-2 p-4 rounded-2xl border" style={{ background: 'var(--brand-light)', borderColor: 'var(--brand-border)' }}>
                  <div className="flex items-center gap-2 text-xs font-bold" style={{ color: 'var(--brand)' }}>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Cross-chain bridge in progress…</span>
                  </div>

                  <div className="space-y-1 pt-1">
                    {(['approve', 'burn', 'fetchAttestation', 'mint'] as BridgeStepName[]).map((stepKey) => {
                      const info = STEP_LABELS[stepKey]
                      const isCurrent = currentStep === stepKey
                      return (
                        <div key={stepKey} className="text-xs flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-brand animate-ping' : 'bg-muted/40'}`} />
                          <span className={`font-semibold ${isCurrent ? 'text-brand' : 'text-muted'}`}>{info.title}</span>
                          {isCurrent && <span className="text-[10px] text-muted">({info.desc})</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Error Notice */}
              {bridgeError && (
                <div className="p-3 rounded-2xl border text-xs space-y-1.5" style={{ background: 'var(--coral-light)', borderColor: 'var(--coral-border)', color: 'var(--coral)' }}>
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle size={14} />
                    <span>Bridge Error</span>
                  </div>
                  <p className="leading-relaxed">{bridgeError}</p>
                  <button onClick={handleReset} className="font-semibold underline cursor-pointer">Try Again</button>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                disabled={isBridging || !amountInput}
                onClick={handleStartBridge}
                className="btn btn-primary w-full h-11 rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                {isBridging ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Bridging to Arc…</span>
                  </>
                ) : (
                  <>
                    <span>Bridge ${amountInput || '0'} USDC from {selectedSource.name}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </>
          ) : (
            /* Bridge Success & Guided Confirmation */
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ background: 'var(--teal-light)', color: 'var(--teal)' }}>
                <CheckCircle2 size={32} />
              </div>

              <div>
                <h3 className="font-jakarta font-extrabold text-xl mb-1" style={{ color: 'var(--ink)' }}>
                  USDC Successfully Arrived on Arc!
                </h3>
                <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
                  ${amountInput} USDC has been minted to your address on Arc via Circle CCTP. Click below to return to Arc and finalize your grant funding.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleSwitchToArcAndFund}
                  className="btn btn-primary w-full h-11 rounded-2xl font-bold flex items-center justify-center gap-2"
                >
                  <span>Switch to Arc & Fund Grant #{grant.id.toString()}</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-ghost w-full h-9 rounded-2xl text-xs font-semibold"
                >
                  Close & View Grant
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
