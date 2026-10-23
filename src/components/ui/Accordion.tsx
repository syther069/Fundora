import React, { useState, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { clsx } from 'clsx'

export interface AccordionItemData {
  id: string
  title: string
  subtitle?: string
  content: React.ReactNode
}

export interface AccordionProps {
  items: AccordionItemData[]
  allowMultiple?: boolean
  defaultExpanded?: string[]
  className?: string
}

export function Accordion({
  items,
  allowMultiple = false,
  defaultExpanded = [],
  className,
}: AccordionProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>(defaultExpanded)
  const baseId = useId()

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setExpandedIds(prev =>
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      )
    } else {
      setExpandedIds(prev => (prev.includes(id) ? [] : [id]))
    }
  }

  return (
    <div className={clsx('divide-y divide-[var(--border)] border border-[var(--border)] rounded-2xl bg-[var(--surface-strong)] overflow-hidden', className)}>
      {items.map(item => {
        const isExpanded = expandedIds.includes(item.id)
        const headerId = `${baseId}-header-${item.id}`
        const panelId = `${baseId}-panel-${item.id}`

        return (
          <div key={item.id} className="transition-colors">
            <h3>
              <button
                id={headerId}
                aria-expanded={isExpanded}
                aria-controls={panelId}
                onClick={() => toggleItem(item.id)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-colors btn-focus"
              >
                <div>
                  <span>{item.title}</span>
                  {item.subtitle && (
                    <span className="block text-xs font-normal text-[var(--muted)] mt-0.5">
                      {item.subtitle}
                    </span>
                  )}
                </div>
                <ChevronDown
                  size={16}
                  className={clsx(
                    'shrink-0 text-[var(--muted)] transition-transform duration-200',
                    isExpanded && 'rotate-180 text-[var(--ink)]'
                  )}
                  aria-hidden="true"
                />
              </button>
            </h3>
            {isExpanded && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={headerId}
                className="px-5 pb-5 pt-1 text-sm text-[var(--muted)] leading-relaxed animate-in fade-in-50 duration-150"
              >
                {item.content}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
