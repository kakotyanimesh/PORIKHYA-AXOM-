import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import type { AttemptQuestion } from "@/lib/actions/lazyquestions.action";

const OPTION_LETTERS = ["a", "b", "c", "d", "e", "f"];

export function QuestionPanel({
  sectionName,
  question,
  questionNumber,
  totalQuestions,
  isLoading,
  selectedOptionId,
  onSelectOption,
  language,
  className,
}: {
  sectionName: string;
  question: AttemptQuestion | undefined;
  questionNumber: number;
  totalQuestions: number;
  isLoading: boolean;
  selectedOptionId: string | undefined;
  onSelectOption: (optionId: string) => void;
  language: "en" | "as";
  className?: string;
}) {
  const questionText =
    language === "as" ? (question?.content_assamese ?? question?.content) : question?.content;

  return (
    <div className={cn("h-full overflow-y-auto", className)}>
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {sectionName}
      </p>

      <div className="mt-2 rounded-3xl border p-6">
        {isLoading || !question ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              Question {questionNumber} of {totalQuestions}
            </p>
            <p className="mt-1 font-heading text-lg font-semibold">{questionText}</p>

            <RadioGroup
              value={selectedOptionId ?? ""}
              onValueChange={(value: string) => onSelectOption(value)}
              className="mt-6"
            >
              {question.options.map((option, index) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 has-data-checked:border-primary has-data-checked:bg-accent/50"
                >
                  <RadioGroupItem value={option.id} />
                  <span className="text-sm font-medium text-muted-foreground">
                    {OPTION_LETTERS[index] ?? index + 1}
                  </span>
                  <span className="text-sm">
                    {language === "as" ? (option.text_assamese ?? option.text) : option.text}
                  </span>
                </label>
              ))}
            </RadioGroup>
          </>
        )}
      </div>
    </div>
  );
}
