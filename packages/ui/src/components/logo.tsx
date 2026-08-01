import { cn } from "@repo/ui/lib/utils";

function Logo({
  className,
  badge = true,
}: {
  className?: string;
  badge?: boolean;
}) {
  return (
    <span className="font-dottedFont inline-flex items-center gap-2 tracking-tight">
      {badge && (
        <span className="flex aspect-square size-8 items-center justify-center rounded-lg bg-chart-4 text-sm font-bold text-primary">
          PA
        </span>
      )}
      <span className={cn("text-2xl text-chart-3", className)}>
        Porikhya
        <span className="text-red-500">Axom</span>
      </span>
    </span>
  );
}

export { Logo };
