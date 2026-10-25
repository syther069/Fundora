import { useState, useEffect, useCallback } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain, useReadContract, usePublicClient } from 'wagmi'
import { erc20Abi, formatUnits } from 'viem'
import {
  ArrowLeft, ExternalLink, Send, CheckCircle, XCircle,
  AlertCircle, Loader2, Ban, AlertTriangle, Info,
  CalendarDays, CheckCircle2, Globe, Fingerprint, Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { FUNDORA_ABI, ARC_TESTNET_ID, ARC_MAINNET_ID, getContractAddress } from '../contracts/fundora'
import { getUsdc, buildTxExplorerUrl } from '@/onchain-facts'
import { parseAmount } from '@/onchain-money'
import { StatusBadge } from './StatusBadge'
import { DeadlineBadge } from './DeadlineBadge'
import {
  usePendingFunderRefund,
  useMilestones,
  useIsReviewer,
  useRequiredApprovals,
  usePendingWithdrawal,
  useApprovalCount,
  useReviewerVote,
  useGrant,
  useGrantCreator,
} from '../hooks/useFundora'
import { useUnifiedIsAdmin } from '../hooks/useAdminRegistry'
import type { Grant, Milestone } from '../hooks/useFundora'
import { parseOnchainError } from '../utils/errors'
import { CrossChainFundModal } from './CrossChainFundModal'
import { getCCTPChain } from '../utils/cctpFunding'
import { usePasskeyContext } from '../context/PasskeyContext'

interface Props {
  grant: Grant
  onBack: () => void
  onRefresh: () => void
  isAdmin: boolean
  activeChainId?: number
}

// v2: evidenceUri is no longer stored onchain — only its keccak256 hash is stored.
const ZERO_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'
function hasEvidence(hash: `0x${string}` | undefined): boolean {
  return !!hash && hash !== ZERO_HASH
}
function shortHash(hash: `0x${string}`): string {
  return `${hash.slice(0, 10)}…${hash.slice(-8)}`
}

function evidenceCacheKey(chainId: number, grantId: bigint, milestoneIndex: number): string {
  return `fundora:evidence:${chainId}:${grantId}:${milestoneIndex}`
}
function saveEvidenceToCache(chainId: number, grantId: bigint, milestoneIndex: number, uri: string) {
  try { localStorage.setItem(evidenceCacheKey(chainId, grantId, milestoneIndex), uri) } catch { /* storage blocked */ }
}
function readEvidenceFromCache(chainId: number, grantId: bigint, milestoneIndex: number): string | null {
  try { return localStorage.getItem(evidenceCacheKey(chainId, grantId, milestoneIndex)) } catch { return null }
}

function formatEvidenceLink(uri: string): { href: string; isLink: boolean; label: string } {
  const trimmed = uri.trim()
  if (trimmed.startsWith('ipfs://')) {
    const cid = trimmed.replace('ipfs://', '')
    return {
      href: `https://ipfs.io/ipfs/${cid}`,
      isLink: true,
      label: trimmed,
    }
  }
  if (/^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[a-z0-9]{55})/i.test(trimmed)) {
    return {
      href: `https://ipfs.io/ipfs/${trimmed}`,
      isLink: true,
      label: `ipfs://${trimmed}`,
    }
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return {
      href: trimmed,
      isLink: true,
      label: trimmed,
    }
  }
  return {
    href: '',
    isLink: false,
    label: trimmed,
  }
}

function formatGrantDate(ts: bigint): string {
  if (!ts || ts === 0n) return ''
  try {
    return new Date(Number(ts) * 1000).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  } catch { return '' }
}

// Status → accent colour for the hero band
const STATUS_BAND: Record<number, string> = {
  0: '#6366f1',
  1: '#0d9488',
  2: '#0d9488',
  3: '#e11d48',
}

