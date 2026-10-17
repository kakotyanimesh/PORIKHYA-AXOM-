"use client";

import type { ExamResultData } from "@/components/exam-result/exam-result-view";

const TTL_MS = 5 * 60_000;
const values = new Map<string, { value: ExamResultData; savedAt: number }>();
const requests = new Map<string, Promise<ExamResultData | null>>();
let generation = 0;

export function readExamResultCache(examId: string): ExamResultData | null {
  const entry = values.get(examId);
  if (!entry) return null;
  if (Date.now() - entry.savedAt > TTL_MS) {
    values.delete(examId);
    return null;
  }
  return entry.value;
}

export function loadExamResult(
  examId: string,
  fetchData: () => Promise<ExamResultData | null>,
) {
  const cached = readExamResultCache(examId);
  if (cached) return Promise.resolve(cached);
  const existing = requests.get(examId);
  if (existing) return existing;

  const startedAtGeneration = generation;
  let request: Promise<ExamResultData | null>;
  request = fetchData()
    .then((value) => {
      if (value && generation === startedAtGeneration) {
        values.set(examId, { value, savedAt: Date.now() });
      }
      return value;
    })
    .finally(() => {
      if (requests.get(examId) === request) requests.delete(examId);
    });
  requests.set(examId, request);
  return request;
}

export function clearExamResultCache() {
  generation += 1;
  values.clear();
  requests.clear();
}
