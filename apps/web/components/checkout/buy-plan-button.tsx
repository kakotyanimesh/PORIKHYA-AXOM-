"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { createPlanOrder } from "@/lib/actions/checkout.action";
import { useRazorpayCheckout } from "./use-razorpay-checkout";

export function BuyPlanButton({
  planId,
  children,
}: {
  planId: string;
  children: React.ReactNode;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const openCheckout = useRazorpayCheckout();

  function buy() {
    startTransition(async () => {
      let order;
      try {
        order = await createPlanOrder({ plan_id: planId });
      } catch {
        toast.error("Couldn't start checkout. Check your connection and retry.");
        return;
      }
      if ("error" in order) {
        toast.error(
          order.error === "already_subscribed"
            ? "You already have this plan active."
            : "This plan can't be purchased right now.",
        );
        return;
      }
      await openCheckout(order, {
        // show the freshly-unlocked plan on the subscriptions page
        onSuccess: () => router.push("/my-subscriptions"),
      });
    });
  }

  return (
    <Button className="w-full" disabled={pending} onClick={buy}>
      {pending && <Loader2Icon className="animate-spin" />}
      {pending ? "Starting checkout…" : children}
    </Button>
  );
}
