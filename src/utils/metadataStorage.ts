import { keccak256, stringToHex } from 'viem'
import type { TeamMember } from '../types/events'

export interface SubmissionPayload {
  title: string
  tagline: string
  description: string
  trackId?: string
  demoUrl?: string
  repoUrl?: string
  socialPostUrl?: string
  mediaUrls: string[]
  teamMembers: TeamMember[]
  submitterAddress: string
  submitterName: string
}

export interface SubmissionDraft extends SubmissionPayload {
  lastSaved: number // timestamp
}

export interface EventCreatePayload {
  title: string
  tagline: string
  description: string
  category: 'hackathon' | 'contest'
  contactEmail: string
  modality: 'native_escrow' | 'external_listing'
  externalUrl?: string
  externalPlatformName?: string
  bannerUrl?: string
  tags: string[]
  submissionDeadlineDays: number
  judgingDays: number
  tracks: Array<{
    name: string
    description: string
    tiers: Array<{ place: string; amountUsdc: string }>
  }>
  rubric: Array<{
    name: string
    description: string
    weightPercentage: number
  }>
  reviewers: string[]
}

// ── Organizer Submissions (pending manual review) ─────────────────────────────

export type OrganizerSubmissionStatus = 'pending' | 'approved' | 'rejected'

export interface OrganizerSubmission {
  id: string               // uuid-like: `osub_${Date.now()}`
  title: string
  category: 'hackathon' | 'contest'
  contactEmail: string
  organizerAddress: string
  modality: 'native_escrow' | 'external_listing'
  status: OrganizerSubmissionStatus
  submittedAt: number      // unix ms
  decidedAt?: number       // unix ms — set when admin approves or rejects
  rejectionReason?: string
  txHash?: string          // set if createEvent was called onchain
  eventId?: string         // onchain event id if created
}

const ORGANIZER_SUBMISSIONS_KEY = 'fundora_organizer_submissions'

export function saveOrganizerSubmission(sub: OrganizerSubmission): void {
  try {
    const existing = getOrganizerSubmissions()
    const updated = [sub, ...existing.filter(s => s.id !== sub.id)]
    localStorage.setItem(ORGANIZER_SUBMISSIONS_KEY, JSON.stringify(updated))
  } catch (err) {
    console.warn('Failed to save organizer submission', err)
  }
}

export function getOrganizerSubmissions(): OrganizerSubmission[] {
  try {
    const raw = localStorage.getItem(ORGANIZER_SUBMISSIONS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as OrganizerSubmission[]
  } catch {
    return []
  }
}

export function updateOrganizerSubmission(
  id: string,
  patch: Partial<OrganizerSubmission>,
): void {
  try {
    const existing = getOrganizerSubmissions()
    const updated = existing.map(s => (s.id === id ? { ...s, ...patch } : s))
    localStorage.setItem(ORGANIZER_SUBMISSIONS_KEY, JSON.stringify(updated))
  } catch (err) {
    console.warn('Failed to update organizer submission', err)
  }
}

export interface EventCreateDraft extends EventCreatePayload {
  lastSaved: number
}

// ── Submission Drafts ─────────────────────────────────────────────────────────

export function getSubmissionDraftKey(eventId: string): string {
  return `fundora_draft_submission_${eventId}`
}

export function saveSubmissionDraft(eventId: string, data: SubmissionPayload): void {
  try {
    const draft: SubmissionDraft = {
      ...data,
      lastSaved: Date.now(),
    }
    localStorage.setItem(getSubmissionDraftKey(eventId), JSON.stringify(draft))
  } catch (err) {
    console.warn('Failed to save submission draft to localStorage', err)
  }
}

export function loadSubmissionDraft(eventId: string): SubmissionDraft | null {
  try {
    const raw = localStorage.getItem(getSubmissionDraftKey(eventId))
    if (!raw) return null
    return JSON.parse(raw) as SubmissionDraft
  } catch {
    return null
  }
}

export function clearSubmissionDraft(eventId: string): void {
  try {
    localStorage.removeItem(getSubmissionDraftKey(eventId))
  } catch {}
}

// ── Event Create Drafts ───────────────────────────────────────────────────────

const EVENT_CREATE_DRAFT_KEY = 'fundora_draft_event_create'

export function saveEventCreateDraft(data: EventCreatePayload): void {
  try {
    const draft: EventCreateDraft = {
      ...data,
      lastSaved: Date.now(),
    }
    localStorage.setItem(EVENT_CREATE_DRAFT_KEY, JSON.stringify(draft))
  } catch (err) {
    console.warn('Failed to save event create draft', err)
  }
}

export function loadEventCreateDraft(): EventCreateDraft | null {
  try {
    const raw = localStorage.getItem(EVENT_CREATE_DRAFT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as EventCreateDraft
  } catch {
    return null
  }
}

export function clearEventCreateDraft(): void {
  try {
    localStorage.removeItem(EVENT_CREATE_DRAFT_KEY)
  } catch {}
}

// ── Metadata Packaging & Hashing ──────────────────────────────────────────────

export function generateSubmissionHash(payload: SubmissionPayload): `0x${string}` {
  const serialized = JSON.stringify(payload)
  return keccak256(stringToHex(serialized))
}

export function formatMetadataUri(payload: SubmissionPayload): string {
  // In production, this can upload to IPFS/Arweave; for client-side deterministic inspection:
  const json = JSON.stringify(payload)
  return `data:application/json;base64,${btoa(unescape(encodeURIComponent(json)))}`
}
