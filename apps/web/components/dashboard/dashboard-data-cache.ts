"use client";

import type { DashboardPageData } from "@/lib/actions/dashboard.action";

const CACHE_TTL_MS = 60_000;
let entry: { value: DashboardPageData; savedAt: number } | null = null;
let request: Promise<DashboardPageData> | null = null;
let revision = 0;
const listeners = new Set<() => void>();

function notify() {
  revision += 1;
  for (const listener of listeners) listener();
}

export function subscribeDashboardDataCache(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function readDashboardDataCache(): DashboardPageData | null {
  if (!entry) return null;
  if (Date.now() - entry.savedAt > CACHE_TTL_MS) {
    entry = null;
    return null;
  }
  return entry.value;
}

export function loadDashboardData(
  fetchData: () => Promise<DashboardPageData>,
): Promise<DashboardPageData> {
  const cached = readDashboardDataCache();
  if (cached) return Promise.resolve(cached);
  if (request) return request;

  const startedAtRevision = revision;
  let currentRequest: Promise<DashboardPageData>;
  currentRequest = fetchData()
    .then((value) => {
      if (revision === startedAtRevision) {
        entry = { value, savedAt: Date.now() };
        notify();
      }
      return value;
    })
    .finally(() => {
      if (request === currentRequest) request = null;
    });
  request = currentRequest;
  return currentRequest;
}

export function clearDashboardDataCache() {
  entry = null;
  request = null;
  notify();
}

export function getDashboardDataCacheRevision() {
  return revision;
}
