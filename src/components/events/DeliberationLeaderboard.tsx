import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, ChevronDown, ChevronUp, Copy, Check, Medal, Info } from 'lucide-react'
import type { Event, PrizeTier, Track } from '../../types/events'
import type { OnchainSubmission } from '../../contracts/fundoraEvents'
import { useSubmissionsBatch, useGetReview } from '../../hooks/useFundoraEvents'
import { loadScorecardDraft } from '../../utils/scorecardStorage'
import { useEvents } from '../../context/EventsContext'
import { useMode } from '../../context/ModeContext'
import { parseSubmissionMetadata } from '../../utils/metadataStorage'
import type { Address } from 'viem'

// ── Types ─────────────────────────────────────────────────────────────────────

export type WinnerMapping = Record<string, {
  submissionId: string
  address: string
  amountUsdc: bigint
}>

interface DeliberationLeaderboardProps {
  event: Event
  isOrganizer: boolean
  winnerMapping: WinnerMapping
  onWinnerMapped: (tierId: string, submissionId: string, address: string, amountUsdc: bigint) => void
}

// Unified row type for display (works with both onchain and mock)
interface LeaderboardRow {
  id: string
  submitter: string
  metadataUri: string
  scoreSum: number
  reviewCount: number
  disqualified: boolean
  trackId?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseMeta(uri: string): { title?: string; tagline?: string; trackId?: string } {
  return parseSubmissionMetadata(uri)
}

function shortAddr(addr: string) {
  return addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr
}

function avgScore(row: LeaderboardRow): number {
  if (row.reviewCount === 0) return 0
  return row.scoreSum / row.reviewCount
}

function avgScoreDisplay(row: LeaderboardRow): string {
  if (row.reviewCount === 0) return '—'
  return (avgScore(row) / 10).toFixed(1) + ' / 10'
}

function rankIcon(rank: number) {
  if (rank === 1) return <Medal size={14} className="text-amber-500" aria-hidden="true" />
  if (rank === 2) return <Medal size={14} className="text-slate-400" aria-hidden="true" />
  if (rank === 3) return <Medal size={14} style={{ color: '#b87333' }} aria-hidden="true" />
  return <span className="font-mono font-bold text-xs text-slate-400 w-[14px] text-center">{rank}</span>
}

// Flatten all prize tiers from all tracks
function flattenPrizeTiers(event: Event): PrizeTier[] {
  return event.tracks.flatMap(t => t.prizeTiers)
}

// Which tier IDs are already mapped to a different submission?
function usedTierIds(winnerMapping: WinnerMapping, currentSubId: string): Set<string> {
  const used = new Set<string>()
  for (const [tierId, mapping] of Object.entries(winnerMapping)) {
    if (mapping.submissionId !== currentSubId) used.add(tierId)
  }
  return used
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={e => {
        e.stopPropagation()
        void navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      }}
      className="ml-1 text-slate-400 hover:text-brand transition-colors outline-none focus-visible:ring-1 focus-visible:ring-brand rounded"
      aria-label="Copy address"
    >
      {copied ? <Check size={11} className="text-teal" /> : <Copy size={11} />}
    </button>
  )
}