export function GrantDetail({ grant: grantProp, onBack, onRefresh, isAdmin, activeChainId: propChainId }: Props) {
  const { address, chainId } = useAccount()
  const { switchChain } = useSwitchChain()
  const activeChainId = propChainId ?? ARC_TESTNET_ID
  const FUNDORA_ADDRESS = getContractAddress(activeChainId)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [showCrossChainModal, setShowCrossChainModal] = useState(false)

  const { data: liveGrant } = useGrant(grantProp.id)
  const grant = liveGrant ?? grantProp

  const { data: isReviewer } = useIsReviewer(address)
  const { isPlatformAdmin } = useUnifiedIsAdmin()
  const { data: grantCreator } = useGrantCreator(grant.id)
  const isGrantCreatorOrPlatformAdmin =
    isAdmin &&
    (!grantCreator ||
      !address ||
      (grantCreator as string).toLowerCase() === address.toLowerCase() ||
      isPlatformAdmin)
  const { data: requiredApprovals } = useRequiredApprovals()
  const { data: pendingWithdrawal, refetch: refetchWithdrawal } = usePendingWithdrawal(address)
  const milestoneCount = Number(grant.milestoneCount)

  const {
    data: milestoneResults,
    refetch: refetchMilestones,
    isFetching: milestonesLoading,
    isError: milestonesError,
  } = useMilestones(grant.id, milestoneCount)

  const milestones: Milestone[] = (milestoneResults ?? []).map(r => r.result as Milestone).filter(Boolean)

  const isBuilder = address?.toLowerCase() === grant.builder?.toLowerCase()

  // ── Passkey / gasless path ────────────────────────────────────────────────
  const {
    isPasskeyConnected,
    executeGaslessAction,
  } = usePasskeyContext()

  // Gasless action state (apply, claim)
  const [gaslessLoading, setGaslessLoading] = useState(false)
  const [gaslessTxHash, setGaslessTxHash] = useState<`0x${string}` | undefined>()
  const [gaslessError, setGaslessError] = useState<string | null>(null)
  const noBuilder = grant.builder === '0x0000000000000000000000000000000000000000'
  const isWrongChain = chainId !== activeChainId

  const usdcFact = getUsdc(activeChainId) ?? getUsdc(ARC_TESTNET_ID)!
  const USDC_ADDRESS = usdcFact.address as `0x${string}`

  const withChain = useCallback((action: () => void) => {
    if (isWrongChain) {
      setPendingAction(() => action)
      switchChain(
        { chainId: activeChainId },
        { onSuccess: () => { action(); setPendingAction(null) } },
      )
      return
    }
    action()
  }, [isWrongChain, switchChain, activeChainId])

  // ── Apply for grant ──
  const { writeContract: applyWrite, data: applyHash, isPending: applyPending } = useWriteContract()
  const { isLoading: applyConfirming, isSuccess: applySuccess } = useWaitForTransactionReceipt({ hash: applyHash })
  useEffect(() => {
    if (applySuccess) {
      void refetchMilestones()
      onRefresh()
      toast.success('Application confirmed! You are now the builder for this grant.')
    }
  }, [applySuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Approve USDC + Fund grant (Fix 1: Chained sequence & allowance tracking) ──
  const { writeContract: approveWrite, data: approveHash, isPending: approvePending } = useWriteContract()
  const { isLoading: approveConfirming, isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash })
  const { writeContract: fundWrite, data: fundHash, isPending: fundPending } = useWriteContract()
  const { isLoading: fundConfirming, isSuccess: fundSuccess } = useWaitForTransactionReceipt({ hash: fundHash })
  const [awaitingFundingAfterApprove, setAwaitingFundingAfterApprove] = useState(false)

  const { data: usdcAllowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address ? [address, FUNDORA_ADDRESS] : undefined,
    chainId: activeChainId,
    query: { enabled: !!address && grant.status === 0 && isAdmin },
  })

  // Automatically execute fundGrant once approve transaction is mined onchain
  useEffect(() => {
    if (approveSuccess && awaitingFundingAfterApprove) {
      setAwaitingFundingAfterApprove(false)
      void refetchAllowance()
      toast.info('USDC approved! Confirm funding in your wallet…')
      withChain(() => {
        fundWrite(
          { address: FUNDORA_ADDRESS, abi: FUNDORA_ABI, functionName: 'fundGrant', args: [grant.id] },
          { onError: (e) => toast.error(parseOnchainError(e)) },
        )
      })
    }
  }, [approveSuccess, awaitingFundingAfterApprove]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (fundSuccess) {
      void refetchAllowance()
      onRefresh()
      toast.success('Grant funded! Builders can now apply.')
    }
  }, [fundSuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Claim payment ──
  const { writeContract: claimWrite, data: claimHash, isPending: claimPending } = useWriteContract()
  const { isLoading: claimConfirming, isSuccess: claimSuccess } = useWaitForTransactionReceipt({ hash: claimHash })
  useEffect(() => {
    if (claimSuccess) { void refetchWithdrawal(); onRefresh(); toast.success('Payment claimed successfully!') }
  }, [claimSuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cancel grant ──
  const { writeContract: cancelWrite, data: cancelHash, isPending: cancelPending } = useWriteContract()
  const { isLoading: cancelConfirming, isSuccess: cancelSuccess } = useWaitForTransactionReceipt({ hash: cancelHash })

  // expireGrant — admin can trigger after deadline passes
  const { writeContract: expireWrite, data: expireHash, isPending: expirePending } = useWriteContract()
  const { isLoading: expireConfirming, isSuccess: expireSuccess } = useWaitForTransactionReceipt({ hash: expireHash })
  useEffect(() => {
    if (expireSuccess) { onRefresh(); toast.success('Grant expired and USDC refunded to funder.') }
  }, [expireSuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  // claimFunderRefund — funder claims after grant cancellation
  const { data: pendingFunderRefund, refetch: refetchFunderRefund } = usePendingFunderRefund(address)
  const hasFunderRefund = pendingFunderRefund !== undefined && pendingFunderRefund > 0n
  const { writeContract: funderClaimWrite, data: funderClaimHash, isPending: funderClaimPending } = useWriteContract()
  const { isLoading: funderClaimConfirming, isSuccess: funderClaimSuccess } = useWaitForTransactionReceipt({ hash: funderClaimHash })
  useEffect(() => {
    if (funderClaimSuccess) { void refetchFunderRefund(); toast.success('Refund claimed successfully!') }
  }, [funderClaimSuccess]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (cancelSuccess) { onRefresh(); toast.success('Grant cancelled. Unreleased USDC refunded.') }
  }, [cancelSuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleApply = () => {
    if (isPasskeyConnected) {
      setGaslessLoading(true)
      setGaslessError(null)
      setGaslessTxHash(undefined)
      executeGaslessAction('applyForGrant', [grant.id])
        .then((hash) => {
          setGaslessTxHash(hash)
          void refetchMilestones()
          onRefresh()
          toast.success('Applied! You are now the builder for this grant.')
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Gasless transaction failed.'
          setGaslessError(msg)
          toast.error(msg)
        })
        .finally(() => setGaslessLoading(false))
      return
    }
    withChain(() => {
      applyWrite({
        address: FUNDORA_ADDRESS,
        abi: FUNDORA_ABI,
        functionName: 'applyForGrant',
        args: [grant.id],
      }, { onError: (e) => toast.error(parseOnchainError(e)) })
    })
  }

  // Capture current time once at mount for deadline comparison
  const [mountTimeSec] = useState<bigint>(() => BigInt(Math.floor(Date.now() / 1000)))
  const isExpiredGrant = grant.deadline > 0n
    && mountTimeSec > grant.deadline
    && grant.status !== 2
    && grant.status !== 3

  const handleExpire = () => withChain(() => {
    expireWrite(
      { address: FUNDORA_ADDRESS, abi: FUNDORA_ABI, functionName: 'expireGrant', args: [grant.id] },
      {
        onSuccess: (hash) => { void (hash) },
        onError: (e) => toast.error(parseOnchainError(e)),
      }
    )
  })

  const handleFunderClaim = () => withChain(() => {
    funderClaimWrite(
      { address: FUNDORA_ADDRESS, abi: FUNDORA_ABI, functionName: 'claimFunderRefund' },
      {
        onSuccess: (hash) => { void (hash) },
        onError: (e) => toast.error(parseOnchainError(e)),
      }
    )
  })

  const handleFund = () => withChain(() => {
    const amount = parseAmount(activeChainId, formatUnits(grant.totalAmount, 6))
    const currentAllowance = usdcAllowance ?? 0n

    if (currentAllowance >= amount.raw) {
      fundWrite(
        { address: FUNDORA_ADDRESS, abi: FUNDORA_ABI, functionName: 'fundGrant', args: [grant.id] },
        { onError: (e) => toast.error(parseOnchainError(e)) },
      )
      return
    }

    setAwaitingFundingAfterApprove(true)
    approveWrite(
      { address: USDC_ADDRESS, abi: erc20Abi, functionName: 'approve', args: [FUNDORA_ADDRESS, amount.raw] },
      {
        onError: (e) => {
          setAwaitingFundingAfterApprove(false)
          toast.error(parseOnchainError(e))
        },
      },
    )
  })

  const handleClaim = () => {
    if (isPasskeyConnected) {
      setGaslessLoading(true)
      setGaslessError(null)
      setGaslessTxHash(undefined)
      executeGaslessAction('claimPayment', [])
        .then((hash) => {
          setGaslessTxHash(hash)
          void refetchWithdrawal()
          onRefresh()
          toast.success('Payment claimed via gasless transaction!')
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Gasless claim failed.'
          setGaslessError(msg)
          toast.error(msg)
        })
        .finally(() => setGaslessLoading(false))
      return
    }
    withChain(() => {
      claimWrite(
        { address: FUNDORA_ADDRESS, abi: FUNDORA_ABI, functionName: 'claimPayment' },
        { onError: (e) => toast.error(parseOnchainError(e)) },
      )
    })
  }

  const handleCancel = () => withChain(() => {
    cancelWrite(
      { address: FUNDORA_ADDRESS, abi: FUNDORA_ABI, functionName: 'cancelGrant', args: [grant.id] },
      {
        onSuccess: () => setConfirmCancel(false),
        onError: (e) => { toast.error(parseOnchainError(e)); setConfirmCancel(false) },
      },
    )
  })

  // Bigint arithmetic — no floats on money paths
  const totalAmt    = BigInt(grant.totalAmount)
  const releasedAmt = BigInt(grant.releasedAmount)
  const refundableAmt = totalAmt - releasedAmt
  const progressPct = totalAmt > 0n ? Math.round(Number((releasedAmt * 100n) / totalAmt)) : 0
  // Display strings — formatUnits used only at render time, never stored as number
  const totalStr    = formatUnits(totalAmt, 6)
  const releasedStr = formatUnits(releasedAmt, 6)
  const refundableStr = formatUnits(refundableAmt, 6)
  const hasPendingWithdrawal = pendingWithdrawal !== undefined && pendingWithdrawal > 0n
  const canCancel = isGrantCreatorOrPlatformAdmin && (grant.status === 0 || grant.status === 1)
  const claimConfirmed = claimHash !== undefined && !claimConfirming && !claimPending
  const cancelConfirmed = cancelHash !== undefined && !cancelConfirming && !cancelPending
  const createdDate = formatGrantDate(grant.createdAt)
  const bandColor = STATUS_BAND[grant.status] ?? STATUS_BAND[0]

  const hasSufficientAllowance = (usdcAllowance ?? 0n) >= grant.totalAmount
  const fundStep =
    approvePending || (approveConfirming && awaitingFundingAfterApprove) ? 1
    : fundPending || fundConfirming ? 2
    : 0
  const fundBusy = fundStep > 0
  const fundBtnLabel =
    fundStep === 1 && approvePending ? 'Step 1/2 — Confirm approval in wallet…'
    : fundStep === 1 ? 'Step 1/2 — Approving USDC on Arc…'
    : fundStep === 2 && fundPending ? 'Step 2/2 — Confirm funding in wallet…'
    : fundStep === 2 ? 'Step 2/2 — Funding grant…'
    : hasSufficientAllowance
    ? `Fund Grant — $${totalStr} USDC`
    : `Approve & Fund — $${totalStr} USDC`

  const isObserver = !!address && !isAdmin && !isReviewer && !isBuilder

  return (
    <>
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Back link */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-70 btn-focus rounded-lg px-1"
        style={{ color: 'var(--muted)' }}
        aria-label="Back to all grants"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        All Grants
      </button>

      {/* ── Hero band ─────────────────────────────────────────────────────── */}
      <div
        className="card rounded-2xl overflow-hidden"
        style={{ background: 'var(--warm-surface)', borderColor: 'var(--border)' }}
      >
        {/* Coloured top band */}
        <div className="h-1.5 w-full" style={{ background: bandColor }} aria-hidden="true" />

        <div className="p-4 sm:p-6 space-y-5">
          {/* Title + status — stacks on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1
                className="font-extrabold text-xl sm:text-2xl mb-1.5 leading-tight break-words"
                style={{
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  color: 'var(--ink)',
                  letterSpacing: '-0.03em',
                }}
              >
                {grant.title}
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                {grant.description || 'No description provided.'}
              </p>
              {createdDate && (
                <div className="flex items-center gap-1 text-xs mt-2" style={{ color: 'var(--subtle)' }}>
                  <CalendarDays size={11} aria-hidden="true" />
                  Created {createdDate}
                </div>
              )}
            </div>
            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-1.5 shrink-0">
              <StatusBadge type="grant" status={grant.status} />
              <DeadlineBadge deadline={grant.deadline} />
            </div>
          </div>

          {/* Big USDC amount + progress */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ background: 'var(--warm-bg-2)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-end justify-between flex-wrap gap-3">
              <div>
                <div className="text-xs font-medium mb-1 uppercase tracking-wide" style={{ color: 'var(--subtle)' }}>
                  Total Grant
                </div>
                <div
                  className="text-3xl font-extrabold tabular-nums leading-none"
                  style={{
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    color: 'var(--teal)',
                    letterSpacing: '-0.03em',
                  }}
                >
                  ${totalStr}
                  <span className="text-base font-semibold ml-1" style={{ color: 'var(--teal)', opacity: 0.7 }}>USDC</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium mb-1 uppercase tracking-wide" style={{ color: 'var(--subtle)' }}>
                  Released
                </div>
                <div className="text-xl font-bold tabular-nums" style={{ color: 'var(--ink)', letterSpacing: '-0.02em', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                  ${releasedStr}
                </div>
              </div>
            </div>

            <div>
              <div
                className="h-2.5 rounded-full overflow-hidden"
                style={{ background: '#e9e7e4' }}
                role="progressbar"
                aria-valuenow={progressPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Funding progress"
              >
                <div
                  className="h-full rounded-full transition-all duration-500 progress-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1.5" style={{ color: 'var(--subtle)' }}>
                <span>{progressPct}% released</span>
                <span>{milestoneCount} milestone{milestoneCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* Builder info */}
          {!noBuilder && (
            <div
              className="text-xs rounded-xl px-3 py-2.5 flex items-center gap-2"
              style={{ background: 'var(--warm-bg-2)', color: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              <span style={{ color: 'var(--subtle)' }}>Builder:</span>
              <span className="mono font-medium break-all" style={{ color: 'var(--ink)', fontSize: '11px' }}>
                {grant.builder.slice(0, 10)}…{grant.builder.slice(-6)}
              </span>
              {isBuilder && (
                <span className="font-semibold" style={{ color: 'var(--brand)' }}>← you</span>
              )}
            </div>
          )}

          {/* Required approvals */}
          {requiredApprovals !== undefined && requiredApprovals > 0n && (
            <div className="text-xs" style={{ color: 'var(--subtle)' }}>
              {requiredApprovals.toString()} reviewer approval{requiredApprovals > 1n ? 's' : ''} required per milestone
            </div>
          )}

          {/* Actions zone */}
          <div className="border-t pt-5" style={{ borderColor: 'var(--border)' }}>
            <div className="label-caps mb-3" style={{ color: 'var(--subtle)' }}>Actions</div>

            {/* Gasless path indicator */}
            {isPasskeyConnected && (
              <div
                className="rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-medium mb-3"
                style={{ background: 'var(--brand-light)', borderColor: 'var(--brand-border)', border: '1px solid var(--brand-border)', color: 'var(--brand)' }}
              >
                <Fingerprint size={12} aria-hidden="true" />
                <span>Gasless mode — transactions are sponsored on Arc via Circle Gas Station</span>
              </div>
            )}

            {/* Gasless tx status */}
            {gaslessLoading && (
              <div
                className="rounded-xl px-3 py-2.5 flex items-center gap-2 text-sm mb-3"
                style={{ background: 'var(--brand-light)', border: '1px solid var(--brand-border)', color: 'var(--brand)' }}
                role="status"
                aria-live="polite"
              >
                <Loader2 size={14} className="animate-spin shrink-0" aria-hidden="true" />
                <span>Submitting gasless transaction on Arc…</span>
              </div>
            )}
            {!gaslessLoading && gaslessTxHash && (
              <a
                href={buildTxExplorerUrl(ARC_TESTNET_ID, gaslessTxHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs mb-3 font-semibold"
                style={{ color: 'var(--brand)' }}
              >
                <Zap size={11} aria-hidden="true" />
                Gasless transaction confirmed — view on explorer
                <ExternalLink size={10} aria-hidden="true" />
              </a>
            )}
            {!gaslessLoading && gaslessError && (
              <div
                className="rounded-xl px-3 py-2.5 flex items-start gap-2 text-xs mb-3"
                style={{ background: 'var(--rose-light)', border: '1px solid var(--rose-border)', color: 'var(--rose)' }}
                role="alert"
              >
                <AlertCircle size={12} className="shrink-0 mt-0.5" aria-hidden="true" />
                <span>{gaslessError}</span>
              </div>
            )}

            {/* Wrong-chain banner */}
            {isWrongChain && (
              <div
                className="rounded-xl px-3 py-2.5 flex items-center gap-2 text-sm mb-3"
                style={{ background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' }}
              >
                <AlertCircle size={14} className="shrink-0" />
                <span className="flex-1">Wrong network. Switch to Arc {activeChainId === ARC_MAINNET_ID ? 'Mainnet' : 'Testnet'} to interact.</span>
                <button
                  onClick={() => withChain(() => { /* fires queued action after switch */ })}
                  className="text-xs font-semibold underline shrink-0 btn-focus rounded"
                  aria-label="Switch network"
                >
                  Switch
                </button>
                {pendingAction && (
                  <span className="text-xs opacity-70 shrink-0">Will retry after switch.</span>
                )}
              </div>
            )}

            {/* Fund grant */}
            {grant.status === 0 && isGrantCreatorOrPlatformAdmin && (
              <div className="space-y-2 mb-3">
                <button
                  onClick={handleFund}
                  disabled={fundBusy || isWrongChain || grant.totalAmount === 0n}
                  title={
                    isWrongChain ? 'Switch network first'
                    : grant.totalAmount === 0n ? 'Grant has no milestone amounts set'
                    : undefined
                  }
                  className="w-full h-11 rounded-full text-sm font-bold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2 btn-focus"
                  style={{
                    background: 'var(--brand)',
                    boxShadow: fundBusy ? 'none' : '0 4px 14px rgba(99,102,241,0.30)',
                  }}
                >
                  {fundBusy && <Loader2 size={14} className="animate-spin" />}
                  {fundBtnLabel}
                </button>
                {fundBusy && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                      style={{ background: fundStep >= 1 ? 'var(--brand)' : 'var(--subtle)', fontSize: '10px' }}
                    >1</span>
                    <span style={{ color: fundStep === 1 ? 'var(--ink)' : 'var(--subtle)', fontWeight: fundStep === 1 ? 600 : 400 }}>
                      Approve USDC
                    </span>
                    <span style={{ color: 'var(--subtle)' }}>→</span>
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                      style={{ background: fundStep >= 2 ? 'var(--brand)' : 'var(--subtle)', fontSize: '10px' }}
                    >2</span>
                    <span style={{ color: fundStep === 2 ? 'var(--ink)' : 'var(--subtle)', fontWeight: fundStep === 2 ? 600 : 400 }}>
                      Fund grant
                    </span>
                  </div>
                )}

                {/* Cross-chain funding option — visible on Arc or any CCTP source chain */}
                {!fundBusy && (chainId === activeChainId || (chainId !== undefined && getCCTPChain(chainId) !== undefined)) && (
                  <button
                    type="button"
                    onClick={() => setShowCrossChainModal(true)}
                    disabled={grant.totalAmount === 0n}
                    className="w-full h-9 rounded-full text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 btn-focus"
                    style={{
                      background: 'var(--warm-surface)',
                      border: '1.5px solid var(--brand-border)',
                      color: 'var(--brand)',
                    }}
                    title="Bridge USDC from Base, Arbitrum, or Ethereum to Arc via CCTP, then fund the grant"
                  >
                    <Globe size={12} />
                    Fund from Base / Arbitrum / ETH via CCTP
                  </button>
                )}
              </div>
            )}

            {/* Apply as builder — wagmi or gasless */}
            {grant.status === 1 && noBuilder && !isReviewer && !isAdmin && (
              <button
                onClick={handleApply}
                disabled={
                  isPasskeyConnected
                    ? gaslessLoading
                    : (applyPending || applyConfirming || isWrongChain)
                }
                title={!isPasskeyConnected && isWrongChain ? 'Switch network first' : undefined}
                className="w-full h-11 rounded-full text-sm font-bold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2 btn-focus mb-3"
                style={{
                  background: 'var(--brand)',
                  boxShadow: '0 4px 14px rgba(99,102,241,0.30)',
                }}
              >
                {isPasskeyConnected ? (
                  <>
                    {gaslessLoading
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Fingerprint size={14} aria-hidden="true" />}
                    {gaslessLoading ? 'Submitting gasless tx…' : 'Apply as Builder (Gasless)'}
                  </>
                ) : (
                  <>
                    {(applyPending || applyConfirming) && <Loader2 size={14} className="animate-spin" />}
                    {applyPending ? 'Confirm in wallet…' : applyConfirming ? 'Confirming…' : 'Apply as Builder'}
                  </>
                )}
              </button>
            )}

            {/* Observer hints */}
            {isObserver && grant.status === 1 && noBuilder && (
              <div
                className="rounded-xl px-3 py-2.5 flex items-start gap-2 text-xs mb-3"
                style={{ background: 'var(--warm-bg-2)', color: 'var(--muted)', border: '1px solid var(--border)' }}
              >
                <Info size={12} className="shrink-0 mt-0.5" style={{ color: 'var(--subtle)' }} />
                This grant is open for applications. Connect a non-reviewer wallet to apply as the builder.
              </div>
            )}
            {isObserver && grant.status === 1 && !noBuilder && (
              <div
                className="rounded-xl px-3 py-2.5 flex items-start gap-2 text-xs mb-3"
                style={{ background: 'var(--warm-bg-2)', color: 'var(--muted)', border: '1px solid var(--border)' }}
              >
                <Info size={12} className="shrink-0 mt-0.5" style={{ color: 'var(--subtle)' }} />
                A builder is actively working on this grant. Milestone submissions and reviewer votes appear below.
              </div>
            )}

            {/* Pending USDC claim — wagmi or gasless */}
            {hasPendingWithdrawal && (
              <div
                className="rounded-xl border p-4 flex items-center justify-between gap-3 mb-3"
                style={{ background: 'var(--teal-light)', borderColor: 'var(--teal-border)' }}
              >
                <div>
                  <div className="text-sm font-bold" style={{ color: 'var(--teal)', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                    ${formatUnits(pendingWithdrawal, 6)} USDC ready to claim
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                    Approved milestone payment — claim to your wallet
                  </div>
                </div>
                <button
                  onClick={handleClaim}
                  disabled={
                    isPasskeyConnected
                      ? gaslessLoading
                      : (claimPending || claimConfirming || isWrongChain)
                  }
                  title={!isPasskeyConnected && isWrongChain ? 'Switch network first' : undefined}
                  className="px-4 h-9 rounded-full text-sm font-bold text-white flex items-center gap-1.5 disabled:opacity-60 shrink-0 btn-focus"
                  style={{ background: 'var(--teal)', boxShadow: '0 2px 8px rgba(13,148,136,0.25)' }}
                >
                  {isPasskeyConnected ? (
                    <>
                      {gaslessLoading && <Loader2 size={12} className="animate-spin" />}
                      {gaslessLoading ? 'Claiming…' : 'Claim USDC (Gasless)'}
                    </>
                  ) : (
                    <>
                      {(claimPending || claimConfirming) && <Loader2 size={12} className="animate-spin" />}
                      {claimPending ? 'Confirm…' : claimConfirming ? 'Claiming…' : 'Claim USDC'}
                    </>
                  )}
                </button>
              </div>
            )}

            {claimHash && (
              <a
                href={buildTxExplorerUrl(activeChainId, claimHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs mb-3"
                style={{ color: 'var(--brand)' }}
              >
                <ExternalLink size={11} />
                {claimConfirmed ? 'Payment confirmed — view on explorer' : 'View pending claim on explorer'}
              </a>
            )}

            {/* Cancel button */}
            {canCancel && !confirmCancel && !cancelSuccess && (
              <button
                onClick={() => setConfirmCancel(true)}
                disabled={isWrongChain}
                title={isWrongChain ? 'Switch network first' : undefined}
                className="w-full h-9 rounded-full text-sm font-semibold flex items-center justify-center gap-1.5 border transition-all hover:opacity-80 disabled:opacity-50 btn-focus"
                style={{ color: 'var(--coral)', borderColor: 'var(--coral-border)', background: 'var(--coral-light)' }}
              >
                <Ban size={13} />
                Cancel Grant & Refund
              </button>
            )}

            {/* Cancel confirm */}
            {canCancel && confirmCancel && (
              <div
                className="rounded-xl border p-4 space-y-3"
                style={{ borderColor: 'var(--coral-border)', background: 'var(--coral-light)' }}
              >
                <div className="flex items-start gap-2 text-sm" style={{ color: '#7f1d1d' }}>
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <span>
                    Cancel this grant? <strong>${refundableStr} USDC</strong> of unreleased funds will
                    be returned to the funder. This cannot be undone.
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={cancelPending || cancelConfirming || isWrongChain}
                    className="flex-1 h-9 rounded-full text-sm font-bold text-white flex items-center justify-center gap-1.5 disabled:opacity-60 btn-focus"
                    style={{ background: 'var(--coral)' }}
                  >
                    {(cancelPending || cancelConfirming) && <Loader2 size={13} className="animate-spin" />}
                    {cancelPending ? 'Confirm in wallet…' : cancelConfirming ? 'Cancelling…' : 'Yes, Cancel Grant'}
                  </button>
                  <button
                    onClick={() => setConfirmCancel(false)}
                    disabled={cancelPending || cancelConfirming}
                    className="flex-1 h-9 rounded-full text-sm font-semibold border disabled:opacity-50 btn-focus"
                    style={{ color: 'var(--ink)', borderColor: 'var(--border)', background: 'var(--warm-surface)' }}
                  >
                    Keep Grant
                  </button>
                </div>
                {cancelHash && (
                  <a
                    href={buildTxExplorerUrl(activeChainId, cancelHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs btn-focus rounded"
                    style={{ color: 'var(--coral)' }}
                  >
                    <ExternalLink size={10} aria-hidden="true" />
                    {cancelConfirmed ? 'Cancellation confirmed — view on explorer' : 'Confirming cancellation…'}
                  </a>
                )}
              </div>
            )}
            {/* Expire grant — admin, when deadline has passed */}
            {isAdmin && isExpiredGrant && (
              <div className="space-y-2 mt-1">
                <button
                  onClick={handleExpire}
                  disabled={expirePending || expireConfirming || isWrongChain}
                  title={isWrongChain ? 'Switch network first' : undefined}
                  className="w-full h-9 rounded-full text-sm font-semibold flex items-center justify-center gap-1.5 border transition-all hover:opacity-80 disabled:opacity-50 btn-focus"
                  style={{ color: 'var(--amber)', borderColor: 'var(--amber-border)', background: 'var(--amber-light)' }}
                >
                  {(expirePending || expireConfirming) && <Loader2 size={13} className="animate-spin" />}
                  {expirePending ? 'Confirm in wallet…' : expireConfirming ? 'Expiring…' : 'Expire Grant (deadline passed)'}
                </button>
                {expireHash && (
                  <a
                    href={buildTxExplorerUrl(activeChainId, expireHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs"
                    style={{ color: 'var(--brand)' }}
                  >
                    <ExternalLink size={10} />
                    {expireConfirming ? 'Confirming expiry…' : 'Expiry confirmed — view on explorer'}
                  </a>
                )}
              </div>
            )}

            {/* Funder refund claim — funder on cancelled/expired grant */}
            {hasFunderRefund && (
              <div
                className="rounded-xl border p-4 flex items-center justify-between gap-3 mt-1"
                style={{ background: 'var(--teal-light)', borderColor: 'var(--teal-border)' }}
              >
                <div>
                  <div className="text-sm font-bold" style={{ color: 'var(--teal)', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                    ${formatUnits(pendingFunderRefund, 6)} USDC refund available
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                    Grant cancelled — claim your unreleased USDC
                  </div>
                </div>
                <button
                  onClick={handleFunderClaim}
                  disabled={funderClaimPending || funderClaimConfirming || isWrongChain}
                  title={isWrongChain ? 'Switch network first' : undefined}
                  className="px-4 h-9 rounded-full text-sm font-bold text-white flex items-center gap-1.5 disabled:opacity-60 shrink-0 btn-focus"
                  style={{ background: 'var(--teal)', boxShadow: '0 2px 8px rgba(13,148,136,0.25)' }}
                >
                  {(funderClaimPending || funderClaimConfirming) && <Loader2 size={12} className="animate-spin" />}
                  {funderClaimPending ? 'Confirm…' : funderClaimConfirming ? 'Claiming…' : 'Claim Refund'}
                </button>
              </div>
            )}
            {funderClaimHash && (
              <a
                href={buildTxExplorerUrl(activeChainId, funderClaimHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs"
                style={{ color: 'var(--brand)' }}
              >
                <ExternalLink size={10} />
                {funderClaimConfirming ? 'View pending refund on explorer' : 'Refund confirmed — view on explorer'}
              </a>
            )}
          </div>{/* end actions */}
        </div>
      </div>

      {/* ── Milestones ─────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h2
          className="font-bold text-lg px-1"
          style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: 'var(--ink)', letterSpacing: '-0.02em' }}
        >
          Milestones{' '}
          <span className="font-normal text-base" style={{ color: 'var(--subtle)' }}>
            ({milestonesLoading && milestoneCount === 0 ? '…' : milestoneCount})
          </span>
        </h2>

        {/* Milestones RPC error */}
        {milestonesError && (
          <div
            className="rounded-2xl border p-6 text-center space-y-2"
            style={{ background: 'var(--warm-surface)', borderColor: 'var(--coral-border)' }}
          >
            <AlertCircle size={18} className="mx-auto" style={{ color: 'var(--coral)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Could not load milestones</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              A network error occurred. The page retries automatically.
            </p>
          </div>
        )}

        {/* Milestone skeletons */}
        {!milestonesError && milestoneResults === undefined && milestonesLoading && milestoneCount > 0 && (
          Array.from({ length: milestoneCount }, (_, i) => (
            <div
              key={i}
              className="rounded-2xl border overflow-hidden animate-pulse"
              style={{ background: 'var(--warm-surface)', borderColor: 'var(--border)' }}
            >
              <div className="h-1 w-full" style={{ background: '#e7e5e4' }} />
              <div className="p-5 space-y-3">
                <div className="flex justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <div className="h-3 rounded-full w-20" style={{ background: '#f0ede8' }} />
                    <div className="h-4 rounded-full w-48" style={{ background: '#f0ede8' }} />
                  </div>
                  <div className="h-5 w-16 rounded-full" style={{ background: '#f0ede8' }} />
                </div>
                <div className="h-3 rounded-full w-full" style={{ background: '#f0ede8' }} />
              </div>
            </div>
          ))
        )}

        {/* No milestones */}
        {!milestonesError && !milestonesLoading && milestoneCount === 0 && (
          <div
            className="rounded-2xl border p-6 text-center"
            style={{ background: 'var(--warm-surface)', borderColor: 'var(--border)' }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>No milestones defined</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              This grant has no milestones. Contact the grant admin.
            </p>
          </div>
        )}

        {/* Milestone cards */}
        {!milestonesError && milestones.map((ms, i) => (
          <MilestoneCard
            key={i}
            milestone={ms}
            index={i}
            grant={grant}
            isBuilder={isBuilder}
            isReviewer={!!isReviewer}
            requiredApprovals={Number(requiredApprovals ?? 1n)}
            isWrongChain={isWrongChain}
            activeChainId={activeChainId}
            onRefreshMilestones={() => void refetchMilestones()}
            onRefresh={onRefresh}
          />
        ))}
      </div>
    </div>

    {/* Cross-chain funding modal — outside the layout div so it overlays correctly */}
    {showCrossChainModal && (
      <CrossChainFundModal
        grant={grant}
        activeChainId={activeChainId}
        onClose={() => { setShowCrossChainModal(false) }}
        onBridgeComplete={() => {
          toast.success(
            'USDC arrived on Arc! Switch to Arc network and click "Fund Grant" to deposit it into the grant escrow.',
            { duration: 8000 },
          )
        }}
      />
    )}
    </>
  )
}

// ── MilestoneCard ─────────────────────────────────────────────────────────────
interface MilestoneCardProps {
  milestone: Milestone
  index: number
  grant: Grant
  isBuilder: boolean
  isReviewer: boolean
  requiredApprovals: number
  isWrongChain: boolean
  activeChainId: number
  onRefreshMilestones: () => void
  onRefresh: () => void
}

// Left border colour per milestone status
const MILESTONE_BORDER_COLOR: Record<number, string> = {
  0: '#d6d3d1',    // Pending — subtle
  1: '#fbbf24',    // In Review — amber
  2: '#2dd4bf',    // Approved — teal
  3: '#fb7185',    // Rejected — coral
}

function MilestoneCard({
  milestone, index, grant,
  isBuilder, isReviewer, requiredApprovals,
  isWrongChain, activeChainId, onRefreshMilestones, onRefresh,
}: MilestoneCardProps) {
  const { address } = useAccount()
  const publicClient = usePublicClient({ chainId: activeChainId })
  const { isPasskeyConnected, executeGaslessAction } = usePasskeyContext()
  const { data: approvalCount } = useApprovalCount(grant.id, index)
  const { data: hasVoted } = useReviewerVote(
    isReviewer ? grant.id : null,
    index,
    address,
  )
  const FUNDORA_ADDRESS = getContractAddress(activeChainId)
  const amountStr = formatUnits(milestone.amount, 6)

  const [evidenceInput, setEvidenceInput] = useState('')
  const [submitHash, setSubmitHash] = useState<`0x${string}` | undefined>()
  const [reviewHash, setReviewHash] = useState<`0x${string}` | undefined>()
  const [gaslessSubmitLoading, setGaslessSubmitLoading] = useState(false)
  const [gaslessSubmitError, setGaslessSubmitError] = useState<string | null>(null)

  const [evidenceUri, setEvidenceUri] = useState<string | null>(() =>
    readEvidenceFromCache(activeChainId, grant.id, index)
  )
  const [evidenceTxHash, setEvidenceTxHash] = useState<`0x${string}` | undefined>(submitHash)
  const [evidenceLoading, setEvidenceLoading] = useState(false)

  // Fix 2: Query MilestoneSubmitted event log onchain when evidence is submitted
  useEffect(() => {
    if (!hasEvidence(milestone.evidenceHash) || evidenceUri || !publicClient) return
    let cancelled = false
    setEvidenceLoading(true)

    publicClient.getLogs({
      address: FUNDORA_ADDRESS,
      event: {
        type: 'event',
        name: 'MilestoneSubmitted',
        inputs: [
          { name: 'grantId', type: 'uint256', indexed: true },
          { name: 'milestoneIndex', type: 'uint256', indexed: true },
          { name: 'evidenceUri', type: 'string', indexed: false },
          { name: 'builder', type: 'address', indexed: true },
        ],
      },
      args: {
        grantId: grant.id,
        milestoneIndex: BigInt(index),
      },
      fromBlock: 0n,
      toBlock: 'latest',
    }).then(logs => {
      if (cancelled || !logs || logs.length === 0) return
      const lastLog = logs[logs.length - 1]
      const uri = (lastLog.args as { evidenceUri?: string }).evidenceUri
      if (uri) {
        setEvidenceUri(uri)
        saveEvidenceToCache(activeChainId, grant.id, index, uri)
        if (lastLog.transactionHash) {
          setEvidenceTxHash(lastLog.transactionHash)
        }
      }
    }).catch((err) => {
      console.warn('Could not fetch MilestoneSubmitted event log:', err)
    }).finally(() => {
      if (!cancelled) setEvidenceLoading(false)
    })

    return () => { cancelled = true }
  }, [milestone.evidenceHash, evidenceUri, publicClient, FUNDORA_ADDRESS, grant.id, index, activeChainId])

  const { writeContract: submitWrite, isPending: submitPending } = useWriteContract()
  const { writeContract: reviewWrite, isPending: reviewPending } = useWriteContract()

  const { isLoading: submitConfirming, isSuccess: submitSuccess } =
    useWaitForTransactionReceipt({ hash: submitHash })
  const { isLoading: reviewConfirming, isSuccess: reviewSuccess } =
    useWaitForTransactionReceipt({ hash: reviewHash })

  useEffect(() => {
    if (submitSuccess) { onRefreshMilestones(); onRefresh() }
  }, [submitSuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (reviewSuccess) { onRefreshMilestones(); onRefresh() }
  }, [reviewSuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  const canSubmit = isBuilder && grant.status === 1 && (milestone.status === 0 || milestone.status === 3)
  const canReview = isReviewer && milestone.status === 1 && !hasVoted
  const alreadyVoted = isReviewer && milestone.status === 1 && hasVoted === true
  const isSubmitting = isPasskeyConnected ? gaslessSubmitLoading : (submitPending || submitConfirming)
  const isReviewing = reviewPending || reviewConfirming
  const submitConfirmed = !!submitHash && !submitConfirming && !submitPending
  const reviewConfirmed = !!reviewHash && !reviewConfirming && !reviewPending
  const evidenceSubmitted = hasEvidence(milestone.evidenceHash)

  const leftBorderColor = MILESTONE_BORDER_COLOR[milestone.status] ?? MILESTONE_BORDER_COLOR[0]

  const handleSubmit = () => {
    const uri = evidenceInput.trim()
    if (!uri) { toast.error('Please enter an evidence URL or IPFS CID.'); return }

    if (isPasskeyConnected) {
      setGaslessSubmitLoading(true)
      setGaslessSubmitError(null)
      executeGaslessAction('submitMilestoneEvidence', [grant.id, BigInt(index), uri])
        .then((hash) => {
          setSubmitHash(hash)
          setEvidenceTxHash(hash)
          setEvidenceInput('')
          saveEvidenceToCache(activeChainId, grant.id, index, uri)
          setEvidenceUri(uri)
          onRefreshMilestones()
          onRefresh()
          toast.success('Evidence submitted via gasless transaction!')
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Gasless submission failed.'
          setGaslessSubmitError(msg)
          toast.error(msg)
        })
        .finally(() => setGaslessSubmitLoading(false))
      return
    }

    submitWrite(
      {
        address: FUNDORA_ADDRESS,
        abi: FUNDORA_ABI,
        functionName: 'submitMilestoneEvidence',
        args: [grant.id, BigInt(index), uri],
      },
      {
        onSuccess: (hash) => {
          setSubmitHash(hash)
          setEvidenceTxHash(hash)
          setEvidenceInput('')
          saveEvidenceToCache(activeChainId, grant.id, index, uri)
          setEvidenceUri(uri)
        },
        onError: (e) => toast.error(parseOnchainError(e)),
      },
    )
  }

  const handleReview = (approve: boolean) => {
    reviewWrite(
      {
        address: FUNDORA_ADDRESS,
        abi: FUNDORA_ABI,
        functionName: 'reviewMilestone',
        args: [grant.id, BigInt(index), approve],
      },
      {
        onSuccess: (hash) => setReviewHash(hash),
        onError: (e) => toast.error(parseOnchainError(e)),
      },
    )
  }

  return (
    <article
      aria-label={`Milestone ${index + 1}: ${milestone.title}`}
      className="card rounded-2xl overflow-hidden"
      style={{
        background: 'var(--warm-surface)',
        borderColor: 'var(--border)',
        borderLeft: `4px solid ${leftBorderColor}`,
      }}
    >
      <div className="p-5 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--subtle)' }}>
                Milestone {index + 1}
              </span>
              <span
                className="tabular-nums text-sm font-bold"
                style={{
                  color: 'var(--teal)',
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                }}
              >
                ${amountStr} USDC
              </span>
            </div>
            <h4
              className="font-semibold text-base"
              style={{ color: 'var(--ink)', fontFamily: '"Plus Jakarta Sans", sans-serif', letterSpacing: '-0.01em' }}
            >
              {milestone.title}
            </h4>
            {milestone.description && (
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--muted)' }}>
                {milestone.description}
              </p>
            )}
          </div>
          <StatusBadge type="milestone" status={milestone.status} className="shrink-0" />
        </div>

        {/* Evidence block */}
        {evidenceSubmitted && (
          <div
            className="rounded-xl px-3 py-2.5 text-xs space-y-2"
            style={{ background: 'var(--warm-bg-2)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <span className="font-medium mr-1.5" style={{ color: 'var(--subtle)' }}>Evidence hash:</span>
                <span className="mono" style={{ color: 'var(--ink)', fontSize: '10px' }}>
                  {shortHash(milestone.evidenceHash)}
                </span>
              </div>
              {(submitHash || evidenceTxHash) && (
                <a
                  href={buildTxExplorerUrl(activeChainId, (submitHash || evidenceTxHash)!)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-semibold btn-focus rounded"
                  style={{ color: 'var(--brand)' }}
                  aria-label="View evidence submission on explorer"
                >
                  <ExternalLink size={10} aria-hidden="true" />
                  View on explorer
                </a>
              )}
            </div>

            {evidenceLoading ? (
              <div className="flex items-center gap-1.5 py-1 text-xs" style={{ color: 'var(--muted)' }}>
                <Loader2 size={12} className="animate-spin" />
                <span>Reading onchain submission from Arc…</span>
              </div>
            ) : evidenceUri ? (
              <div className="space-y-0.5">
                <div className="font-medium" style={{ color: 'var(--subtle)' }}>Submitted Evidence:</div>
                {(() => {
                  const parsed = formatEvidenceLink(evidenceUri)
                  if (parsed.isLink) {
                    return (
                      <a
                        href={parsed.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold break-all leading-snug btn-focus rounded underline"
                        style={{ color: 'var(--brand)' }}
                        aria-label={`Evidence link: ${parsed.label}`}
                      >
                        {parsed.label}
                        <ExternalLink size={11} className="shrink-0" aria-hidden="true" />
                      </a>
                    )
                  }
                  return (
                    <div className="break-all font-mono text-[11px] leading-snug" style={{ color: 'var(--ink)' }}>
                      {parsed.label}
                    </div>
                  )
                })()}
              </div>
            ) : (
              <div style={{ color: 'var(--subtle)', lineHeight: 1.4 }}>
                Hash recorded onchain. Full submission was emitted in the <span className="font-semibold">MilestoneSubmitted</span> event.
              </div>
            )}
          </div>
        )}

        {/* Approval progress */}
        {milestone.status === 1 && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--subtle)' }}>
            <CheckCircle size={11} style={{ color: 'var(--teal)' }} aria-hidden="true" />
            {Number(approvalCount ?? 0n)} / {requiredApprovals} approval{requiredApprovals !== 1 ? 's' : ''}
          </div>
        )}

        {/* Builder: submit evidence — wagmi or gasless */}
        {canSubmit && (
          <div className="space-y-2">
            <div className="space-y-1">
              <input
                value={evidenceInput}
                onChange={(e) => setEvidenceInput(e.target.value)}
                placeholder="GitHub PR URL, IPFS CID, demo link…"
                disabled={isSubmitting || (!isPasskeyConnected && isWrongChain)}
                maxLength={500}
                className="w-full h-10 rounded-xl border px-3 text-sm outline-none disabled:opacity-50 btn-focus transition-all"
                style={{
                  background: 'var(--warm-bg-2)',
                  borderColor: 'var(--border)',
                  color: 'var(--ink)',
                }}
                aria-label="Evidence URL or IPFS CID"
              />
              {evidenceInput.length > 300 && (
                <div
                  className="text-right text-xs tabular-nums"
                  style={{ color: evidenceInput.length > 450 ? 'var(--coral)' : 'var(--subtle)' }}
                >
                  {evidenceInput.length}/500
                </div>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !evidenceInput.trim() || (!isPasskeyConnected && isWrongChain)}
              title={
                !isPasskeyConnected && isWrongChain ? 'Switch network first'
                : !evidenceInput.trim() ? 'Enter an evidence URL first'
                : undefined
              }
              className="w-full h-9 rounded-full text-sm font-bold text-white flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all btn-focus"
              style={{
                background: 'var(--brand)',
                boxShadow: isSubmitting ? 'none' : '0 2px 8px rgba(99,102,241,0.25)',
              }}
            >
              {isSubmitting
                ? <Loader2 size={13} className="animate-spin" />
                : isPasskeyConnected
                  ? <Fingerprint size={13} aria-hidden="true" />
                  : <Send size={13} aria-hidden="true" />}
              {isSubmitting
                ? (isPasskeyConnected ? 'Submitting gasless tx…' : submitPending ? 'Confirm in wallet…' : 'Submitting…')
                : isPasskeyConnected ? 'Submit Evidence (Gasless)' : 'Submit Evidence'}
            </button>
            {gaslessSubmitError && (
              <div
                className="flex items-start gap-1.5 text-xs"
                style={{ color: 'var(--rose)' }}
                role="alert"
              >
                <AlertCircle size={11} className="shrink-0 mt-0.5" aria-hidden="true" />
                <span>{gaslessSubmitError}</span>
              </div>
            )}
            {submitHash && (
              <a
                href={buildTxExplorerUrl(activeChainId, submitHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs"
                style={{ color: 'var(--brand)' }}
              >
                <ExternalLink size={10} />
                {submitConfirmed ? 'Submission confirmed — view on explorer' : 'View pending submission on explorer'}
              </a>
            )}
          </div>
        )}

        {/* Already voted badge */}
        {alreadyVoted && (
          <div
            className="rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-semibold"
            style={{ background: 'var(--teal-light)', color: 'var(--teal)', border: '1px solid var(--teal-border)' }}
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 size={13} aria-hidden="true" />
            Vote recorded — awaiting other reviewers ({Number(approvalCount ?? 0n)}/{requiredApprovals} approved)
          </div>
        )}

        {/* Reviewer approve / reject */}
        {canReview && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                onClick={() => handleReview(true)}
                disabled={isReviewing || isWrongChain}
                title={isWrongChain ? 'Switch network first' : undefined}
                className="flex-1 h-9 rounded-full text-sm font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all border btn-focus"
                style={{ background: 'var(--teal-light)', color: 'var(--teal)', borderColor: 'var(--teal-border)' }}
                aria-label="Approve milestone"
              >
                {isReviewing ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} aria-hidden="true" />}
                Approve
              </button>
              <button
                onClick={() => handleReview(false)}
                disabled={isReviewing || isWrongChain}
                title={isWrongChain ? 'Switch network first' : undefined}
                className="flex-1 h-9 rounded-full text-sm font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all border btn-focus"
                style={{ background: 'var(--coral-light)', color: 'var(--coral)', borderColor: 'var(--coral-border)' }}
                aria-label="Reject milestone"
              >
                {isReviewing ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} aria-hidden="true" />}
                Reject
              </button>
            </div>
            {reviewHash && (
              <a
                href={buildTxExplorerUrl(activeChainId, reviewHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs"
                style={{ color: 'var(--brand)' }}
              >
                <ExternalLink size={10} />
                {reviewConfirmed ? 'Vote confirmed — view on explorer' : 'View pending vote on explorer'}
              </a>
            )}
          </div>
        )}
      </div>

    </article>
  )
}
