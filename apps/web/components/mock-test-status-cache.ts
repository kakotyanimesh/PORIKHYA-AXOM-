"use client";

export type MockTestStatus = {
  completedExamIds: string[];
  accessibleExamIds: string[];
};

export const MOCK_TEST_STATUS_TTL_MS = 60_000;
const cache = new Map<string, { value: MockTestStatus; savedAt: number }>();
const requests = new Map<string, Promise<MockTestStatus>>();
let revision = 0;

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

export function writeMockTestStatusCache(
  seriesName: string,
  value: MockTestStatus,
) {
  cache.set(key(seriesName), { value, savedAt: Date.now() });
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
        writeMockTestStatusCache(seriesName, value);
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
  revision += 1;
}

export function getMockTestStatusCacheRevision() {
  return revision;
}