// ── Prize tier selector (organizer only) ─────────────────────────────────────
function PrizeTierSelector({
  row,
  event,
  winnerMapping,
  onMap,
}: {
  row: LeaderboardRow
  event: Event
  winnerMapping: WinnerMapping
  onMap: (tierId: string, amountUsdc: bigint) => void
}) {
  const allTiers = flattenPrizeTiers(event)
  const usedTiers = usedTierIds(winnerMapping, row.id)
  const mappedTierId = Object.entries(winnerMapping)
    .find(([, m]) => m.submissionId === row.id)?.[0]

  return (
    <select
      value={mappedTierId ?? ''}
      onChange={e => {
        const tierId = e.target.value
        if (!tierId) {
          onMap('', 0n)
          return
        }
        const tier = allTiers.find(t => t.id === tierId)
        if (tier) onMap(tierId, tier.amountUsdc)
      }}
      onClick={e => e.stopPropagation()}
      className="text-[11px] font-semibold rounded-lg border px-2 py-1 outline-none focus:ring-2 focus:ring-brand transition-shadow max-w-[140px]"
      style={{
        borderColor: mappedTierId ? 'var(--teal-border)' : 'var(--border)',
        background: mappedTierId ? 'var(--teal-light)' : 'var(--warm-surface)',
        color: mappedTierId ? 'var(--teal)' : 'var(--muted)',
      }}
      aria-label="Assign prize tier"
    >
      <option value="">— Assign tier —</option>
      {allTiers.map(tier => (
        <option
          key={tier.id}
          value={tier.id}
          disabled={usedTiers.has(tier.id)}
        >
          {tier.place} (${Number(tier.amountUsdc / 1_000_000n).toLocaleString()} USDC)
          {usedTiers.has(tier.id) ? ' ✓ taken' : ''}
        </option>
      ))}
    </select>
  )
}

// ── Per-reviewer score row (Demo mode: reads from scorecardStorage) ───────────
function DemoReviewerScoreRow({
  reviewerAddr,
  eventId,
  submissionId,
  fallbackScore,
}: {
  reviewerAddr: string
  eventId: string
  submissionId: string
  fallbackScore: number
}) {
  const draft = useMemo(() => {
    return loadScorecardDraft(eventId, submissionId, reviewerAddr)
  }, [eventId, submissionId, reviewerAddr])

  const score = draft?.onchainScore ?? (draft?.submitted && draft.criterionScores
    ? Math.round((Object.values(draft.criterionScores).reduce((a, b) => a + b, 0) / Object.keys(draft.criterionScores).length) * 10)
    : (fallbackScore > 0 ? fallbackScore : null))

  const dateLabel = draft?.savedAt
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }).format(new Date(draft.savedAt))
    : fallbackScore > 0 ? 'Assigned' : '—'

  return (
    <tr className="border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
      <td className="py-1.5 pr-3 font-mono text-[11px]" style={{ color: 'var(--muted)' }}>
        {shortAddr(reviewerAddr)}
      </td>
      <td className="py-1.5 px-3 text-center">
        {score !== null && score > 0 ? (
          <span className="font-mono font-bold text-[12px] text-midnight tabular-nums">
            {score}<span className="font-normal text-slate-400"> / 100</span>
          </span>
        ) : (
          <span className="text-[11px]" style={{ color: 'var(--subtle)' }}>Not yet reviewed</span>
        )}
      </td>
      <td className="py-1.5 pl-3 text-[11px] text-right" style={{ color: 'var(--muted)' }}>
        {dateLabel}
      </td>
    </tr>
  )
}

// ── Per-reviewer score row (one hook call each — safe pattern for hooks-in-loops) ──
function ReviewerScoreRow({
  reviewerAddr,
  eventIdBig,
  submissionIdBig,
}: {
  reviewerAddr: string
  eventIdBig: bigint
  submissionIdBig: bigint
}) {
  const { data, isLoading } = useGetReview(
    eventIdBig,
    submissionIdBig,
    reviewerAddr as Address,
  )

  const reviewedAtLabel = useMemo(() => {
    if (!data || data.reviewedAt === 0) return null
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(data.reviewedAt * 1000))
  }, [data])

  return (
    <tr className="border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
      <td className="py-1.5 pr-3 font-mono text-[11px]" style={{ color: 'var(--muted)' }}>
        {shortAddr(reviewerAddr)}
      </td>
      <td className="py-1.5 px-3 text-center">
        {isLoading ? (
          <span className="inline-block w-3 h-3 rounded-full border-2 border-slate-300 border-t-brand animate-spin" aria-hidden="true" />
        ) : data && data.score > 0 ? (
          <span className="font-mono font-bold text-[12px] text-midnight tabular-nums">
            {data.score}<span className="font-normal text-slate-400"> / 100</span>
          </span>
        ) : (
          <span className="text-[11px]" style={{ color: 'var(--subtle)' }}>Not yet reviewed</span>
        )}
      </td>
      <td className="py-1.5 pl-3 text-[11px] text-right" style={{ color: 'var(--muted)' }}>
        {reviewedAtLabel ?? '—'}
      </td>
    </tr>
  )
}

