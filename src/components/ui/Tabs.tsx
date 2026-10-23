import React, { useRef } from 'react'
import { clsx } from 'clsx'

export interface TabItem {
  id: string
  label: string
  icon?: React.ReactNode
  badge?: string | number
}

export interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (id: string) => void
  size?: 'sm' | 'md'
  className?: string
}

export function Tabs({ tabs, activeTab, onChange, size = 'md', className }: TabsProps) {
  const tabListRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % tabs.length
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + tabs.length) % tabs.length
    } else if (e.key === 'Home') {
      nextIndex = 0
    } else if (e.key === 'End') {
      nextIndex = tabs.length - 1
    } else {
      return
    }

    e.preventDefault()
    onChange(tabs[nextIndex].id)
    const buttons = tabListRef.current?.querySelectorAll<HTMLButtonElement>('button[role="tab"]')
    buttons?.[nextIndex]?.focus()
  }

  return (
    <div
      ref={tabListRef}
      role="tablist"
      aria-orientation="horizontal"
      className={clsx(
        'inline-flex items-center p-1 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] gap-1',
        className
      )}
    >
      {tabs.map((tab, idx) => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={e => handleKeyDown(e, idx)}
            className={clsx(
              'relative inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-150 btn-focus select-none touch-target',
              size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
              isActive
                ? 'bg-[var(--surface-elevated)] text-[var(--ink)] shadow-2xs font-semibold'
                : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)]'
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={clsx(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-bold tabular-nums',
                  isActive
                    ? 'bg-[var(--spring-light)] text-[var(--spring)]'
                    : 'bg-[var(--border)] text-[var(--subtle)]'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
