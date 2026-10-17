"use client";

import type { AccountUser } from "@/components/account-menu";

const TTL_MS = 60_000;
let entry: { value: AccountUser; savedAt: number } | null = null;
let request: Promise<AccountUser> | null = null;
let generation = 0;
let revision = 0;
const listeners = new Set<() => void>();

function notify() {
  revision += 1;
  for (const listener of listeners) listener();
}

export function subscribeAccountDataCache(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAccountDataCacheRevision() {
  return revision;
}

export function readAccountDataCache(): AccountUser | null {
  if (!entry) return null;
  if (Date.now() - entry.savedAt > TTL_MS) {
    entry = null;
    return null;
  }
  return entry.value;
}

export function loadAccountData(fetchData: () => Promise<AccountUser>) {
  const cached = readAccountDataCache();
  if (cached) return Promise.resolve(cached);
  if (request) return request;

  const startedAtGeneration = generation;
  let currentRequest: Promise<AccountUser>;
  currentRequest = fetchData()
    .then((value) => {
      if (generation === startedAtGeneration) {
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

export function clearAccountDataCache() {
  generation += 1;
  entry = null;
  request = null;
  notify();
}
