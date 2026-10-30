import { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseUnits } from 'viem'
import {
  X, ArrowLeft, ArrowRight, ShieldCheck, ExternalLink, Plus, Trash2,
  AlertCircle, CheckCircle2, Loader2, Info, DollarSign, Calendar, Zap
} from 'lucide-react'
import {
  saveEventCreateDraft,
  loadEventCreateDraft,
  clearEventCreateDraft,
  saveOrganizerSubmission,
  type EventCreatePayload,
} from '../../utils/metadataStorage'
import type { Event } from '../../types/events'
import { useCreateEvent } from '../../hooks/useFundoraEvents'
import { FUNDORA_EVENTS_ADDRESS } from '../../contracts/fundoraEvents'

// USDC on Arc (native = ERC-20 on Arc)
const USDC_ADDRESS = '0x3600000000000000000000000000000000000000' as const
const USDC_DECIMALS = 6

const ERC20_APPROVE_ABI = [
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

interface OrganizerCreateWizardProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (eventId: bigint, txHash: string, createdEvent?: Event) => void
  initialCategory?: 'hackathon' | 'contest'
}

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6

interface TrackForm {
  id: string
  name: string
  description: string
  tiers: Array<{ place: string; amountUsdc: string }>
}

interface RubricCriterionForm {
  id: string
  name: string
  description: string
  weightPercentage: number
}

const defaultTrack = (): TrackForm => ({
  id: `track_${Date.now()}`,
  name: '',
  description: '',
  tiers: [{ place: '1st Place', amountUsdc: '' }],
})

