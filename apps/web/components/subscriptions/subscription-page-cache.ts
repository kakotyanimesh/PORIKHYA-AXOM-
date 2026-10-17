"use client";

import type {
  PlanCatalog,
  SubscriptionPageData,
} from "@/lib/actions/my-subscriptions.action";

const USER_DATA_TTL_MS = 60_000;
const CATALOG_TTL_MS = 5 * 60_000;

let subscriptionEntry: { value: SubscriptionPageData; savedAt: number } | null = null;
let subscriptionRequest: Promise<SubscriptionPageData> | null = null;
let catalogEntry: { value: PlanCatalog; savedAt: number } | null = null;
let catalogRequest: Promise<PlanCatalog> | null = null;
let revision = 0;
const listeners = new Set<() => void>();

function notify() {
  revision += 1;
  for (const listener of listeners) listener();
}

export function subscribeSubscriptionPageCache(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSubscriptionPageCacheRevision() {
  return revision;
}

export function readSubscriptionPageCache(): SubscriptionPageData | null {
  if (!subscriptionEntry) return null;
  if (Date.now() - subscriptionEntry.savedAt > USER_DATA_TTL_MS) {
    subscriptionEntry = null;
    return null;
  }
  return subscriptionEntry.value;
}

export function loadSubscriptionPageData(
  fetchData: () => Promise<SubscriptionPageData>,
) {
  const cached = readSubscriptionPageCache();
  if (cached) return Promise.resolve(cached);
  if (subscriptionRequest) return subscriptionRequest;

  const startedAtRevision = revision;
  let currentRequest: Promise<SubscriptionPageData>;
  currentRequest = fetchData()
    .then((value) => {
      if (revision === startedAtRevision) {
        subscriptionEntry = { value, savedAt: Date.now() };
        catalogEntry = { value: value.catalog, savedAt: Date.now() };
        notify();
      }
      return value;
    })
    .finally(() => {
      if (subscriptionRequest === currentRequest) subscriptionRequest = null;
    });
  subscriptionRequest = currentRequest;
  return currentRequest;
}

export function readPlanCatalogCache(): PlanCatalog | null {
  if (!catalogEntry) return null;
  if (Date.now() - catalogEntry.savedAt > CATALOG_TTL_MS) {
    catalogEntry = null;
    return null;
  }
  return catalogEntry.value;
}

export function loadPlanCatalog(
  fetchData: () => Promise<PlanCatalog>,
): Promise<PlanCatalog> {
  const cached = readPlanCatalogCache();
  if (cached) return Promise.resolve(cached);
  if (catalogRequest) return catalogRequest;

  const startedAtRevision = revision;
  let currentRequest: Promise<PlanCatalog>;
  currentRequest = fetchData()
    .then((value) => {
      if (revision === startedAtRevision) {
        catalogEntry = { value, savedAt: Date.now() };
        notify();
      }
      return value;
    })
    .finally(() => {
      if (catalogRequest === currentRequest) catalogRequest = null;
    });
  catalogRequest = currentRequest;
  return currentRequest;
}

export function clearSubscriptionPageCache() {
  subscriptionEntry = null;
  subscriptionRequest = null;
  notify();
}

export function clearPlanCatalogCache() {
  catalogEntry = null;
  catalogRequest = null;
  clearSubscriptionPageCache();
}
