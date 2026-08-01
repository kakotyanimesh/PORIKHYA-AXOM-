import "server-only";
import crypto from "node:crypto";

// constant-time compare of two hex digests — avoids leaking match progress via
// timing. Returns false on any length mismatch instead of throwing.
function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// checkout-handler verification: Razorpay returns this signature to the client
// on success. Authentic iff HMAC_SHA256(`${order_id}|${payment_id}`, key_secret)
// matches. This is what proves a client-reported payment is real — never grant
// access without it.
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return safeEqualHex(expected, signature);
}

// webhook verification: HMAC of the raw request body with the webhook secret
// (a different secret from key_secret). Body must be the exact bytes received.
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");
  return safeEqualHex(expected, signature);
}
