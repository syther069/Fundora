import { useState, useEffect, useCallback } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain, useReadContract } from 'wagmi'
import { erc20Abi, formatUnits } from 'viem'
import {
  ArrowLeft, ExternalLink, Send, CheckCircle, XCircle,
  AlertCircle, Loader2, Ban, AlertTriangle, Info,
  CalendarDays, CheckCircle2, Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import { PROOF_SPRING_ADDRESS, PROOF_SPRING_ABI, ARC_TESTNET_ID, ARC_MAINNET_ID } from '../contracts/proofSpring'
import { getUsdc, buildTxExplorerUrl } from '@/onchain-facts'
import { StatusBadge } from './StatusBadge'
import {
  useMilestones,
  useIsReviewer,
  useRequiredApprovals,
  usePendingWithdrawal,
  useApprovalCount,
  useReviewerVote,
  useGrant,
} from '../hooks/useProofSpring'
import type { Grant, Milestone } from '../hooks/useProofSpring'
import { useEvidenceResolver, saveEvidenceToCache } from '../hooks/useEvidenceResolver'
import { parseOnchainError } from '../utils/errors'


interface Props {
  grant: Grant
  onBack: () => void
  onRefresh: () => void
  isAdmin: boolean
}

// v2: evidenceUri is no longer stored onchain — only its keccak256 hash is stored (gas saving).
// The full URI is emitted in the MilestoneSubmitted event log and is permanently immutable there.
// The hash displayed here acts as a tamper-evident commitment.
// We also cache the URI the builder submitted in localStorage so it shows back to them after submit.
const ZERO_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'
function hasEvidence(hash: `0x${string}` | undefined): boolean {
  return !!hash && hash !== ZERO_HASH
}
function shortHash(hash: `0x${string}`): string {
  return `${hash.slice(0, 10)}…${hash.slice(-8)}`
}

// C5: format Unix timestamp bigint to locale date
function formatGrantDate(ts: bigint): string {
  if (!ts || ts === 0n) return ''
  try {
    return new Date(Number(ts) * 1000).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  } catch { return '' }
}

export function GrantDetail({ grant: grantProp, onBack, onRefresh, isAdmin }: Props) {
  const { address, chainId } = useAccount()
  const { switchChain } = useSwitchChain()
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  // M10: inline cancel confirm — replaces window.confirm
  const [confirmCancel, setConfirmCancel] = useState(false)

  // Live grant data — merges prop with fresh chain state
  const { data: liveGrant } = useGrant(grantProp.id)
  const grant = (liveGrant) ?? grantProp

  const { data: isReviewer } = useIsReviewer(address)
  const { data: requiredApprovals } = useRequiredApprovals()
  const { data: pendingWithdrawal, refetch: refetchWithdrawal } = usePendingWithdrawal(address)
  const milestoneCount = Number(grant.milestoneCount)

  // C3: read isError from useMilestones
  const {
    data: milestoneResults,
    refetch: refetchMilestones,
    isFetching: milestonesLoading,
    isError: milestonesError,
  } = useMilestones(grant.id, milestoneCount)

  const milestones: Milestone[] = (milestoneResults ?? []).map(r => r.result as Milestone).filter(Boolean)

  const isArcChain = chainId === ARC_MAINNET_ID || chainId === ARC_TESTNET_ID
  const targetChainId = chainId === ARC_MAINNET_ID ? ARC_MAINNET_ID : ARC_TESTNET_ID
  // Gates write buttons if not on Arc Mainnet or Testnet
  const isWrongChain = !isArcChain

  const usdcFact = getUsdc(targetChainId) || getUsdc(ARC_TESTNET_ID)!
  const USDC_ADDRESS = usdcFact.address as `0x${string}`

  // Query USDC allowance for ProofSpring contract on Arc (6 decimals)
  const { data: usdcAllowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address ? [address, PROOF_SPRING_ADDRESS] : undefined,
    query: {
      enabled: !!address && grant.status === 0,
      refetchInterval: 12_000,
    },
    chainId: targetChainId,
  })
  const hasSufficientAllowance = (usdcAllowance ?? 0n) >= grant.totalAmount

  const isBuilder = !!address && address.toLowerCase() === grant.builder?.toLowerCase()
  const noBuilder = !grant.builder || grant.builder === '0x0000000000000000000000000000000000000000'

  // C9: chain-switch + retry
  const withChain = useCallback((action: () => void) => {
    if (isWrongChain) {
      setPendingAction(() => action)
      switchChain(
        { chainId: ARC_MAINNET_ID },
        { onSuccess: () => { action(); setPendingAction(null) } },
      )
      return
    }
    action()
  }, [isWrongChain, switchChain])

  // Expiration check: active or open grant past deadline
  const [nowSeconds] = useState(() => Math.floor(Date.now() / 1000))
  const isExpired = grant.deadline > 0n && BigInt(nowSeconds) > grant.deadline
  const canExpire = (grant.status === 1 || grant.status === 2) && isExpired

  const [confirmExpire, setConfirmExpire] = useState(false)
  const { writeContract: expireWrite, data: expireHash, isPending: expirePending } = useWriteContract()
  const { isLoading: expireConfirming, isSuccess: expireSuccess } =
    useWaitForTransactionReceipt({ hash: expireHash })

  const expireConfirmed = !!expireHash && !expireConfirming && !expirePending

  useEffect(() => {
    if (expireSuccess) {
      onRefresh()
      toast.success('Grant expired! Remaining escrow queued for funder refund.')
      queueMicrotask(() => {
        setConfirmExpire(false)
      })
    }
  }, [expireSuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleExpire = () => withChain(() => {
    expireWrite(
      {
        address: PROOF_SPRING_ADDRESS,
        abi: PROOF_SPRING_ABI,
        functionName: 'expireGrant',
        args: [grant.id],
      },
      {
        onError: (e) => toast.error(parseOnchainError(e)),
      },
    )
  })


  // ── Apply for grant ──
  const { writeContract: applyWrite, data: applyHash, isPending: applyPending } = useWriteContract()
  const { isLoading: applyConfirming, isSuccess: applySuccess } = useWaitForTransactionReceipt({ hash: applyHash })
  useEffect(() => {
    if (applySuccess) {
      void refetchMilestones()
      onRefresh()
      // M14: explicit success toast — button disappearing alone isn't enough feedback
      toast.success('Application confirmed! You are now the builder for this grant.')
    }
  }, [applySuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Approve USDC + Fund grant (two-step) ──
  const { writeContract: approveWrite, data: approveHash, isPending: approvePending } = useWriteContract()
  const { isLoading: approveConfirming, isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash })
  const { writeContract: fundWrite, data: fundHash, isPending: fundPending } = useWriteContract()
  const { isLoading: fundConfirming, isSuccess: fundSuccess } = useWaitForTransactionReceipt({ hash: fundHash })

  // Refresh allowance and notify admin when approval tx confirms
  useEffect(() => {
    if (approveSuccess) {
      void refetchAllowance()
      toast.success('USDC spend approved! Click "Step 2/2 — Fund Grant" to complete escrow funding.')
    }
  }, [approveSuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (fundSuccess) { onRefresh(); toast.success('Grant funded! Builders can now apply.') }
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
  useEffect(() => {
    if (cancelSuccess) { onRefresh(); toast.success('Grant cancelled. Unreleased USDC refunded.') }
  }, [cancelSuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleApply = () => withChain(() => {
    applyWrite({
      address: PROOF_SPRING_ADDRESS,
      abi: PROOF_SPRING_ABI,
      functionName: 'applyForGrant',
      args: [grant.id],
    }, { onError: (e) => toast.error(parseOnchainError(e)) })
  })

  const handleFund = () => withChain(() => {
    // If allowance already covers totalAmount, execute fundGrant directly
    if (hasSufficientAllowance) {
      fundWrite(
        { address: PROOF_SPRING_ADDRESS, abi: PROOF_SPRING_ABI, functionName: 'fundGrant', args: [grant.id] },
        { onError: (e) => toast.error(parseOnchainError(e)) },
      )
      return
    }

    // Step 1: Request allowance approval for exact grant amount (6 decimals)
    approveWrite(
      { address: USDC_ADDRESS, abi: erc20Abi, functionName: 'approve', args: [PROOF_SPRING_ADDRESS, grant.totalAmount] },
      { onError: (e) => toast.error(parseOnchainError(e)) },
    )
  })

  const handleClaim = () => withChain(() => {
    claimWrite(
      { address: PROOF_SPRING_ADDRESS, abi: PROOF_SPRING_ABI, functionName: 'claimPayment' },
      { onError: (e) => toast.error(parseOnchainError(e)) },
    )
  })

  const handleCancel = () => withChain(() => {
    cancelWrite(
      { address: PROOF_SPRING_ADDRESS, abi: PROOF_SPRING_ABI, functionName: 'cancelGrant', args: [grant.id] },
      {
        onSuccess: () => setConfirmCancel(false),
        onError: (e) => { toast.error(parseOnchainError(e)); setConfirmCancel(false) },
      },
    )
  })

  const total = parseFloat(formatUnits(grant.totalAmount, 6))
  const released = parseFloat(formatUnits(grant.releasedAmount, 6))
  const refundable = total - released
  const progressPct = total > 0 ? Math.round((released / total) * 100) : 0
  const hasPendingWithdrawal = pendingWithdrawal !== undefined && pendingWithdrawal > 0n
  const canCancel = isAdmin && (grant.status === 0 || grant.status === 1)
  const claimConfirmed = claimHash !== undefined && !claimConfirming && !claimPending
  const cancelConfirmed = cancelHash !== undefined && !cancelConfirming && !cancelPending
  // C5: creation date
  const createdDate = formatGrantDate(grant.createdAt)

  // Two-step fund flow state
  const isApproving = approvePending || approveConfirming
  const isFunding = fundPending || fundConfirming
  const fundBusy = isApproving || isFunding

  const fundBtnLabel =
    approvePending ? 'Step 1/2 — Confirm approval in wallet…'
    : approveConfirming ? 'Step 1/2 — Approving USDC spend…'
    : fundPending ? 'Step 2/2 — Confirm funding in wallet…'
    : fundConfirming ? 'Step 2/2 — Funding grant…'
    : hasSufficientAllowance ? `Fund Grant — $${total.toFixed(2)} USDC`
    : approveSuccess ? `Step 2/2 — Fund Grant ($${total.toFixed(2)} USDC)`
    : `Step 1/2 — Approve $${total.toFixed(2)} USDC`

  // C7: observer = connected but has no role on this grant
  const isObserver = !!address && !isAdmin && !isReviewer && !isBuilder

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-70 btn-focus rounded-lg px-1"
        style={{ color: 'var(--muted)' }}
        aria-label="Back to all grants"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        All Grants
      </button>

      {/* Header card */}
      <div
        className="rounded-2xl border p-6 space-y-4"
        style={{ background: 'var(--surface-strong)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="display font-bold text-xl mb-1 truncate" style={{ color: 'var(--ink)' }}>
              {grant.title}
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {grant.description || 'No description provided.'}
            </p>
            <div className="flex items-center gap-3 flex-wrap text-xs mt-2" style={{ color: 'var(--subtle)' }}>
              {createdDate && (
                <div className="flex items-center gap-1">
                  <CalendarDays size={12} aria-hidden="true" />
                  Created {createdDate}
                </div>
              )}
              {grant.deadline > 0n && (
                <div className="flex items-center gap-1">
                  <Clock size={12} aria-hidden="true" />
                  Deadline: {formatGrantDate(grant.deadline)}
                  {isExpired ? (
                    <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      Expired
                    </span>
                  ) : (
                    <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  )}
                </div>
              )}
            </div>

          </div>
          <StatusBadge type="grant" status={grant.status} />
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span style={{ color: 'var(--muted)' }}>Funding progress</span>
            <span className="tabular-nums font-semibold" style={{ color: 'var(--ink)' }}>
              ${released.toFixed(2)}{' '}
              <span style={{ color: 'var(--muted)' }}>/ ${total.toFixed(2)} USDC</span>
            </span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: 'var(--surface-muted)' }}
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Funding progress"
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                background: progressPct === 100 ? 'var(--success)' : 'var(--spring)',
              }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1.5" style={{ color: 'var(--subtle)' }}>
            <span>{progressPct}% released</span>
            <span>{milestoneCount} milestone{milestoneCount !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Builder info */}
        {!noBuilder && (
          <div
            className="text-xs rounded-lg px-3 py-2"
            style={{ background: 'var(--surface-muted)', color: 'var(--muted)' }}
          >
            Builder:{' '}
            <span className="mono" style={{ color: 'var(--ink)' }}>
              {grant.builder.slice(0, 10)}…{grant.builder.slice(-6)}
            </span>
            {isBuilder && (
              <span className="ml-2 font-semibold" style={{ color: 'var(--spring)' }}>← you</span>
            )}
          </div>
        )}

        {/* Required approvals info */}
        {requiredApprovals !== undefined && requiredApprovals > 0n && (
          <div className="text-xs" style={{ color: 'var(--subtle)' }}>
            {requiredApprovals.toString()} reviewer approval{requiredApprovals > 1n ? 's' : ''} required per milestone
          </div>
        )}

        {/* B4: visual separator between info and action zone */}
        <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
          <div className="label-caps mb-3" style={{ color: 'var(--subtle)' }}>Actions</div>

        {/* C2: Wrong-chain banner — action buttons below are also disabled */}
        {isWrongChain && (
          <div
            className="rounded-lg px-3 py-2.5 flex items-center gap-2 text-sm"
            style={{ background: '#fff7ed', color: '#92400e', border: '1px solid #fed7aa' }}
          >
            <AlertCircle size={14} className="shrink-0" />
            <span className="flex-1">You are on the wrong network. Switch to Arc Testnet to interact.</span>
            <button
              onClick={() => withChain(() => { /* fires queued action after switch */ })}
              className="text-xs font-semibold underline shrink-0"
              aria-label="Switch to Arc Testnet"
            >
              Switch
            </button>
            {pendingAction && (
              <span className="text-xs opacity-70 shrink-0">Will retry after switch.</span>
            )}
          </div>
        )}

        {/* C1: Fund grant — admin only, status Open */}
        {grant.status === 0 && isAdmin && (
          <>
            <button
              onClick={handleFund}
              disabled={fundBusy || isWrongChain || grant.totalAmount === 0n}
              title={
                isWrongChain ? 'Switch to Arc first'
                : grant.totalAmount === 0n ? 'Grant has no milestone amounts set'
                : undefined
              }
              className="w-full h-10 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2 btn-focus"
              style={{ background: 'var(--spring)' }}
            >
              {fundBusy && <Loader2 size={14} className="animate-spin" />}
              {fundBtnLabel}
            </button>

            {/* Two-step progress indicator when approval is needed */}
            {!hasSufficientAllowance && (
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{
                    background: approveSuccess ? 'var(--success)' : isApproving ? 'var(--spring)' : 'var(--subtle)',
                    fontSize: '10px',
                  }}
                >
                  {approveSuccess ? '✓' : '1'}
                </span>
                <span style={{ color: isApproving || !approveSuccess ? 'var(--ink)' : 'var(--muted)', fontWeight: isApproving ? 600 : 400 }}>
                  Approve USDC
                </span>
                <span style={{ color: 'var(--subtle)' }}>→</span>
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ background: approveSuccess || isFunding ? 'var(--spring)' : 'var(--subtle)', fontSize: '10px' }}
                >2</span>
                <span style={{ color: approveSuccess || isFunding ? 'var(--ink)' : 'var(--subtle)', fontWeight: isFunding ? 600 : 400 }}>
                  Fund grant
                </span>
              </div>
            )}
          </>
        )}

        {/* Apply button — non-reviewer, non-admin, status Active, no builder yet */}
        {grant.status === 1 && noBuilder && !isReviewer && !isAdmin && (
          <button
            onClick={handleApply}
            disabled={applyPending || applyConfirming || isWrongChain}
            title={isWrongChain ? 'Switch to Arc first' : undefined}
            className="w-full h-10 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2 btn-focus"
            style={{ background: 'var(--accent)' }}
          >
            {(applyPending || applyConfirming) && <Loader2 size={14} className="animate-spin" />}
            {applyPending ? 'Confirm in wallet…' : applyConfirming ? 'Confirming…' : 'Apply as Builder'}
          </button>
        )}

        {/* C7: Context for observers who have no actionable role */}
        {isObserver && grant.status === 1 && noBuilder && (
          <div
            className="rounded-lg px-3 py-2 flex items-start gap-2 text-xs"
            style={{ background: 'var(--surface-muted)', color: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            <Info size={12} className="shrink-0 mt-0.5" style={{ color: 'var(--subtle)' }} />
            This grant is open for applications. Connect a non-reviewer wallet to apply as the builder.
          </div>
        )}
        {isObserver && grant.status === 1 && !noBuilder && (
          <div
            className="rounded-lg px-3 py-2 flex items-start gap-2 text-xs"
            style={{ background: 'var(--surface-muted)', color: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            <Info size={12} className="shrink-0 mt-0.5" style={{ color: 'var(--subtle)' }} />
            A builder is actively working on this grant. Milestone submissions and reviewer votes appear below.
          </div>
        )}

        {/* Pending USDC claim */}
        {hasPendingWithdrawal && (
          <div
            className="rounded-xl border p-4 flex items-center justify-between gap-3"
            style={{ background: 'var(--spring-light)', borderColor: '#a7f3d0' }}
          >
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--spring)' }}>
                ${parseFloat(formatUnits(pendingWithdrawal, 6)).toFixed(2)} USDC ready to claim
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                Approved milestone payment — claim to your wallet
              </div>
            </div>
            <button
              onClick={handleClaim}
              disabled={claimPending || claimConfirming || isWrongChain}
              title={isWrongChain ? 'Switch to Arc first' : undefined}
              className="px-4 h-9 rounded-lg text-sm font-semibold text-white flex items-center gap-1.5 disabled:opacity-60 shrink-0 btn-focus"
              style={{ background: 'var(--spring)' }}
            >
              {(claimPending || claimConfirming) && <Loader2 size={12} className="animate-spin" />}
              {claimPending ? 'Confirm…' : claimConfirming ? 'Claiming…' : 'Claim USDC'}
            </button>
          </div>
        )}

        {claimHash && (
          <a
            href={buildTxExplorerUrl(targetChainId, claimHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs"
            style={{ color: 'var(--accent)' }}
          >
            <ExternalLink size={11} />
            {claimConfirmed ? 'Payment confirmed — view on explorer' : 'View pending claim on explorer'}
          </a>
        )}

        {/* M10: inline cancel confirm — replaces window.confirm */}
        {canCancel && !confirmCancel && !cancelSuccess && (
          <button
            onClick={() => setConfirmCancel(true)}
            disabled={isWrongChain}
            title={isWrongChain ? 'Switch to Arc Testnet first' : undefined}
            className="w-full h-9 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 border transition-all hover:opacity-80 disabled:opacity-50"
            style={{ color: 'var(--danger)', borderColor: '#fecaca', background: '#fef2f2' }}
          >
            <Ban size={13} />
            Cancel Grant & Refund
          </button>
        )}

        {canCancel && confirmCancel && (
          <div
            className="rounded-xl border p-4 space-y-3"
            style={{ borderColor: '#fecaca', background: '#fef2f2' }}
          >
            <div className="flex items-start gap-2 text-sm" style={{ color: '#7f1d1d' }}>
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <span>
                Cancel this grant? <strong>${refundable.toFixed(2)} USDC</strong> of unreleased funds will
                be returned to the funder. This cannot be undone.
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={cancelPending || cancelConfirming || isWrongChain}
                className="flex-1 h-9 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-1.5 disabled:opacity-60 btn-focus"
                style={{ background: 'var(--danger)' }}
              >
                {(cancelPending || cancelConfirming) && <Loader2 size={13} className="animate-spin" />}
                {cancelPending ? 'Confirm in wallet…' : cancelConfirming ? 'Cancelling…' : 'Yes, Cancel Grant'}
              </button>
              <button
                onClick={() => setConfirmCancel(false)}
                disabled={cancelPending || cancelConfirming}
                className="flex-1 h-9 rounded-xl text-sm font-medium border disabled:opacity-50 btn-focus"
                style={{ color: 'var(--ink)', borderColor: 'var(--border)', background: 'var(--surface-strong)' }}
              >
                Keep Grant
              </button>
            </div>
            {cancelHash && (
              <a
                href={buildTxExplorerUrl(targetChainId, cancelHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs btn-focus rounded"
                style={{ color: 'var(--danger)' }}
              >
                <ExternalLink size={10} aria-hidden="true" />
                {cancelConfirmed ? 'Cancellation confirmed — view on explorer' : 'Confirming cancellation…'}
              </a>
            )}
          </div>
        )}

        {/* Expire Grant action for expired active grants */}
        {canExpire && !confirmExpire && !expireSuccess && (
          <button
            onClick={() => setConfirmExpire(true)}
            disabled={isWrongChain}
            title={isWrongChain ? 'Switch to Arc network first' : undefined}
            className="w-full h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 border transition-all hover:opacity-85 disabled:opacity-50 btn-focus"
            style={{ color: '#b45309', borderColor: '#fde68a', background: '#fffbeb' }}
          >
            <Clock size={14} />
            Expire Stalled Grant & Refund
          </button>
        )}

        {canExpire && confirmExpire && (
          <div
            className="rounded-xl border p-4 space-y-3"
            style={{ borderColor: '#fde68a', background: '#fffbeb' }}
          >
            <div className="flex items-start gap-2 text-sm" style={{ color: '#92400e' }}>
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <span>
                This grant passed its deadline on <strong>{formatGrantDate(grant.deadline)}</strong>. Expiring will close the grant and return <strong>${refundable.toFixed(2)} USDC</strong> of unreleased escrow to the funder.
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExpire}
                disabled={expirePending || expireConfirming || isWrongChain}
                className="flex-1 h-9 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-1.5 disabled:opacity-60 btn-focus"
                style={{ background: '#d97706' }}
              >
                {(expirePending || expireConfirming) && <Loader2 size={13} className="animate-spin" />}
                {expirePending ? 'Confirm in wallet…' : expireConfirming ? 'Expiring…' : 'Yes, Expire Grant'}
              </button>
              <button
                onClick={() => setConfirmExpire(false)}
                disabled={expirePending || expireConfirming}
                className="flex-1 h-9 rounded-xl text-sm font-medium border disabled:opacity-50 btn-focus"
                style={{ color: 'var(--ink)', borderColor: 'var(--border)', background: 'var(--surface-strong)' }}
              >
                Cancel
              </button>
            </div>
            {expireHash && (
              <a
                href={buildTxExplorerUrl(targetChainId, expireHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs btn-focus rounded"
                style={{ color: '#b45309' }}
              >
                <ExternalLink size={10} aria-hidden="true" />
                {expireConfirmed ? 'Expiration confirmed — view on explorer' : 'Confirming expiration…'}
              </a>
            )}
          </div>
        )}
        </div>{/* end actions wrapper */}

      </div>

      {/* Milestones section */}
      <div className="space-y-3">
        {/* B7: milestone count in heading */}
        <h2 className="display font-semibold text-base px-1" style={{ color: 'var(--ink)' }}>
          Milestones{' '}
          <span style={{ color: 'var(--subtle)' }}>
            ({milestonesLoading && milestoneCount === 0 ? '…' : milestoneCount})
          </span>
        </h2>

        {/* C3: RPC error state for milestones */}
        {milestonesError && (
          <div
            className="rounded-2xl border p-6 text-center space-y-2"
            style={{ background: 'var(--surface-strong)', borderColor: '#fecaca' }}
          >
            <AlertCircle size={18} className="mx-auto" style={{ color: 'var(--danger)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Could not load milestones</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              A network error occurred. The page retries automatically — check your connection if it persists.
            </p>
          </div>
        )}

        {/* C4: skeleton only when milestoneCount > 0 and data not yet loaded */}
        {!milestonesError && milestoneResults === undefined && milestonesLoading && milestoneCount > 0 && (
          Array.from({ length: milestoneCount }, (_, i) => (
            <div
              key={i}
              className="rounded-2xl border p-5 animate-pulse space-y-3"
              style={{ background: 'var(--surface-strong)', borderColor: 'var(--border)' }}
            >
              <div className="flex justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="h-3 rounded-full w-20" style={{ background: 'var(--surface-muted)' }} />
                  <div className="h-4 rounded-full w-48" style={{ background: 'var(--surface-muted)' }} />
                </div>
                <div className="h-5 w-16 rounded-full" style={{ background: 'var(--surface-muted)' }} />
              </div>
              <div className="h-3 rounded-full w-full" style={{ background: 'var(--surface-muted)' }} />
            </div>
          ))
        )}

        {/* B8: explicit empty state when grant has no milestones */}
        {!milestonesError && !milestonesLoading && milestoneCount === 0 && (
          <div
            className="rounded-2xl border p-6 text-center"
            style={{ background: 'var(--surface-strong)', borderColor: 'var(--border)' }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>No milestones defined</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              This grant has no milestones. Contact the grant admin.
            </p>
          </div>
        )}

        {/* M13: each MilestoneCard owns its own tx hashes */}
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
            targetChainId={targetChainId}
            onRefreshMilestones={() => void refetchMilestones()}
            onRefresh={onRefresh}
          />
        ))}
      </div>
    </div>
  )
}

// ── MilestoneCard — owns its own evidence input and per-card tx hashes ────────
interface MilestoneCardProps {
  milestone: Milestone
  index: number
  grant: Grant
  isBuilder: boolean
  isReviewer: boolean
  requiredApprovals: number
  isWrongChain: boolean
  targetChainId: number
  onRefreshMilestones: () => void
  onRefresh: () => void
}

function MilestoneCard({
  milestone, index, grant,
  isBuilder, isReviewer, requiredApprovals,
  isWrongChain, targetChainId, onRefreshMilestones, onRefresh,
}: MilestoneCardProps) {
  const { address } = useAccount()
  const { data: approvalCount } = useApprovalCount(grant.id, index)
  // A1: has this reviewer already voted in the current round?
  const { data: hasVoted } = useReviewerVote(
    isReviewer ? grant.id : null,
    index,
    address,
  )
  const amount = parseFloat(formatUnits(milestone.amount, 6))

  // M13: per-card local state for evidence + tx hashes
  const [evidenceInput, setEvidenceInput] = useState('')
  const [submitHash, setSubmitHash] = useState<`0x${string}` | undefined>()
  const [reviewHash, setReviewHash] = useState<`0x${string}` | undefined>()

  // useEvidenceResolver checks localStorage first and queries onchain MilestoneSubmitted event logs as fallback
  const { evidenceUri: resolvedEvidenceUri, isLoading: isResolvingEvidence, isVerified } =
    useEvidenceResolver(grant.id, index, milestone.evidenceHash)

  // Local state for immediate update upon submission in the current browser session
  const [submittedEvidenceUri, setSubmittedEvidenceUri] = useState<string | null>(null)
  const displayEvidenceUri = submittedEvidenceUri || resolvedEvidenceUri

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

  // Milestone status: 0=Pending, 1=SubmittedForReview, 2=Approved, 3=Rejected
  const canSubmit = isBuilder && grant.status === 1 && (milestone.status === 0 || milestone.status === 3)
  // A1: reviewer can only vote if they haven't voted yet this round
  const canReview = isReviewer && milestone.status === 1 && !hasVoted
  const alreadyVoted = isReviewer && milestone.status === 1 && hasVoted === true
  const isSubmitting = submitPending || submitConfirming
  const isReviewing = reviewPending || reviewConfirming
  const submitConfirmed = !!submitHash && !submitConfirming && !submitPending
  const reviewConfirmed = !!reviewHash && !reviewConfirming && !reviewPending

  const handleSubmit = () => {
    const uri = evidenceInput.trim()
    if (!uri) { toast.error('Please enter an evidence URL or IPFS CID.'); return }
    submitWrite(
      {
        address: PROOF_SPRING_ADDRESS,
        abi: PROOF_SPRING_ABI,
        functionName: 'submitMilestoneEvidence',
        args: [grant.id, BigInt(index), uri],
      },
      {
        onSuccess: (hash) => {
          setSubmitHash(hash)
          setEvidenceInput('')
          // Cache the URI locally so the builder sees it immediately
          saveEvidenceToCache(targetChainId, grant.id, index, uri)
          setSubmittedEvidenceUri(uri)
        },
        onError: (e) => toast.error(parseOnchainError(e)),
      },
    )
  }

  const handleReview = (approve: boolean) => {
    reviewWrite(
      {
        address: PROOF_SPRING_ADDRESS,
        abi: PROOF_SPRING_ABI,
        functionName: 'reviewMilestone',
        args: [grant.id, BigInt(index), approve],
      },
      {
        onSuccess: (hash) => setReviewHash(hash),
        onError: (e) => toast.error(parseOnchainError(e)),
      },
    )
  }

  // v2: evidence stored as bytes32 hash onchain; full URI in MilestoneSubmitted event
  const evidenceSubmitted = hasEvidence(milestone.evidenceHash)

  return (
    <div
      className="rounded-2xl border p-5 space-y-3"
      style={{ background: 'var(--surface-strong)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--subtle)' }}>
              Milestone {index + 1}
            </span>
            <span className="tabular-nums text-xs font-semibold" style={{ color: 'var(--spring)' }}>
              ${amount.toFixed(2)} USDC
            </span>
          </div>
          <h4 className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>{milestone.title}</h4>
          {milestone.description && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{milestone.description}</p>
          )}
        </div>
        <StatusBadge type="milestone" status={milestone.status} className="shrink-0" />
      </div>

      {/* v2: evidence hash onchain + resolved plaintext URI from logs or cache */}
      {evidenceSubmitted && (
        <div className="rounded-lg px-3 py-2.5 text-xs space-y-2" style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
          {/* Row 1: hash + explorer link */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <span className="font-medium mr-1.5" style={{ color: 'var(--subtle)' }}>Evidence hash:</span>
              <span className="mono" style={{ color: 'var(--ink)', fontSize: '10px' }}>
                {shortHash(milestone.evidenceHash)}
              </span>
            </div>
            {submitHash && (
              <a
                href={buildTxExplorerUrl(targetChainId, submitHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-medium btn-focus rounded"
                style={{ color: 'var(--accent)' }}
                aria-label="View evidence submission on explorer"
              >
                <ExternalLink size={10} aria-hidden="true" />
                View on explorer
              </a>
            )}
          </div>

          {/* Row 2: display evidence URI with verification badge */}
          {displayEvidenceUri ? (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-medium" style={{ color: 'var(--subtle)' }}>
                <span>Submitted Evidence:</span>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600">
                    <CheckCircle2 size={10} /> Onchain Verified
                  </span>
                )}
              </div>
              <a
                href={displayEvidenceUri.startsWith('http') ? displayEvidenceUri : undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all leading-snug btn-focus rounded font-mono text-xs block hover:underline"
                style={{ color: 'var(--accent)' }}
                aria-label={`Evidence link: ${displayEvidenceUri}`}
              >
                {displayEvidenceUri}
              </a>
            </div>
          ) : isResolvingEvidence ? (
            <div className="flex items-center gap-1.5 text-xs italic py-1" style={{ color: 'var(--subtle)' }}>
              <Loader2 size={12} className="animate-spin text-indigo-500" />
              <span>Resolving evidence from onchain logs…</span>
            </div>
          ) : (
            <div style={{ color: 'var(--subtle)', lineHeight: 1.4 }}>
              Full URL stored in the <span className="font-semibold">MilestoneSubmitted</span> event log.
            </div>
          )}
        </div>
      )}


      {/* Approval progress while in review — C7: correct plural */}
      {milestone.status === 1 && (
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--subtle)' }}>
          <CheckCircle size={11} style={{ color: 'var(--spring)' }} aria-hidden="true" />
          {Number(approvalCount ?? 0n)} / {requiredApprovals} approval{requiredApprovals !== 1 ? 's' : ''}
        </div>
      )}

      {/* Builder: submit evidence — C2: disabled on wrong chain */}
      {canSubmit && (
        <div className="space-y-2">
          <div className="space-y-1">
            <input
              value={evidenceInput}
              onChange={(e) => setEvidenceInput(e.target.value)}
              placeholder="GitHub PR URL, IPFS CID, demo link…"
              disabled={isSubmitting || isWrongChain}
              maxLength={500}
              className="w-full h-10 rounded-xl border px-3 text-sm outline-none disabled:opacity-50 btn-focus"
              style={{
                background: 'var(--surface-muted)',
                borderColor: 'var(--border)',
                color: 'var(--ink)',
              }}
              aria-label="Evidence URL or IPFS CID"
            />
            {/* B5: char counter when approaching limit */}
            {evidenceInput.length > 300 && (
              <div
                className="text-right text-xs tabular-nums"
                style={{ color: evidenceInput.length > 450 ? 'var(--danger)' : 'var(--subtle)' }}
              >
                {evidenceInput.length}/500
              </div>
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !evidenceInput.trim() || isWrongChain}
            title={
              isWrongChain ? 'Switch to Arc Testnet first'
              : !evidenceInput.trim() ? 'Enter an evidence URL first'
              : undefined
            }
            className="w-full h-9 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all btn-focus"
            style={{ background: 'var(--accent)' }}
          >
            {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} aria-hidden="true" />}
            {isSubmitting
              ? (submitPending ? 'Confirm in wallet…' : 'Submitting…')
              : 'Submit Evidence'}
          </button>
          {submitHash && (
            <a
              href={buildTxExplorerUrl(targetChainId, submitHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs"
              style={{ color: 'var(--accent)' }}
            >
              <ExternalLink size={10} />
              {submitConfirmed ? 'Submission confirmed — view on explorer' : 'View pending submission on explorer'}
            </a>
          )}
        </div>
      )}

      {/* A1: already voted — show badge instead of buttons */}
      {alreadyVoted && (
        <div
          className="rounded-lg px-3 py-2 flex items-center gap-2 text-xs font-medium"
          style={{ background: 'var(--spring-light)', color: 'var(--spring)', border: '1px solid #a7f3d0' }}
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 size={13} aria-hidden="true" />
          Vote recorded — awaiting other reviewers ({Number(approvalCount ?? 0n)}/{requiredApprovals} approved)
        </div>
      )}

      {/* Reviewer: approve / reject — C2: disabled on wrong chain */}
      {canReview && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => handleReview(true)}
              disabled={isReviewing || isWrongChain}
              title={isWrongChain ? 'Switch to Arc first' : undefined}
              className="flex-1 h-9 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all border btn-focus"
              style={{ background: 'var(--spring-light)', color: 'var(--spring)', borderColor: '#a7f3d0' }}
              aria-label="Approve milestone"
            >
              {isReviewing ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} aria-hidden="true" />}
              Approve
            </button>
            <button
              onClick={() => handleReview(false)}
              disabled={isReviewing || isWrongChain}
              title={isWrongChain ? 'Switch to Arc first' : undefined}
              className="flex-1 h-9 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all border btn-focus"
              style={{ background: '#fef2f2', color: 'var(--danger)', borderColor: '#fecaca' }}
              aria-label="Reject milestone"
            >
              {isReviewing ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} aria-hidden="true" />}
              Reject
            </button>
          </div>
          {reviewHash && (
            <a
              href={buildTxExplorerUrl(targetChainId, reviewHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs"
              style={{ color: 'var(--accent)' }}
            >
              <ExternalLink size={10} />
              {reviewConfirmed ? 'Vote confirmed — view on explorer' : 'View pending vote on explorer'}
            </a>
          )}
        </div>
      )}
    </div>
  )
}
