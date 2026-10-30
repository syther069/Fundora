import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useAccount } from 'wagmi'
import {
  ArrowLeft, ShieldCheck, ExternalLink, Clock, Users,
  Trophy, Sparkles, CheckCircle2, Copy, Check, FileText,
  Scale, Layers, Award, Github, Globe, HelpCircle, CheckCheck
} from 'lucide-react'
import type { Event, Submission } from '../../types/events'
import { ParticipantSubmitWizard } from './ParticipantSubmitWizard'
import { SubmissionReceiptModal } from './SubmissionReceiptModal'
import { useUserSubmissionId } from '../../hooks/useFundoraEvents'

interface EventDetailProps {
  event: Event
  submissions: Submission[]
  onBack: () => void
  onOpenSubmitModal?: () => void
}

type TabType = 'overview' | 'tracks' | 'rubric' | 'showcase' | 'winners'

// Module-level timestamp — avoids impure Date.now() during render
const MODULE_NOW_SECS = Math.floor(Date.now() / 1000)

function formatUsdc(amount: bigint): string {
  const dollars = amount / 1_000_000n
  return Number(dollars).toLocaleString('en-US')
}

export function EventDetailView({ event, submissions, onBack, onOpenSubmitModal }: EventDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>(event.status === 'completed' ? 'winners' : 'overview')
  const [copiedAddr, setCopiedAddr] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [lastSubmission, setLastSubmission] = useState<Submission | null>(null)
  const [receiptOpen, setReceiptOpen] = useState(false)

  const { address } = useAccount()
  const isNativeEvent = event.modality === 'native_escrow'

  // Check if connected wallet already submitted to this event
  const eventIdBig = (() => {
    try { return BigInt(event.id.replace(/\D/g, '') || '0') } catch { return 0n }
  })()
  const { data: existingSubId, isLoading: subCheckLoading } = useUserSubmissionId(
    isNativeEvent && eventIdBig > 0n ? eventIdBig : undefined,
    address ?? undefined,
  )
  const alreadySubmittedId = existingSubId

  const handleOpenSubmit = () => {
    setWizardOpen(true)
    // Also call prop callback for view switching if provided
    onOpenSubmitModal?.()
  }

  const handleWizardSuccess = (sub: Submission) => {
    setLastSubmission(sub)
    setWizardOpen(false)
    setReceiptOpen(true)
  }

  const isExternal = event.modality === 'external_listing'
  const isNative = event.modality === 'native_escrow'
  const isCompleted = event.status === 'completed'
  const isJudging = event.status === 'judging'

  const copyAddress = (addr?: string) => {
    if (!addr) return
    void navigator.clipboard.writeText(addr)
    setCopiedAddr(true)
    setTimeout(() => setCopiedAddr(false), 2000)
  }

  // Countdown calculations
  const now = MODULE_NOW_SECS
  const diff = Math.max(0, event.submissionDeadline - now)
  const days = Math.floor(diff / 86400)
  const hours = Math.floor((diff % 86400) / 3600)
  const minutes = Math.floor((diff % 3600) / 60)

  return (
    <div className="max-w-6xl mx-auto pb-16">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-midnight transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-brand"
          aria-label="Back to all events directory"
        >
          <ArrowLeft size={14} />
          Back to Events Directory
        </button>

        <div className="flex items-center gap-2">
          {event.contractAddress && (
            <a
              href={`https://explorer.testnet.arc.io/address/${event.contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand font-mono transition-colors"
              title="Inspect onchain escrow contract"
            >
              <span>Escrow: {event.contractAddress.slice(0, 6)}...{event.contractAddress.slice(-4)}</span>
              <ExternalLink size={11} />
            </a>
          )}
        </div>
      </div>

      {/* Hero Banner Section */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm mb-8 overflow-hidden relative">
        {/* Subtle accent highlight bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{
            background: isNative
              ? 'linear-gradient(90deg, #1A3F75 0%, #0F766E 100%)'
              : 'linear-gradient(90deg, #4F7897 0%, #A7C6D8 100%)',
          }}
        />

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pt-2">
          <div className="flex-1 max-w-2xl">
            {/* Badges row */}
            <div className="flex items-center gap-2 mb-3.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {event.category === 'hackathon' ? (
                  <Trophy size={11} className="text-brand" />
                ) : (
                  <Sparkles size={11} className="text-amber-600" />
                )}
                {event.category === 'hackathon' ? 'Hackathon' : 'Contest'}
              </span>

              {isNative ? (
                <span
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: 'var(--teal-light)',
                    color: 'var(--teal)',
                    borderColor: 'var(--teal-border)',
                  }}
                  title="Funds are locked in verified smart contract escrow on Arc"
                >
                  <ShieldCheck size={13} />
                  Arc Verified Escrow
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border border-slate-300 bg-slate-50 text-slate-600">
                  <ExternalLink size={12} />
                  External Event ({event.externalPlatformName})
                </span>
              )}

              {/* Status Badge */}
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  <CheckCircle2 size={12} className="text-brand" />
                  Completed
                </span>
              ) : isJudging ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  In Judging
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
                  Active Submissions
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-jakarta font-extrabold text-2xl sm:text-3xl text-midnight tracking-tight mb-2.5 leading-snug">
              {event.title}
            </h1>

            {/* Tagline */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
              {event.tagline}
            </p>

            {/* Host Info */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Organized by:</span>
              <div className="flex items-center gap-1.5 font-semibold text-midnight">
                {event.hostAvatar && (
                  <img src={event.hostAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                )}
                <span>{event.hostName}</span>
              </div>
              {event.hostAddress && (
                <button
                  onClick={() => copyAddress(event.hostAddress)}
                  className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-400 hover:text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200"
                  title="Copy host wallet address"
                >
                  {event.hostAddress.slice(0, 6)}...{event.hostAddress.slice(-4)}
                  {copiedAddr ? <Check size={10} className="text-teal" /> : <Copy size={10} />}
                </button>
              )}
            </div>
          </div>

          {/* Right Action / Financial Box */}
          <div className="flex flex-col sm:flex-row lg:flex-col justify-between items-stretch lg:items-end gap-4 p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 min-w-[280px]">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                Total Prize Pool
                {isNative && (
                  <span title="USDC held in non-custodial pull-escrow" className="cursor-help">
                    <HelpCircle size={12} className="text-slate-400" />
                  </span>
                )}
              </div>
              <div className="font-mono font-extrabold text-2xl sm:text-3xl text-midnight tabular-nums tracking-tight">
                ${formatUsdc(event.totalPrizePoolUsdc)}{' '}
                <span className="text-sm font-bold text-slate-500">USDC</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Across {event.tracks.length} {event.tracks.length === 1 ? 'Track' : 'Tracks'} & Bounties
              </div>
            </div>

            {/* Countdown or Status Callout */}
            <div className="pt-3 border-t border-slate-200/60 w-full">
              {!isCompleted && !isJudging && (
                <div className="mb-3">
                  <div className="text-[11px] font-medium text-slate-500 mb-1.5 flex items-center gap-1">
                    <Clock size={12} />
                    Submissions Deadline:
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <div className="bg-white border border-slate-200 rounded px-2 py-1 text-center min-w-[36px]">
                      <span className="font-bold text-sm text-midnight">{days}</span>
                      <span className="text-[9px] block text-slate-400">DAYS</span>
                    </div>
                    <span className="text-slate-400 font-bold">:</span>
                    <div className="bg-white border border-slate-200 rounded px-2 py-1 text-center min-w-[36px]">
                      <span className="font-bold text-sm text-midnight">{hours}</span>
                      <span className="text-[9px] block text-slate-400">HRS</span>
                    </div>
                    <span className="text-slate-400 font-bold">:</span>
                    <div className="bg-white border border-slate-200 rounded px-2 py-1 text-center min-w-[36px]">
                      <span className="font-bold text-sm text-midnight">{minutes}</span>
                      <span className="text-[9px] block text-slate-400">MIN</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Action Button */}
              {isExternal ? (
                <a
                  href={event.externalUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-midnight hover:bg-slate-800 transition-all shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  Apply on {event.externalPlatformName || 'External Platform'}
                  <ExternalLink size={14} />
                </a>
              ) : isCompleted ? (
                <button
                  onClick={() => setActiveTab('winners')}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-brand bg-brand-light hover:bg-brand-light/80 border border-brand-border transition-all shadow-sm"
                >
                  <Award size={14} />
                  View Winners Podium
                </button>
              ) : isJudging ? (
                <button
                  disabled
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-500 bg-slate-200 cursor-not-allowed"
                >
                  Submissions Closed (In Review)
                </button>
              ) : subCheckLoading ? (
                <button
                  disabled
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-400 bg-slate-100 cursor-wait"
                  aria-label="Checking submission status…"
                >
                  <span className="w-3 h-3 rounded-full border-2 border-slate-300 border-t-slate-500 animate-spin" aria-hidden="true" />
                  Checking status…
                </button>
              ) : alreadySubmittedId && alreadySubmittedId > 0n ? (
                <button
                  onClick={handleOpenSubmit}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-teal bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-all shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-teal"
                >
                  <CheckCheck size={14} />
                  View My Submission
                </button>
              ) : (
                <button
                  onClick={handleOpenSubmit}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-brand hover:bg-brand-hover transition-all shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <Sparkles size={14} />
                  Submit Project
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation Row */}
      <div className="border-b border-slate-200 mb-8 overflow-x-auto tab-scroll-container">
        <div className="flex items-center gap-1 sm:gap-2" role="tablist">
          {[
            { id: 'overview', label: 'Overview & Rules', icon: FileText },
            { id: 'tracks', label: `Tracks & Prizes (${event.tracks.length})`, icon: Trophy },
            { id: 'rubric', label: 'Judging Rubric', icon: Scale },
            { id: 'showcase', label: `Projects Showcase (${submissions.length})`, icon: Layers },
            ...(isCompleted ? [{ id: 'winners', label: 'Winners Podium 🏆', icon: Award }] : []),
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => setActiveTab(id as TabType)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all outline-none whitespace-nowrap ${activeTab === id
                  ? 'border-brand text-brand'
                  : 'border-transparent text-slate-500 hover:text-midnight hover:border-slate-300'
                }`}
            >
              <Icon size={14} className={activeTab === id ? 'text-brand' : 'text-slate-400'} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Area */}
      <div>
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
                <h2 className="font-jakarta font-bold text-lg text-midnight mb-4">
                  Event Brief & Requirements
                </h2>
                <div className="prose prose-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {event.description}
                </div>
              </div>

              {/* Tags block */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Focus Technologies & Themes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium px-3 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Information */}
            <div className="space-y-6">
              {/* Event Timeline Card */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                <h3 className="text-xs font-bold text-midnight uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Clock size={13} className="text-brand" />
                  Key Milestones & Schedule
                </h3>
                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-teal-600 mt-1" />
                    <div>
                      <div className="font-semibold text-midnight">Event Kickoff</div>
                      <div className="text-slate-500">
                        {new Date(event.startDate * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1" />
                    <div>
                      <div className="font-semibold text-midnight">Submission Deadline</div>
                      <div className="text-slate-500">
                        {new Date(event.submissionDeadline * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-slate-400 mt-1" />
                    <div>
                      <div className="font-semibold text-midnight">Deliberation & Judging Ends</div>
                      <div className="text-slate-500">
                        {new Date(event.judgingDeadline * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  {event.winnersAnnouncedDate && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-brand mt-1" />
                      <div>
                        <div className="font-semibold text-midnight">Winners & Settlement</div>
                        <div className="text-slate-500">
                          {new Date(event.winnersAnnouncedDate * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Trust & Safety Notice */}
              <div className="rounded-2xl border border-teal-200/80 bg-teal-50/50 p-5">
                <div className="flex items-center gap-2 text-teal-900 font-bold text-xs mb-2">
                  <ShieldCheck size={16} className="text-teal" />
                  Onchain Escrow Protection
                </div>
                <p className="text-xs text-teal-800 leading-relaxed">
                  Prizes on Fundora are funded into onchain smart contracts prior to announcement. Winning rewards are claimed directly by your wallet using pull-payments, protecting you from transfer failures or cancellation lockouts.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Tracks & Prizes */}
        {activeTab === 'tracks' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {event.tracks.map((track) => (
                <div
                  key={track.id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-brand-light text-brand">
                        Track Pool
                      </span>
                      <span className="font-mono font-bold text-base text-midnight tabular-nums">
                        ${formatUsdc(track.prizePoolUsdc)} USDC
                      </span>
                    </div>

                    <h3 className="font-jakarta font-bold text-lg text-midnight mb-2">
                      {track.name}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-6">
                      {track.description}
                    </p>
                  </div>

                  {/* Prize Tier Breakdown */}
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Prize Distribution
                    </h4>
                    <div className="space-y-2">
                      {track.prizeTiers.map((tier) => (
                        <div key={tier.id} className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            {tier.place}
                          </span>
                          <span className="font-mono font-semibold text-midnight tabular-nums">
                            ${formatUsdc(tier.amountUsdc)} USDC
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Judging Rubric */}
        {activeTab === 'rubric' && (
          <div className="max-w-3xl space-y-6">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
              <h2 className="font-jakarta font-bold text-lg text-midnight mb-2">
                Evaluation Criteria & Weightings
              </h2>
              <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                Invited reviewers score each submission from 1 to 10 on the published rubric below. Weighted averages form the deliberation leaderboard, which informs the organizer's final prize allocations.
              </p>

              <div className="space-y-5">
                {event.rubric.map((criterion) => (
                  <div key={criterion.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/70">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-sm text-midnight">{criterion.name}</span>
                      <span className="font-mono font-bold text-xs text-brand bg-brand-light px-2.5 py-0.5 rounded">
                        {criterion.weightPercentage}% Weight
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-2.5">
                      {criterion.description}
                    </p>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand rounded-full"
                        style={{ width: `${criterion.weightPercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Submissions Showcase */}
        {activeTab === 'showcase' && (
          <div>
            {event.isBlindJudging && !isCompleted ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center max-w-lg mx-auto">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-3">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="font-jakarta font-bold text-base text-midnight mb-1">
                  Blind Judging in Effect
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Submissions are hidden from the public gallery during the active evaluation window to ensure completely impartial judging. Entries will be unlocked once winners are confirmed.
                </p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center max-w-lg mx-auto">
                <Users size={32} className="text-slate-300 mx-auto mb-3" />
                <h3 className="font-jakarta font-bold text-base text-midnight mb-1">
                  No Entries Submitted Yet
                </h3>
                <p className="text-xs text-slate-600 mb-4">
                  Be the first to submit a project to this event!
                </p>
                {onOpenSubmitModal && (
                  <button
                    onClick={onOpenSubmitModal}
                    className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold text-white bg-brand"
                  >
                    <Sparkles size={13} />
                    Submit Project
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      {sub.mediaUrls[0] && (
                        <img
                          src={sub.mediaUrls[0]}
                          alt={sub.title}
                          className="w-full h-36 object-cover rounded-xl mb-4 border border-slate-100"
                        />
                      )}
                      <h4 className="font-jakarta font-bold text-base text-midnight mb-1 line-clamp-1">
                        {sub.title}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                        {sub.tagline}
                      </p>

                      {/* Team Collaborators */}
                      <div className="mb-4">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                          Contributors ({sub.teamMembers.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {sub.teamMembers.map((member) => (
                            <span
                              key={member.name}
                              className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                              title={`${member.name} (${member.role})`}
                            >
                              {member.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Links row */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {sub.repoUrl && (
                          <a
                            href={sub.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-midnight flex items-center gap-1"
                            title="GitHub Repository"
                          >
                            <Github size={13} />
                            Code
                          </a>
                        )}
                        {sub.demoUrl && (
                          <a
                            href={sub.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-midnight flex items-center gap-1"
                            title="Live Interactive Demo"
                          >
                            <Globe size={13} />
                            Demo
                          </a>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {sub.submitterAddress.slice(0, 6)}...{sub.submitterAddress.slice(-4)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Winners Podium */}
        {activeTab === 'winners' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50/60 via-teal-50/40 to-indigo-50/40 border border-amber-200/70 mb-6">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-1">
                <Trophy size={16} className="text-amber-600" />
                Official Award Decisions Finalized
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                The organizer has confirmed prize allocations based on reviewer scorecards. Prize funds have been credited onchain and are pulled directly by the winners' addresses.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {submissions
                .filter((s) => s.rank)
                .sort((a, b) => (a.rank || 0) - (b.rank || 0))
                .map((winner) => (
                  <div
                    key={winner.id}
                    className={`rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative overflow-hidden bg-white ${winner.rank === 1
                        ? 'border-amber-300 ring-2 ring-amber-100'
                        : 'border-slate-200'
                      }`}
                  >
                    {/* Top Medal Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${winner.rank === 1
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : winner.rank === 2
                              ? 'bg-slate-100 text-slate-800 border border-slate-300'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                      >
                        <Award size={13} />
                        {winner.rank === 1 ? '1st Place' : winner.rank === 2 ? '2nd Place' : '3rd Place'}
                      </span>

                      {winner.totalScore && (
                        <span className="font-mono text-xs font-semibold text-slate-500">
                          Score: {winner.totalScore}/10
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-jakarta font-bold text-lg text-midnight mb-1">
                        {winner.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        {winner.tagline}
                      </p>

                      {/* Prize Award */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 mb-4">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                          Prize Awarded
                        </span>
                        <div className="font-mono font-bold text-xl text-teal tabular-nums">
                          ${winner.prizeAmountUsdc ? formatUsdc(winner.prizeAmountUsdc) : '0'} USDC
                        </div>
                      </div>

                      {/* Team Credits */}
                      <div className="mb-4">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                          Winning Team
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {winner.teamMembers.map((m) => (
                            <span key={m.name} className="text-xs text-slate-700 font-medium">
                              {m.name}{m.handle ? ` (${m.handle})` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Onchain Settlement Receipt */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1 text-teal font-semibold text-[11px]">
                        <CheckCircle2 size={12} /> Claimed on Arc
                      </span>
                      {winner.claimTxHash && (
                        <a
                          href={`https://explorer.mainnet.arc.io/tx/${winner.claimTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[11px] text-slate-500 hover:text-brand flex items-center gap-1"
                          title="View claim transaction on Arc Explorer"
                        >
                          Tx: {winner.claimTxHash.slice(0, 6)}...
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Submission Wizard Modal ── */}
      <AnimatePresence>
        {wizardOpen && (
          <ParticipantSubmitWizard
            event={event}
            isOpen={wizardOpen}
            onClose={() => setWizardOpen(false)}
            onSuccess={handleWizardSuccess}
            alreadySubmittedId={alreadySubmittedId}
          />
        )}
      </AnimatePresence>

      {/* ── Submission Receipt Modal ── */}
      <AnimatePresence>
        {receiptOpen && lastSubmission && (
          <SubmissionReceiptModal
            submission={lastSubmission}
            eventTitle={event.title}
            onClose={() => setReceiptOpen(false)}
            onViewShowcase={() => {
              setReceiptOpen(false)
              setActiveTab('showcase')
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
