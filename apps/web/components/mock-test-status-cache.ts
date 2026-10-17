"use client";

export type MockTestStatus = {
  completedExamIds: string[];
  accessibleExamIds: string[];
};

export const MOCK_TEST_STATUS_TTL_MS = 60_000;
const cache = new Map<string, { value: MockTestStatus; savedAt: number }>();
const requests = new Map<string, Promise<MockTestStatus>>();
let revision = 0;
const listeners = new Set<() => void>();

function notify() {
  revision += 1;
  for (const listener of listeners) listener();
}

export function subscribeMockTestStatusCache(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function key(seriesName: string) {
  return seriesName;
}

export function readMockTestStatusCache(
  seriesName: string,
): MockTestStatus | null {
  const cacheKey = key(seriesName);
  const entry = cache.get(cacheKey);
  if (!entry) return null;
  if (Date.now() - entry.savedAt > MOCK_TEST_STATUS_TTL_MS) {
    cache.delete(cacheKey);
    return null;
  }
  return entry.value;
}

export function loadMockTestStatus(
  seriesName: string,
  fetchStatus: () => Promise<MockTestStatus>,
) {
  const cached = readMockTestStatusCache(seriesName);
  if (cached) return Promise.resolve(cached);

  const cacheKey = key(seriesName);
  const existing = requests.get(cacheKey);
  if (existing) return existing;

  const startedAtRevision = revision;
  let request: Promise<MockTestStatus>;
  request = fetchStatus()
    .then((value) => {
      if (revision === startedAtRevision) {
        cache.set(cacheKey, { value, savedAt: Date.now() });
        notify();
      }
      return value;
    })
    .finally(() => {
      if (requests.get(cacheKey) === request) requests.delete(cacheKey);
    });
  requests.set(cacheKey, request);
  return request;
}

export function clearMockTestStatusCache() {
  cache.clear();
  requests.clear();
  notify();
}

export function getMockTestStatusCacheRevision() {
  return revision;
}
