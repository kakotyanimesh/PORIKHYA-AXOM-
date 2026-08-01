// Single source of truth for money amounts. Plan prices live in the DB
// (Plan.price); only the flat single-exam price is a code constant.
export const SINGLE_TEST_PRICE_INR = 50;

// Razorpay works in the smallest currency unit (paise for INR).
export const toPaise = (inr: number): number => Math.round(inr * 100);
