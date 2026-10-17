"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LockIcon, FileTextIcon, LayersIcon, Loader2Icon } from "lucide-react";
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
      let order;
      try {
        order = await createExamOrder({ exam_id: examId });
      } catch {
        toast.error("Couldn't start checkout. Check your connection and retry.");
        return;
      }
      if ("error" in order) {
        toast.error(
          order.error === "already_owned"
            ? "You already own this test."
            : "This test can't be purchased right now.",
        );
        return;
      }
      await openCheckout(order, {
        // land straight on this test's instruction page once unlocked
        onSuccess: () => router.push(`/all-test-series/${seriesName}/${examId}`),
        onSettled: () => setOpen(false),
      });
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
        variant="default"
        className="w-22"
        onClick={() => setOpen(true)}
      >
        <LockIcon />
        Unlock
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          // don't let an outside-click dismiss the modal mid-purchase
          if (pending && !next) return;
          setOpen(next);
        }}
      >
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
              {pending ? (
                <Loader2Icon className="size-5 shrink-0 animate-spin text-muted-foreground" />
              ) : (
                <FileTextIcon className="size-5 shrink-0 text-muted-foreground" />
              )}
              <span className="flex-1">
                <span className="block font-medium">
                  {pending ? "Starting checkout…" : "This test only"}
                </span>
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
              className="relative flex items-center gap-3 rounded-xl border-2 border-green-500 bg-green-50 p-4 text-left transition-colors hover:bg-green-100 disabled:opacity-60 dark:bg-green-950/30 dark:hover:bg-green-950/50"
            >
              <div className="absolute -top-2 right-4 rounded-full bg-green-500 px-2 py-0.5 text-xs font-semibold text-white">
                Recommended
              </div>
              <LayersIcon className="size-5 shrink-0 text-green-600 dark:text-green-400" />
              <span className="flex-1">
                <span className="block font-semibold text-green-700 dark:text-green-300">
                  Whole series pack
                </span>
                <span className="block text-sm text-green-600 dark:text-green-400">
                  Unlock every test in {seriesName}
                </span>
              </span>
              <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                View plans →
              </span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
