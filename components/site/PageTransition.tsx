"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

/**
 * PageTransition — gentle fade + translateY entrance.
 * CLAUDE.md §6.7: slow, light, natural. No bounce, no exaggeration.
 *
 * Usage: wrap the inner content of any page section.
 */
export function PageTransition({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered list item — for archive grids where cards should
 * appear one after another rather than all at once.
 */
export function StaggerItem({
  children,
  index,
  className,
}: {
  children: ReactNode;
  index: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.05, 0.4),
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
