"use client";

import { useTransition } from "react";
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
  const openCheckout = useRazorpayCheckout();

  function buy() {
    startTransition(async () => {
      const order = await createPlanOrder({ plan_id: planId });
      if ("error" in order) {
        toast.error(
          order.error === "already_subscribed"
            ? "You already have an active plan."
            : "This plan can't be purchased right now.",
        );
        return;
      }
      await openCheckout(order);
    });
  }

  return (
    <Button className="w-full" disabled={pending} onClick={buy}>
      {children}
    </Button>
  );
}
