import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Clock, Mail, Trophy, Zap, ChevronDown, ChevronUp } from 'lucide-react'
import {
  getOrganizerSubmissions,
  updateOrganizerSubmission,
  type OrganizerSubmission,
} from '../../utils/metadataStorage'

interface OrganizerReviewPanelProps {
  isAdmin: boolean
}

function StatusBadge({ status }: { status: OrganizerSubmission['status'] }) {
  if (status === 'pending') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
      <Clock size={9} /> Pending Review
    </span>
  )
  if (status === 'approved') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
      <CheckCircle2 size={9} /> Approved
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
      <XCircle size={9} /> Rejected
    </span>
  )
}

function SubmissionRow({
  sub,
  isAdmin,
  onDecide,
}: {
  sub: OrganizerSubmission
  isAdmin: boolean
  onDecide: (id: string, decision: 'approved' | 'rejected', reason?: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showReject, setShowReject] = useState(false)

  const fmt = (ts: number) =>
    new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(ts))

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Row header */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
      >
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: sub.category === 'hackathon' ? 'var(--brand-light)' : 'var(--teal-light)' }}
        >
          {sub.category === 'hackathon'
            ? <Zap size={14} style={{ color: 'var(--brand)' }} />
            : <Trophy size={14} style={{ color: 'var(--teal)' }} />
          }
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-midnight truncate">{sub.title}</span>
            <StatusBadge status={sub.status} />
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[11px] text-slate-500 capitalize">{sub.category}</span>
            <span className="text-[11px] text-slate-400">·</span>
            <span className="text-[11px] text-slate-500">{fmt(sub.submittedAt)}</span>
          </div>
        </div>
        {expanded ? <ChevronUp size={14} className="text-slate-400 shrink-0" /> : <ChevronDown size={14} className="text-slate-400 shrink-0" />}
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 space-y-3 border-t border-slate-100">
              {/* Contact email */}
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Mail size={12} className="text-slate-400 shrink-0" />
                <span className="font-medium">Contact:</span>
                <a href={`mailto:${sub.contactEmail}`} className="text-brand hover:underline">{sub.contactEmail}</a>
              </div>

              {/* Modality */}
              <div className="text-xs text-slate-500">
                Type: <span className="font-medium text-midnight capitalize">{sub.modality === 'native_escrow' ? 'Native Arc Escrow' : 'External Listing'}</span>
              </div>

              {/* Decision timestamp */}
              {sub.decidedAt && (
                <div className="text-xs text-slate-500">
                  Decision recorded: <span className="font-medium text-midnight">{fmt(sub.decidedAt)}</span>
                </div>
              )}

              {/* Rejection reason */}
              {sub.status === 'rejected' && sub.rejectionReason && (
                <div className="rounded-lg bg-rose-50 border border-rose-100 px-3 py-2 text-xs text-rose-700">
                  <span className="font-semibold">Rejection reason: </span>{sub.rejectionReason}
                </div>
              )}

              {/* Admin actions — only for pending, only for admins */}
              {isAdmin && sub.status === 'pending' && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => { onDecide(sub.id, 'approved'); setExpanded(false) }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal hover:opacity-90 transition-all"
                  >
                    <CheckCircle2 size={12} />
                    Approve
                  </button>
                  {!showReject ? (
                    <button
                      onClick={() => setShowReject(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all"
                    >
                      <XCircle size={12} />
                      Reject
                    </button>
                  ) : (
                    <div className="w-full space-y-2">
                      <textarea
                        rows={2}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Rejection reason or next steps (optional)"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-midnight placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => { onDecide(sub.id, 'rejected', rejectReason); setExpanded(false) }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:opacity-90"
                        >
                          Confirm Rejection
                        </button>
                        <button
                          onClick={() => setShowReject(false)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function OrganizerReviewPanel({ isAdmin }: OrganizerReviewPanelProps) {
  const [submissions, setSubmissions] = useState<OrganizerSubmission[]>(() => getOrganizerSubmissions())

  const handleDecide = (id: string, decision: 'approved' | 'rejected', reason?: string) => {
    updateOrganizerSubmission(id, {
      status: decision,
      decidedAt: Date.now(),
      ...(reason ? { rejectionReason: reason } : {}),
    })
    setSubmissions(getOrganizerSubmissions())
  }

  const pending = submissions.filter(s => s.status === 'pending')
  const decided = submissions.filter(s => s.status !== 'pending')

  if (submissions.length === 0) return null

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-jakarta font-bold text-base text-midnight flex items-center gap-2">
            <Clock size={16} className="text-amber-500" />
            Organizer Review Queue
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin
              ? 'Review and approve or reject submitted organizer applications.'
              : 'Your event submission is pending manual review. We\'ll contact you at the email you provided.'}
          </p>
        </div>
        {pending.length > 0 && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
            {pending.length} pending
          </span>
        )}
      </div>

      {pending.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Awaiting Review</p>
          {pending.map(sub => (
            <SubmissionRow key={sub.id} sub={sub} isAdmin={isAdmin} onDecide={handleDecide} />
          ))}
        </div>
      )}

      {decided.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Decided</p>
          {decided.map(sub => (
            <SubmissionRow key={sub.id} sub={sub} isAdmin={isAdmin} onDecide={handleDecide} />
          ))}
        </div>
      )}
    </div>
  )
}
