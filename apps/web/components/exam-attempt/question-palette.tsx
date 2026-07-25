import { cn } from "@repo/ui/lib/utils";
import type { ExamSection } from "@/lib/actions/lazyquestions.action";

type PaletteStatus = "current" | "marked" | "answered" | "visited" | "unvisited";

// same legend as the instructions page's palette-legend card — keep in sync
function statusClassName(status: PaletteStatus): string {
  switch (status) {
    case "marked":
      return "border-amber-500 bg-amber-500 text-white";
    case "answered":
      return "border-emerald-500 bg-emerald-500 text-white";
    case "visited":
      return "border-rose-500 bg-rose-500 text-white";
    default:
      return "border-border bg-background text-muted-foreground";
  }
}

export function QuestionPalette({
  sections,
  activeSectionId,
  activeIndex,
  isAnswered,
  isMarked,
  isVisited,
  onSelect,
  className,
  hideTitle = false,
}: {
  sections: ExamSection[];
  activeSectionId: string | null;
  activeIndex: number;
  isAnswered: (sectionId: string | null, index: number) => boolean;
  isMarked: (sectionId: string | null, index: number) => boolean;
  isVisited: (sectionId: string | null, index: number) => boolean;
  onSelect: (sectionId: string | null, index: number) => void;
  className?: string;
  hideTitle?: boolean;
}) {
  return (
    <div className={cn("flex h-full flex-col overflow-y-auto rounded-3xl border p-4", className)}>
      {!hideTitle && <p className="font-heading text-sm font-medium">Questions</p>}
      <div className="mt-3 flex flex-col gap-4">
        {sections.map((section) => (
          <div key={section.id ?? "ungrouped"}>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {section.name ?? "General"}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {Array.from({ length: section.question_count }, (_, index) => {
                const isCurrent = section.id === activeSectionId && index === activeIndex;
                const status: PaletteStatus = isCurrent
                  ? "current"
                  : isMarked(section.id, index)
                    ? "marked"
                    : isAnswered(section.id, index)
                      ? "answered"
                      : isVisited(section.id, index)
                        ? "visited"
                        : "unvisited";

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => onSelect(section.id, index)}
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg border text-xs font-medium transition-transform active:scale-95",
                      statusClassName(status),
                      isCurrent && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                    )}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
