"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { verifyPayment, type OrderResult } from "@/lib/actions/checkout.action";

// minimal shape of what checkout.js hands the handler on success
type RazorpayHandlerResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    // checkout.js attaches this constructor; typed loosely on purpose
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type CheckoutOptions = {
  // runs after the payment is verified and access is granted. Default: refresh.
  onSuccess?: () => void;
  // runs when the Razorpay modal is dismissed without completing (or on failure)
  // so callers can clear their loading state.
  onSettled?: () => void;
};

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadCheckoutScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const el = document.createElement("script");
    el.src = CHECKOUT_SRC;
    el.onload = () => resolve(true);
    el.onerror = () => resolve(false);
    document.body.appendChild(el);
  });
}

// opens the Razorpay modal for a server-created order, verifies the result
// server-side, then refreshes so the now-unlocked exam re-renders.
export function useRazorpayCheckout() {
  const router = useRouter();

  return useCallback(
    async (order: OrderResult, opts?: CheckoutOptions) => {
      const loaded = await loadCheckoutScript();
      if (!loaded || !window.Razorpay) {
        toast.error("Couldn't load payment. Check your connection and retry.");
        opts?.onSettled?.();
        return;
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amountPaise,
        currency: order.currency,
        name: "porikhyaaxom",
        description: order.label,
        handler: async (resp: RazorpayHandlerResponse) => {
          const verifying = toast.loading("Verifying payment…");
          const res = await verifyPayment({
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature: resp.razorpay_signature,
          });
          toast.dismiss(verifying);
          if (res.ok) {
            toast.success("Payment successful — access unlocked.");
            if (opts?.onSuccess) opts.onSuccess();
            else router.refresh();
          } else {
            // payment likely went through but grant didn't — the webhook backstop
            // will reconcile. Tell the user not to pay again.
            toast.error(
              "Payment received but unlocking is delayed. It'll appear shortly — don't pay again.",
            );
          }
          opts?.onSettled?.();
        },
        modal: {
          // user closed the Razorpay modal without paying
          ondismiss: () => opts?.onSettled?.(),
        },
      });
      rzp.open();
    },
    [router],
  );
}
