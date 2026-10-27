import { ReactNode } from 'react'
import { motion, Variants, useReducedMotion } from 'framer-motion'
import React from 'react'

export type AnimatedGroupProps = {
  children: ReactNode
  className?: string
  variants?: {
    container?: Variants
    item?: Variants
  }
}

// Stagger container — reduced-motion uses opacity-only, no stagger
const snappyEase = [0.22, 1, 0.36, 1] as const

export function AnimatedGroup({
  children,
  className,
  variants,
}: AnimatedGroupProps) {
  const shouldReduce = useReducedMotion()

  const containerVariants: Variants = shouldReduce
    ? { hidden: {}, visible: {} }
    : variants?.container ?? {
        hidden: {},
        visible: { transition: { staggerChildren: 0.06 } },
      }

  const itemVariants: Variants = shouldReduce
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.15 } } }
    : variants?.item ?? {
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: snappyEase } },
      }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
