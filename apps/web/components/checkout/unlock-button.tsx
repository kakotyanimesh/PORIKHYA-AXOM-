"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LockIcon, FileTextIcon, LayersIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { createExamOrder } from "@/lib/actions/checkout.action";
import { SINGLE_TEST_PRICE_INR } from "@/lib/pricing";
import { useRazorpayCheckout } from "./use-razorpay-checkout";

// The unlock modal: buy only this test (₹50, straight to Razorpay) or the whole
// series pack (→ the pack checkout page). Rendered per locked row.
export function UnlockButton({
  examId,
  examName,
  seriesName,
}: {
  examId: string;
  examName: string;
  seriesName: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const openCheckout = useRazorpayCheckout();

  function buyThisTest() {
    startTransition(async () => {
      const order = await createExamOrder({ exam_id: examId });
      if ("error" in order) {
        toast.error(
          order.error === "already_owned"
            ? "You already own this test."
            : "This test can't be purchased right now.",
        );
        return;
      }
      setOpen(false);
      await openCheckout(order);
    });
  }

  function buyWholePack() {
    setOpen(false);
    router.push(`/all-test-series/${seriesName}/pack`);
  }

  return (
    <>
      <Button
        size="sm"
        type="button"
        variant="secondary"
        className="w-22"
        onClick={() => setOpen(true)}
      >
        <LockIcon />
        Unlock
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlock this test</DialogTitle>
            <DialogDescription>
              Buy just this test, or unlock the whole {seriesName} series.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 flex flex-col gap-3">
            <button
              type="button"
              disabled={pending}
              onClick={buyThisTest}
              className="flex items-center gap-3 rounded-xl border p-4 text-left transition-colors hover:bg-muted disabled:opacity-60"
            >
              <FileTextIcon className="size-5 shrink-0 text-muted-foreground" />
              <span className="flex-1">
                <span className="block font-medium">This test only</span>
                <span className="block text-sm text-muted-foreground">
                  {examName}
                </span>
              </span>
              <span className="font-semibold">₹{SINGLE_TEST_PRICE_INR}</span>
            </button>

            <button
              type="button"
              disabled={pending}
              onClick={buyWholePack}
              className="flex items-center gap-3 rounded-xl border p-4 text-left transition-colors hover:bg-muted disabled:opacity-60"
            >
              <LayersIcon className="size-5 shrink-0 text-muted-foreground" />
              <span className="flex-1">
                <span className="block font-medium">Whole series pack</span>
                <span className="block text-sm text-muted-foreground">
                  Unlock every test in {seriesName}
                </span>
              </span>
              <span className="text-sm font-medium text-primary">View plans →</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
