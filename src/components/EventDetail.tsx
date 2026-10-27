import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EventHero } from './EventHero'
import { EventTabs, type TabId } from './EventTabs'
import { PrizeTierList } from './PrizeTierList'
import { SubmissionsShowcase } from './SubmissionsShowcase'
import { WinnersPodium } from './WinnersPodium'
import type { OnchainEventInfo } from '../contracts/fundoraEvents'
import { formatUnits } from 'viem'

interface EventDetailProps {
  event: OnchainEventInfo
  onBack: () => void
}

export function EventDetail({ event: ev, onBack }: EventDetailProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const judgingDeadlineDate = ev.judgingDeadline > 0
    ? new Date(ev.judgingDeadline * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  const submissionDeadlineDate = ev.submissionDeadline > 0
    ? new Date(ev.submissionDeadline * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <EventHero event={ev} onBack={onBack} />

      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
      >
        <EventTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          submissionCount={ev.submissionCount}
        />

        <div className="p-5 sm:p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                role="tabpanel"
                id="panel-overview"
                aria-labelledby="tab-overview"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <h2 className="font-jakarta font-bold text-lg" style={{ color: 'var(--ink)', letterSpacing: '-0.02em' }}>
                  Event Overview
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {ev.description || 'No additional description provided.'}
                </p>

                {/* Key dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {submissionDeadlineDate && (
                    <div
                      className="rounded-xl border p-4 space-y-0.5"
                      style={{ background: 'var(--surface-overlay)', borderColor: 'var(--border)' }}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--subtle)' }}>
                        Submission Deadline
                      </p>
                      <p className="font-jakarta font-bold text-base" style={{ color: 'var(--ink)' }}>
                        {submissionDeadlineDate}
                      </p>
                    </div>
                  )}
                  {judgingDeadlineDate && (
                    <div
                      className="rounded-xl border p-4 space-y-0.5"
                      style={{ background: 'var(--surface-overlay)', borderColor: 'var(--border)' }}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--subtle)' }}>
                        Judging Deadline
                      </p>
                      <p className="font-jakarta font-bold text-base" style={{ color: 'var(--ink)' }}>
                        {judgingDeadlineDate}
                      </p>
                    </div>
                  )}
                </div>

                {/* Chain details */}
                {ev.eventType === 0 /* NativeEscrow */ && ev.totalPrizePool > 0n && (
                  <div
                    className="rounded-xl border p-4 space-y-1 text-xs"
                    style={{ background: 'var(--surface-overlay)', borderColor: 'var(--border)' }}
                  >
                    <p className="font-semibold uppercase tracking-wider" style={{ color: 'var(--subtle)' }}>
                      Escrow details
                    </p>
                    <p style={{ color: 'var(--muted)' }}>
                      Total in escrow: <span className="font-bold" style={{ color: 'var(--teal)' }}>
                        ${Number(formatUnits(ev.totalPrizePool, 6)).toLocaleString()} USDC
                      </span>
                    </p>
                    <p style={{ color: 'var(--muted)' }}>
                      Organizer: <span className="font-mono" style={{ color: 'var(--ink)' }}>
                        {ev.organizer.slice(0,6)}…{ev.organizer.slice(-4)}
                      </span>
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'prizes' && (
              <motion.div
                key="prizes"
                role="tabpanel"
                id="panel-prizes"
                aria-labelledby="tab-prizes"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
              >
                <PrizeTierList event={ev} />
              </motion.div>
            )}

            {activeTab === 'rubric' && (
              <motion.div
                key="rubric"
                role="tabpanel"
                id="panel-rubric"
                aria-labelledby="tab-rubric"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                <h2 className="font-jakarta font-bold text-lg" style={{ color: 'var(--ink)' }}>
                  Judging Rubric
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                  Reviewers score each submission on a scale of 1–100. Scores are stored fully onchain so you can verify them at any time.
                </p>

                {/* Default criteria until organizer stores rubric in metadata */}
                <div className="space-y-2">
                  {[
                    { criterion: 'Impact', weight: 'High',   desc: 'Real-world utility and potential for adoption.' },
                    { criterion: 'Innovation', weight: 'High', desc: 'Novelty of the idea and execution approach.' },
                    { criterion: 'Technical Excellence', weight: 'Medium', desc: 'Code quality, architecture, and completeness.' },
                    { criterion: 'Presentation', weight: 'Medium', desc: 'Clarity of the submission, demo, and documentation.' },
                    { criterion: 'Arc Native', weight: 'Low', desc: 'Intentional use of Arc-specific features (USDC gas, sub-second finality).' },
                  ].map(row => (
                    <div
                      key={row.criterion}
                      className="flex items-start gap-3 rounded-xl border p-4"
                      style={{ background: 'var(--surface-overlay)', borderColor: 'var(--border)' }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-jakarta font-bold text-sm" style={{ color: 'var(--ink)' }}>
                            {row.criterion}
                          </span>
                          <span
                            className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                            style={{
                              background: row.weight === 'High' ? 'var(--teal-light)' : row.weight === 'Medium' ? 'var(--amber-light)' : 'var(--surface-overlay)',
                              color: row.weight === 'High' ? 'var(--teal)' : row.weight === 'Medium' ? 'var(--amber)' : 'var(--muted)',
                            }}
                          >
                            {row.weight}
                          </span>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>{row.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'submissions' && (
              <motion.div
                key="submissions"
                role="tabpanel"
                id="panel-submissions"
                aria-labelledby="tab-submissions"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
              >
                <SubmissionsShowcase event={ev} />
              </motion.div>
            )}

            {activeTab === 'winners' && (
              <motion.div
                key="winners"
                role="tabpanel"
                id="panel-winners"
                aria-labelledby="tab-winners"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
              >
                <WinnersPodium event={ev} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
