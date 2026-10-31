import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { keccak256, toHex } from 'viem'
import {
  X, Github, Globe, Video, Copy, Check, CheckCircle2,
  ChevronRight, Scale,
} from 'lucide-react'
import type { Event } from '../../types/events'
import type { RubricCriterion } from '../../types/events'
import { useSubmitReview } from '../../hooks/useFundoraEvents'
import { useSubmissionsBatch } from '../../hooks/useFundoraEvents'
import { useMode } from '../../context/ModeContext'
import { useEvents } from '../../context/EventsContext'
import {
  saveScorecardDraft,
  loadScorecardDraft,
} from '../../utils/scorecardStorage'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ReviewerScorecardModalProps {
  event: Event
  submissionIndex: number
  reviewerAddress: string
  onNext: () => void
  onClose: () => void
}

interface ParsedMeta {
  title?: string
  tagline?: string
  description?: string
  repoUrl?: string
  demoUrl?: string
  videoUrl?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseMeta(uri: string): ParsedMeta {
  try { return JSON.parse(uri) as ParsedMeta } catch { return { title: uri } }
}

function shortAddr(addr: string) {
  return addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr
}

/** Compute weighted 1–10 score from criterion scores + rubric */
function computeWeightedTotal(
  scores: Record<string, number>,
  rubric: RubricCriterion[],
): number {
  if (rubric.length === 0) return 5
  let total = 0
  for (const criterion of rubric) {
    const score = scores[criterion.id] ?? 5
    total += score * (criterion.weightPercentage / 100)
  }
  return total
}

/** Convert weighted 1–10 total to onchain 1–100 uint16 */
function toOnchainScore(weightedTotal: number): number {
  return Math.max(1, Math.min(100, Math.round(weightedTotal * 10)))
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { void navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800) }}
      className="text-slate-400 hover:text-brand transition-colors outline-none focus-visible:ring-1 focus-visible:ring-brand rounded"
      aria-label="Copy address"
    >
      {copied ? <Check size={12} className="text-teal" /> : <Copy size={12} />}
    </button>
  )
}

