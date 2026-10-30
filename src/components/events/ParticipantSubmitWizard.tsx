import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import {
  ArrowLeft, ArrowRight, X, ShieldCheck, Github, Globe,
  Video, Twitter, Plus, Trash2, Sparkles,
  ExternalLink, Loader2
} from 'lucide-react'
import type { Event, Submission, TeamMember } from '../../types/events'
import {
  saveSubmissionDraft,
  loadSubmissionDraft,
  clearSubmissionDraft,
  generateSubmissionHash,
  formatMetadataUri,
  type SubmissionPayload,
} from '../../utils/metadataStorage'
import { usePasskeyContext } from '../../context/PasskeyContext'
import { useMode } from '../../context/ModeContext'
import { useEvents } from '../../context/EventsContext'
import { useSubmitEntry } from '../../hooks/useFundoraEvents'

interface ParticipantSubmitWizardProps {
  event: Event
  isOpen: boolean
  onClose: () => void
  onSuccess: (submission: Submission) => void
  /** If set, the wallet already submitted — show existing receipt instead of wizard */
  alreadySubmittedId?: bigint
}

type Step = 1 | 2 | 3 | 4

export function ParticipantSubmitWizard({
  event,
  isOpen,
  onClose,
  onSuccess,
  alreadySubmittedId,
}: ParticipantSubmitWizardProps) {
  const { address } = useAccount()
  const { isPasskeyConnected, smartAccountAddress } = usePasskeyContext()
  const activeAddress = isPasskeyConnected ? smartAccountAddress : address
  const { isLive } = useMode()
  const { addSubmission } = useEvents()

  // Onchain submit hook
  const {
    submitEntry,
    isPending: isWalletPrompt,
    isConfirming,
    isSuccess: isOnchainSuccess,
    hash: txHash,
    error: submitError,
  } = useSubmitEntry()

  const isExternal = event.modality === 'external_listing'

  const [step, setStep] = useState<Step>(1)

  // Load draft once via lazy initialisers — avoids set-state-in-effect
  const _initDraft = useMemo(() => loadSubmissionDraft(event.id), [event.id])

  const [draftRestoredTime] = useState<string | null>(
    () => _initDraft ? new Date(_initDraft.lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null
  )

  // Form State
  const [title, setTitle] = useState(() => _initDraft?.title ?? '')
  const [tagline, setTagline] = useState(() => _initDraft?.tagline ?? '')
  const [description, setDescription] = useState(() => _initDraft?.description ?? '')
  const [trackId, setTrackId] = useState(() => _initDraft?.trackId ?? event.tracks[0]?.id ?? '')

  // Media / Links
  const [repoUrl, setRepoUrl] = useState(() => _initDraft?.repoUrl ?? '')
  const [demoUrl, setDemoUrl] = useState(() => _initDraft?.demoUrl ?? '')
  const [videoUrl, setVideoUrl] = useState(() => _initDraft?.mediaUrls?.[0] ?? '')
  const [socialPostUrl, setSocialPostUrl] = useState(() => _initDraft?.socialPostUrl ?? '')
  const [mediaUrlInput, setMediaUrlInput] = useState('')
  const [mediaUrls, setMediaUrls] = useState<string[]>(() => _initDraft?.mediaUrls ?? [])

  // Team
  const [submitterName, setSubmitterName] = useState(() => _initDraft?.submitterName ?? '')
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => _initDraft?.teamMembers ?? [])
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('')
  const [newMemberHandle, setNewMemberHandle] = useState('')

  // Confirmation
  const [agreedToRules, setAgreedToRules] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isHackathon = event.category === 'hackathon'

  // Autosave draft on change
  useEffect(() => {
    if (!isOpen || !title.trim()) return
    const timer = setTimeout(() => {
      saveSubmissionDraft(event.id, {
        title,
        tagline,
        description,
        trackId,
        demoUrl,
        repoUrl,
        socialPostUrl,
        mediaUrls,
        teamMembers,
        submitterAddress: activeAddress || '',
        submitterName,
      })
    }, 600)
    return () => clearTimeout(timer)
  }, [
    isOpen, event.id, title, tagline, description, trackId,
    demoUrl, repoUrl, socialPostUrl, mediaUrls, teamMembers,
    activeAddress, submitterName,
  ])

  const handleClearDraft = () => {
    clearSubmissionDraft(event.id)
    setTitle('')
    setTagline('')
    setDescription('')
    setRepoUrl('')
    setDemoUrl('')
    setVideoUrl('')
    setSocialPostUrl('')
    setMediaUrls([])
    setSubmitterName('')
    setTeamMembers([])
  }

  // Teammate management
  const handleAddTeammate = () => {
    if (!newMemberName.trim()) return
    setTeamMembers([
      ...teamMembers,
      {
        name: newMemberName.trim(),
        role: newMemberRole.trim() || 'Contributor',
        handle: newMemberHandle.trim().startsWith('@') ? newMemberHandle.trim() : newMemberHandle.trim() ? `@${newMemberHandle.trim()}` : undefined,
      },
    ])
    setNewMemberName('')
    setNewMemberRole('')
    setNewMemberHandle('')
  }

  const handleRemoveTeammate = (idx: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== idx))
  }

  // Step Validation
  const validateStep = (currentStep: Step): boolean => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!title.trim()) newErrors.title = 'Project title is required'
      if (!tagline.trim()) newErrors.tagline = 'Short tagline is required'
      if (!description.trim()) newErrors.description = 'Project description is required'
      if (description.trim().length < 30) newErrors.description = 'Please provide at least 30 characters explaining your work'
    }

    if (currentStep === 2) {
      if (isHackathon) {
        if (!repoUrl.trim()) {
          newErrors.repoUrl = 'GitHub repository URL is required'
        } else if (!repoUrl.includes('github.com')) {
          newErrors.repoUrl = 'Must be a valid GitHub repository link (https://github.com/...)'
        }
      } else {
        if (!socialPostUrl.trim()) {
          newErrors.socialPostUrl = 'X (Twitter) post URL is required for contest entries'
        }
      }
    }

    if (currentStep === 3) {
      if (!submitterName.trim()) newErrors.submitterName = 'Lead submitter name is required'
    }

    if (currentStep === 4) {
      if (!agreedToRules) newErrors.agreedToRules = 'You must confirm that this is original work built for this event'
      if (!activeAddress) newErrors.wallet = 'Please connect your wallet or sign in with a passkey to submit'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(4, prev + 1) as Step)
    }
  }

  const handleBack = () => {
    setErrors({})
    setStep((prev) => Math.max(1, prev - 1) as Step)
  }

  const handleSubmit = () => {
    if (!validateStep(4)) return
    if (!activeAddress) {
      setErrors({ wallet: 'Please connect your wallet to submit.' })
      return
    }
    if (isExternal) {
      setErrors({ submit: 'External events do not accept Fundora submissions. Please apply on the external platform.' })
      return
    }

    if (!isLive) {
      const newSubmission: Submission = {
        id: `sub_${Date.now().toString().slice(-6)}`,
        eventId: event.id,
        trackId,
        title,
        tagline,
        description,
        submitterAddress: activeAddress,
        submitterName,
        teamMembers,
        demoUrl: demoUrl.trim() || undefined,
        repoUrl: repoUrl.trim() || undefined,
        socialPostUrl: socialPostUrl.trim() || undefined,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : videoUrl ? [videoUrl] : [],
        submittedAt: Math.floor(Date.now() / 1000),
      }
      addSubmission(newSubmission)
      clearSubmissionDraft(event.id)
      onSuccess(newSubmission)
      return
    }

    const payload: SubmissionPayload = {
      title,
      tagline,
      description,
      trackId,
      demoUrl: demoUrl.trim() || undefined,
      repoUrl: repoUrl.trim() || undefined,
      socialPostUrl: socialPostUrl.trim() || undefined,
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : videoUrl ? [videoUrl] : [],
      teamMembers,
      submitterAddress: activeAddress,
      submitterName,
    }

    const submissionHash = generateSubmissionHash(payload)
    const metadataUri = formatMetadataUri(payload)

    // eventId is a numeric string in the frontend Event type
    const eventIdBig = BigInt(event.id.replace(/\D/g, '') || '0')
    if (eventIdBig <= 0n) {
      setErrors({ submit: 'Invalid onchain event ID. Only verified live events can accept onchain entries.' })
      return
    }

    submitEntry(eventIdBig, metadataUri, submissionHash)
  }

  // React to onchain success: clear draft and call onSuccess
  useEffect(() => {
    if (!isOnchainSuccess) return
    clearSubmissionDraft(event.id)
    const newSubmission: Submission = {
      id: txHash ? `0x${txHash.slice(2, 8)}` : `sub_${Date.now().toString().slice(-6)}`,
      eventId: event.id,
      trackId,
      title,
      tagline,
      description,
      submitterAddress: activeAddress || '',
      submitterName,
      teamMembers,
      demoUrl: demoUrl.trim() || undefined,
      repoUrl: repoUrl.trim() || undefined,
      socialPostUrl: socialPostUrl.trim() || undefined,
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : videoUrl ? [videoUrl] : [],
      submittedAt: Math.floor(Date.now() / 1000),
      claimTxHash: txHash,
    }
    addSubmission(newSubmission)
    onSuccess(newSubmission)
  }, [isOnchainSuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  const isSubmitting = isWalletPrompt || isConfirming

  if (!isOpen) return null

  // Guard: already submitted
  if (alreadySubmittedId && alreadySubmittedId > 0n) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/70 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="already-submitted-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md rounded-3xl bg-white border border-teal-200 shadow-2xl p-7 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-teal" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            aria-label="Close"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
              <ShieldCheck size={22} className="text-teal" />
            </div>
            <div>
              <h2 id="already-submitted-title" className="font-jakarta font-extrabold text-lg text-midnight">
                Already Submitted
              </h2>
              <p className="text-xs text-slate-500">One entry per wallet per event</p>
            </div>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed mb-5">
            Your wallet has already submitted an entry to <strong>{event.title}</strong>. Only one submission per wallet is permitted.
          </p>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs font-mono text-slate-600 mb-5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Onchain Submission ID</span>
            <span className="font-bold text-midnight">#{alreadySubmittedId.toString()}</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-5">
            Editing or resubmitting is not supported in the current contract version.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-midnight hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </motion.div>
      </div>
    )
  }

  // Guard: external listing events
  if (isExternal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/70 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="external-event-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-7 relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            aria-label="Close"
          >
            <X size={16} />
          </button>
          <h2 id="external-event-title" className="font-jakarta font-extrabold text-lg text-midnight mb-3">
            External Platform Event
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed mb-5">
            <strong>{event.title}</strong> is hosted on <strong>{event.externalPlatformName || 'an external platform'}</strong>. Submissions are managed there, not through Fundora.
          </p>
          <a
            href={event.externalUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-midnight hover:bg-slate-800 transition-colors mb-3"
          >
            Apply on {event.externalPlatformName || 'External Platform'}
            <ExternalLink size={13} />
          </a>
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-midnight"
          >
            Cancel
          </button>
        </motion.div>
      </div>
    )
  }

  const selectedTrack = event.tracks.find((t) => t.id === trackId) || event.tracks[0]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-midnight/70 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl relative my-auto overflow-hidden flex flex-col"
        style={{ maxHeight: '92vh' }}
      >
        {/* Top Header & Step Indicator */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-light text-brand truncate">
                {event.title}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ Submission</span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200/60 transition-colors"
              aria-label="Close wizard"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <h2 id="wizard-title" className="font-jakarta font-extrabold text-xl text-midnight tracking-tight">
              {step === 1 && '1. Project Essentials'}
              {step === 2 && (isHackathon ? '2. Code & Live Demo' : '2. Contest Submission & Media')}
              {step === 3 && '3. Submitter & Team Credits'}
              {step === 4 && '4. Live Preview & Confirmation'}
            </h2>
            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-500">
              <span className="text-brand">0{step}</span>
              <span className="text-slate-300">/</span>
              <span>04</span>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>

          {/* Draft Restored Banner */}
          {draftRestoredTime && (
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/60">
              <span>Draft auto-restored from {draftRestoredTime}</span>
              <button
                onClick={handleClearDraft}
                className="text-teal-900 underline hover:opacity-80 font-medium"
              >
                Clear draft
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-5">
          {/* ═══════════════════════════════════════════════════════════════════
              STEP 1: PROJECT ESSENTIALS
          ════════════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-midnight uppercase tracking-wider mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={title}
                  maxLength={60}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    if (errors.title) setErrors({ ...errors, title: '' })
                  }}
                  placeholder="e.g. HydroPay, PulsePass, ArcPoint"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-midnight placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand ${errors.title ? 'border-coral ring-1 ring-coral' : 'border-slate-200'
                    }`}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.title ? (
                    <span className="text-xs text-coral font-medium">{errors.title}</span>
                  ) : (
                    <span className="text-[11px] text-slate-400">Clear, memorable name for your project</span>
                  )}
                  <span className="text-[11px] text-slate-400 font-mono">{title.length}/60</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-midnight uppercase tracking-wider mb-1.5">
                  One-Line Tagline *
                </label>
                <input
                  type="text"
                  value={tagline}
                  maxLength={120}
                  onChange={(e) => {
                    setTagline(e.target.value)
                    if (errors.tagline) setErrors({ ...errors, tagline: '' })
                  }}
                  placeholder="e.g. Continuous real-time USDC streaming payments with zero gas volatility on Arc."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-midnight placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand ${errors.tagline ? 'border-coral ring-1 ring-coral' : 'border-slate-200'
                    }`}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.tagline ? (
                    <span className="text-xs text-coral font-medium">{errors.tagline}</span>
                  ) : (
                    <span className="text-[11px] text-slate-400">Appears on directory cards and showcase grids</span>
                  )}
                  <span className="text-[11px] text-slate-400 font-mono">{tagline.length}/120</span>
                </div>
              </div>

              {/* Track Selection */}
              <div>
                <label className="block text-xs font-bold text-midnight uppercase tracking-wider mb-1.5">
                  Select Competition Track *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {event.tracks.map((t) => (
                    <label
                      key={t.id}
                      onClick={() => setTrackId(t.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${trackId === t.id
                          ? 'border-brand bg-brand-light/40 shadow-xs ring-1 ring-brand'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-midnight">{t.name}</span>
                          <span className="font-mono text-[11px] text-teal font-semibold">
                            ${Number(t.prizePoolUsdc / 1_000_000n).toLocaleString()} USDC
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {t.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-midnight uppercase tracking-wider mb-1.5">
                  Detailed Project Description *
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    if (errors.description) setErrors({ ...errors, description: '' })
                  }}
                  placeholder="Explain what your project does, how it leverages Arc's unique architecture (e.g. USDC gas, passkeys), and instructions for judges..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-midnight placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand ${errors.description ? 'border-coral ring-1 ring-coral' : 'border-slate-200'
                    }`}
                />
                {errors.description && (
                  <span className="text-xs text-coral font-medium mt-1 block">{errors.description}</span>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              STEP 2: PROOF & MEDIA ARTIFACTS
          ════════════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-4">
              {isHackathon ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-midnight uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Github size={14} className="text-slate-700" />
                      GitHub Repository URL *
                    </label>
                    <input
                      type="url"
                      value={repoUrl}
                      onChange={(e) => {
                        setRepoUrl(e.target.value)
                        if (errors.repoUrl) setErrors({ ...errors, repoUrl: '' })
                      }}
                      placeholder="https://github.com/your-username/your-repo"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-midnight placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand ${errors.repoUrl ? 'border-coral ring-1 ring-coral' : 'border-slate-200'
                        }`}
                    />
                    {errors.repoUrl ? (
                      <span className="text-xs text-coral font-medium mt-1 block">{errors.repoUrl}</span>
                    ) : (
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Must contain smart contracts, tests, and documentation.
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-midnight uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Globe size={14} className="text-brand" />
                      Live Interactive Demo URL (Recommended)
                    </label>
                    <input
                      type="url"
                      value={demoUrl}
                      onChange={(e) => setDemoUrl(e.target.value)}
                      placeholder="https://your-demo-app.vercel.app"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-midnight placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-midnight uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Video size={14} className="text-amber-600" />
                      Video Walkthrough Link (Loom / YouTube / MP4)
                    </label>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://loom.com/share/..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-midnight placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-midnight uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Twitter size={14} className="text-sky-500" />
                      X (Twitter) Post URL *
                    </label>
                    <input
                      type="url"
                      value={socialPostUrl}
                      onChange={(e) => {
                        setSocialPostUrl(e.target.value)
                        if (errors.socialPostUrl) setErrors({ ...errors, socialPostUrl: '' })
                      }}
                      placeholder="https://x.com/username/status/123456789"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-midnight placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand ${errors.socialPostUrl ? 'border-coral ring-1 ring-coral' : 'border-slate-200'
                        }`}
                    />
                    {errors.socialPostUrl && (
                      <span className="text-xs text-coral font-medium mt-1 block">{errors.socialPostUrl}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-midnight uppercase tracking-wider mb-1.5">
                      Artwork / Image Attachment URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={mediaUrlInput}
                      onChange={(e) => setMediaUrlInput(e.target.value)}
                      placeholder="https://images.unsplash.com/... or IPFS gateway URL"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-midnight placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              STEP 3: SUBMITTER & TEAM CREDITS
          ════════════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Connected Address Pull-Payment Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Onchain Prize Recipient Wallet
                </span>
                <div className="font-mono font-bold text-sm text-midnight truncate mb-1">
                  {activeAddress || 'No wallet connected'}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Prizes are pull-claimed directly by this address on Arc. Teams can use a shared Safe multisig or payment splitter address.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-midnight uppercase tracking-wider mb-1.5">
                  Lead Submitter Name *
                </label>
                <input
                  type="text"
                  value={submitterName}
                  onChange={(e) => {
                    setSubmitterName(e.target.value)
                    if (errors.submitterName) setErrors({ ...errors, submitterName: '' })
                  }}
                  placeholder="e.g. Elena Rostova"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-midnight placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand ${errors.submitterName ? 'border-coral ring-1 ring-coral' : 'border-slate-200'
                    }`}
                />
                {errors.submitterName && (
                  <span className="text-xs text-coral font-medium mt-1 block">{errors.submitterName}</span>
                )}
              </div>

              {/* Dynamic Collaborators */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-midnight uppercase tracking-wider">
                    Teammates & Collaborators ({teamMembers.length})
                  </label>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Teammates are credited publicly in the project showcase and winner announcements.
                </p>

                {/* Existing members */}
                {teamMembers.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {teamMembers.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-midnight">{m.name}</span>
                          <span className="text-slate-400 font-medium">({m.role})</span>
                          {m.handle && <span className="text-brand font-mono">{m.handle}</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveTeammate(idx)}
                          className="text-slate-400 hover:text-coral p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new teammate inputs */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Add Team Member
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Name (e.g. Maya Lin)"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-midnight focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                    <input
                      type="text"
                      placeholder="Role (e.g. Design)"
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-midnight focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                    <input
                      type="text"
                      placeholder="Handle (e.g. @maya)"
                      value={newMemberHandle}
                      onChange={(e) => setNewMemberHandle(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-midnight focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTeammate}
                    disabled={!newMemberName.trim()}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-50"
                  >
                    <Plus size={12} /> Add to Team
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              STEP 4: LIVE PREVIEW & CONFIRMATION
          ════════════════════════════════════════════════════════════════════ */}
          {step === 4 && (
            <div className="space-y-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Entry Showcase Card Preview
              </span>

              {/* Rendered Card Preview */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-brand-light text-brand">
                    {selectedTrack.name}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    By {submitterName || 'Anonymous'}
                  </span>
                </div>

                <h3 className="font-jakarta font-bold text-lg text-midnight">{title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{tagline}</p>

                {/* Team summary */}
                <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-medium text-slate-500 mr-1">Contributors:</span>
                  <span className="text-xs font-medium text-slate-800">{submitterName} (Lead)</span>
                  {teamMembers.map((m) => (
                    <span key={m.name} className="text-xs text-slate-600">
                      · {m.name}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="flex items-center gap-3 pt-2 text-xs text-slate-500">
                  {repoUrl && (
                    <span className="flex items-center gap-1">
                      <Github size={12} /> GitHub Verified
                    </span>
                  )}
                  {demoUrl && (
                    <span className="flex items-center gap-1">
                      <Globe size={12} /> Live Demo
                    </span>
                  )}
                  {socialPostUrl && (
                    <span className="flex items-center gap-1">
                      <Twitter size={12} className="text-sky-500" /> Post Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Originality & Rules Agreement */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToRules}
                    onChange={(e) => {
                      setAgreedToRules(e.target.checked)
                      if (errors.agreedToRules) setErrors({ ...errors, agreedToRules: '' })
                    }}
                    className="mt-0.5 rounded border-slate-300 text-brand focus:ring-brand"
                  />
                  <span className="text-xs text-slate-700 leading-relaxed">
                    I certify that this project is original work built for this event, does not infringe on intellectual property rights, and complies with Arc Network terms.
                  </span>
                </label>
                {errors.agreedToRules && (
                  <span className="text-xs text-coral font-medium block">{errors.agreedToRules}</span>
                )}
                {errors.wallet && (
                  <span className="text-xs text-coral font-medium block">{errors.wallet}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-200/80 bg-slate-50 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:text-midnight bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft size={13} /> Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-2"
            >
              Cancel
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-midnight hover:bg-slate-800 transition-colors shadow-sm"
            >
              Continue to Step 0{step + 1}
              <ArrowRight size={13} />
            </button>
          ) : (
            <div className="flex flex-col items-end gap-1.5">
              {submitError && (
                <span className="text-[11px] text-coral font-medium text-right">
                  {(submitError as Error).message?.split('\n')[0]?.slice(0, 100) || 'Transaction failed. Please try again.'}
                </span>
              )}
              {errors.submit && (
                <span className="text-[11px] text-coral font-medium text-right">{errors.submit}</span>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl text-xs font-bold text-white bg-brand hover:bg-brand-hover disabled:opacity-50 transition-colors shadow-sm"
              >
                {isWalletPrompt ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Confirm in Wallet…
                  </>
                ) : isConfirming ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Confirming on Arc…
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Confirm &amp; Submit Entry
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
