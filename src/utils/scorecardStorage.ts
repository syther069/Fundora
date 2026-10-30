// ── Scorecard Draft Storage ───────────────────────────────────────────────────
// Persists per-reviewer scorecard drafts to localStorage so reviewers never
// lose progress on accidental tab close. Keyed by eventId:submissionId:address.

export interface ScorecardDraft {
  /** criterionId → 1–10 slider value */
  criterionScores: Record<string, number>
  notes: string
  /** unix milliseconds */
  savedAt: number
  /** true after the onchain submitReview tx is confirmed */
  submitted: boolean
  /** computed weighted total sent onchain (1–100) — stored for display */
  onchainScore?: number
}

function storageKey(eventId: string, submissionId: string, reviewer: string): string {
  return `fundora:scorecard:${eventId}:${submissionId}:${reviewer.toLowerCase()}`
}

export function saveScorecardDraft(
  eventId: string,
  submissionId: string,
  reviewer: string,
  draft: ScorecardDraft,
): void {
  try {
    localStorage.setItem(storageKey(eventId, submissionId, reviewer), JSON.stringify(draft))
  } catch {
    // storage full or unavailable — silently swallow
  }
}

export function loadScorecardDraft(
  eventId: string,
  submissionId: string,
  reviewer: string,
): ScorecardDraft | null {
  try {
    const raw = localStorage.getItem(storageKey(eventId, submissionId, reviewer))
    if (!raw) return null
    return JSON.parse(raw) as ScorecardDraft
  } catch {
    return null
  }
}

export function clearScorecardDraft(
  eventId: string,
  submissionId: string,
  reviewer: string,
): void {
  try {
    localStorage.removeItem(storageKey(eventId, submissionId, reviewer))
  } catch {
    // noop
  }
}

/** Count how many drafts for an event have been submitted (for progress bars). */
export function countSubmittedDraftsForEvent(
  eventId: string,
  reviewer: string,
): number {
  try {
    const prefix = `fundora:scorecard:${eventId}:`
    const normalizedReviewer = reviewer.toLowerCase()
    let count = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith(prefix)) continue
      if (!key.endsWith(`:${normalizedReviewer}`)) continue
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const draft = JSON.parse(raw) as ScorecardDraft
      if (draft.submitted) count++
    }
    return count
  } catch {
    return 0
  }
}

/** Load all drafts for an event (used to show status pills per submission). */
export function loadAllDraftsForEvent(
  eventId: string,
  reviewer: string,
): Record<string, ScorecardDraft> {
  const result: Record<string, ScorecardDraft> = {}
  try {
    const prefix = `fundora:scorecard:${eventId}:`
    const normalizedReviewer = reviewer.toLowerCase()
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith(prefix)) continue
      if (!key.endsWith(`:${normalizedReviewer}`)) continue
      // key = fundora:scorecard:{eventId}:{submissionId}:{reviewer}
      const parts = key.split(':')
      const submissionId = parts[3]
      const raw = localStorage.getItem(key)
      if (!raw || !submissionId) continue
      result[submissionId] = JSON.parse(raw) as ScorecardDraft
    }
  } catch {
    // noop
  }
  return result
}
