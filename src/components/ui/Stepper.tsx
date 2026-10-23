import React from 'react'
import { Check } from 'lucide-react'
import { clsx } from 'clsx'

export interface StepItem {
  number: number
  title: string
  description: string
}

export interface StepperProps {
  steps: StepItem[]
  currentStep?: number
  onStepClick?: (stepNumber: number) => void
  className?: string
}

export function Stepper({
  steps,
  currentStep = 1,
  onStepClick,
  className,
}: StepperProps) {
  return (
    <nav aria-label="Progress" className={clsx('w-full', className)}>
      <ol className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {steps.map((step) => {
          const isCompleted = step.number < currentStep
          const isCurrent = step.number === currentStep
          const isUpcoming = step.number > currentStep

          return (
            <li
              key={step.number}
              className={clsx(
                'relative flex flex-col p-4 rounded-2xl border transition-all duration-200',
                isCurrent &&
                  'bg-[var(--surface-strong)] border-[var(--spring)] shadow-sm dark:border-emerald-500/80',
                isCompleted &&
                  'bg-[var(--surface-muted)] border-[var(--border)] opacity-90',
                isUpcoming &&
                  'bg-[var(--surface)] border-[var(--border)] opacity-60'
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors',
                    isCompleted && 'bg-[var(--spring)] text-white',
                    isCurrent &&
                      'bg-[var(--ink)] text-white dark:bg-[#34d399] dark:text-[#0b131e] ring-4 ring-[var(--spring-light)]',
                    isUpcoming &&
                      'bg-[var(--border)] text-[var(--muted)]'
                  )}
                  aria-hidden="true"
                >
                  {isCompleted ? <Check size={14} /> : step.number}
                </span>

                <span
                  className={clsx(
                    'text-xs font-bold uppercase tracking-wider',
                    isCurrent
                      ? 'text-[var(--spring)]'
                      : isCompleted
                      ? 'text-[var(--muted)]'
                      : 'text-[var(--subtle)]'
                  )}
                >
                  Step 0{step.number}
                </span>
              </div>

              <h4 className="text-sm font-semibold text-[var(--ink)] mb-1">
                {step.title}
              </h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                {step.description}
              </p>

              {onStepClick && (
                <button
                  type="button"
                  onClick={() => onStepClick(step.number)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label={`Jump to step ${step.number}: ${step.title}`}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
