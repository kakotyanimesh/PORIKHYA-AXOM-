"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function storageKey(attemptKey: string): string {
  return `exam-timer:${attemptKey}`;
}

export function useExamTimer(attemptKey: string, durationMinutes: number, onExpire: () => void) {
  const totalSeconds = durationMinutes * 60;

  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    if (typeof window === "undefined") return totalSeconds;
    const stored = Number(window.localStorage.getItem(storageKey(attemptKey)));
    return stored > 0 && stored <= totalSeconds ? stored : totalSeconds;
  });
  const [isPaused, setIsPaused] = useState(false);
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey(attemptKey), String(remainingSeconds));
  }, [attemptKey, remainingSeconds]);

  useEffect(() => {
    if (isPaused) return;
    const id = window.setInterval(() => {
      setRemainingSeconds((s) => (s <= 0 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [isPaused]);

  useEffect(() => {
    if (remainingSeconds === 0) onExpireRef.current();
  }, [remainingSeconds]);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);
  const clear = useCallback(() => {
    window.localStorage.removeItem(storageKey(attemptKey));
  }, [attemptKey]);

  return { remainingSeconds, isPaused, pause, resume, clear };
}
