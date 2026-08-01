"use client";

import { useEffect, useState } from "react";

// Fills from 0 → pct once on mount. This is an entrance, not constant motion,
// so ease-out (Emil's strong curve). motion-reduce snaps to the value.
export function PlanProgress({
  pct,
  dayNumber,
  totalDays,
}: {
  pct: number;
  dayNumber: number;
  totalDays: number;
}) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(pct));
    return () => cancelAnimationFrame(id);
  }, [pct]);

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Day {dayNumber} of {totalDays}
        </span>
        <span className="tabular-nums">{pct}% used</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
