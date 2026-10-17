"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PauseIcon, LayoutGridIcon } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/sheet";
import { useExamTimer } from "@/hooks/use-exam-timer";
import { useLazyQuestions } from "@/hooks/use-lazy-questions";
import { submitExamAttempt } from "@/lib/actions/submit-exam-attempt.action";
import { clearMockTestStatusCache } from "@/components/mock-test-status-cache";
import { clearDashboardDataCache } from "@/components/dashboard/dashboard-data-cache";
import { clearExamResultCache } from "@/components/exam-result/exam-result-cache";
import type { ExamAttemptInit } from "@/lib/actions/lazyquestions.action";
import { QuestionPalette } from "./question-palette";
import { QuestionPanel } from "./question-panel";
import { PauseDialog } from "./pause-dialog";

function sectionKey(sectionId: string | null): string {
  return sectionId ?? "ungrouped";
}

function posKey(sectionId: string | null, index: number): string {
  return `${sectionKey(sectionId)}#${index}`;
}

function formatClock(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function ExamAttemptShell({
  examId,
  examName,
  durationMinutes,
  init,
}: {
  examId: string;
  examName: string;
  durationMinutes: number;
  init: ExamAttemptInit;
}) {
  const router = useRouter();
  const lazy = useLazyQuestions(examId, init);
  const [indexInSection, setIndexInSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { questionId: string; optionId: string }>>(
    {},
  );
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [submitOpen, setSubmitOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [language, setLanguage] = useState<"en" | "as">("en");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitExam = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    timer.clear();
    try {
      await submitExamAttempt({
        exam_id: examId,
        answers: Object.values(answers).map((a) => ({
          question_id: a.questionId,
          selected_option_id: a.optionId,
        })),
      });
      clearMockTestStatusCache();
      clearDashboardDataCache();
      clearExamResultCache();
      lazy.reset();
      router.push(`/exams/${examId}/result`);
    } catch {
      // reset only on failure — success navigates away and the button must stay
      // disabled through the transition, else a slow nav lets the user re-submit
      // a one-attempt-ever exam. react-doctor flags this as reset-outside-finally
      // but a finally would reintroduce that double-submit; deliberate.
      toast.error("Couldn't submit your attempt. Please try again.");
      setIsSubmitting(false);
    }
  };

  const timer = useExamTimer(examId, durationMinutes, submitExam);

  useEffect(() => {
    lazy.loadSection(init.first_section_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentQuestion = lazy.questions[indexInSection];
  const currentKey = posKey(lazy.activeSectionId, indexInSection);

  useEffect(() => {
    if (!currentQuestion) return;
    setVisited((prev) => (prev.has(currentKey) ? prev : new Set(prev).add(currentKey)));
  }, [currentKey, currentQuestion]);

  const totalQuestions = useMemo(
    () => lazy.sections.reduce((sum, s) => sum + s.question_count, 0),
    [lazy.sections],
  );

  const questionNumber = useMemo(() => {
    const sectionIdx = lazy.sections.findIndex((s) => s.id === lazy.activeSectionId);
    const before = lazy.sections
      .slice(0, sectionIdx)
      .reduce((sum, s) => sum + s.question_count, 0);
    return before + indexInSection + 1;
  }, [lazy.sections, lazy.activeSectionId, indexInSection]);

  const activeSection = lazy.sections.find((s) => s.id === lazy.activeSectionId);
  const isFirstQuestion =
    lazy.sections[0]?.id === lazy.activeSectionId && indexInSection === 0;
  const isLastQuestion =
    lazy.sections.at(-1)?.id === lazy.activeSectionId &&
    indexInSection === (activeSection?.question_count ?? 1) - 1;

  function goToQuestion(sectionId: string | null, index: number) {
    if (sectionId !== lazy.activeSectionId) {
      lazy.loadSection(sectionId);
    }
    setIndexInSection(index);
    setPaletteOpen(false);
  }

  function goNext() {
    if (indexInSection < lazy.questions.length - 1) {
      setIndexInSection((i) => i + 1);
      return;
    }
    const sectionIdx = lazy.sections.findIndex((s) => s.id === lazy.activeSectionId);
    const next = lazy.sections[sectionIdx + 1];
    if (!next) return;
    goToQuestion(next.id, 0);
  }

  function goPrev() {
    if (indexInSection > 0) {
      setIndexInSection((i) => i - 1);
      return;
    }
    const sectionIdx = lazy.sections.findIndex((s) => s.id === lazy.activeSectionId);
    const prev = lazy.sections[sectionIdx - 1];
    if (!prev) return;
    goToQuestion(prev.id, prev.question_count - 1);
  }

  function toggleMarkForReview() {
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(currentKey)) next.delete(currentKey);
      else next.add(currentKey);
      return next;
    });
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <header className="flex shrink-0 items-center justify-between rounded-3xl border m-4 mb-0 px-5 py-3">
        <div className="order-1 flex items-center gap-2 sm:order-2">
          <div className="flex rounded-full border p-0.5">
            <Button
              variant={language === "en" ? "default" : "ghost"}
              size="sm"
              className="rounded-full"
              onClick={() => setLanguage("en")}
            >
              EN
            </Button>
            <Button
              variant={language === "as" ? "default" : "ghost"}
              size="sm"
              className="rounded-full"
              onClick={() => setLanguage("as")}
            >
              অসমীয়া
            </Button>
          </div>
          <span className="font-mono text-sm tabular-nums">{formatClock(timer.remainingSeconds)}</span>
          <Button variant="ghost" size="icon-sm" onClick={timer.pause} aria-label="Pause timer">
            <PauseIcon />
          </Button>
        </div>
        <span className="order-2 font-heading text-base font-medium sm:order-1">{examName}</span>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[1fr_320px]">
        <QuestionPanel
          sectionName={activeSection?.name ?? "General"}
          question={currentQuestion}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          isLoading={lazy.isLoading}
          selectedOptionId={answers[currentKey]?.optionId}
          onSelectOption={(optionId) =>
            currentQuestion &&
            setAnswers((prev) => ({
              ...prev,
              [currentKey]: { questionId: currentQuestion.id, optionId },
            }))
          }
          language={language}
        />

        <QuestionPalette
          sections={lazy.sections}
          activeSectionId={lazy.activeSectionId}
          activeIndex={indexInSection}
          isAnswered={(sectionId, index) => posKey(sectionId, index) in answers}
          isMarked={(sectionId, index) => marked.has(posKey(sectionId, index))}
          isVisited={(sectionId, index) => visited.has(posKey(sectionId, index))}
          onSelect={goToQuestion}
          className="hidden lg:flex"
        />
      </div>

      <footer className="shrink-0 rounded-3xl border m-4 mt-0 px-4 py-3">
        {/* small screens: prev/next stack, palette moves behind a bottom sheet */}
        <div className="flex items-center justify-between gap-2 lg:hidden">
          <div className="flex flex-col gap-1.5">
            <Button variant="outline" size="sm" onClick={goPrev} disabled={isFirstQuestion}>
              Prev
            </Button>
            <Button variant="outline" size="sm" onClick={goNext} disabled={isLastQuestion}>
              Next
            </Button>
          </div>
          <Button
            variant={marked.has(currentKey) ? "default" : "outline"}
            size="sm"
            onClick={toggleMarkForReview}
          >
            Mark
          </Button>
          <Sheet open={paletteOpen} onOpenChange={setPaletteOpen}>
            <SheetTrigger render={<Button variant="outline" size="sm" />}>
              <LayoutGridIcon />
              Palette
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[70vh]">
              <SheetHeader>
                <SheetTitle>Questions</SheetTitle>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
                <QuestionPalette
                  sections={lazy.sections}
                  activeSectionId={lazy.activeSectionId}
                  activeIndex={indexInSection}
                  isAnswered={(sectionId, index) => posKey(sectionId, index) in answers}
                  isMarked={(sectionId, index) => marked.has(posKey(sectionId, index))}
                  isVisited={(sectionId, index) => visited.has(posKey(sectionId, index))}
                  onSelect={goToQuestion}
                  className="border-none p-0"
                  hideTitle
                />
              </div>
            </SheetContent>
          </Sheet>
          <Button variant="destructive" size="sm" onClick={() => setSubmitOpen(true)}>
            Submit
          </Button>
        </div>

        {/* lg+: palette is already visible inline, no trigger needed */}
        <div className="hidden items-center justify-between gap-2 lg:flex">
          <Button variant="outline" onClick={goPrev} disabled={isFirstQuestion}>
            Prev
          </Button>
          <Button
            variant={marked.has(currentKey) ? "default" : "outline"}
            onClick={toggleMarkForReview}
          >
            Mark for review
          </Button>
          <Button variant="outline" onClick={goNext} disabled={isLastQuestion}>
            Next
          </Button>
          <Button variant="destructive" onClick={() => setSubmitOpen(true)}>
            Submit exam
          </Button>
        </div>
      </footer>

      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit exam?</DialogTitle>
            <DialogDescription>
              {totalQuestions - Object.keys(answers).length} of {totalQuestions} questions are
              unanswered. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={submitExam} disabled={isSubmitting}>
              {isSubmitting ? "Submitting…" : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PauseDialog open={timer.isPaused} onResume={timer.resume} onSubmit={submitExam} />
    </div>
  );
}
