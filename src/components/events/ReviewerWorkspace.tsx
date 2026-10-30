import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount } from 'wagmi'
import { ConnectKitButton } from 'connectkit'
import {
  Scale, Trophy, Clock, ChevronDown, ChevronUp,
  CheckCircle2, Circle, FileEdit, AlertTriangle, ArrowRight,
} from 'lucide-react'
import { useEvents } from '../../context/EventsContext'
import { useMode } from '../../context/ModeContext'
import { useIsEventReviewer } from '../../hooks/useFundoraEvents'
import { useSubmissionsBatch } from '../../hooks/useFundoraEvents'
import {
  loadAllDraftsForEvent,
  countSubmittedDraftsForEvent,
  type ScorecardDraft,
} from '../../utils/scorecardStorage'
import type { Event } from '../../types/events'
import { ReviewerScorecardModal } from './ReviewerScorecardModal'

interface ReviewerWorkspaceProps {
  onSelectEvent: (eventId: string) => void
}

// ── Submission status pill ───────────────────────────────────────────────────
function StatusPill({ draft }: { draft: ScorecardDraft | undefined }) {
  if (!draft) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
        <Circle size={9} aria-hidden="true" />
        Not Started
      </span>
    )
  }
  if (draft.submitted) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border"
        style={{ background: 'var(--teal-light)', color: 'var(--teal)', borderColor: 'var(--teal-border)' }}>
        <CheckCircle2 size={9} aria-hidden="true" />
        Submitted
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border"
      style={{ background: 'var(--amber-light)', color: 'var(--amber)', borderColor: 'var(--amber-border, #fde68a)' }}>
      <FileEdit size={9} aria-hidden="true" />
      Draft Saved
    </span>
  )
}

// ── Countdown helper ─────────────────────────────────────────────────────────
const MODULE_NOW = Math.floor(Date.now() / 1000)
function deadlineLabel(deadline: number): string {
  const diff = deadline - MODULE_NOW
  if (diff <= 0) return 'Judging closed'
  const days = Math.floor(diff / 86400)
  const hours = Math.floor((diff % 86400) / 3600)
  if (days > 0) return `${days}d ${hours}h remaining`
  return `${hours}h remaining`
}