// ── Criterion slider row ──────────────────────────────────────────────────────
function CriterionSlider({
  criterion,
  value,
  onChange,
}: {
  criterion: RubricCriterion
  value: number
  onChange: (v: number) => void
}) {
  const pct = ((value - 1) / 9) * 100
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-midnight">{criterion.name}</span>
          {criterion.description && (
            <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--muted)' }}>
              {criterion.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold"
            style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
            {criterion.weightPercentage}%
          </span>
          <span className="font-mono font-bold text-sm w-10 text-right tabular-nums text-midnight">
            {value} / 10
          </span>
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand"
          style={{
            background: `linear-gradient(to right, var(--brand) 0%, var(--brand) ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)`,
          }}
          aria-label={`${criterion.name} score`}
          aria-valuemin={1}
          aria-valuemax={10}
          aria-valuenow={value}
        />
      </div>
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────
export function ReviewerScorecardModal({
  event,
  submissionIndex,
  reviewerAddress,
  onNext,
  onClose,
}: ReviewerScorecardModalProps) {
  const { isLive } = useMode()
  const { getSubmissionsForEvent } = useEvents()
  const [mobileTab, setMobileTab] = useState<'inspect' | 'score'>('inspect')

  // ── Fetch submission data ──────────────────────────────────────────────────
  const eventIdBig = useMemo(() => {
    try { return BigInt(event.id.replace(/\D/g, '') || '0') } catch { return 0n }
  }, [event.id])

  const { data: onchainSubs } = useSubmissionsBatch(
    isLive ? eventIdBig : undefined,
    0,
    50,
  )

  const mockSubs = useMemo(() => getSubmissionsForEvent(event.id), [event.id, getSubmissionsForEvent])

  const activeSub = useMemo(() => {
    if (isLive && onchainSubs) return onchainSubs[submissionIndex]
    if (!isLive && mockSubs[submissionIndex]) {
      const m = mockSubs[submissionIndex]
      return {
        id: BigInt(submissionIndex + 1),
        submitter: (m.submitterAddress || '0x0000000000000000000000000000000000000000') as `0x${string}`,
        metadataUri: JSON.stringify({
          title: m.title,
          tagline: m.tagline,
          description: m.description,
          repoUrl: m.repoUrl,
          demoUrl: m.demoUrl,
        }),
        scoreSum: 0,
        reviewCount: 0,
        disqualified: false,
      }
    }
    return null
  }, [isLive, onchainSubs, mockSubs, submissionIndex])

  const submissionId = activeSub?.id.toString() ?? String(submissionIndex + 1)
  const meta = parseMeta(activeSub?.metadataUri ?? '')
  const totalSubs = isLive ? (onchainSubs?.length ?? event.submissionsCount) : mockSubs.length

  // ── Scorecard state ────────────────────────────────────────────────────────
  const defaultScores = useMemo(() => {
    const draft = loadScorecardDraft(event.id, submissionId, reviewerAddress)
    if (draft?.criterionScores) return draft.criterionScores
    const defaults: Record<string, number> = {}
    for (const c of event.rubric) defaults[c.id] = 5
    return defaults
  }, [event.id, event.rubric, submissionId, reviewerAddress])

  const defaultNotes = useMemo(() => {
    const draft = loadScorecardDraft(event.id, submissionId, reviewerAddress)
    return draft?.notes ?? ''
  }, [event.id, submissionId, reviewerAddress])

  const [criterionScores, setCriterionScores] = useState<Record<string, number>>(defaultScores)
  const [notes, setNotes] = useState(defaultNotes)
  const [dwellSuccess, setDwellSuccess] = useState(false)

  // Reset when submission index changes — defer to avoid synchronous setState-in-effect
  useEffect(() => {
    const t = setTimeout(() => {
      const draft = loadScorecardDraft(event.id, submissionId, reviewerAddress)
      const newScores: Record<string, number> = {}
      for (const c of event.rubric) newScores[c.id] = draft?.criterionScores?.[c.id] ?? 5
      setCriterionScores(newScores)
      setNotes(draft?.notes ?? '')
      setDwellSuccess(false)
      setMobileTab('inspect')
    }, 0)
    return () => clearTimeout(t)
  }, [submissionIndex, submissionId, event.id, event.rubric, reviewerAddress])

  // ── Live computed scores ───────────────────────────────────────────────────
  const weightedTotal = useMemo(
    () => computeWeightedTotal(criterionScores, event.rubric),
    [criterionScores, event.rubric],
  )
  const onchainScore = useMemo(() => toOnchainScore(weightedTotal), [weightedTotal])

  // ── Autosave debounce ──────────────────────────────────────────────────────
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveScorecardDraft(event.id, submissionId, reviewerAddress, {
        criterionScores,
        notes,
        savedAt: Date.now(),
        submitted: false,
        onchainScore,
      })
    }, 800)
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [criterionScores, notes, event.id, submissionId, reviewerAddress, onchainScore])

  // ── Onchain submit ─────────────────────────────────────────────────────────
  const { submitReview, isPending, isConfirming, isSuccess, error } = useSubmitReview()

  const handleSubmit = useCallback(() => {
    if (isPending || isConfirming || dwellSuccess) return
    if (!isLive) {
      saveScorecardDraft(event.id, submissionId, reviewerAddress, {
        criterionScores,
        notes,
        savedAt: Date.now(),
        submitted: true,
        onchainScore,
      })
      setDwellSuccess(true)
      setTimeout(() => {
        setDwellSuccess(false)
        onNext()
      }, 1200)
      return
    }
    const subIdBig = activeSub?.id ?? BigInt(submissionIndex + 1)
    const notesHash = keccak256(toHex(notes || ''))
    submitReview(eventIdBig, subIdBig, onchainScore, notesHash)
  }, [isLive, isPending, isConfirming, dwellSuccess, event.id, submissionId, reviewerAddress, criterionScores, activeSub, submissionIndex, notes, onchainScore, eventIdBig, submitReview, onNext])

  // Dwell on success then advance — defer initial setState to avoid synchronous set-in-effect
  useEffect(() => {
    if (!isSuccess) return
    // Save the submitted draft immediately (no setState — pure side-effect)
    saveScorecardDraft(event.id, submissionId, reviewerAddress, {
      criterionScores,
      notes,
      savedAt: Date.now(),
      submitted: true,
      onchainScore,
    })
    const t0 = setTimeout(() => setDwellSuccess(true), 0)
    const t1 = setTimeout(() => {
      setDwellSuccess(false)
      onNext()
    }, 1200)
    return () => { clearTimeout(t0); clearTimeout(t1) }
  }, [isSuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Keyboard Ctrl+Enter / Cmd+Enter ───────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleSubmit()
      }
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSubmit, onClose])

  // ── Submission Inspector pane ──────────────────────────────────────────────
  const InspectorPane = (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-5">
      {/* Counter */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--muted)' }}>
          Submission {submissionIndex + 1} of {totalSubs}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { if (submissionIndex + 1 < totalSubs) onNext() }}
            disabled={submissionIndex + 1 >= totalSubs}
            className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-label="Next submission"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Title + tagline */}
      <div>
        <h2 className="font-jakarta font-extrabold text-xl text-midnight leading-tight">
          {meta.title || `Submission #${submissionId}`}
        </h2>
        {meta.tagline && (
          <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--muted)' }}>{meta.tagline}</p>
        )}
      </div>

      {/* Submitter */}
      {activeSub?.submitter && (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
            {activeSub.submitter.slice(2, 4).toUpperCase()}
          </div>
          <span className="font-mono text-xs text-slate-600">{shortAddr(activeSub.submitter)}</span>
          <CopyButton text={activeSub.submitter} />
        </div>
      )}

      {/* Links */}
      <div className="flex flex-wrap gap-2">
        {meta.repoUrl && (
          <a href={meta.repoUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors hover:bg-slate-50 outline-none focus-visible:ring-2 focus-visible:ring-brand"
            style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}>
            <Github size={13} aria-hidden="true" />
            Repository
          </a>
        )}
        {meta.demoUrl && (
          <a href={meta.demoUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors hover:bg-slate-50 outline-none focus-visible:ring-2 focus-visible:ring-brand"
            style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}>
            <Globe size={13} aria-hidden="true" />
            Live Demo
          </a>
        )}
        {meta.videoUrl && (
          <a href={meta.videoUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors hover:bg-slate-50 outline-none focus-visible:ring-2 focus-visible:ring-brand"
            style={{ borderColor: 'var(--border)', color: 'var(--ink)' }}>
            <Video size={13} aria-hidden="true" />
            Video
          </a>
        )}
      </div>

      {/* Description */}
      {meta.description ? (
        <div className="text-sm leading-relaxed text-slate-700 max-w-[65ch] whitespace-pre-wrap">
          {meta.description}
        </div>
      ) : (
        <div className="text-xs italic" style={{ color: 'var(--muted)' }}>
          No project description provided.
        </div>
      )}
    </div>
  )

  // ── Scoring Console pane ───────────────────────────────────────────────────
  const ScoringPane = (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-5"
      style={{ background: 'var(--warm-bg)' }}>

      {/* Rubric criteria */}
      {event.rubric.length > 0 ? (
        <div className="space-y-5">
          {event.rubric.map(criterion => (
            <CriterionSlider
              key={criterion.id}
              criterion={criterion}
              value={criterionScores[criterion.id] ?? 5}
              onChange={v => setCriterionScores(prev => ({ ...prev, [criterion.id]: v }))}
            />
          ))}
        </div>
      ) : (
        // No rubric defined — single overall score
        <div className="space-y-2">
          <p className="text-xs font-semibold text-midnight">Overall Score</p>
          <CriterionSlider
            criterion={{ id: '__overall', name: 'Overall Quality', description: '', weightPercentage: 100, maxScore: 10 }}
            value={criterionScores['__overall'] ?? 5}
            onChange={v => setCriterionScores({ __overall: v })}
          />
        </div>
      )}

      {/* Live weighted total */}
      <div className="rounded-2xl border p-4 text-center space-y-1"
        style={{ background: 'var(--warm-surface)', borderColor: 'var(--border)' }}>
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--subtle)' }}>
          Weighted Score
        </p>
        <p className="font-mono font-extrabold text-3xl tabular-nums text-midnight">
          {weightedTotal.toFixed(1)}<span className="text-base font-semibold text-slate-400"> / 10</span>
        </p>
        <p className="text-[11px] font-semibold" style={{ color: 'var(--muted)' }}>
          → <span className="font-mono text-midnight">{onchainScore}</span> / 100 submitted onchain
        </p>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label htmlFor="review-notes" className="text-xs font-semibold text-midnight block">
          Private Deliberation Notes
        </label>
        <textarea
          id="review-notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          onKeyDown={e => {
            // Enter key must NOT submit (per project rules)
            if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) e.stopPropagation()
          }}
          rows={4}
          placeholder="Private notes & deliberation comments (visible to organizer only)…"
          className="w-full rounded-xl border px-3.5 py-2.5 text-xs text-midnight placeholder:text-slate-400 resize-none outline-none focus:ring-2 focus:ring-brand transition-shadow"
          style={{ borderColor: 'var(--border)', background: 'var(--warm-surface)' }}
        />
        <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
          Notes are hashed onchain (keccak256) — the text stays local until the organizer requests it.
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs font-medium rounded-xl px-3.5 py-2.5 border"
          style={{ background: 'var(--coral-light)', borderColor: 'var(--coral-border)', color: 'var(--coral)' }}>
          {(error as Error).message?.includes('User rejected')
            ? 'Transaction cancelled.'
            : ((error as Error).message?.slice(0, 100) || 'Submission failed. Please try again.')}
        </p>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={isPending || isConfirming || dwellSuccess}
        aria-busy={isPending || isConfirming}
        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-70 outline-none focus-visible:ring-2 focus-visible:ring-brand"
        style={{ background: dwellSuccess ? 'var(--teal)' : 'var(--brand)' }}
      >
        {dwellSuccess ? (
          <>
            <CheckCircle2 size={16} aria-hidden="true" />
            Submitted!
          </>
        ) : isPending ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />
            Confirm in Wallet…
          </>
        ) : isConfirming ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />
            Confirming on Arc…
          </>
        ) : (
          <>
            <Scale size={15} aria-hidden="true" />
            Submit Review
          </>
        )}
      </button>
      <p className="text-[11px] text-center" style={{ color: 'var(--subtle)' }}>
        Ctrl+Enter / ⌘+Enter to submit
      </p>
    </div>
  )

  // ── Modal shell ────────────────────────────────────────────────────────────
  return (
    <motion.div
      key="scorecard-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6"
      style={{ background: 'rgba(15,18,28,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label={`Judging scorecard for submission ${submissionIndex + 1}`}
    >
      <motion.div
        initial={{ scale: 0.97, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.97, y: 16 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--warm-surface)', border: '1px solid var(--border)' }}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--border)', background: 'var(--warm-bg)' }}>
          <div className="flex items-center gap-3">
            <Scale size={16} style={{ color: 'var(--brand)' }} aria-hidden="true" />
            <div>
              <h2 className="font-jakarta font-bold text-sm text-midnight">{event.title}</h2>
              <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
                Reviewing {submissionIndex + 1} of {totalSubs}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200/60 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-label="Close scorecard"
          >
            <X size={16} />
          </button>
        </div>

        {/* Mobile tab toggle */}
        <div className="lg:hidden flex border-b" style={{ borderColor: 'var(--border)' }}>
          {(['inspect', 'score'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className="flex-1 py-2.5 text-xs font-semibold transition-colors outline-none"
              style={{
                color: mobileTab === tab ? 'var(--brand)' : 'var(--muted)',
                borderBottom: mobileTab === tab ? '2px solid var(--brand)' : '2px solid transparent',
                background: 'var(--warm-bg)',
              }}
              aria-selected={mobileTab === tab}
            >
              {tab === 'inspect' ? 'Inspect Entry' : 'Scorecard'}
            </button>
          ))}
        </div>

        {/* Desktop: side-by-side | Mobile: single tab */}
        <div className="hidden lg:grid grid-cols-[3fr_2fr]" style={{ minHeight: '70vh', maxHeight: '85vh' }}>
          <div className="border-r overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
            {InspectorPane}
          </div>
          <div className="overflow-y-auto">
            {ScoringPane}
          </div>
        </div>
        <div className="lg:hidden" style={{ minHeight: '70vh', maxHeight: '85vh', overflowY: 'auto' }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mobileTab}
              initial={{ opacity: 0, x: mobileTab === 'inspect' ? -8 : 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mobileTab === 'inspect' ? 8 : -8 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {mobileTab === 'inspect' ? InspectorPane : ScoringPane}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Save & Next footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t"
          style={{ borderColor: 'var(--border)', background: 'var(--warm-bg)' }}>
          <span className="text-[11px]" style={{ color: 'var(--subtle)' }}>
            Drafts auto-saved to your browser
          </span>
          <button
            onClick={() => { setMobileTab('score') ; onNext() }}
            disabled={submissionIndex + 1 >= totalSubs}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl border transition-all disabled:opacity-40 outline-none focus-visible:ring-2 focus-visible:ring-brand"
            style={{ borderColor: 'var(--border)', color: 'var(--ink)', background: 'var(--warm-surface)' }}
          >
            Save & Next
            <ChevronRight size={13} aria-hidden="true" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
