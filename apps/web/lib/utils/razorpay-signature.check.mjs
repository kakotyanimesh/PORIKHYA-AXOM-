// Self-check for the Razorpay signature contract. Run: node razorpay-signature.check.mjs
// Mirrors razorpay-signature.ts — if the HMAC formula (`order|payment` with
// key_secret) ever drifts, this fails. No framework, just assert.
import crypto from "node:crypto";
import assert from "node:assert";
import { Buffer } from "node:buffer";

const SECRET = "test_secret";
const sign = (payload) =>
  crypto.createHmac("sha256", SECRET).update(payload).digest("hex");

// what verifyPaymentSignature must accept: HMAC of `${order_id}|${payment_id}`
const orderId = "order_ABC123";
const paymentId = "pay_XYZ789";
const good = sign(`${orderId}|${paymentId}`);

function verify(order, payment, signature, secret = SECRET) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${order}|${payment}`)
    .digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

assert.equal(verify(orderId, paymentId, good), true, "valid signature must pass");
assert.equal(verify(orderId, paymentId, sign("tampered")), false, "tampered must fail");
assert.equal(verify(orderId, "pay_OTHER", good), false, "swapped payment id must fail");
assert.equal(verify(orderId, paymentId, "abcd"), false, "wrong-length must fail, not throw");

console.log("razorpay signature contract OK");
