"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Label } from "@repo/ui/components/label";
import { Button } from "@repo/ui/components/button";
import { startExamAttempt } from "@/lib/actions/start-exam-attempt.action";

export function StartTestGate({ examId }: { examId: string }) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [alreadyAttempted, setAlreadyAttempted] = useState<{ completed: boolean } | null>(null);

  async function handleStart() {
    setIsStarting(true);
    const result = await startExamAttempt({ exam_id: examId });
    if (result.status === "started") {
      router.push(`/exams/${examId}/attempt`);
      return;
    }
    setAlreadyAttempted({ completed: result.completed });
    setIsStarting(false);
  }

  if (alreadyAttempted) {
    return (
      <div className="rounded-2xl border p-6 text-sm text-muted-foreground">
        {alreadyAttempted.completed
          ? "You've already completed this exam. Each exam can only be attempted once."
          : "Your previous attempt on this exam wasn't completed. Since attempts are locked at start, it can't be retaken."}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
      <Label htmlFor="agree-instructions" className="items-start font-normal text-muted-foreground">
        <Checkbox
          id="agree-instructions"
          checked={agreed}
          onCheckedChange={(checked) => setAgreed(checked === true)}
          className="mt-0.5"
        />
        <span>
          I have read all the instructions carefully and I agree to abide by them. I understand
          the test will begin immediately after I click <span className="italic">Start test</span>.
        </span>
      </Label>

      <Button type="button" disabled={!agreed || isStarting} className="shrink-0" onClick={handleStart}>
        Start test
        <ArrowRightIcon />
      </Button>
    </div>
  );
}
