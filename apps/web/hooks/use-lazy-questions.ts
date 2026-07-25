"use client";

import { useCallback, useRef, useState } from "react";
import {
  getSectionQuestions,
  type AttemptQuestion,
  type ExamAttemptInit,
  type ExamSection,
} from "@/lib/actions/lazyquestions.action";

function sectionKey(sectionId: string | null): string {
  return sectionId ?? "ungrouped";
}

function nextSectionId(
  sections: ExamSection[],
  currentSectionId: string | null,
): string | null | undefined {
  const index = sections.findIndex((s) => s.id === currentSectionId);
  return index === -1 ? undefined : sections[index + 1]?.id;
}

export function useLazyQuestions(examId: string, init: ExamAttemptInit) {
  const cacheRef = useRef<Map<string, AttemptQuestion[]> | null>(null);
  const inFlightRef = useRef<Map<string, Promise<AttemptQuestion[]>>>(new Map());
  const activeSectionIdRef = useRef(init.first_section_id);

  if (cacheRef.current === null) {
    cacheRef.current = new Map([
      [sectionKey(init.first_section_id), init.first_section_questions],
    ]);
  }
  const cache = cacheRef.current;

  const [activeSectionId, setActiveSectionId] = useState(init.first_section_id);
  const [questions, setQuestions] = useState(init.first_section_questions);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSection = useCallback(
    (sectionId: string | null): Promise<AttemptQuestion[]> => {
      const key = sectionKey(sectionId);
      const cached = cache.get(key);
      if (cached) return Promise.resolve(cached);

      let promise = inFlightRef.current.get(key);
      if (!promise) {
        promise = getSectionQuestions({ exam_id: examId, section_id: sectionId }).then((qs) => {
          cache.set(key, qs);
          inFlightRef.current.delete(key);
          return qs;
        });
        inFlightRef.current.set(key, promise);
      }
      return promise;
    },
    [cache, examId],
  );

  // one section ahead only — stays lazy, never chain-prefetches the whole exam
  const prefetchNext = useCallback(
    (afterSectionId: string | null) => {
      const upcoming = nextSectionId(init.sections, afterSectionId);
      if (upcoming === undefined) return;
      const key = sectionKey(upcoming);
      if (cache.has(key) || inFlightRef.current.has(key)) return;
      fetchSection(upcoming).catch(() => {
        // prefetch failures are silent — real fetch retries when the user gets there
      });
    },
    [cache, fetchSection, init.sections],
  );

  const loadSection = useCallback(
    (sectionId: string | null) => {
      activeSectionIdRef.current = sectionId;
      setActiveSectionId(sectionId);

      const key = sectionKey(sectionId);
      const cached = cache.get(key);
      if (cached) {
        setQuestions(cached);
        setIsLoading(false);
        prefetchNext(sectionId);
        return;
      }

      setIsLoading(true);
      fetchSection(sectionId).then((qs) => {
        if (activeSectionIdRef.current !== sectionId) return; // stale — user moved on already
        setQuestions(qs);
        setIsLoading(false);
        prefetchNext(sectionId);
      });
    },
    [cache, fetchSection, prefetchNext],
  );

  const reset = useCallback(() => {
    cache.clear();
    inFlightRef.current.clear();
    cache.set(sectionKey(init.first_section_id), init.first_section_questions);
    activeSectionIdRef.current = init.first_section_id;
    setActiveSectionId(init.first_section_id);
    setQuestions(init.first_section_questions);
    setIsLoading(false);
  }, [cache, init.first_section_id, init.first_section_questions]);

  return {
    sections: init.sections,
    activeSectionId,
    questions,
    isLoading,
    loadSection,
    reset,
  };
}