// ── Expanded row detail ───────────────────────────────────────────────────────
function ExpandedRow({
  row,
  event,
  eventIdBig,
  isLive,
}: {
  row: LeaderboardRow
  event: Event
  eventIdBig: bigint
  isLive: boolean
}) {
  const meta = parseMeta(row.metadataUri)
  const track: Track | undefined = event.tracks.find(t => t.id === row.trackId)

  const submissionIdBig = useMemo(() => {
    try { return BigInt(row.id) } catch { return 0n }
  }, [row.id])

  // event.reviewers is the list of reviewer addresses assigned to this event
  const reviewers: string[] = event.reviewers ?? []

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="px-4 pb-4 pt-2 border-t" style={{ borderColor: 'var(--border)', background: 'var(--warm-bg)' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">

          {/* Left — project details */}
          <div>
            <p className="font-bold text-midnight mb-1">Project Details</p>
            {meta.title && (
              <p className="text-slate-600">
                <span className="font-semibold">Title:</span> {meta.title}
              </p>
            )}
            {track && (
              <p className="text-slate-600 mt-0.5">
                <span className="font-semibold">Track:</span> {track.name}
              </p>
            )}
            <p className="font-mono text-slate-500 mt-0.5 select-all">{row.submitter}</p>
            <div className="mt-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="font-semibold text-midnight mb-0.5">Score Summary</p>
              <p className="text-slate-600">
                Cumulative: <span className="font-mono font-semibold">{row.scoreSum}</span>
              </p>
              <p className="text-slate-600">
                Reviews: <span className="font-mono font-semibold">{row.reviewCount}</span>
              </p>
              <p className="text-slate-600">
                Average: <span className="font-mono font-semibold">{avgScoreDisplay(row)}</span>
              </p>
              {row.disqualified && (
                <p className="font-semibold mt-1" style={{ color: 'var(--coral)' }}>Disqualified</p>
              )}
            </div>
          </div>

          {/* Right — per-reviewer breakdown */}
          <div>
            <p className="font-bold text-midnight mb-2 flex items-center gap-1.5">
              Reviewer Breakdown
              <Info size={11} style={{ color: 'var(--muted)' }} aria-hidden="true" />
            </p>
            {reviewers.length === 0 ? (
              <p className="text-[11px] italic" style={{ color: 'var(--subtle)' }}>
                No reviewers assigned to this event yet.
              </p>
            ) : (
              <table className="w-full text-xs table-fixed">
                <thead>
                  <tr style={{ color: 'var(--subtle)' }}>
                    <th className="text-left font-semibold pb-1 w-1/3">Reviewer</th>
                    <th className="text-center font-semibold pb-1 w-1/3">Score</th>
                    <th className="text-right font-semibold pb-1 w-1/3">Reviewed At</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewers.map(addr =>
                    isLive ? (
                      <ReviewerScoreRow
                        key={addr}
                        reviewerAddr={addr}
                        eventIdBig={eventIdBig}
                        submissionIdBig={submissionIdBig}
                      />
                    ) : (
                      <DemoReviewerScoreRow
                        key={addr}
                        reviewerAddr={addr}
                        eventId={event.id}
                        submissionId={row.id}
                        fallbackScore={row.scoreSum}
                      />
                    )
                  )}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </motion.div>
  )
}

// ── Leaderboard row ───────────────────────────────────────────────────────────
function LeaderboardRow({
  row,
  rank,
  event,
  eventIdBig,
  isOrganizer,
  isLive,
  winnerMapping,
  onWinnerMapped,
}: {
  row: LeaderboardRow
  rank: number
  event: Event
  eventIdBig: bigint
  isOrganizer: boolean
  isLive: boolean
  winnerMapping: WinnerMapping
  onWinnerMapped: (tierId: string, submissionId: string, address: string, amountUsdc: bigint) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const meta = parseMeta(row.metadataUri)
  const track = event.tracks.find(t => t.id === row.trackId)

  return (
    <div className={`border-b last:border-0 ${row.disqualified ? 'opacity-50' : ''}`}
      style={{ borderColor: 'var(--border)' }}>
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset"
        aria-expanded={expanded}
      >
        {/* Rank */}
        <div className="w-6 flex items-center justify-center shrink-0">
          {rankIcon(rank)}
        </div>

        {/* Title + submitter */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold text-midnight truncate ${row.disqualified ? 'line-through' : ''}`}>
            {meta.title || `Submission #${row.id}`}
          </p>
          <p className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--muted)' }}>
            {shortAddr(row.submitter)}
            <CopyBtn text={row.submitter} />
          </p>
        </div>

        {/* Track badge */}
        {track && (
          <span className="hidden sm:inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0 max-w-[120px] truncate">
            {track.name}
          </span>
        )}

        {/* Review count */}
        <span className="hidden sm:block text-[11px] font-mono text-slate-500 shrink-0 w-12 text-center tabular-nums">
          {row.reviewCount} {row.reviewCount === 1 ? 'review' : 'reviews'}
        </span>

        {/* Score */}
        <span className="font-mono font-bold text-sm tabular-nums shrink-0 w-16 text-right"
          style={{ color: row.reviewCount > 0 ? 'var(--ink)' : 'var(--subtle)' }}>
          {avgScoreDisplay(row)}
        </span>

        {/* Prize tier selector */}
        {isOrganizer && !row.disqualified && (
          <div onClick={e => e.stopPropagation()} className="shrink-0">
            <PrizeTierSelector
              row={row}
              event={event}
              winnerMapping={winnerMapping}
              onMap={(tierId, amountUsdc) => {
                if (!tierId) {
                  // Clear mapping for this submission
                  const existingTier = Object.entries(winnerMapping)
                    .find(([, m]) => m.submissionId === row.id)?.[0]
                  if (existingTier) onWinnerMapped(existingTier, '', '', 0n)
                  return
                }
                onWinnerMapped(tierId, row.id, row.submitter, amountUsdc)
              }}
            />
          </div>
        )}

        {/* Expand chevron */}
        <div className="shrink-0 text-slate-400">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <ExpandedRow
            key="expanded"
            row={row}
            event={event}
            eventIdBig={eventIdBig}
            isLive={isLive}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function DeliberationLeaderboard({
  event,
  isOrganizer,
  winnerMapping,
  onWinnerMapped,
}: DeliberationLeaderboardProps) {
  const { isLive } = useMode()
  const { getSubmissionsForEvent } = useEvents()
  const [trackFilter, setTrackFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'score' | 'date'>('score')

  const eventIdBig = useMemo(() => {
    try { return BigInt(event.id.replace(/\D/g, '') || '0') } catch { return 0n }
  }, [event.id])

  const { data: onchainSubs, isLoading } = useSubmissionsBatch(
    isLive ? eventIdBig : undefined,
    0,
    50,
  )

  // Unify mock and onchain submissions into LeaderboardRow format
  const rows: LeaderboardRow[] = useMemo(() => {
    if (isLive) {
      if (!onchainSubs) return []
      return (onchainSubs as OnchainSubmission[]).map(sub => {
        const meta = parseSubmissionMetadata(sub.metadataUri)
        return {
          id: sub.id.toString(),
          submitter: sub.submitter,
          metadataUri: sub.metadataUri,
          scoreSum: sub.scoreSum,
          reviewCount: sub.reviewCount,
          disqualified: sub.disqualified,
          trackId: meta.trackId,
        }
      })
    } else {
      return (getSubmissionsForEvent(event.id)).map((sub) => ({
        id: sub.id,
        submitter: sub.submitterAddress,
        metadataUri: JSON.stringify({ title: sub.title }),
        scoreSum: Math.round((sub.totalScore ?? 0) * 10),
        reviewCount: sub.totalScore != null ? 1 : 0,
        disqualified: false,
        trackId: sub.trackId,
      }))
    }
  }, [isLive, onchainSubs, getSubmissionsForEvent, event.id])

  // Filter by track
  const filtered = useMemo(() => {
    if (trackFilter === 'all') return rows
    return rows.filter(r => r.trackId === trackFilter)
  }, [rows, trackFilter])

  // Sort: disqualified always last
  const sorted = useMemo(() => {
    const qualified = filtered.filter(r => !r.disqualified)
    const disqualified = filtered.filter(r => r.disqualified)
    if (sortBy === 'score') {
      qualified.sort((a, b) => avgScore(b) - avgScore(a))
    }
    return [...qualified, ...disqualified]
  }, [filtered, sortBy])

  // Stats
  const totalReviewed = useMemo(
    () => rows.filter(r => r.reviewCount > 0).length,
    [rows],
  )

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center text-sm text-slate-500 flex items-center justify-center gap-2"
        style={{ borderColor: 'var(--border)' }}>
        <span className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-brand animate-spin" aria-hidden="true" />
        Loading submissions…
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-white overflow-hidden shadow-sm"
      style={{ borderColor: 'var(--border)' }}>
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center justify-between flex-wrap gap-3"
        style={{ borderColor: 'var(--border)', background: 'var(--warm-bg)' }}>
        <div>
          <h3 className="font-jakarta font-bold text-base text-midnight flex items-center gap-2">
            <Trophy size={16} style={{ color: 'var(--brand)' }} aria-hidden="true" />
            Deliberation Leaderboard
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
            {totalReviewed} of {rows.length} submissions reviewed
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Track filter */}
          {event.tracks.length > 1 && (
            <select
              value={trackFilter}
              onChange={e => setTrackFilter(e.target.value)}
              className="text-xs font-semibold rounded-xl border px-3 py-1.5 outline-none focus:ring-2 focus:ring-brand"
              style={{ borderColor: 'var(--border)', background: 'var(--warm-surface)' }}
              aria-label="Filter by track"
            >
              <option value="all">All Tracks</option>
              {event.tracks.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}
          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'score' | 'date')}
            className="text-xs font-semibold rounded-xl border px-3 py-1.5 outline-none focus:ring-2 focus:ring-brand"
            style={{ borderColor: 'var(--border)', background: 'var(--warm-surface)' }}
            aria-label="Sort submissions"
          >
            <option value="score">Sort by Score</option>
            <option value="date">Sort by Date</option>
          </select>
        </div>
      </div>

      {/* Column headers */}
      <div className="hidden sm:flex items-center gap-3 px-4 py-2 border-b text-[10px] font-bold uppercase tracking-wider"
        style={{ borderColor: 'var(--border)', color: 'var(--subtle)', background: 'var(--warm-bg)' }}>
        <div className="w-6 shrink-0">#</div>
        <div className="flex-1">Project</div>
        <div className="w-24 shrink-0">Track</div>
        <div className="w-16 shrink-0 text-center">Reviews</div>
        <div className="w-16 shrink-0 text-right">Avg Score</div>
        {isOrganizer && <div className="w-36 shrink-0 text-right">Prize Tier</div>}
        <div className="w-5 shrink-0" />
      </div>

      {/* Rows */}
      {sorted.length === 0 ? (
        <div className="p-10 text-center text-sm text-slate-500">
          No submissions yet for this event.
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {sorted.map((row, i) => (
            <LeaderboardRow
              key={row.id}
              row={row}
              rank={i + 1}
              event={event}
              eventIdBig={eventIdBig}
              isOrganizer={isOrganizer}
              isLive={isLive}
              winnerMapping={winnerMapping}
              onWinnerMapped={onWinnerMapped}
            />
          ))}
        </div>
      )}
    </div>
  )
}
