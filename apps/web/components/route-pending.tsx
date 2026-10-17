export function RoutePending() {
  return (
    <div role="status" aria-live="polite" className="py-5 text-sm text-muted-foreground">
      <span className="sr-only">Loading page</span>
      <span aria-hidden="true" className="inline-flex items-center gap-2">
        <span className="size-2 animate-pulse rounded-full bg-current" />
        Loading…
      </span>
    </div>
  );
}