function formatDateInput(ts: number): string {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseDateInput(val: string): number {
  if (!val) return 0
  return Math.floor(new Date(val + 'T23:59:59Z').getTime() / 1000)
}

function totalPrizeUsdc(tracks: TrackForm[]): bigint {
  let total = 0n
  for (const t of tracks) {
    for (const tier of t.tiers) {
      const raw = tier.amountUsdc.trim()
      if (!raw) continue
      try {
        total += parseUnits(raw, USDC_DECIMALS)
      } catch { /* skip invalid */ }
    }
  }
  return total
}

// Computed once at module load — avoids impure Date() call during render
const TODAY_STR = new Date().toISOString().split('T')[0]

export function OrganizerCreateWizard({ isOpen, onClose, onSuccess, initialCategory }: OrganizerCreateWizardProps) {
  const { address } = useAccount()

  // ── Wizard step ──────────────────────────────────────────────────────────
  const [step, setStep] = useState<WizardStep>(1)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load draft once at init — avoids set-state-in-effect
  const _initDraft = useMemo(() => loadEventCreateDraft(), [])

  // ── Step 1: Modality ─────────────────────────────────────────────────────
  const [modality, setModality] = useState<'native_escrow' | 'external_listing'>(
    () => _initDraft?.modality ?? 'native_escrow'
  )

  // ── Step 2: Details ──────────────────────────────────────────────────────
  const [title, setTitle] = useState(() => _initDraft?.title ?? '')
  const [tagline, setTagline] = useState(() => _initDraft?.tagline ?? '')
  const [description, setDescription] = useState(() => _initDraft?.description ?? '')
  const [category, setCategory] = useState<'hackathon' | 'contest'>(
    () => initialCategory ?? _initDraft?.category ?? 'hackathon'
  )
  const [contactEmail, setContactEmail] = useState(() => _initDraft?.contactEmail ?? '')
  const [tags, setTags] = useState<string[]>(() => _initDraft?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [externalUrl, setExternalUrl] = useState(() => _initDraft?.externalUrl ?? '')
  const [externalPlatformName, setExternalPlatformName] = useState(
    () => _initDraft?.externalPlatformName ?? ''
  )

  // ── Step 3: Schedule ─────────────────────────────────────────────────────
  const [submissionDeadlineDate, setSubmissionDeadlineDate] = useState(
    () => _initDraft ? formatDateInput(_initDraft.submissionDeadlineDays) : ''
  )
  const [judgingDeadlineDate, setJudgingDeadlineDate] = useState(
    () => _initDraft ? formatDateInput(_initDraft.judgingDays) : ''
  )

  // ── Step 4: Prizes ───────────────────────────────────────────────────────
  const [tracks, setTracks] = useState<TrackForm[]>(() =>
    _initDraft?.tracks?.length
      ? _initDraft.tracks.map((t, i) => ({ id: `track_${i}`, name: t.name, description: t.description, tiers: t.tiers }))
      : [defaultTrack()]
  )
  const [rubric, setRubric] = useState<RubricCriterionForm[]>([
    { id: 'rc1', name: 'Technical Implementation', description: 'Code quality, architecture, and Arc integration depth', weightPercentage: 40 },
    { id: 'rc2', name: 'Innovation', description: 'Originality and creative use of onchain primitives', weightPercentage: 30 },
    { id: 'rc3', name: 'Product & UX', description: 'Usability, UI polish, and real-world applicability', weightPercentage: 30 },
  ])

  // ── Step 5: Reviewers ────────────────────────────────────────────────────
  const [reviewerInput, setReviewerInput] = useState('')
  const [reviewers, setReviewers] = useState<string[]>(() => _initDraft?.reviewers ?? [])

  // ── Step 6: Publish tx states (fully derived from wagmi — see publishStage below)

  // USDC balance + allowance reads
  const { data: usdcBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_APPROVE_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && modality === 'native_escrow' },
  })
  const prizeTotal = totalPrizeUsdc(tracks)
  const { data: usdcAllowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_APPROVE_ABI,
    functionName: 'allowance',
    args: address ? [address, FUNDORA_EVENTS_ADDRESS] : undefined,
    query: { enabled: !!address && modality === 'native_escrow' },
  })

  // ERC-20 approve
  const {
    writeContract: writeApprove,
    data: approveHash,
    isPending: isApprovePending,
    error: approveWriteError,
  } = useWriteContract()
  const approveReceipt = useWaitForTransactionReceipt({ hash: approveHash })

  // createEvent
  const {
    createEvent,
    hash: createHash,
    isPending: isCreatePending,
    isConfirming: isCreateConfirming,
    isSuccess: isCreateSuccess,
    error: createError,
  } = useCreateEvent()

  // Draft was loaded via lazy useState initializers above.
  // Show a restore notice if a draft was found.
  const [draftRestoredTime] = useState<string | null>(
    () => _initDraft ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null
  )

  // Autosave draft
  useEffect(() => {
    if (!isOpen || !title.trim()) return
    const timer = setTimeout(() => {
      const payload: EventCreatePayload = {
        title, tagline, description, category, contactEmail, modality, externalUrl,
        externalPlatformName, tags,
        submissionDeadlineDays: parseDateInput(submissionDeadlineDate),
        judgingDays: parseDateInput(judgingDeadlineDate),
        tracks: tracks.map((t) => ({ name: t.name, description: t.description, tiers: t.tiers })),
        rubric: rubric.map((r) => ({ name: r.name, description: r.description, weightPercentage: r.weightPercentage })),
        reviewers,
      }
      saveEventCreateDraft(payload)
    }, 800)
    return () => clearTimeout(timer)
  }, [isOpen, title, tagline, description, category, contactEmail, modality, externalUrl, externalPlatformName,
    tags, submissionDeadlineDate, judgingDeadlineDate, tracks, rubric, reviewers])

  // Derive full publish stage from wagmi state — no setState needed for transitions
  const isApproveConfirmed = approveReceipt.isSuccess
  const isCreateDone = isCreateSuccess
  const publishStage: 'idle' | 'approving' | 'approved' | 'creating' | 'done' =
    isCreateDone ? 'done'
    : isCreatePending || isCreateConfirming ? 'creating'
    : isApproveConfirmed ? 'approved'
    : isApprovePending || approveReceipt.isLoading ? 'approving'
    : 'idle'

  const handleClearDraft = () => {
    clearEventCreateDraft()
    setTitle(''); setTagline(''); setDescription('')
    setContactEmail('')
    setTags([]); setExternalUrl(''); setExternalPlatformName('')
    setTracks([defaultTrack()]); setReviewers([])
  }

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = (s: WizardStep): boolean => {
    const e: Record<string, string> = {}
    if (s === 2) {
      if (!title.trim()) e.title = 'Event title is required'
      if (!description.trim() || description.length < 50) e.description = 'Description must be at least 50 characters'
      if (!contactEmail.trim()) e.contactEmail = 'Contact email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) e.contactEmail = 'Enter a valid email address'
      if (modality === 'external_listing') {
        if (!externalUrl.trim()) e.externalUrl = 'External URL is required'
        else if (!/^https?:\/\//.test(externalUrl)) e.externalUrl = 'Must be a valid https:// URL'
      }
    }
    if (s === 3) {
      const now = Math.floor(Date.now() / 1000)
      const subTs = parseDateInput(submissionDeadlineDate)
      const judgeTs = parseDateInput(judgingDeadlineDate)
      if (!subTs || subTs <= now) e.submissionDeadline = 'Submission deadline must be in the future'
      if (!judgeTs || judgeTs < subTs) e.judgingDeadline = 'Judging deadline must be on or after submission deadline'
    }
    if (s === 4 && modality === 'native_escrow') {
      tracks.forEach((t, i) => {
        if (!t.name.trim()) e[`track_${i}_name`] = `Track ${i + 1} name is required`
        t.tiers.forEach((tier, j) => {
          if (!tier.amountUsdc.trim() || isNaN(Number(tier.amountUsdc))) {
            e[`track_${i}_tier_${j}`] = 'Enter a valid USDC amount'
          }
        })
      })
      const total = totalPrizeUsdc(tracks)
      if (total === 0n) e.prizeTotal = 'Total prize pool must be greater than 0'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if (validate(step)) setStep((s) => Math.min(6, s + 1) as WizardStep) }
  const back = () => { setErrors({}); setStep((s) => Math.max(1, s - 1) as WizardStep) }

  // ── Tags ─────────────────────────────────────────────────────────────────
  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t) && tags.length < 6) setTags([...tags, t])
    setTagInput('')
  }

  // ── Publish flow ─────────────────────────────────────────────────────────
  const handleApprove = () => {
    if (!address) return
    writeApprove({
      address: USDC_ADDRESS,
      abi: ERC20_APPROVE_ABI,
      functionName: 'approve',
      args: [FUNDORA_EVENTS_ADDRESS, prizeTotal],
    })
  }

  const handleCreate = () => {
    if (!validate(6)) return
    createEvent({
      title,
      description,
      externalUrl: modality === 'external_listing' ? externalUrl : '',
      eventType: modality === 'native_escrow' ? 0 : 1,
      totalPrizePool: modality === 'native_escrow' ? prizeTotal : 0n,
      submissionDeadline: parseDateInput(submissionDeadlineDate),
      judgingDeadline: parseDateInput(judgingDeadlineDate),
    })
  }

  const handlePublish = () => {
    const currentAllowance = (usdcAllowance) ?? 0n
    if (modality === 'native_escrow' && currentAllowance < prizeTotal) {
      handleApprove()
    } else {
      handleCreate()
    }
  }

  // After approve confirms: refetch allowance then call handleCreate.
  // handleCreate sets publishStage('creating') — that is fine because it
  // runs inside a wagmi writeContract callback, not directly in the effect body.
  const didTriggerCreateRef = useRef(false)
  useEffect(() => {
    if (!isApproveConfirmed || didTriggerCreateRef.current) return
    didTriggerCreateRef.current = true
    void refetchAllowance().then(() => handleCreate())
  }, [isApproveConfirmed]) // eslint-disable-line react-hooks/exhaustive-deps

  // After createEvent confirms: save pending submission, clear draft, notify parent.
  const didNotifyRef = useRef(false)
  useEffect(() => {
    if (!isCreateDone || didNotifyRef.current) return
    didNotifyRef.current = true
    clearEventCreateDraft()
    saveOrganizerSubmission({
      id: `org_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      organizerAddress: address ?? '',
      title,
      contactEmail,
      category,
      modality,
      status: 'pending',
      submittedAt: Date.now(),
    })
    if (createHash) {
      const createdEv: Event = {
        id: `event_${Date.now()}`,
        title,
        tagline: tagline || title,
        description,
        category,
        modality,
        status: 'active',
        hostName: address ? `${address.slice(0, 6)}…${address.slice(-4)}` : 'Organizer',
        hostAddress: address,
        totalPrizePoolUsdc: prizeTotal,
        contractAddress: modality === 'native_escrow' ? FUNDORA_EVENTS_ADDRESS : undefined,
        tags: tags.length > 0 ? tags : [category],
        startDate: Math.floor(Date.now() / 1000),
        submissionDeadline: parseDateInput(submissionDeadlineDate) || Math.floor(Date.now() / 1000) + 86400 * 14,
        judgingDeadline: parseDateInput(judgingDeadlineDate) || Math.floor(Date.now() / 1000) + 86400 * 21,
        tracks: tracks.map((t, idx) => ({
          id: t.id || `track_${idx}`,
          name: t.name,
          description: t.description,
          prizePoolUsdc: t.tiers.reduce((sum, tr) => {
            try { return sum + parseUnits(tr.amountUsdc || '0', USDC_DECIMALS) } catch { return sum }
          }, 0n),
          prizeTiers: t.tiers.map((tr, pIdx) => ({
            id: `tier_${idx}_${pIdx}`,
            place: tr.place,
            amountUsdc: (() => {
              try { return parseUnits(tr.amountUsdc || '0', USDC_DECIMALS) } catch { return 0n }
            })(),
          })),
        })),
        rubric: rubric.map((r, rIdx) => ({
          id: r.id || `rubric_${rIdx}`,
          name: r.name,
          description: r.description,
          weightPercentage: Number(r.weightPercentage) || 0,
          maxScore: 10,
        })),
        reviewers: reviewers.filter(Boolean),
        submissionsCount: 0,
      }
      onSuccess(1n, createHash, createdEv)
    }
  }, [isCreateDone, createHash, onSuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null

  const isNative = modality === 'native_escrow'
  const isPublishing = publishStage === 'approving' || isApprovePending || approveReceipt.isLoading
    || publishStage === 'creating' || isCreatePending || isCreateConfirming
  const txError = approveWriteError ?? approveReceipt.error ?? createError

  const stepLabels = ['Event Type', 'Details', 'Schedule', 'Prizes', 'Reviewers', 'Review & Publish']
  const subTs = parseDateInput(submissionDeadlineDate)
  const judgeTs = parseDateInput(judgingDeadlineDate)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-midnight/70 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-wizard-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl relative my-auto overflow-hidden flex flex-col"
        style={{ maxHeight: '94vh' }}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center justify-between gap-3 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-midnight/10 text-midnight">
              New Event
            </span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200/60 transition-colors"
              aria-label="Close wizard"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex items-center justify-between mb-3">
            <h2 id="create-wizard-title" className="font-jakarta font-extrabold text-xl text-midnight tracking-tight">
              {stepLabels[step - 1]}
            </h2>
            <span className="font-mono text-xs font-semibold text-slate-500">
              <span className="text-brand">0{step}</span>
              <span className="text-slate-300"> / </span>
              06
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-brand rounded-full"
              animate={{ width: `${(step / 6) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Step pills */}
          <div className="flex gap-1 mt-2 flex-wrap">
            {stepLabels.map((label, i) => (
              <span
                key={label}
                className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors ${i + 1 === step
                  ? 'bg-brand text-white'
                  : i + 1 < step
                    ? 'bg-teal-50 text-teal border border-teal-200'
                    : 'bg-slate-100 text-slate-500'
                  }`}
              >
                {i + 1 < step ? '✓ ' : ''}{label}
              </span>
            ))}
          </div>

          {draftRestoredTime && (
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/60">
              <span>Draft restored from {draftRestoredTime}</span>
              <button onClick={handleClearDraft} className="text-teal-900 underline hover:opacity-80 font-medium">Clear</button>
            </div>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-5">

          {/* ── STEP 1: MODALITY ──────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                Choose how participants will enter and how prizes are managed.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'native_escrow' as const,
                    icon: <ShieldCheck size={22} className="text-teal" />,
                    label: 'Native Arc Escrow',
                    desc: 'Prize pool is locked in a verified onchain smart contract. Participants submit via Fundora. Winners claim USDC directly.',
                    badge: 'Recommended',
                    badgeColor: 'text-teal bg-teal-50 border border-teal-200',
                  },
                  {
                    id: 'external_listing' as const,
                    icon: <ExternalLink size={22} className="text-slate-500" />,
                    label: 'External Listing',
                    desc: 'List an event hosted on another platform (Devpost, DoraHacks, X). No USDC escrow — participants apply externally.',
                    badge: 'No Escrow',
                    badgeColor: 'text-slate-600 bg-slate-100 border border-slate-200',
                  },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    onClick={() => setModality(opt.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${modality === opt.id
                      ? 'border-brand bg-brand-light/40 ring-1 ring-brand shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">{opt.icon}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-jakarta font-bold text-sm text-midnight">{opt.label}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${opt.badgeColor}`}>{opt.badge}</span>
                        </div>
                        <p className="text-[12px] text-slate-600 leading-relaxed">{opt.desc}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <div className={`w-4 h-4 rounded-full border-2 transition-colors ${modality === opt.id ? 'border-brand bg-brand' : 'border-slate-300'}`}>
                        {modality === opt.id && <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5" />}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {isNative && (
                <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200/60 text-[12px] text-teal-900 flex items-start gap-2 leading-relaxed">
                  <Info size={14} className="text-teal shrink-0 mt-0.5" />
                  <span>
                    You will need sufficient USDC on Arc Testnet to fund the prize pool. You will approve the exact amount during the publish step — no funds move until you confirm both steps in your wallet.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: DETAILS ───────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-midnight uppercase tracking-wider mb-1.5">Event Category *</label>
                <div className="flex gap-3">
                  {(['hackathon', 'contest'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${category === cat ? 'border-brand bg-brand-light text-brand' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                    >
                      {cat === 'hackathon' ? '🏗 Hackathon' : '🎯 Contest'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-midnight uppercase tracking-wider mb-1.5">Event Title *</label>
                <input
                  type="text"
                  maxLength={80}
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors({ ...errors, title: '' }) }}
                  placeholder="e.g. Arc Nanopayments & Agent Sprint"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-midnight placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand ${errors.title ? 'border-coral ring-1 ring-coral' : 'border-slate-200'}`}
                />
                {errors.title && <span className="text-xs text-coral mt-1 block">{errors.title}</span>}
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-bold text-midnight uppercase tracking-wider mb-1.5">Short Tagline</label>
                <input
                  type="text"
                  maxLength={120}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="One-line summary shown on directory cards"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-midnight placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-midnight uppercase tracking-wider mb-1.5">Event Description *</label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); if (errors.description) setErrors({ ...errors, description: '' }) }}
                  placeholder="What are participants building? What problem does it solve? What makes this special?"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-midnight placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand resize-none ${errors.description ? 'border-coral ring-1 ring-coral' : 'border-slate-200'}`}
                />
                {errors.description && <span className="text-xs text-coral mt-1 block">{errors.description}</span>}
              </div>

              {/* Contact Email */}
              <div>
                <label className="block text-xs font-bold text-midnight uppercase tracking-wider mb-1.5">
                  Contact Email *
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => { setContactEmail(e.target.value); if (errors.contactEmail) setErrors({ ...errors, contactEmail: '' }) }}
                  placeholder="you@example.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-midnight placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand ${errors.contactEmail ? 'border-coral ring-1 ring-coral' : 'border-slate-200'}`}
                />
                {errors.contactEmail && <span className="text-xs text-coral mt-1 block">{errors.contactEmail}</span>}
                <p className="text-[11px] text-slate-500 mt-1">
                  You'll receive a submission confirmation at this address, and a decision email once your event has been manually reviewed.
                </p>
              </div>

              {/* External URL (only for external listings) */}
              {!isNative && (
                <div>
                  <label className="block text-xs font-bold text-midnight uppercase tracking-wider mb-1.5">External Platform URL *</label>
                  <input
                    type="url"
                    value={externalUrl}
                    onChange={(e) => { setExternalUrl(e.target.value); if (errors.externalUrl) setErrors({ ...errors, externalUrl: '' }) }}
                    placeholder="https://dorahacks.io/hackathon/..."
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-midnight placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand ${errors.externalUrl ? 'border-coral ring-1 ring-coral' : 'border-slate-200'}`}
                  />
                  {errors.externalUrl && <span className="text-xs text-coral mt-1 block">{errors.externalUrl}</span>}
                  <input
                    type="text"
                    value={externalPlatformName}
                    onChange={(e) => setExternalPlatformName(e.target.value)}
                    placeholder='Platform name (e.g. "DoraHacks")'
                    className="w-full mt-2 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-midnight placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
              )}

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-midnight uppercase tracking-wider mb-1.5">
                  Tags ({tags.length}/6)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                    placeholder="arc, usdc, defi..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs text-midnight focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                  <button type="button" onClick={addTag} className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700">
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {t}
                        <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} className="text-slate-400 hover:text-coral">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 3: SCHEDULE ──────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                Set the submission deadline and judging period. Both are enforced onchain and cannot be changed after creation.
              </p>
              <div>
                <label className="block text-xs font-bold text-midnight uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar size={13} className="text-brand" />
                  Submission Deadline *
                </label>
                <input
                  type="date"
                  value={submissionDeadlineDate}
                  min={TODAY_STR}
                  onChange={(e) => { setSubmissionDeadlineDate(e.target.value); if (errors.submissionDeadline) setErrors({ ...errors, submissionDeadline: '' }) }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-midnight focus:outline-none focus:ring-2 focus:ring-brand ${errors.submissionDeadline ? 'border-coral ring-1 ring-coral' : 'border-slate-200'}`}
                />
                {errors.submissionDeadline && <span className="text-xs text-coral mt-1 block">{errors.submissionDeadline}</span>}
                {subTs > 0 && <span className="text-[11px] text-slate-500 mt-1 block">Closes: {new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(subTs * 1000))}</span>}
              </div>
              <div>
                <label className="block text-xs font-bold text-midnight uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar size={13} className="text-amber-600" />
                  Judging Deadline *
                </label>
                <input
                  type="date"
                  value={judgingDeadlineDate}
                  min={submissionDeadlineDate || TODAY_STR}
                  onChange={(e) => { setJudgingDeadlineDate(e.target.value); if (errors.judgingDeadline) setErrors({ ...errors, judgingDeadline: '' }) }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-midnight focus:outline-none focus:ring-2 focus:ring-brand ${errors.judgingDeadline ? 'border-coral ring-1 ring-coral' : 'border-slate-200'}`}
                />
                {errors.judgingDeadline && <span className="text-xs text-coral mt-1 block">{errors.judgingDeadline}</span>}
                {judgeTs > 0 && <span className="text-[11px] text-slate-500 mt-1 block">Closes: {new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(judgeTs * 1000))}</span>}
              </div>
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-[12px] text-amber-900 flex items-start gap-2">
                <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <span>Deadlines are stored onchain as Unix timestamps and cannot be modified after the event is published.</span>
              </div>
            </div>
          )}

          {/* ── STEP 4: PRIZES ────────────────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-5">
              {!isNative ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-700">
                  <Info size={14} className="inline text-slate-400 mr-1.5" />
                  External listing events do not escrow prize funds through Fundora. Prize details are managed by the external platform.
                </div>
              ) : (
                <>
                  {/* Prize total */}
                  <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/60">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">Total to Escrow</span>
                      <div className="font-mono font-extrabold text-xl text-teal tabular-nums">
                        ${Number(prizeTotal / BigInt(10 ** USDC_DECIMALS)).toLocaleString()} USDC
                      </div>
                    </div>
                    <p className="text-[11px] text-teal-700 mt-1">This exact amount will be transferred from your wallet during publish.</p>
                    {errors.prizeTotal && <span className="text-xs text-coral mt-1 block">{errors.prizeTotal}</span>}
                  </div>

                  {/* Tracks */}
                  {tracks.map((track, ti) => (
                    <div key={track.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-midnight uppercase tracking-wider">Track {ti + 1}</span>
                        {tracks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setTracks(tracks.filter((_, i) => i !== ti))}
                            className="text-slate-400 hover:text-coral"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Track name (e.g. DeFi & Payments)"
                        value={track.name}
                        onChange={(e) => setTracks(tracks.map((t, i) => i === ti ? { ...t, name: e.target.value } : t))}
                        className={`w-full px-3 py-2 rounded-xl border text-sm text-midnight placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand ${errors[`track_${ti}_name`] ? 'border-coral' : 'border-slate-200'}`}
                      />
                      <textarea
                        rows={2}
                        placeholder="Brief track description..."
                        value={track.description}
                        onChange={(e) => setTracks(tracks.map((t, i) => i === ti ? { ...t, description: e.target.value } : t))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-midnight placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                      />

                      {/* Prize tiers */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Prize Tiers</span>
                        {track.tiers.map((tier, ji) => (
                          <div key={ji} className="flex gap-2 items-center">
                            <input
                              type="text"
                              placeholder="Place (e.g. 1st)"
                              value={tier.place}
                              onChange={(e) => setTracks(tracks.map((t, i) => i === ti ? { ...t, tiers: t.tiers.map((tr, j) => j === ji ? { ...tr, place: e.target.value } : tr) } : t))}
                              className="w-28 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-midnight focus:outline-none focus:ring-1 focus:ring-brand"
                            />
                            <div className="relative flex-1">
                              <DollarSign size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-teal" />
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Amount USDC"
                                value={tier.amountUsdc}
                                onChange={(e) => setTracks(tracks.map((t, i) => i === ti ? { ...t, tiers: t.tiers.map((tr, j) => j === ji ? { ...tr, amountUsdc: e.target.value } : tr) } : t))}
                                className={`w-full pl-7 pr-3 py-1.5 rounded-lg border text-xs text-midnight focus:outline-none focus:ring-1 focus:ring-brand ${errors[`track_${ti}_tier_${ji}`] ? 'border-coral' : 'border-slate-200'}`}
                              />
                            </div>
                            {track.tiers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setTracks(tracks.map((t, i) => i === ti ? { ...t, tiers: t.tiers.filter((_, j) => j !== ji) } : t))}
                                className="text-slate-400 hover:text-coral"
                              >
                                <X size={13} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setTracks(tracks.map((t, i) => i === ti ? { ...t, tiers: [...t.tiers, { place: '', amountUsdc: '' }] } : t))}
                          className="inline-flex items-center gap-1 text-xs text-brand hover:underline font-semibold"
                        >
                          <Plus size={12} /> Add Tier
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setTracks([...tracks, defaultTrack()])}
                    disabled={tracks.length >= 6}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand border border-brand-border bg-brand-light px-3 py-2 rounded-xl hover:bg-brand-light/70 disabled:opacity-50"
                  >
                    <Plus size={13} /> Add Track
                  </button>
                </>
              )}

              {/* Rubric */}
              <div className="pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-midnight uppercase tracking-wider">Judging Rubric</span>
                  <span className="text-[11px] text-slate-500">(stored offchain — visible to reviewers)</span>
                </div>
                {rubric.map((r, ri) => (
                  <div key={r.id} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={r.name}
                      onChange={(e) => setRubric(rubric.map((rc, i) => i === ri ? { ...rc, name: e.target.value } : rc))}
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-midnight focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                    <div className="flex items-center gap-1 text-xs">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={r.weightPercentage}
                        onChange={(e) => setRubric(rubric.map((rc, i) => i === ri ? { ...rc, weightPercentage: Number(e.target.value) } : rc))}
                        className="w-14 px-2 py-1.5 rounded-lg border border-slate-200 text-center text-xs focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                      <span className="text-slate-500">%</span>
                    </div>
                    {rubric.length > 1 && (
                      <button type="button" onClick={() => setRubric(rubric.filter((_, i) => i !== ri))} className="text-slate-400 hover:text-coral">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setRubric([...rubric, { id: `rc${Date.now()}`, name: '', description: '', weightPercentage: 0 }])}
                  className="text-xs text-brand hover:underline font-semibold inline-flex items-center gap-1 mt-1"
                >
                  <Plus size={12} /> Add Criterion
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 5: REVIEWERS ─────────────────────────────────────── */}
          {step === 5 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                Add reviewer wallet addresses. Reviewers can score submissions via the contract. You can also add reviewers after publish from the Admin Panel.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={reviewerInput}
                  onChange={(e) => setReviewerInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (reviewerInput.startsWith('0x') && reviewerInput.length === 42 && !reviewers.includes(reviewerInput.toLowerCase())) {
                        setReviewers([...reviewers, reviewerInput.toLowerCase()])
                        setReviewerInput('')
                      }
                    }
                  }}
                  placeholder="0x wallet address"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-midnight placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (reviewerInput.startsWith('0x') && reviewerInput.length === 42 && !reviewers.includes(reviewerInput.toLowerCase())) {
                      setReviewers([...reviewers, reviewerInput.toLowerCase()])
                      setReviewerInput('')
                    }
                  }}
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
                >
                  <Plus size={14} />
                </button>
              </div>
              {reviewers.length === 0 && (
                <p className="text-[11px] text-slate-400 italic">No reviewers added. You can add them later from the Admin Panel.</p>
              )}
              {reviewers.map((r) => (
                <div key={r} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white">
                  <span className="font-mono text-xs text-midnight">{r.slice(0, 10)}...{r.slice(-6)}</span>
                  <button type="button" onClick={() => setReviewers(reviewers.filter((x) => x !== r))} className="text-slate-400 hover:text-coral">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[12px] text-slate-600 flex items-start gap-2">
                <Info size={13} className="text-slate-400 shrink-0 mt-0.5" />
                <span>
                  Note: reviewer addresses will be added to the contract via separate <code>addReviewer</code> transactions after the event is created. This step records your intent for batch add after publish.
                </span>
              </div>
            </div>
          )}

          {/* ── STEP 6: REVIEW & PUBLISH ──────────────────────────────── */}
          {step === 6 && (
            <div className="space-y-5">
              {/* Summary card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3.5 text-xs">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Event Type</span>
                  <span className="font-semibold text-midnight">{isNative ? '🔒 Native Arc Escrow' : '🔗 External Listing'}</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Category</span>
                  <span className="font-semibold text-midnight capitalize">{category}</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Title</span>
                  <span className="font-bold text-midnight font-jakarta">{title}</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Submission Deadline</span>
                  <span className="font-semibold text-midnight">{subTs > 0 ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(subTs * 1000)) : '—'}</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Judging Deadline</span>
                  <span className="font-semibold text-midnight">{judgeTs > 0 ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(judgeTs * 1000)) : '—'}</span>
                </div>
                {isNative && (
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Prize Pool to Escrow</span>
                    <span className="font-mono font-extrabold text-teal tabular-nums">
                      ${Number(prizeTotal / BigInt(10 ** USDC_DECIMALS)).toLocaleString()} USDC
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Tracks / Reviewers</span>
                  <span className="font-semibold text-midnight">{tracks.length} tracks · {reviewers.length} reviewers</span>
                </div>
              </div>

              {/* USDC balance check (native only) */}
              {isNative && (
                <div className={`p-4 rounded-2xl border text-xs ${(usdcBalance ?? 0n) >= prizeTotal ? 'border-teal-200 bg-teal-50/60' : 'border-coral-200 bg-coral-50/60'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign size={13} className={(usdcBalance ?? 0n) >= prizeTotal ? 'text-teal' : 'text-coral'} />
                    <span className="font-bold text-midnight">Your USDC Balance</span>
                  </div>
                  <div className="font-mono font-bold text-base tabular-nums text-midnight">
                    ${Number(((usdcBalance) ?? 0n) / BigInt(10 ** USDC_DECIMALS)).toLocaleString()} USDC
                  </div>
                  {(usdcBalance ?? 0n) < prizeTotal && (
                    <p className="text-coral mt-1 font-medium">Insufficient balance. You need at least ${Number(prizeTotal / BigInt(10 ** USDC_DECIMALS)).toLocaleString()} USDC on Arc Testnet.</p>
                  )}
                </div>
              )}

              {/* Two-step publish explanation (native only) */}
              {isNative && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-[12px]">
                  <p className="font-bold text-midnight text-sm">Publishing requires two wallet confirmations:</p>
                  <div className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${publishStage === 'idle' || publishStage === 'approving' ? 'border-brand/30 bg-brand-light/40' : 'border-teal-200 bg-teal-50/60'}`}>
                    <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${publishStage === 'approved' || publishStage === 'creating' || publishStage === 'done' ? 'bg-teal text-white' : 'bg-brand text-white'}`}>
                      {publishStage === 'approved' || publishStage === 'creating' || publishStage === 'done' ? '✓' : '1'}
                    </div>
                    <div>
                      <span className="font-semibold text-midnight block">Approve USDC</span>
                      <span className="text-slate-500">Authorize FundoraEvents to transfer ${Number(prizeTotal / BigInt(10 ** USDC_DECIMALS)).toLocaleString()} USDC from your wallet.</span>
                    </div>
                  </div>
                  <div className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${publishStage === 'creating' || publishStage === 'done' ? 'border-teal-200 bg-teal-50/60' : 'border-slate-200'}`}>
                    <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${publishStage === 'done' ? 'bg-teal text-white' : publishStage === 'creating' ? 'bg-brand text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {publishStage === 'done' ? '✓' : '2'}
                    </div>
                    <div>
                      <span className="font-semibold text-midnight block">Create Event &amp; Lock Escrow</span>
                      <span className="text-slate-500">Publish the event onchain. USDC is transferred to the contract vault at this step.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Success */}
              {publishStage === 'done' && (
                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-teal shrink-0" />
                  <div>
                    <p className="font-bold text-teal-900 text-sm">Event Published!</p>
                    <p className="text-[12px] text-teal-700 mt-0.5">
                      Your event is live onchain. Use the Admin Panel to manage reviewers and finalize winners.
                    </p>
                    {createHash && (
                      <a
                        href={`https://explorer.testnet.arc.io/tx/${createHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-teal hover:underline mt-1.5"
                      >
                        View on Explorer <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Error */}
              {txError && (
                <div className="p-3.5 rounded-xl bg-coral-50 border border-coral-200 text-xs text-coral flex items-start gap-2">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{(txError as Error).message?.split('\n')[0]?.slice(0, 200) || 'Transaction failed. Please try again.'}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-200/80 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          {step > 1 && publishStage !== 'done' ? (
            <button
              type="button"
              onClick={back}
              disabled={isPublishing}
              className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:text-midnight bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft size={13} /> Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              disabled={isPublishing}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-2"
            >
              {publishStage === 'done' ? 'Close' : 'Cancel'}
            </button>
          )}

          {publishStage === 'done' ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl text-xs font-bold text-white bg-teal hover:bg-teal/90 shadow-sm"
            >
              <CheckCircle2 size={14} />
              Done
            </button>
          ) : step < 6 ? (
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-1.5 py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-midnight hover:bg-slate-800 transition-colors shadow-sm"
            >
              Continue
              <ArrowRight size={13} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing || !address}
              className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl text-xs font-bold text-white bg-brand hover:bg-brand-hover disabled:opacity-50 transition-colors shadow-sm"
            >
              {isApprovePending || publishStage === 'approving' ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Confirm Approval…
                </>
              ) : approveReceipt.isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Confirming Approval…
                </>
              ) : isCreatePending || publishStage === 'creating' ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Confirm in Wallet…
                </>
              ) : isCreateConfirming ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publishing on Arc…
                </>
              ) : (
                <>
                  <Zap size={14} />
                  {isNative ? 'Approve & Publish' : 'Publish Event'}
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
