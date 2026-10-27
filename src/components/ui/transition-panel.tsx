import { AnimatePresence, Transition, Variant, motion, MotionProps, useReducedMotion } from 'framer-motion'
import React from 'react'
import { clsx } from 'clsx'

export type TransitionPanelProps = {
  children: React.ReactNode[]
  className?: string
  transition?: Transition
  activeIndex: number
  variants?: { enter: Variant; center: Variant; exit: Variant }
} & MotionProps

const defaultVariants = (dir: number) => ({
  enter: { x: dir > 0 ? 20 : -20, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: dir > 0 ? -20 : 20, opacity: 0 },
})

const reducedVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
}

export function TransitionPanel({
  children,
  className,
  transition,
  variants,
  activeIndex,
  custom,
  ...motionProps
}: TransitionPanelProps) {
  const shouldReduce = useReducedMotion()
  const dir = typeof custom === 'number' ? custom : 1
  const resolvedVariants = variants
    ?? (shouldReduce ? reducedVariants : defaultVariants(dir))
  const resolvedTransition = transition ?? (shouldReduce
    ? { duration: 0.15 }
    : { duration: 0.22, ease: [0.22, 1, 0.36, 1] })

  return (
    <div className={clsx('relative overflow-hidden', className)}>
      <AnimatePresence initial={false} mode="popLayout" custom={custom}>
        <motion.div
          key={activeIndex}
          variants={resolvedVariants}
          transition={resolvedTransition}
          initial="enter"
          animate="center"
          exit="exit"
          custom={custom}
          {...motionProps}
        >
          {children[activeIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
