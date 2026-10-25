import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi'
import { isAddress, parseUnits, formatUnits } from 'viem'
import { Loader2, Plus, UserCheck, UserMinus, Sliders, Ban, AlertTriangle, AlertCircle, CheckCircle2, ExternalLink, ShieldOff, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { FUNDORA_ABI, getContractAddress } from '../contracts/fundora'
import { useRequiredApprovals, usePendingFunderRefund, usePaused, useActiveChainId } from '../hooks/useFundora'
import { useAdminProfile, useUnifiedIsAdmin } from '../hooks/useAdminRegistry'
import { buildTxExplorerUrl } from '@/onchain-facts'
import { useGrants } from '../context/GrantsContext'
import type { Grant } from '../hooks/useFundora'
import { parseOnchainError } from '../utils/errors'

interface Props {
  onGrantCreated: () => void
}

// Strict USDC amount validation — no negatives, no scientific notation, max 6 decimal places
const USDC_AMOUNT_RE = /^\d+(\.\d{1,6})?$/
function parseUsdcAmount(raw: string): bigint | null {
  if (!USDC_AMOUNT_RE.test(raw.trim())) return null
  try {
    const val = parseUnits(raw.trim(), 6)
    return val > 0n ? val : null
  } catch {
    return null
  }
}

type Tab = 'create' | 'reviewers' | 'settings' | 'cancel'

export function AdminPanel({ onGrantCreated }: Props) {
  const { chainId, address } = useAccount()
  const { switchChain } = useSwitchChain()
  const activeChainId = useActiveChainId()
  const FUNDORA_ADDRESS = getContractAddress(activeChainId)
  const { data: requiredApprovals, refetch: refetchRA } = useRequiredApprovals()
  const { data: isPaused, refetch: refetchPaused } = usePaused()
  const { data: adminProfile } = useAdminProfile(address)
  const { isPlatformAdmin } = useUnifiedIsAdmin()
  const [tab, setTab] = useState<Tab>('create')
  const isWrongChain = chainId !== activeChainId

  const withChain = useCallback((action: () => void) => {
    if (isWrongChain) {
      switchChain({ chainId: activeChainId }, { onSuccess: () => action() })
      return
    }
    action()
  }, [isWrongChain, switchChain, activeChainId])

  // ── Create grant ──
  const [grantTitle, setGrantTitle] = useState('')
  const [grantDesc, setGrantDesc] = useState('')
  const [milestoneRows, setMilestoneRows] = useState([{ title: '', desc: '', amount: '' }])

  const addMilestoneRow = () => setMilestoneRows(r => [...r, { title: '', desc: '', amount: '' }])
  const removeMilestoneRow = (i: number) => setMilestoneRows(r => r.filter((_, idx) => idx !== i))
  const updateMilestoneRow = (i: number, field: 'title' | 'desc' | 'amount', val: string) =>
    setMilestoneRows(r => r.map((row, idx) => idx === i ? { ...row, [field]: val } : row))

  // C5/C11: canCreate — compute why form isn't ready so we can explain it
  const missingTitle = !grantTitle.trim()
  const invalidMilestones = milestoneRows.some(r => !r.title.trim() || parseUsdcAmount(r.amount) === null)
  const canCreate = !missingTitle && !invalidMilestones
  const createDisabledReason = missingTitle
    ? 'Grant title is required'
    : invalidMilestones
    ? 'All milestones need a title and a valid USDC amount'
    : undefined

  const { writeContract: createWrite, data: createHash, isPending: createPending } = useWriteContract()
  const { isLoading: createConfirming, isSuccess: createSuccess } = useWaitForTransactionReceipt({ hash: createHash })

  // A4: brief "Grant Created ✓" dwell on the button before resetting
  const [justCreated, setJustCreated] = useState(false)
  const dwellTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Only toast + refresh in the effect; state changes go into the write onSuccess
  useEffect(() => {
    if (createSuccess) {
      onGrantCreated()
      toast.success('Grant created successfully!')
    }
    return () => { if (dwellTimer.current) clearTimeout(dwellTimer.current) }
  }, [createSuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = () => withChain(() => {
    if (!canCreate) return
    const milestoneAmounts = milestoneRows.map(r => parseUsdcAmount(r.amount)!)
    createWrite({
      address: FUNDORA_ADDRESS,
      abi: FUNDORA_ABI,
      functionName: 'createGrant',
      args: [
        grantTitle,
        grantDesc,
        BigInt(milestoneRows.length),
        milestoneRows.map(r => r.title),
        milestoneRows.map(r => r.desc),
        milestoneAmounts,
        0, // deadline: 0 = no deadline; uint40 ABI arg
      ],
    }, {
      onSuccess: () => {
        setGrantTitle('')
        setGrantDesc('')
        setMilestoneRows([{ title: '', desc: '', amount: '' }])
        // A4: trigger dwell — state update in event callback, not in effect
        setJustCreated(true)
        dwellTimer.current = setTimeout(() => setJustCreated(false), 1500)
      },
      onError: (e) => toast.error(parseOnchainError(e)),
    })
  })

  // ── Add reviewer ──
  const [addReviewerAddr, setAddReviewerAddr] = useState('')
  const addAddrValid = isAddress(addReviewerAddr) || !addReviewerAddr
  const { writeContract: addRWrite, data: addRHash, isPending: addRPending } = useWriteContract()
  const { isLoading: addRConfirming, isSuccess: addRSuccess } = useWaitForTransactionReceipt({ hash: addRHash })
  useEffect(() => { if (addRSuccess) toast.success('Reviewer added!') }, [addRSuccess])

  const handleAddReviewer = () => withChain(() => {
    if (!isAddress(addReviewerAddr)) { toast.error('Enter a valid 0x address.'); return }
    addRWrite({
      address: FUNDORA_ADDRESS,
      abi: FUNDORA_ABI,
      functionName: 'addReviewer',
      args: [addReviewerAddr],
    }, {
      onSuccess: () => setAddReviewerAddr(''),
      onError: (e) => toast.error(parseOnchainError(e)),
    })
  })

  // ── Remove reviewer ──
  const [removeReviewerAddr, setRemoveReviewerAddr] = useState('')
  const removeAddrValid = isAddress(removeReviewerAddr) || !removeReviewerAddr
  const { writeContract: removeRWrite, data: removeRHash, isPending: removeRPending } = useWriteContract()
  const { isLoading: removeRConfirming, isSuccess: removeRSuccess } = useWaitForTransactionReceipt({ hash: removeRHash })
  useEffect(() => { if (removeRSuccess) toast.success('Reviewer removed.') }, [removeRSuccess])

  const handleRemoveReviewer = () => withChain(() => {
    if (!isAddress(removeReviewerAddr)) { toast.error('Enter a valid 0x address.'); return }
    removeRWrite({
      address: FUNDORA_ADDRESS,
      abi: FUNDORA_ABI,
      functionName: 'removeReviewer',
      args: [removeReviewerAddr],
    }, {
      onSuccess: () => setRemoveReviewerAddr(''),
      onError: (e) => toast.error(parseOnchainError(e)),
    })
  })

  // ── Set required approvals ──
  const [newRequired, setNewRequired] = useState('')
  const newRequiredN = parseInt(newRequired)
  const newRequiredValid = !newRequired || (!isNaN(newRequiredN) && newRequiredN >= 1)
  const { writeContract: setRAWrite, data: setRAHash, isPending: setRAPending } = useWriteContract()
  const { isLoading: setRAConfirming, isSuccess: setRASuccess } = useWaitForTransactionReceipt({ hash: setRAHash })

  useEffect(() => {
    if (setRASuccess) { void refetchRA(); toast.success('Required approvals updated!') }
  }, [setRASuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSetRA = () => withChain(() => {
    if (isNaN(newRequiredN) || newRequiredN < 1) { toast.error('Must be at least 1.'); return }
    setRAWrite({
      address: FUNDORA_ADDRESS,
      abi: FUNDORA_ABI,
      functionName: 'setRequiredApprovals',
      args: [BigInt(newRequiredN)],
    }, { onError: (e) => toast.error(parseOnchainError(e)) })
  })

  // ── Cancel grant — 3.3: read from shared context, no duplicate RPC ──
  const { grants: allGrants } = useGrants()
  const cancellableGrants: Grant[] = allGrants
    .filter((g): g is Grant => g.status === 0 || g.status === 1)

  const [cancelGrantId, setCancelGrantId] = useState<bigint | null>(null)
  // M10: per-grant inline confirm state
  const [confirmCancelId, setConfirmCancelId] = useState<bigint | null>(null)
  const { writeContract: cancelWrite, data: cancelHash, isPending: cancelPending } = useWriteContract()
  const { isLoading: cancelConfirming, isSuccess: cancelSuccess } = useWaitForTransactionReceipt({ hash: cancelHash })

  useEffect(() => {
    if (cancelSuccess) { onGrantCreated(); toast.success('Grant cancelled. Unreleased USDC queued for refund — use "Claim Refund" below.') }
  }, [cancelSuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCancelGrant = (grantId: bigint) => withChain(() => {
    setCancelGrantId(grantId)
    cancelWrite({
      address: FUNDORA_ADDRESS,
      abi: FUNDORA_ABI,
      functionName: 'cancelGrant',
      args: [grantId],
    }, {
      onSuccess: () => { setCancelGrantId(null); setConfirmCancelId(null) },
      onError: (e) => { toast.error(parseOnchainError(e)); setCancelGrantId(null) },
    })
  })

  // ── Claim funder refund ──
  const { data: pendingFunderRefund, refetch: refetchFunderRefund } = usePendingFunderRefund(address)
  const hasFunderRefund = pendingFunderRefund !== undefined && (pendingFunderRefund) > 0n
  const { writeContract: claimRefundWrite, data: claimRefundHash, isPending: claimRefundPending } = useWriteContract()
  const { isLoading: claimRefundConfirming, isSuccess: claimRefundSuccess } = useWaitForTransactionReceipt({ hash: claimRefundHash })

  useEffect(() => {
    if (claimRefundSuccess) { void refetchFunderRefund(); toast.success('Refund claimed successfully!') }
  }, [claimRefundSuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClaimRefund = () => withChain(() => {
    claimRefundWrite({
      address: FUNDORA_ADDRESS,
      abi: FUNDORA_ABI,
      functionName: 'claimFunderRefund',
    }, { onError: (e) => toast.error(parseOnchainError(e)) })
  })

  // ── Reassign builder ──
  const [reassignGrantId, setReassignGrantId] = useState('')
  const [reassignBuilderAddr, setReassignBuilderAddr] = useState('')
  const reassignBuilderValid = isAddress(reassignBuilderAddr) || !reassignBuilderAddr
  const { writeContract: reassignWrite, data: reassignHash, isPending: reassignPending } = useWriteContract()
  const { isLoading: reassignConfirming } = useWaitForTransactionReceipt({ hash: reassignHash })
  const handleReassign = () => withChain(() => {
    const gid = parseInt(reassignGrantId)
    if (isNaN(gid) || gid < 1) { toast.error('Enter a valid grant ID.'); return }
    if (!isAddress(reassignBuilderAddr)) { toast.error('Enter a valid builder address.'); return }
    reassignWrite({
      address: FUNDORA_ADDRESS,
      abi: FUNDORA_ABI,
      functionName: 'adminReassignBuilder',
      args: [BigInt(gid), reassignBuilderAddr],
    }, {
      onSuccess: () => { toast.success('Builder reassigned.'); setReassignGrantId(''); setReassignBuilderAddr('') },
      onError: (e) => toast.error(parseOnchainError(e)),
    })
  })

  // Pause / unpause
  const { writeContract: pauseWrite, isPending: pausePending } = useWriteContract()
  const { writeContract: unpauseWrite, isPending: unpausePending } = useWriteContract()

  const handlePause = () => withChain(() => {
    pauseWrite({
      address: FUNDORA_ADDRESS, abi: FUNDORA_ABI, functionName: 'pause',
    }, {
      onSuccess: () => { void refetchPaused(); toast.success('Contract paused') },
      onError: (e) => toast.error(parseOnchainError(e)),
    })
  })
  const handleUnpause = () => withChain(() => {
    unpauseWrite({
      address: FUNDORA_ADDRESS, abi: FUNDORA_ABI, functionName: 'unpause',
    }, {
      onSuccess: () => { void refetchPaused(); toast.success('Contract unpaused') },
      onError: (e) => toast.error(parseOnchainError(e)),
    })
  })

  const inputCls = 'w-full h-10 rounded-xl border px-3 text-sm outline-none focus:ring-2 transition-all'
  const inputStyle = {
    background: 'var(--surface-muted)',
    borderColor: 'var(--border)',
    color: 'var(--ink)',
    '--tw-ring-color': 'var(--focus)',
  } as React.CSSProperties

  const tabs = [
    { id: 'create' as const, icon: Plus, label: 'New Grant' },
    { id: 'reviewers' as const, icon: UserCheck, label: 'Reviewers' },
    { id: 'settings' as const, icon: Sliders, label: 'Settings' },
    { id: 'cancel' as const, icon: Ban, label: 'Cancel Grant' },
  ]

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: 'var(--surface-strong)', borderColor: 'var(--border)' }}
    >
      {/* Tabs — ARIA tablist + keyboard nav (F7) */}
      <div className="relative" style={{ borderBottom: '1px solid var(--border)' }}>
        {/* Right-edge fade to signal horizontal scroll */}
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 z-10"
          style={{ background: 'linear-gradient(to left, var(--surface-strong), transparent)' }}
          aria-hidden="true"
        />
        <div
          role="tablist"
          aria-label="Admin panel sections"
          className="px-4 pt-4 pb-0 flex items-center gap-1 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
          onKeyDown={e => {
            const idx = tabs.findIndex(t => t.id === tab)
            if (e.key === 'ArrowRight') { e.preventDefault(); setTab(tabs[(idx + 1) % tabs.length].id) }
            if (e.key === 'ArrowLeft')  { e.preventDefault(); setTab(tabs[(idx - 1 + tabs.length) % tabs.length].id) }
          }}
        >
          <div className="flex items-center gap-2 mr-4 pb-3 shrink-0">
            <h2 className="display font-bold text-base" style={{ color: 'var(--ink)' }}>
              Admin Panel
            </h2>
            {adminProfile && (
              <span
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold"
                style={{
                  background: 'var(--brand-light)',
                  borderColor: 'var(--brand-border)',
                  color: 'var(--brand)',
                }}
              >
                <ShieldCheck size={12} />
                @{(adminProfile as any).arcHouseUsername || (adminProfile as any)[0]}
              </span>
            )}
          </div>
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              aria-controls={`tabpanel-${id}`}
              id={`tab-${id}`}
              tabIndex={tab === id ? 0 : -1}
              onClick={() => setTab(id)}
              className="relative flex items-center gap-1.5 px-3 pb-3 pt-1 text-sm font-medium transition-colors shrink-0 btn-focus"
              style={{
                color: tab === id ? (id === 'cancel' ? 'var(--coral)' : 'var(--ink)') : 'var(--muted)',
                border: 'none', background: 'transparent',
              }}
            >
              <Icon size={13} aria-hidden="true" />
              {label}
              {tab === id && (
                <motion.span
                  layoutId="admin-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: id === 'cancel' ? 'var(--coral)' : 'var(--brand)' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>{/* end tab header */}

      <div className="p-5 space-y-4">

        {/* ── Create grant ── */}
        {tab === 'create' && (
          <div
            role="tabpanel"
            id="tabpanel-create"
            aria-labelledby="tab-create"
            className="space-y-3"
          >
            {/* Title */}
            <div className="space-y-1">
              <input
                value={grantTitle}
                onChange={e => setGrantTitle(e.target.value)}
                placeholder="Grant title *"
                className={inputCls}
                style={{
                  ...inputStyle,
                  borderColor: grantTitle === '' ? 'var(--border)' : undefined,
                }}
                aria-label="Grant title"
              />
            </div>

            {/* Description */}
            <textarea
              value={grantDesc}
              onChange={e => setGrantDesc(e.target.value)}
              placeholder="Grant description — what are you funding? (optional)"
              rows={2}
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 resize-none transition-all"
              style={inputStyle}
              aria-label="Grant description"
            />

            {/* Milestones */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--subtle)' }}>
                Milestones
              </div>
              {milestoneRows.map((row, i) => (
                <div
                  key={i}
                  className="rounded-xl border p-3 space-y-2"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-muted)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: 'var(--subtle)' }}>
                      Milestone {i + 1}
                    </span>
                    {milestoneRows.length > 1 && (
                      <button
                        onClick={() => removeMilestoneRow(i)}
                        className="text-xs font-medium"
                        style={{ color: 'var(--danger)' }}
                        aria-label={`Remove milestone ${i + 1}`}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    value={row.title}
                    onChange={e => updateMilestoneRow(i, 'title', e.target.value)}
                    placeholder="Milestone title *"
                    className={inputCls}
                    style={{
                      ...inputStyle,
                      borderColor: row.title === '' ? 'var(--border)' : undefined,
                    }}
                    aria-label={`Milestone ${i + 1} title`}
                  />
                  <input
                    value={row.desc}
                    onChange={e => updateMilestoneRow(i, 'desc', e.target.value)}
                    placeholder="Description (optional)"
                    className={inputCls}
                    style={inputStyle}
                    aria-label={`Milestone ${i + 1} description`}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      value={row.amount}
                      onChange={e => updateMilestoneRow(i, 'amount', e.target.value)}
                      placeholder="0.00"
                      inputMode="decimal"
                      className="flex-1 h-10 rounded-xl border px-3 text-sm outline-none focus:ring-2 tabular-nums transition-all"
                      style={{
                        ...inputStyle,
                        borderColor: row.amount && parseUsdcAmount(row.amount) === null
                          ? 'var(--danger)'
                          : 'var(--border)',
                      }}
                      aria-label={`Milestone ${i + 1} USDC amount`}
                    />
                    <span className="text-sm font-medium shrink-0" style={{ color: 'var(--muted)' }}>USDC</span>
                  </div>
                  {row.amount && parseUsdcAmount(row.amount) === null && (
                    <p className="text-xs flex items-center gap-1" style={{ color: 'var(--danger)' }}>
                      <AlertCircle size={11} />
                      Enter a valid amount (e.g. 10.50 — no negatives or scientific notation)
                    </p>
                  )}
                </div>
              ))}
              <button
                onClick={addMilestoneRow}
                className="w-full h-9 rounded-xl border text-sm font-medium flex items-center justify-center gap-1.5 transition-all hover:opacity-80 btn-focus"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
              >
                <Plus size={13} aria-hidden="true" /> Add Milestone
              </button>
            </div>

            {/* C5/C11: disabled reason shown below the button */}
            <button
              onClick={handleCreate}
              disabled={createPending || createConfirming || !canCreate || isWrongChain || justCreated}
              title={
                isWrongChain ? 'Switch network first'
                : createDisabledReason ?? undefined
              }
              className="w-full h-10 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-all btn-focus"
              style={{
                background: justCreated ? 'var(--success)' : 'var(--accent)',
                transition: 'background 0.2s',
              }}
            >
              {justCreated ? (
                <><CheckCircle2 size={14} /> Grant Created</>
              ) : (createPending || createConfirming) ? (
                <><Loader2 size={14} className="animate-spin" />{createPending ? 'Confirm in wallet…' : 'Creating…'}</>
              ) : (
                'Create Grant'
              )}
            </button>

            {/* Inline disabled reason — shows beneath button, not as a toast */}
            {!canCreate && !createPending && !createConfirming && (
              <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
                {createDisabledReason}
              </p>
            )}
          </div>
        )}

        {/* ── Reviewers ── */}
        {tab === 'reviewers' && (
          <div role="tabpanel" id="tabpanel-reviewers" aria-labelledby="tab-reviewers" className="space-y-5">
            {/* Add */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--subtle)' }}>
                Add Reviewer
              </div>
              <input
                value={addReviewerAddr}
                onChange={e => setAddReviewerAddr(e.target.value)}
                placeholder="0x… wallet address"
                className={`${inputCls} mono`}
                style={{
                  ...inputStyle,
                  borderColor: addReviewerAddr && !addAddrValid ? 'var(--danger)' : 'var(--border)',
                }}
                aria-label="Reviewer address to add"
              />
              {addReviewerAddr && !addAddrValid && (
                <p className="text-xs flex items-center gap-1" style={{ color: 'var(--danger)' }}>
                  <AlertCircle size={11} /> Not a valid 0x address
                </p>
              )}
              <button
                onClick={handleAddReviewer}
                disabled={addRPending || addRConfirming || !addReviewerAddr || isWrongChain}
                title={
                  isWrongChain ? 'Switch network first'
                  : !addReviewerAddr ? 'Enter an address first'
                  : undefined
                }
                className="w-full h-10 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-1.5 disabled:opacity-50 btn-focus"
                style={{ background: 'var(--spring)' }}
              >
                {(addRPending || addRConfirming) ? <Loader2 size={13} className="animate-spin" /> : <UserCheck size={13} aria-hidden="true" />}
                {addRPending ? 'Confirm in wallet…' : addRConfirming ? 'Adding…' : 'Add Reviewer'}
              </button>
            </div>

            <div className="border-t" style={{ borderColor: 'var(--border)' }} />

            {/* Remove */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--subtle)' }}>
                Remove Reviewer
              </div>
              <input
                value={removeReviewerAddr}
                onChange={e => setRemoveReviewerAddr(e.target.value)}
                placeholder="0x… wallet address"
                className={`${inputCls} mono`}
                style={{
                  ...inputStyle,
                  borderColor: removeReviewerAddr && !removeAddrValid ? 'var(--danger)' : 'var(--border)',
                }}
                aria-label="Reviewer address to remove"
              />
              {removeReviewerAddr && !removeAddrValid && (
                <p className="text-xs flex items-center gap-1" style={{ color: 'var(--danger)' }}>
                  <AlertCircle size={11} /> Not a valid 0x address
                </p>
              )}
              <button
                onClick={handleRemoveReviewer}
                disabled={removeRPending || removeRConfirming || !removeReviewerAddr || isWrongChain}
                title={
                  isWrongChain ? 'Switch network first'
                  : !removeReviewerAddr ? 'Enter an address first'
                  : undefined
                }
                className="w-full h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 border btn-focus"
                style={{ color: 'var(--danger)', borderColor: '#fecaca', background: '#fef2f2' }}
              >
                {(removeRPending || removeRConfirming) ? <Loader2 size={13} className="animate-spin" /> : <UserMinus size={13} aria-hidden="true" />}
                {removeRPending ? 'Confirm in wallet…' : removeRConfirming ? 'Removing…' : 'Remove Reviewer'}
              </button>
            </div>
          </div>
        )}

        {/* ── Settings ── */}
        {tab === 'settings' && (
          <div role="tabpanel" id="tabpanel-settings" aria-labelledby="tab-settings" className="space-y-3">
            <div className="text-sm" style={{ color: 'var(--muted)' }}>
              Current required approvals:{' '}
              <strong style={{ color: 'var(--ink)' }}>{requiredApprovals?.toString() ?? '…'}</strong>
            </div>
            <div className="flex gap-2">
              <input
                value={newRequired}
                onChange={e => setNewRequired(e.target.value)}
                placeholder="New value (e.g. 2)"
                inputMode="numeric"
                className={`${inputCls} tabular-nums flex-1`}
                style={{
                  ...inputStyle,
                  borderColor: newRequired && !newRequiredValid ? 'var(--danger)' : 'var(--border)',
                }}
                aria-label="New required approvals value"
              />
              <button
                onClick={handleSetRA}
                disabled={setRAPending || setRAConfirming || !newRequired || !newRequiredValid || isWrongChain}
                title={
                  isWrongChain ? 'Switch network first'
                  : !newRequiredValid ? 'Must be a whole number ≥ 1'
                  : undefined
                }
                className="px-4 h-10 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center gap-1.5 shrink-0 btn-focus"
                style={{ background: 'var(--accent)' }}
              >
                {(setRAPending || setRAConfirming) ? <Loader2 size={13} className="animate-spin" /> : <Sliders size={13} aria-hidden="true" />}
                {setRAPending ? 'Confirm…' : setRAConfirming ? 'Updating…' : 'Update'}
              </button>
            </div>
            {newRequired && !newRequiredValid && (
              <p className="text-xs flex items-center gap-1" style={{ color: 'var(--danger)' }}>
                <AlertCircle size={11} /> Must be a whole number of at least 1
              </p>
            )}

            {/* Contract pause (A3) */}
            <div
              className="rounded-xl border p-4 space-y-3 mt-2"
              style={{
                background: isPaused ? 'var(--coral-light)' : 'var(--surface-muted)',
                borderColor: isPaused ? 'var(--coral-border)' : 'var(--border)',
              }}
            >
              <div className="flex items-center gap-2">
                {isPaused
                  ? <ShieldOff size={14} style={{ color: 'var(--coral)' }} aria-hidden="true" />
                  : <ShieldCheck size={14} style={{ color: 'var(--teal)' }} aria-hidden="true" />
                }
                <span className="text-sm font-semibold" style={{ color: isPaused ? 'var(--coral)' : 'var(--teal)' }}>
                  Contract is {isPaused ? 'PAUSED' : 'active'}
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                {isPaused
                  ? 'All fund, apply, submit, and review actions are blocked. Claim and cancel still work.'
                  : 'Pause to block new funding and submissions during an emergency.'
                }
              </p>
              {isPaused ? (
                <button
                  onClick={handleUnpause}
                  disabled={unpausePending || isWrongChain}
                  className="btn btn-teal btn-sm btn-focus"
                >
                  {unpausePending ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                  Unpause Contract
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  disabled={pausePending || isWrongChain}
                  className="btn btn-danger btn-sm btn-focus"
                >
                  {pausePending ? <Loader2 size={12} className="animate-spin" /> : <ShieldOff size={12} />}
                  Pause Contract
                </button>
              )}
            </div>
            {/* Reassign Builder */}
            <div
              className="rounded-xl border p-4 space-y-3 mt-2"
              style={{ background: 'var(--surface-muted)', borderColor: 'var(--border)' }}
            >
              <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--subtle)' }}>
                Reassign Builder
              </div>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                Replaces the assigned builder on a grant (e.g. if the original builder abandons work).
              </p>
              <div className="space-y-2">
                <input
                  value={reassignGrantId}
                  onChange={e => setReassignGrantId(e.target.value)}
                  placeholder="Grant ID (e.g. 1)"
                  inputMode="numeric"
                  className={`${inputCls} tabular-nums`}
                  style={inputStyle}
                  aria-label="Grant ID to reassign builder"
                />
                <input
                  value={reassignBuilderAddr}
                  onChange={e => setReassignBuilderAddr(e.target.value)}
                  placeholder="New builder 0x… address"
                  className={`${inputCls} mono`}
                  style={{
                    ...inputStyle,
                    borderColor: reassignBuilderAddr && !reassignBuilderValid ? 'var(--danger)' : 'var(--border)',
                  }}
                  aria-label="New builder address"
                />
                {reassignBuilderAddr && !reassignBuilderValid && (
                  <p className="text-xs flex items-center gap-1" style={{ color: 'var(--danger)' }}>
                    <AlertCircle size={11} /> Not a valid 0x address
                  </p>
                )}
                <button
                  onClick={handleReassign}
                  disabled={reassignPending || reassignConfirming || !reassignGrantId || !reassignBuilderAddr || isWrongChain}
                  title={isWrongChain ? 'Switch network first' : undefined}
                  className="w-full h-10 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-1.5 disabled:opacity-50 btn-focus"
                  style={{ background: 'var(--brand)' }}
                >
                  {(reassignPending || reassignConfirming) ? <Loader2 size={13} className="animate-spin" /> : <UserCheck size={13} aria-hidden="true" />}
                  {reassignPending ? 'Confirm in wallet…' : reassignConfirming ? 'Reassigning…' : 'Reassign Builder'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Cancel grant ── */}
        {tab === 'cancel' && (
          <div role="tabpanel" id="tabpanel-cancel" aria-labelledby="tab-cancel" className="space-y-3">
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Cancel an Open or Active grant. Unreleased USDC is refunded to the funder.
              Completed and already-cancelled grants cannot be cancelled.
            </p>

            {cancellableGrants.length === 0 ? (
              <div
                className="rounded-xl border p-6 text-center space-y-1"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-muted)' }}
              >
                <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                  No cancellable grants
                </p>
                <p className="text-xs" style={{ color: 'var(--subtle)' }}>
                  All grants are either completed or already cancelled.
                </p>
              </div>
            ) : (
              cancellableGrants.map(g => {
                const gTotalAmt    = BigInt(g.totalAmount)
                const gReleasedAmt = BigInt(g.releasedAmount)
                const gRefundableAmt = gTotalAmt - gReleasedAmt
                const gTotalStr    = formatUnits(gTotalAmt, 6)
                const gReleasedStr = formatUnits(gReleasedAmt, 6)
                const gRefundableStr = formatUnits(gRefundableAmt, 6)
                const isThisOne = cancelGrantId === g.id
                const confirmingThis = confirmCancelId === g.id

                return (
                  <div
                    key={g.id.toString()}
                    className="rounded-xl border overflow-hidden"
                    style={{
                      borderColor: confirmingThis ? '#fecaca' : 'var(--border)',
                      background: confirmingThis ? '#fef2f2' : 'var(--surface-muted)',
                    }}
                  >
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate" style={{ color: 'var(--ink)' }}>
                          {g.title}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                          ${gTotalStr} total · ${gReleasedStr} released ·{' '}
                          <strong style={{ color: gRefundableAmt > 0n ? 'var(--spring)' : 'var(--subtle)' }}>
                            ${gRefundableStr} refundable
                          </strong>
                        </div>
                      </div>
                      {!confirmingThis && (
                        <button
                          onClick={() => setConfirmCancelId(g.id)}
                          disabled={(cancelPending || cancelConfirming) && isThisOne}
                          className="px-3 h-8 rounded-lg text-xs font-semibold flex items-center gap-1 disabled:opacity-60 shrink-0 border"
                          style={{ color: 'var(--danger)', borderColor: '#fecaca', background: '#fef2f2' }}
                          aria-label={`Cancel grant: ${g.title}`}
                        >
                          <Ban size={11} />
                          Cancel
                        </button>
                      )}
                    </div>

                    {/* M10: inline confirm panel — replaces window.confirm */}
                    {confirmingThis && (
                      <div
                        className="px-4 pb-4 space-y-3 border-t"
                        style={{ borderColor: '#fecaca' }}
                      >
                        <div className="pt-3 flex items-start gap-2 text-xs" style={{ color: '#7f1d1d' }}>
                          <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                          <span>
                            This will permanently cancel the grant and refund{' '}
                            <strong>${gRefundableStr} USDC</strong> to the funder.
                            This cannot be undone.
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCancelGrant(g.id)}
                            disabled={(cancelPending || cancelConfirming) && isThisOne || isWrongChain}
                            className="flex-1 h-8 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1 disabled:opacity-60"
                            style={{ background: 'var(--danger)' }}
                          >
                            {(cancelPending || cancelConfirming) && isThisOne
                              ? <Loader2 size={11} className="animate-spin" />
                              : <Ban size={11} />}
                            {(cancelPending || cancelConfirming) && isThisOne
                              ? 'Cancelling…'
                              : 'Yes, Cancel Grant'}
                          </button>
                          <button
                            onClick={() => setConfirmCancelId(null)}
                            disabled={(cancelPending || cancelConfirming) && isThisOne}
                            className="flex-1 h-8 rounded-lg text-xs font-medium border disabled:opacity-50"
                            style={{
                              color: 'var(--ink)',
                              borderColor: '#fecaca',
                              background: 'var(--surface-strong)',
                            }}
                          >
                            Keep Grant
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}

            {/* ── Claim funder refund ── */}
            {hasFunderRefund && (
              <div
                className="rounded-xl border p-4 flex items-center justify-between gap-3"
                style={{ background: 'var(--spring-light)', borderColor: '#a7f3d0' }}
              >
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--spring)' }}>
                    ${formatUnits(pendingFunderRefund, 6)} USDC refund ready
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                    From cancelled grant — claim to your wallet
                  </div>
                </div>
                <button
                  onClick={handleClaimRefund}
                  disabled={claimRefundPending || claimRefundConfirming || isWrongChain}
                  title={isWrongChain ? 'Switch network first' : undefined}
                  className="px-4 h-9 rounded-lg text-sm font-semibold text-white flex items-center gap-1.5 disabled:opacity-60 shrink-0 btn-focus"
                  style={{ background: 'var(--spring)' }}
                >
                  {(claimRefundPending || claimRefundConfirming)
                    ? <Loader2 size={12} className="animate-spin" />
                    : <CheckCircle2 size={12} aria-hidden="true" />}
                  {claimRefundPending ? 'Confirm…' : claimRefundConfirming ? 'Claiming…' : 'Claim Refund'}
                </button>
              </div>
            )}
            {claimRefundHash && (
              <a
                href={buildTxExplorerUrl(activeChainId, claimRefundHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs btn-focus rounded"
                style={{ color: 'var(--accent)' }}
              >
                <ExternalLink size={10} aria-hidden="true" />
                {!claimRefundConfirming && !claimRefundPending ? 'Refund confirmed — view on explorer' : 'View pending refund claim'}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
