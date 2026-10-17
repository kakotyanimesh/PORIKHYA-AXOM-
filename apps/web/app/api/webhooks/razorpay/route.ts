import { updateTag } from "next/cache";
import { verifyWebhookSignature } from "@/lib/utils/razorpay-signature";
import { grantForOrder } from "@/lib/utils/payment-grant";

// Idempotent backstop to the client checkout handler. Razorpay retries this if
// the browser closed before verifyPayment ran. grantForOrder's atomic claim
// makes a double delivery grant exactly once. Verify the body HMAC before
// trusting anything — an unsigned/forged POST must not grant access.
export async function POST(req: Request): Promise<Response> {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return new Response("invalid signature", { status: 400 });
  }

  const event = JSON.parse(rawBody) as {
    event?: string;
    payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
  };

  if (event.event === "payment.captured" || event.event === "order.paid") {
    const entity = event.payload?.payment?.entity;
    if (entity?.order_id && entity.id) {
      const result = await grantForOrder(entity.order_id, entity.id);
      if (result.userId) {
        updateTag(`subscription:${result.userId}`);
        updateTag(`exam-status:${result.userId}`);
      }
    }
  }

  // always 200 on a verified event — a non-2xx makes Razorpay retry forever.
  return new Response("ok");
}
