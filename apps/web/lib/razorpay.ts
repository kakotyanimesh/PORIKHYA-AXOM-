import "server-only";
import Razorpay from "razorpay";

// server-only client — key_secret must never reach the browser. The public
// key_id is exposed separately via NEXT_PUBLIC_RAZORPAY_KEY_ID for checkout.js.
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
