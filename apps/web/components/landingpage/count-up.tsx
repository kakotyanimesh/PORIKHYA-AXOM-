"use client";

import { useEffect, useRef, useState } from "react";

/** Counts from 0 → `to` once it scrolls into view. Respects reduced-motion
 *  (jumps straight to the final value). Illustrative product-preview numbers
 *  only — not real metrics. */
export function CountUp({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1100,
  className,
}: {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const ran = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      setValue(to);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || ran.current) return;
        ran.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
          setValue(to * eased);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}
