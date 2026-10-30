import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { isAddress } from 'viem'
import {
  ShieldCheck, X, Zap, Trophy, ArrowLeft, CheckCircle2, Sparkles, ArrowRight,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type Category = 'hackathon' | 'contest'
type WizardStep = 'choice' | 1 | 2 | 3 | 'success'

export interface OrganizerProfile {
  address: string
  username: string
  orgName: string
  category: Category
  description: string
  budgetUsdc: string
  targetWinners: string
  createdAt: number
}

interface Props {
  onClose: () => void
  /** Called after profile saved — pass chosen category so wizard can pre-select it */
  onSuccessRedirect: (category: Category) => void
}

// ── localStorage helpers ───────────────────────────────────────────────────────

export function saveOrganizerProfile(profile: OrganizerProfile): void {
  try {
    localStorage.setItem(
      `fundora:organizer:profile:${profile.address.toLowerCase()}`,
      JSON.stringify(profile),
    )
  } catch { /* storage full */ }
}

export function loadOrganizerProfile(address: string): OrganizerProfile | null {
  try {
    const raw = localStorage.getItem(`fundora:organizer:profile:${address.toLowerCase()}`)
    return raw ? (JSON.parse(raw) as OrganizerProfile) : null
  } catch { return null }
}

// ── Step pill indicator ────────────────────────────────────────────────────────

const STEP_LABELS = ['Profile & Identity', 'Program & Budget', 'Confirmation']

function StepPills({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-1" role="list" aria-label="Setup progress">
      {STEP_LABELS.map((label, i) => {
        const num = (i + 1) as 1 | 2 | 3
        const active = num === current
        const done = num < current
        return (
          <div key={num} className="flex items-center gap-1" role="listitem">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all"
              style={{
                background: done ? 'var(--teal-light)' : active ? 'var(--brand)' : 'var(--warm-bg-2)',
                color: done ? 'var(--teal)' : active ? '#fff' : 'var(--subtle)',
                border: done ? '1px solid var(--teal-border)' : active ? 'none' : '1px solid var(--border)',
              }}
              aria-current={active ? 'step' : undefined}
            >
              {done ? <CheckCircle2 size={10} /> : <span>{num}</span>}
              <span className="hidden sm:inline">{label}</span>
            </div>
            {i < 2 && (
              <div className="w-3 h-px" style={{ background: done ? 'var(--teal-border)' : 'var(--border)' }} aria-hidden="true" />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Input helpers ─────────────────────────────────────────────────────────────

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--subtle)' }}>
      {children}
    </label>
  )
}

const INPUT_CLS = 'w-full h-11 px-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand focus:border-transparent text-sm text-midnight placeholder:text-slate-400 outline-none transition-shadow bg-white'

// ── Main modal ────────────────────────────────────────────────────────────────

export function ApplyAdminModal({ onClose, onSuccessRedirect }: Props) {
  const { address } = useAccount()

  // Wizard state
  const [wizardStep, setWizardStep] = useState<WizardStep>('choice')
  const [category, setCategory] = useState<Category | null>(null)

  // Step 1 fields
  const [username, setUsername] = useState('')
  const [walletAddr, setWalletAddr] = useState(() => address ?? '')
  const [orgName, setOrgName] = useState('')

  // Step 2 fields
  const [description, setDescription] = useState('')
  const [budgetUsdc, setBudgetUsdc] = useState('')
  const [targetWinners, setTargetWinners] = useState('')

  // ── Validation ────────────────────────────────────────────────────────────
  const validUsername = username.trim().length >= 2
  const validWallet = isAddress(walletAddr)
  const validOrg = orgName.trim().length >= 2
  const step1Valid = validUsername && validWallet && validOrg

  const validDesc = description.trim().length >= 10
  const validBudget = /^\d+(\.\d+)?$/.test(budgetUsdc.trim()) && Number(budgetUsdc.trim()) > 0
  const step2Valid = validDesc && validBudget

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleChoose = (cat: Category) => {
    setCategory(cat)
    setWizardStep(1)
  }

  const handleBack = () => {
    if (wizardStep === 1) setWizardStep('choice')
    else if (wizardStep === 2) setWizardStep(1)
    else if (wizardStep === 3) setWizardStep(2)
  }

  const handleComplete = () => {
    if (!category) return
    const profile: OrganizerProfile = {
      address: walletAddr,
      username: username.trim().replace(/^@/, ''),
      orgName: orgName.trim(),
      category,
      description: description.trim(),
      budgetUsdc: budgetUsdc.trim(),
      targetWinners: targetWinners.trim(),
      createdAt: Date.now(),
    }
    saveOrganizerProfile(profile)
    setWizardStep('success')
  }

  // ── Gradient bar colour by category ──────────────────────────────────────
  const gradientStyle = {
    background: category === 'contest'
      ? 'linear-gradient(90deg, #0d9488 0%, #6366f1 100%)'
      : 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,18,28,0.55)', backdropFilter: 'blur(4px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-organiser-title"
      onKeyDown={e => { if (e.key === 'Escape') onClose() }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl rounded-3xl overflow-hidden flex flex-col"
        style={{
          background: 'var(--warm-surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 24px 64px rgba(15,18,28,0.22)',
          maxHeight: '92vh',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top gradient bar */}
        <div className="h-1.5 w-full shrink-0" style={gradientStyle} aria-hidden="true" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            {wizardStep !== 'choice' && wizardStep !== 'success' ? (
              <button
                onClick={handleBack}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand"
                aria-label="Go back"
              >
                <ArrowLeft size={16} style={{ color: 'var(--ink)' }} />
              </button>
            ) : (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}
                aria-hidden="true"
              >
                <ShieldCheck size={18} />
              </div>
            )}
            <div>
              <h2 id="apply-organiser-title" className="font-jakarta font-extrabold text-lg text-midnight leading-tight">
                Apply as an Organiser
              </h2>
              {wizardStep === 'choice' && (
                <p className="text-xs leading-snug mt-0.5" style={{ color: 'var(--muted)' }}>
                  Select what type of competition you want to organize on Arc.
                </p>
              )}
              {(wizardStep === 1 || wizardStep === 2 || wizardStep === 3) && category && (
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md"
                    style={{
                      background: category === 'hackathon' ? 'var(--brand-light)' : 'var(--teal-light)',
                      color: category === 'hackathon' ? 'var(--brand)' : 'var(--teal)',
                    }}
                  >
                    {category === 'hackathon' ? <Zap size={9} /> : <Trophy size={9} />}
                    {category === 'hackathon' ? 'Hackathon' : 'Contest'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {(wizardStep === 1 || wizardStep === 2 || wizardStep === 3) && (
              <StepPills current={wizardStep} />
            )}
            <button
              onClick={onClose}
              className="ml-1 w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand"
              aria-label="Close"
            >
              <X size={16} style={{ color: 'var(--muted)' }} />
            </button>
          </div>
        </div>

        {/* Body — animated step transitions */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <AnimatePresence mode="wait" initial={false}>

            {/* ── CHOICE SCREEN ─────────────────────────────────────────── */}
            {wizardStep === 'choice' && (
              <motion.div
                key="choice"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.18 }}
                className="space-y-3"
              >
                {/* Hackathon card */}
                <button
                  onClick={() => handleChoose('hackathon')}
                  className="w-full rounded-2xl border text-left p-5 hover:border-brand/50 hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-brand outline-none transition-all duration-150 group"
                  style={{ borderColor: 'var(--border)', background: 'white' }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}
                    >
                      <Zap size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-jakarta font-extrabold text-base text-midnight">
                          Organize a Hackathon
                        </span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}
                        >
                          Multi-Track & Escrow
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                        Multi-track developer build sprint with USDC prize escrow, milestone tracks, and judging rubrics.
                      </p>
                    </div>
                    <ArrowRight size={16} className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--brand)' }} />
                  </div>
                </button>

                {/* Contest card */}
                <button
                  onClick={() => handleChoose('contest')}
                  className="w-full rounded-2xl border text-left p-5 hover:border-teal-400/60 hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-brand outline-none transition-all duration-150 group"
                  style={{ borderColor: 'var(--border)', background: 'white' }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: 'var(--teal-light)', color: 'var(--teal)' }}
                    >
                      <Trophy size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-jakarta font-extrabold text-base text-midnight">
                          Organize a Contest
                        </span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--teal-light)', color: 'var(--teal)' }}
                        >
                          Bounties & Fast Review
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                        Single-track submission challenge, creative bounty, or design sprint with direct USDC payouts.
                      </p>
                    </div>
                    <ArrowRight size={16} className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--teal)' }} />
                  </div>
                </button>

                <p className="text-[11px] text-center mt-3" style={{ color: 'var(--subtle)' }}>
                  Zero USDC fee — profile creation only. Launch your event right after.
                </p>
              </motion.div>
            )}

            {/* ── STEP 1: Profile & Identity ─────────────────────────────── */}
            {wizardStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                {/* Arc House Username */}
                <div>
                  <FieldLabel htmlFor="org-username">Arc House Username <span className="text-red-500">*</span></FieldLabel>
                  <div className="relative">
                    <span
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold select-none"
                      style={{ color: 'var(--subtle)' }}
                      aria-hidden="true"
                    >@</span>
                    <input
                      id="org-username"
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="alice_arc"
                      className={INPUT_CLS + ' pl-8'}
                    />
                  </div>
                </div>

                {/* Wallet */}
                <div>
                  <FieldLabel htmlFor="org-wallet">Organiser Wallet Address <span className="text-red-500">*</span></FieldLabel>
                  <input
                    id="org-wallet"
                    type="text"
                    value={walletAddr}
                    onChange={e => setWalletAddr(e.target.value)}
                    placeholder="0x..."
                    className={INPUT_CLS + ' font-mono text-xs'}
                  />
                  {walletAddr && !validWallet && (
                    <p className="text-xs text-red-500 mt-1">Enter a valid EVM address (0x…)</p>
                  )}
                </div>

                {/* Org name */}
                <div>
                  <FieldLabel htmlFor="org-name">Organisation / Project Name <span className="text-red-500">*</span></FieldLabel>
                  <input
                    id="org-name"
                    type="text"
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    placeholder="e.g. Arc Builders Collective"
                    className={INPUT_CLS}
                  />
                </div>

                <button
                  onClick={() => setWizardStep(2)}
                  disabled={!step1Valid}
                  className="w-full h-11 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-brand inline-flex items-center justify-center gap-2 mt-2"
                  style={{ background: 'var(--brand)' }}
                >
                  Continue
                  <ArrowRight size={15} />
                </button>
              </motion.div>
            )}

            {/* ── STEP 2: Program & Budget ───────────────────────────────── */}
            {wizardStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                {/* Description */}
                <div>
                  <FieldLabel htmlFor="org-desc">Program Description & Purpose <span className="text-red-500">*</span></FieldLabel>
                  <textarea
                    id="org-desc"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe your initiative, competition rules, and what you're looking for from participants…"
                    rows={4}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand focus:border-transparent text-sm text-midnight placeholder:text-slate-400 outline-none transition-shadow bg-white resize-none"
                  />
                </div>

                {/* Budget + Winners side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel htmlFor="org-budget">Est. Total Budget (USDC) <span className="text-red-500">*</span></FieldLabel>
                    <div className="relative">
                      <span
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold select-none"
                        style={{ color: 'var(--subtle)' }}
                        aria-hidden="true"
                      >$</span>
                      <input
                        id="org-budget"
                        type="text"
                        inputMode="decimal"
                        value={budgetUsdc}
                        onChange={e => setBudgetUsdc(e.target.value)}
                        placeholder="5000"
                        className={INPUT_CLS + ' pl-7 tabular-nums'}
                      />
                    </div>
                    {budgetUsdc && !validBudget && (
                      <p className="text-xs text-red-500 mt-1">Enter a positive number</p>
                    )}
                  </div>
                  <div>
                    <FieldLabel htmlFor="org-winners">Target Winners</FieldLabel>
                    <input
                      id="org-winners"
                      type="number"
                      min="1"
                      step="1"
                      value={targetWinners}
                      onChange={e => setTargetWinners(e.target.value)}
                      placeholder="e.g. 3"
                      className={INPUT_CLS + ' tabular-nums'}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setWizardStep(3)}
                  disabled={!step2Valid}
                  className="w-full h-11 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-brand inline-flex items-center justify-center gap-2 mt-2"
                  style={{ background: 'var(--brand)' }}
                >
                  Review Profile
                  <ArrowRight size={15} />
                </button>
              </motion.div>
            )}

            {/* ── STEP 3: Confirmation ───────────────────────────────────── */}
            {wizardStep === 3 && category && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                {/* Summary card */}
                <div
                  className="rounded-2xl border p-5 space-y-3"
                  style={{ borderColor: 'var(--border)', background: 'var(--warm-bg)' }}
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--subtle)' }}>
                    Profile Summary
                  </p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
                    <SummaryRow label="Username" value={`@${username.trim().replace(/^@/, '')}`} />
                    <SummaryRow label="Category" value={category === 'hackathon' ? 'Hackathon' : 'Contest'} />
                    <SummaryRow label="Organisation" value={orgName.trim()} />
                    <SummaryRow label="Budget" value={`$${budgetUsdc} USDC`} />
                    <div className="col-span-2">
                      <SummaryRow label="Wallet" value={walletAddr} mono />
                    </div>
                    {targetWinners && <SummaryRow label="Target Winners" value={targetWinners} />}
                  </div>
                </div>

                {/* Fee notice */}
                <div
                  className="rounded-xl border px-4 py-3 flex items-center gap-3"
                  style={{ background: 'var(--teal-light)', borderColor: 'var(--teal-border)' }}
                >
                  <CheckCircle2 size={16} style={{ color: 'var(--teal)' }} className="shrink-0" />
                  <p className="text-xs leading-snug" style={{ color: 'var(--teal)' }}>
                    <span className="font-bold">Zero USDC fee.</span> This is a profile-only registration — no transaction or wallet approval required.
                  </p>
                </div>

                <button
                  onClick={handleComplete}
                  className="w-full h-11 rounded-2xl text-sm font-bold text-white transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand inline-flex items-center justify-center gap-2 mt-1"
                  style={{ background: 'var(--brand)' }}
                >
                  <Sparkles size={15} />
                  Complete Organiser Profile
                </button>
              </motion.div>
            )}

            {/* ── SUCCESS ────────────────────────────────────────────────── */}
            {wizardStep === 'success' && category && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.22 }}
                className="py-4 text-center space-y-5"
              >
                <div
                  className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
                  style={{ background: 'var(--teal-light)', color: 'var(--teal)' }}
                >
                  <CheckCircle2 size={34} />
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-jakarta font-extrabold text-2xl text-midnight">
                    Organiser Profile Created!
                  </h3>
                  <p className="text-sm max-w-xs mx-auto leading-relaxed" style={{ color: 'var(--muted)' }}>
                    You are now registered as an organiser and ready to launch your competition on Arc.
                  </p>
                </div>

                <button
                  onClick={() => {
                    onClose()
                    onSuccessRedirect(category)
                  }}
                  className="inline-flex items-center gap-2 px-8 h-11 rounded-2xl text-sm font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-brand transition-all"
                  style={{ background: 'var(--brand)' }}
                >
                  <Sparkles size={15} />
                  Launch {category === 'hackathon' ? 'Hackathon' : 'Contest'}
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

// ── Summary row helper ─────────────────────────────────────────────────────────

function SummaryRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--subtle)' }}>{label}</p>
      <p className={`font-semibold text-midnight truncate ${mono ? 'font-mono text-[11px]' : ''}`}>{value}</p>
    </div>
  )
}
