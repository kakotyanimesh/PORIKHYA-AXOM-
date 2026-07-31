"use client";

import { LazyMotion, domAnimation, m, MotionConfig } from "motion/react";

// strong ease-out — the built-in CSS curve lacks punch (Emil)
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export function DashboardReveal({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}

// scale-in + fade, staggered by index. Decorative entrance, plays once per
// navigation. reducedMotion="user" (set on the provider) drops the movement.
export function RevealItem({
  index = 0,
  className,
  children,
}: {
  index?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.32, ease: EASE_OUT, delay: index * 0.05 }}
    >
      {children}
    </m.div>
  );
}