// ── Event queue card with expandable submission list ─────────────────────────
function EventQueueCard({
  event,
  reviewerAddress,
  onOpenScorecard,
}: {
  event: Event
  reviewerAddress: string
  onOpenScorecard: (event: Event, submissionIndex: number) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const { isLive } = useMode()

  // Fetch submissions — enabled only when expanded in live mode
  const eventIdBig = useMemo(() => {
    try { return BigInt(event.id.replace(/\D/g, '') || '0') } catch { return 0n }
  }, [event.id])

  const { data: onchainSubs, isLoading: subsLoading } = useSubmissionsBatch(
    isLive && expanded ? eventIdBig : undefined,
    0,
    50,
  )

  const allDrafts = useMemo(
    () => loadAllDraftsForEvent(event.id, reviewerAddress),
    [event.id, reviewerAddress]
  )

  const submittedCount = useMemo(
    () => countSubmittedDraftsForEvent(event.id, reviewerAddress),
    [event.id, reviewerAddress]
  )

  const totalSubs = event.submissionsCount || 0
  const progressPct = totalSubs > 0 ? Math.round((submittedCount / totalSubs) * 100) : 0

  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden"
      style={{ borderColor: 'var(--border)' }}>
      {/* Card header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-start justify-between gap-4 p-5 text-left hover:bg-slate-50/60 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset"
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md"
              style={{ background: 'var(--brand-light)', color: 'var(--brand)', border: '1px solid var(--brand-border)' }}>
              <Scale size={10} aria-hidden="true" />
              Reviewer Assigned
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              {event.category === 'hackathon' ? 'Hackathon' : 'Contest'}
            </span>
          </div>
          <h3 className="font-jakarta font-bold text-base text-midnight truncate">{event.title}</h3>
          <p className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: 'var(--muted)' }}>
            <Clock size={11} aria-hidden="true" />
            {deadlineLabel(event.judgingDeadline)}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="font-mono text-xs font-bold tabular-nums"
            style={{ color: submittedCount === totalSubs && totalSubs > 0 ? 'var(--teal)' : 'var(--ink)' }}>
            {submittedCount} / {totalSubs} reviewed
          </span>
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>

      {/* Progress bar */}
      <div className="h-1 w-full bg-slate-100">
        <div
          className="h-1 transition-all duration-500"
          style={{
            width: `${progressPct}%`,
            background: progressPct === 100 ? 'var(--teal)' : 'var(--brand)',
          }}
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${progressPct}% of submissions reviewed`}
        />
      </div>

      {/* Expanded submission list */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="sub-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="border-t divide-y" style={{ borderColor: 'var(--border)' }}>
              {subsLoading && (
                <div className="p-5 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <span className="w-3 h-3 rounded-full border-2 border-slate-300 border-t-brand animate-spin" aria-hidden="true" />
                  Loading submissions…
                </div>
              )}

              {/* Demo mode: use mock submissions from EventsContext */}
              {!isLive && (() => {
                const mockSubs = Array.from({ length: Math.max(totalSubs, 1) }, (_, i) => ({
                  id: String(i + 1),
                  submitter: '0x' + '0'.repeat(40),
                  metadataUri: `Demo Submission #${i + 1}`,
                }))
                return mockSubs.map((sub, idx) => {
                  const draft = allDrafts[sub.id]
                  return (
                    <SubmissionRow
                      key={sub.id}
                      submissionId={sub.id}
                      metadataUri={sub.metadataUri}
                      submitter={sub.submitter}
                      draft={draft}
                      onReview={() => onOpenScorecard(event, idx)}
                    />
                  )
                })
              })()}

              {/* Live mode: use onchain submissions */}
              {isLive && !subsLoading && onchainSubs && onchainSubs.map((sub, idx) => {
                const draft = allDrafts[sub.id.toString()]
                return (
                  <SubmissionRow
                    key={sub.id.toString()}
                    submissionId={sub.id.toString()}
                    metadataUri={sub.metadataUri}
                    submitter={sub.submitter}
                    draft={draft}
                    onReview={() => onOpenScorecard(event, idx)}
                  />
                )
              })}

              {isLive && !subsLoading && (!onchainSubs || onchainSubs.length === 0) && (
                <div className="p-5 text-center text-xs text-slate-500">
                  No submissions found for this event yet.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Single submission row ────────────────────────────────────────────────────
function SubmissionRow({
  submissionId,
  metadataUri,
  submitter,
  draft,
  onReview,
}: {
  submissionId: string
  metadataUri: string
  submitter: string
  draft: ScorecardDraft | undefined
  onReview: () => void
}) {
  const title = useMemo(() => {
    try {
      const parsed = JSON.parse(metadataUri) as { title?: string }
      return parsed.title || metadataUri
    } catch {
      return metadataUri
    }
  }, [metadataUri])

  const shortAddr = submitter.length > 10
    ? `${submitter.slice(0, 6)}…${submitter.slice(-4)}`
    : submitter

  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-midnight truncate">{title}</p>
        <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--muted)' }}>
          #{submissionId} · {shortAddr}
        </p>
        {draft?.onchainScore !== undefined && draft.submitted && (
          <p className="text-[11px] font-semibold mt-0.5" style={{ color: 'var(--teal)' }}>
            Score: {draft.onchainScore} / 100
          </p>
        )}
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        <StatusPill draft={draft} />
        <button
          onClick={onReview}
          className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand"
          style={{
            background: draft?.submitted ? 'var(--warm-bg-2)' : 'var(--brand)',
            color: draft?.submitted ? 'var(--muted)' : '#fff',
            border: draft?.submitted ? '1px solid var(--border)' : 'none',
          }}
          aria-label={`${draft?.submitted ? 'View' : 'Review'} submission #${submissionId}`}
        >
          {draft?.submitted ? 'View' : 'Review'}
          <ArrowRight size={11} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

// ── Per-event reviewer check (live mode) ─────────────────────────────────────
function useIsReviewerForEvent(eventId: bigint | undefined, address: `0x${string}` | undefined) {
  return useIsEventReviewer(eventId, address)
}

function ReviewerEventGate({
  event,
  reviewerAddress,
  onOpenScorecard,
}: {
  event: Event
  reviewerAddress: `0x${string}`
  onOpenScorecard: (event: Event, idx: number) => void
}) {
  const eventIdBig = useMemo(() => {
    try { return BigInt(event.id.replace(/\D/g, '') || '0') } catch { return 0n }
  }, [event.id])
  const { data: isReviewer, isLoading } = useIsReviewerForEvent(eventIdBig, reviewerAddress)

  if (isLoading) return null
  if (!isReviewer) return null

  return (
    <EventQueueCard
      event={event}
      reviewerAddress={reviewerAddress}
      onOpenScorecard={onOpenScorecard}
    />
  )
}

// ── Main workspace component ─────────────────────────────────────────────────
export function ReviewerWorkspace({ onSelectEvent: _onSelectEvent }: ReviewerWorkspaceProps) {
  const { address, isConnected } = useAccount()
  const { events } = useEvents()
  const { isLive } = useMode()

  const [scorecardState, setScorecardState] = useState<{
    event: Event
    submissionIndex: number
  } | null>(null)

  const nativeEvents = useMemo(
    () => events.filter(e => e.modality === 'native_escrow'),
    [events],
  )

  const handleOpenScorecard = (event: Event, submissionIndex: number) => {
    setScorecardState({ event, submissionIndex })
  }

  // ── State 1: Wallet disconnected ─────────────────────────────────────────
  if (!isConnected || !address) {
    return (
      <motion.div
        key="reviewer-disconnected"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center justify-center py-20 text-center gap-6"
      >
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: 'var(--brand-light)' }}>
          <Scale size={28} style={{ color: 'var(--brand)' }} aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-jakarta font-extrabold text-2xl text-midnight mb-2">
            Reviewer Judging Workspace
          </h2>
          <p className="text-sm max-w-sm mx-auto leading-relaxed" style={{ color: 'var(--muted)' }}>
            Connect the wallet you were invited with as a judge to access your assigned review queues.
          </p>
        </div>
        <ConnectKitButton label="Connect Wallet to Access Reviews" />
      </motion.div>
    )
  }

  return (
    <motion.div
      key="reviewer-workspace"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="font-jakarta font-extrabold text-2xl text-midnight tracking-tight mb-1">
          Reviewer Judging Workspace
        </h1>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Score assigned submissions using the event's published rubric criteria.
        </p>
      </div>

      {/* Guidelines card */}
      <div className="rounded-2xl border p-4 text-xs leading-relaxed space-y-1"
        style={{ background: 'var(--brand-light)', borderColor: 'var(--brand-border)', color: 'var(--brand)' }}>
        <p className="font-bold flex items-center gap-1.5">
          <Scale size={13} aria-hidden="true" />
          Judging Guidelines
        </p>
        <ul className="space-y-1 list-none pl-1 font-medium" style={{ color: 'var(--ink)' }}>
          <li className="flex items-start gap-1.5">
            <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--brand)' }} />
            Score each submission on all rubric criteria using the 1–10 sliders. The weighted total is submitted onchain as a 1–100 integer.
          </li>
          <li className="flex items-start gap-1.5">
            <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--brand)' }} />
            Drafts are saved automatically. Your progress is preserved if you close the modal.
          </li>
          <li className="flex items-start gap-1.5">
            <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--brand)' }} />
            Once submitted onchain, a review cannot be changed. Review carefully before confirming.
          </li>
        </ul>
      </div>

      {/* Event queue — demo mode shows all native escrow events */}
      {!isLive ? (
        <>
          {nativeEvents.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {nativeEvents.map(event => (
                <EventQueueCard
                  key={event.id}
                  event={event}
                  reviewerAddress={address}
                  onOpenScorecard={handleOpenScorecard}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        // Live mode: check isEventReviewer per event
        <LiveReviewerQueue
          events={nativeEvents}
          reviewerAddress={address}
          onOpenScorecard={handleOpenScorecard}
        />
      )}

      {/* Scorecard modal */}
      <AnimatePresence>
        {scorecardState && (
          <ReviewerScorecardModal
            event={scorecardState.event}
            submissionIndex={scorecardState.submissionIndex}
            reviewerAddress={address}
            onNext={() => {
              const totalSubs = scorecardState.event.submissionsCount
              if (scorecardState.submissionIndex + 1 < totalSubs) {
                setScorecardState(prev => prev
                  ? { ...prev, submissionIndex: prev.submissionIndex + 1 }
                  : null
                )
              } else {
                setScorecardState(null)
              }
            }}
            onClose={() => setScorecardState(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Live mode: per-event role-gate wrapper ───────────────────────────────────
function LiveReviewerQueue({
  events,
  reviewerAddress,
  onOpenScorecard,
}: {
  events: Event[]
  reviewerAddress: `0x${string}`
  onOpenScorecard: (event: Event, idx: number) => void
}) {
  if (events.length === 0) return <EmptyState />

  return (
    <div className="space-y-4">
      {events.map(event => (
        <ReviewerEventGate
          key={event.id}
          event={event}
          reviewerAddress={reviewerAddress}
          onOpenScorecard={onOpenScorecard}
        />
      ))}
      <EmptyStateIfNoQueues events={events} reviewerAddress={reviewerAddress} />
    </div>
  )
}

// Renders empty state only if no events matched (uses a sentinel approach)
function EmptyStateIfNoQueues({
  events,
  reviewerAddress,
}: {
  events: Event[]
  reviewerAddress: string
}) {
  // We don't have a clean way to know all gated components returned null
  // without lifting state — so instead show an informational note below the queue
  if (events.length === 0) return <EmptyState />
  return (
    <div className="text-xs text-center py-2" style={{ color: 'var(--muted)' }}>
      Only events where {reviewerAddress.slice(0, 6)}…{reviewerAddress.slice(-4)} is an invited judge are shown.
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
        <AlertTriangle size={22} className="text-slate-400" aria-hidden="true" />
      </div>
      <h3 className="font-jakarta font-bold text-base text-midnight">No Assigned Review Queues</h3>
      <p className="text-xs leading-relaxed max-w-xs mx-auto" style={{ color: 'var(--muted)' }}>
        No review queues found for this wallet. Connect the invited judge address, or ask the event organizer to add you as a reviewer.
      </p>
      <div className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--brand)' }}>
        <Trophy size={12} />
        Browse public events to explore open hackathons
      </div>
    </div>
  )
}
