import { useRef } from 'react'
import { motion } from 'framer-motion'

export type TabId = 'overview' | 'prizes' | 'rubric' | 'submissions' | 'winners'

export const TABS: { id: TabId; label: string }[] = [
  { id: 'overview',     label: 'Overview' },
  { id: 'prizes',       label: 'Tracks & Prizes' },
  { id: 'rubric',       label: 'Judging Rubric' },
  { id: 'submissions',  label: 'Submissions' },
  { id: 'winners',      label: 'Winners' },
]

interface EventTabsProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  winnerCount?: number
  submissionCount?: number
}

export function EventTabs({ activeTab, onTabChange, winnerCount, submissionCount }: EventTabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'ArrowRight') {
      const next = (idx + 1) % TABS.length
      tabRefs.current[next]?.focus()
      onTabChange(TABS[next].id)
    } else if (e.key === 'ArrowLeft') {
      const prev = (idx - 1 + TABS.length) % TABS.length
      tabRefs.current[prev]?.focus()
      onTabChange(TABS[prev].id)
    }
  }

  return (
    <div
      className="flex border-b overflow-x-auto no-scrollbar"
      role="tablist"
      aria-label="Event details tabs"
      style={{ borderColor: 'var(--border)' }}
    >
      {TABS.map((tab, idx) => {
        const isActive = activeTab === tab.id
        const badge = tab.id === 'submissions' && submissionCount !== undefined && submissionCount > 0
          ? submissionCount
          : tab.id === 'winners' && winnerCount !== undefined && winnerCount > 0
          ? winnerCount
          : undefined

        return (
          <button
            key={tab.id}
            ref={el => { tabRefs.current[idx] = el }}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={e => handleKeyDown(e, idx)}
            className="relative shrink-0 flex items-center gap-1.5 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors focus-visible:outline-none"
            style={{
              color: isActive ? 'var(--brand)' : 'var(--muted)',
              borderBottom: isActive ? '2px solid var(--brand)' : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            {tab.label}
            {badge !== undefined && (
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center"
                style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}
              >
                {badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
