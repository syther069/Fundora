import { ReactNode, useRef, useState } from 'react'
import { motion, useInView, Variant, Transition, UseInViewOptions, useReducedMotion } from 'framer-motion'

export type InViewProps = {
  children: ReactNode
  variants?: {
    hidden: Variant
    visible: Variant
  }
  transition?: Transition
  viewOptions?: UseInViewOptions
  once?: boolean
}

const defaultVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

const reducedVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const defaultTransition: Transition = { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
const reducedTransition: Transition = { duration: 0.15 }

export function InView({
  children,
  variants,
  transition,
  viewOptions,
  once = true,
}: InViewProps) {
  const ref = useRef(null)
  const shouldReduce = useReducedMotion()
  const isInView = useInView(ref, viewOptions ?? { once, margin: '0px 0px -40px 0px' })
  const [isViewed, setIsViewed] = useState(false)

  const resolvedVariants = variants ?? (shouldReduce ? reducedVariants : defaultVariants)
  const resolvedTransition = transition ?? (shouldReduce ? reducedTransition : defaultTransition)

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView || isViewed ? 'visible' : 'hidden'}
      variants={resolvedVariants}
      transition={resolvedTransition}
      onAnimationComplete={() => { if (once) setIsViewed(true) }}
    >
      {children}
    </motion.div>
  )
}
