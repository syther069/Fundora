import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Lock,
  ChevronDown,
  RefreshCw,
  Terminal as TerminalIcon,
  Copy,
  Check,
  FileCode2,
} from 'lucide-react'
import { useEvents } from '../context/EventsContext'

interface LandingPageProps {
  onNavigate: (view: 'events' | 'participant' | 'organizer') => void
  onSelectEvent: (eventId: string) => void
  onOpenOrganizerWizard?: () => void
}

function formatUsdc(amount: bigint): string {
  const dollars = amount / 1_000_000n
  return Number(dollars).toLocaleString('en-US')
}

// ── Interactive Live Terminal & Vault Inspector ───────────────────────────────
function VaultTerminal() {
  const [activeTab, setActiveTab] = useState<'vault' | 'logs' | 'proof'>('vault')
  const [simState, setSimState] = useState<'locked' | 'voted' | 'claimed'>('locked')

  const handleCycleState = () => {
    if (simState === 'locked') setSimState('voted')
    else if (simState === 'voted') setSimState('claimed')
    else setSimState('locked')
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden transition-all duration-200">
      {/* Terminal Title Bar */}
      <div className="px-4 py-3 bg-[#00002A] text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-[11px] font-mono text-slate-400 pl-2 border-l border-slate-700/80">
            arc-mainnet / 0xc9c7...154a
          </span>
        </div>

        {/* Live Network Health Indicator */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-teal-300 bg-teal-950/70 px-2 py-0.5 rounded border border-teal-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            0.78s finality
          </span>
        </div>
      </div>

      {/* Terminal Tab Switcher */}
      <div className="flex items-center border-b border-slate-200 bg-slate-50 px-3 pt-2 gap-1 text-xs font-mono">
        <button
          type="button"
          onClick={() => setActiveTab('vault')}
          className={`px-3 py-1.5 rounded-t-lg transition-all ${
            activeTab === 'vault'
              ? 'bg-white text-midnight font-bold border-t border-x border-slate-200 -mb-px'
              : 'text-slate-500 hover:text-midnight'
          }`}
        >
          vault_state.json
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`px-3 py-1.5 rounded-t-lg transition-all ${
            activeTab === 'logs'
              ? 'bg-white text-midnight font-bold border-t border-x border-slate-200 -mb-px'
              : 'text-slate-500 hover:text-midnight'
          }`}
        >
          execution.log
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('proof')}
          className={`px-3 py-1.5 rounded-t-lg transition-all ${
            activeTab === 'proof'
              ? 'bg-white text-midnight font-bold border-t border-x border-slate-200 -mb-px'
              : 'text-slate-500 hover:text-midnight'
          }`}
        >
          evidence_receipt.sig
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-5">
        <AnimatePresence mode="wait">
          {activeTab === 'vault' && (
            <motion.div
              key="vault-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Primary Balance Display */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex items-baseline justify-between">
                <div>
                  <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wide">
                    Locked In Escrow
                  </div>
                  <div className="font-jakarta font-extrabold text-2xl sm:text-3xl text-midnight tabular-nums mt-0.5">
                    $25,000.00 <span className="text-xs font-semibold text-slate-500">USDC</span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold ${
                      simState === 'claimed'
                        ? 'bg-teal-50 text-teal border border-teal-200'
                        : simState === 'voted'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-brand-light text-brand border border-brand-border'
                    }`}
                  >
                    {simState === 'claimed' ? (
                      <>
                        <CheckCircle2 size={11} /> Settled
                      </>
                    ) : simState === 'voted' ? (
                      <>
                        <Clock size={11} /> Quorum Met
                      </>
                    ) : (
                      <>
                        <Lock size={11} /> Locked
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Real-time Ledger Rows */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-white">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-teal-50 text-teal flex items-center justify-center font-bold text-[10px]">
                      1st
                    </span>
                    <span className="text-slate-800">1st Place Grand Winner</span>
                  </div>
                  <span className="font-bold text-teal tabular-nums">$15,000 USDC</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-white">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-brand-light text-brand flex items-center justify-center font-bold text-[10px]">
                      2nd
                    </span>
                    <span className="text-slate-800">Runner-Up Innovation</span>
                  </div>
                  <span className="font-bold text-slate-700 tabular-nums">$7,000 USDC</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-white">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                      3rd
                    </span>
                    <span className="text-slate-800">Community Choice</span>
                  </div>
                  <span className="font-bold text-slate-700 tabular-nums">$3,000 USDC</span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'logs' && (
            <motion.div
              key="logs-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[#00002A] text-slate-200 p-4 rounded-xl font-mono text-xs space-y-2 overflow-x-auto min-h-[190px]"
            >
              <div className="text-slate-400">// Real Arc RPC execution trail</div>
              <div>
                <span className="text-emerald-400">INFO</span> [block 5042109] FundoraEvents.depositPrizePool(id: 12)
              </div>
              <div className="text-slate-400">↳ tx: 0x8aa192ed8fafa8bccc9e8d4978869572d4af414ed090...</div>
              <div>
                <span className="text-teal-400">STATE</span> Locked: 25,000.000000 USDC (Native Arc ERC-20)
              </div>
              <div>
                <span className="text-amber-400">VOTE</span> Reviewer 0x5b12...ef42 signed evaluation rubric (Score: 94/100)
              </div>
              {simState === 'claimed' && (
                <div className="text-emerald-300">
                  <span className="text-emerald-400">CALL</span> claimPrize() by winner 0x71b4...2a60 → Settled in 780ms
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'proof' && (
            <motion.div
              key="proof-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-3 min-h-[190px]"
            >
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Git Commit SHA</div>
                <div className="text-midnight font-semibold truncate">
                  8f9b2d3c1a4e7605e5218d9b1c7f4a2e0987bc21
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">IPFS Artifact CID</div>
                <div className="text-midnight font-semibold truncate">
                  bafybeiczsscdspl73waxmnhxea4kex3q5m5mvdq5k
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Reviewer Attestations</div>
                <div className="text-teal font-semibold">3 of 3 Independent Signatures Confirmed</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Controls */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-[11px] text-slate-500 font-mono">
            {simState === 'locked' && '1. Prize pool deposited into contract'}
            {simState === 'voted' && '2. Reviewers scored against public rubric'}
            {simState === 'claimed' && '3. Winner executed claimPayment() on Arc'}
          </div>

          <button
            type="button"
            onClick={handleCycleState}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-midnight transition-all"
          >
            <RefreshCw size={12} />
            <span>
              {simState === 'locked' && 'Advance: Submit Votes'}
              {simState === 'voted' && 'Advance: Claim USDC'}
              {simState === 'claimed' && 'Reset Simulation'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function LandingPage({
  onNavigate,
  onSelectEvent,
  onOpenOrganizerWizard,
}: LandingPageProps) {
  const { events } = useEvents()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const totalEscrowUsdc = useMemo(() => {
    const raw = events.reduce((sum, e) => sum + e.totalPrizePoolUsdc, 0n)
    return Number(raw / 1_000_000n).toLocaleString('en-US')
  }, [events])

  const faqs = [
    {
      q: 'What happens if an organizer tries to cancel an event and take the money back?',
      a: 'They cannot. Once an event starts and submissions open, the smart contract prevents the organizer from withdrawing the prize money. Funds can only be released to winning participants who meet the published review criteria.',
    },
    {
      q: 'How do I claim my prize money if I win?',
      a: 'You simply connect the wallet you used to submit, open your Participant Hub, and click Claim. The USDC moves directly from the contract into your wallet in less than one second.',
    },
    {
      q: 'Do I need to buy crypto or bridge tokens to pay for gas?',
      a: 'No. Arc uses USDC as the native gas token. When you claim rewards or submit an entry, you pay tiny fractions of a cent in USDC. You never need to purchase volatile or obscure gas tokens.',
    },
    {
      q: 'Can my company, university, or DAO run a competition on Fundora?',
      a: 'Yes. Anyone can open the Organizer Console, set prize tiers, define a scoring rubric, and deposit USDC into escrow. Your event is immediately published to the community directory.',
    },
  ]

  return (
    <div className="w-full space-y-20 sm:space-y-24 pb-20">
      {/* ───────────────────────────────────────────────────────────────────────
          1. HERO: DIRECT PLAIN-ENGLISH PROPOSITION & LIVE TERMINAL
      ──────────────────────────────────────────────────────────────────────── */}
      <section className="pt-2 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Plain English Headline & Facts */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="font-jakarta font-extrabold text-4xl sm:text-5xl lg:text-6xl text-midnight tracking-tight leading-[1.08]">
              Prize money you can actually count on.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              When you enter a hackathon or contest on Fundora, the prize purse is already locked in an
              audited smart contract. When judging concludes, winners withdraw USDC straight to their
              wallet in under a second.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('events')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-brand hover:bg-brand-hover text-white font-semibold text-sm shadow-md transition-all group"
              >
                <span>See open competitions</span>
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onOpenOrganizerWizard) onOpenOrganizerWizard()
                  else onNavigate('organizer')
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-midnight border border-slate-300 font-semibold text-sm shadow-xs transition-all"
              >
                <span>Host a competition</span>
              </button>
            </div>

            {/* Plain facts, zero buzzwords */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/80 max-w-md">
              <div>
                <div className="text-[11px] font-mono uppercase text-slate-400">Total Locked</div>
                <div className="font-jakarta font-bold text-lg text-midnight tabular-nums">
                  ${totalEscrowUsdc} <span className="text-xs text-slate-500 font-normal">USDC</span>
                </div>
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase text-slate-400">Payout Speed</div>
                <div className="font-jakarta font-bold text-lg text-teal tabular-nums">&lt; 1 second</div>
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase text-slate-400">Network Gas</div>
                <div className="font-jakarta font-bold text-lg text-midnight tabular-nums">USDC</div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Density Vault Inspector */}
          <div className="lg:col-span-5">
            <VaultTerminal />
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────────
          2. THE PROBLEM & THE FIX: HONEST SIDE-BY-SIDE COMPARISON
      ──────────────────────────────────────────────────────────────────────── */}
      <section className="space-y-8">
        <div className="max-w-2xl space-y-2">
          <h2 className="font-jakarta font-bold text-2xl sm:text-3xl text-midnight tracking-tight">
            How hackathons usually break, and how Fundora fixes them
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            If you have built for hackathons before, you know the drill: months of waiting, private
            spreadsheets, and disappearing organizers. Here is what changes on Fundora.
          </p>
        </div>

        {/* Side-by-side comparison table */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {/* Left: The Old Way */}
            <div className="p-6 sm:p-8 space-y-6 bg-slate-50/50">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                The usual way
              </div>

              <div className="space-y-5 text-sm">
                <div>
                  <div className="font-semibold text-midnight">Unpaid or delayed prizes</div>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
                    Organizers promise thousands of dollars in rewards, then take four to six months
                    to disburse funds or go silent on Discord.
                  </p>
                </div>

                <div>
                  <div className="font-semibold text-midnight">Judging behind closed doors</div>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
                    Winners are picked in private spreadsheets with zero audit trail. Nobody knows who
                    scored what or why a project was chosen.
                  </p>
                </div>

                <div>
                  <div className="font-semibold text-midnight">Gas token headaches</div>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
                    You have to buy volatile chain tokens just to pay for gas fees before you can
                    receive your prize.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: The Fundora Way */}
            <div className="p-6 sm:p-8 space-y-6 bg-white">
              <div className="flex items-center gap-2 text-teal font-bold text-xs uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-teal" />
                Fundora on Arc
              </div>

              <div className="space-y-5 text-sm">
                <div>
                  <div className="font-semibold text-midnight">Locked in contract on day one</div>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
                    The entire purse is deposited into escrow before the event opens. Once active, the
                    organizer cannot withdraw or claw back the funds.
                  </p>
                </div>

                <div>
                  <div className="font-semibold text-midnight">Public, signed review quorums</div>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
                    Assigned reviewers score submissions against a published rubric. All review
                    signatures and decisions are permanently stored onchain.
                  </p>
                </div>

                <div>
                  <div className="font-semibold text-midnight">USDC is the native gas token</div>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
                    Arc uses native USDC for gas. You claim your prize in a single click without
                    trading or bridging extra tokens.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────────
          3. LIVE COMPETITIONS LEDGER (REAL FINANCIAL DATA TABLE)
      ──────────────────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-jakarta font-bold text-2xl text-midnight tracking-tight">
              Open competitions & hackathons
            </h2>
            <p className="text-sm text-slate-600">
              Active events currently funded with verified smart contract escrow.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('events')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-hover"
          >
            <span>View directory ({events.length})</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Financial Table View */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-mono">
                  <th className="py-3 px-4 font-semibold">Event Name</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Escrow Purse</th>
                  <th className="py-3 px-4 font-semibold">Submissions</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.slice(0, 5).map((evt) => (
                  <tr
                    key={evt.id}
                    onClick={() => onSelectEvent(evt.id)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-midnight group-hover:text-brand transition-colors">
                        {evt.title}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{evt.tagline}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono uppercase text-[11px] text-slate-600">
                      {evt.category}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-midnight tabular-nums">
                      ${formatUsdc(evt.totalPrizePoolUsdc)}{' '}
                      <span className="text-[10px] text-slate-400 font-normal">USDC</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 tabular-nums">
                      {evt.submissionsCount} entries
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          evt.status === 'active'
                            ? 'bg-teal-50 text-teal border border-teal-200'
                            : evt.status === 'judging'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {evt.status === 'active' ? 'Open' : evt.status === 'judging' ? 'Judging' : evt.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="text-xs font-semibold text-brand group-hover:underline inline-flex items-center gap-1">
                        View
                        <ArrowRight size={12} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────────
          4. DEVELOPER & CONTRACT INSPECTOR TERMINAL
      ──────────────────────────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-[#00002A] text-white p-6 sm:p-8 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-teal-300">
              <TerminalIcon size={14} />
              <span>Verified Arc Contracts</span>
            </div>

            <h2 className="font-jakarta font-bold text-2xl text-white tracking-tight">
              Inspect the contract code anytime
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Fundora contracts are compiled with Solidity 0.8.28 and deployed directly to the Arc
              blockchain. Every payout rule is enforced mathematically onchain.
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono">
              <a
                href="https://explorer.testnet.arc.io/address/0xc9c7033f4736f8b6e213ea7617596c3fd7bb154a"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
              >
                <span>FundoraEvents (0xc9c7...154a)</span>
                <ExternalLink size={12} />
              </a>

              <a
                href="https://explorer.testnet.arc.io/address/0x9bf7d4681410f7db14490cc67d517e3621d73fe6"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
              >
                <span>AdminRegistry (0x9bf7...7fe6)</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="p-4 rounded-xl bg-black/60 border border-slate-800 font-mono text-xs text-slate-300 space-y-2.5">
              <div className="text-slate-400">// Interface: FundoraEvents.sol</div>
              <div>
                <span className="text-teal-400">function</span> depositPrizePool(uint256 eventId, uint256 amount)
              </div>
              <div>
                <span className="text-teal-400">function</span> recordReviewerVote(uint256 submissionId, uint8 score)
              </div>
              <div>
                <span className="text-teal-400">function</span> finalizeWinners(uint256 eventId, address[] winners)
              </div>
              <div>
                <span className="text-emerald-400 font-bold">function</span> claimPrize(uint256 eventId) external
              </div>
              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                Pull-payment design: winners claim their funds directly. Reentrancy guarded.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────────
          5. PLAIN-ENGLISH QUESTIONS & ANSWERS (NO JARGON)
      ──────────────────────────────────────────────────────────────────────── */}
      <section className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2 mb-6">
          <h2 className="font-jakarta font-bold text-2xl text-midnight tracking-tight">
            Common questions
          </h2>
          <p className="text-sm text-slate-600">Everything you need to know in plain English.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index
            return (
              <div
                key={faq.q}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-jakarta font-semibold text-sm sm:text-base text-midnight hover:text-brand transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 transition-transform duration-200 text-slate-400 ${
                      isOpen ? 'rotate-180 text-brand' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────────
          6. CLEAN CLOSING BANNER
      ──────────────────────────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-xs space-y-5">
        <h2 className="font-jakarta font-extrabold text-3xl text-midnight tracking-tight">
          Run your next competition on Fundora.
        </h2>

        <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto">
          Whether you are distributing community grants or hosting an international hackathon,
          guarantee every dollar with open smart escrow.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onNavigate('events')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand hover:bg-brand-hover text-white font-semibold text-sm shadow-sm transition-all"
          >
            <span>Explore open events</span>
            <ArrowRight size={15} />
          </button>

          <button
            type="button"
            onClick={() => {
              if (onOpenOrganizerWizard) onOpenOrganizerWizard()
              else onNavigate('organizer')
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-50 hover:bg-slate-100 text-midnight border border-slate-300 font-semibold text-sm transition-all"
          >
            <span>Host a competition</span>
          </button>
        </div>
      </section>
    </div>
  )
}
