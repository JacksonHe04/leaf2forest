"use client";

import { ReactNode } from "react";

/**
 * PageTransition — previously a fade+slide animation wrapper.
 * Now renders children immediately for instant page transitions.
 * Kept as a no-op wrapper so existing imports don't break.
 */
export function PageTransition({
  children,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

/**
 * StaggerItem — previously a staggered entrance animation.
 * Now renders children immediately.
 */
export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  index: number;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
