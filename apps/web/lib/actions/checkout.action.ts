"use server";

import { updateTag } from "next/cache";
import { prisma } from "@repo/db";
import { getCurrentUser } from "@/lib/utils/current-user";
import { razorpay } from "@/lib/razorpay";
import { SINGLE_TEST_PRICE_INR, toPaise } from "@/lib/pricing";
import { verifyPaymentSignature } from "@/lib/utils/razorpay-signature";
import { hasExamAccess } from "@/lib/utils/subscription-access";
import { grantForOrder } from "@/lib/utils/payment-grant";
import {
  createExamOrderSchema,
  createPlanOrderSchema,
  verifyPaymentSchema,
  type CreateExamOrderInput,
  type CreatePlanOrderInput,
  type VerifyPaymentInput,
} from "../validations/checkout.validation";

// what the client checkout modal needs. keyId is the PUBLIC key — safe to send.
export type OrderResult = {
  orderId: string;
  amountPaise: number;
  currency: string;
  keyId: string;
  label: string;
};
export type CheckoutError = { error: string };

const RAZORPAY_PUBLIC_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;

// ₹50 single exam. Amount is the server constant, never a client value.
export async function createExamOrder(
  input: CreateExamOrderInput,
): Promise<OrderResult | CheckoutError> {
  const { exam_id } = createExamOrderSchema.parse(input);
  const user = await getCurrentUser();

  if (await hasExamAccess(user.id, exam_id)) return { error: "already_owned" };

  const exam = await prisma.exam.findUnique({
    where: { id: exam_id },
    select: { id: true, name: true, is_free: true, is_active: true },
  });
  if (!exam || !exam.is_active || exam.is_free) return { error: "not_purchasable" };

  const amountPaise = toPaise(SINGLE_TEST_PRICE_INR);
  const order = await razorpay.orders.create({
    amount: amountPaise,
    currency: "INR",
    notes: { kind: "exam", exam_id, user_id: user.id },
  });

  await prisma.payment.create({
    data: {
      user_id: user.id,
      amount: SINGLE_TEST_PRICE_INR,
      currency: "INR",
      razorpay_order_id: order.id,
      status: "PENDING",
    },
  });

  return {
    orderId: order.id,
    amountPaise,
    currency: "INR",
    keyId: RAZORPAY_PUBLIC_KEY,
    label: exam.name,
  };
}

// A plan (category pack or super). Price comes from the DB row, never the client.
export async function createPlanOrder(
  input: CreatePlanOrderInput,
): Promise<OrderResult | CheckoutError> {
  const { plan_id } = createPlanOrderSchema.parse(input);
  const user = await getCurrentUser();

  const plan = await prisma.plan.findUnique({
    where: { id: plan_id },
    select: { id: true, name: true, price: true, is_active: true },
  });
  if (!plan || !plan.is_active) return { error: "not_purchasable" };

  // one active Subscription per user (partial unique index). Refuse to CHARGE
  // for a plan we could not then grant. ponytail: no upgrade/stacking yet —
  // add plan-swap here when the super-plan upgrade flow is built.
  const activeSub = await prisma.subscription.findFirst({
    where: { user_id: user.id, is_active: true, expires_at: { gt: new Date() } },
    select: { id: true },
  });
  if (activeSub) return { error: "already_subscribed" };

  const amountPaise = toPaise(Number(plan.price));
  const order = await razorpay.orders.create({
    amount: amountPaise,
    currency: "INR",
    notes: { kind: "plan", plan_id, user_id: user.id },
  });

  await prisma.payment.create({
    data: {
      user_id: user.id,
      amount: plan.price,
      currency: "INR",
      razorpay_order_id: order.id,
      status: "PENDING",
    },
  });

  return {
    orderId: order.id,
    amountPaise,
    currency: "INR",
    keyId: RAZORPAY_PUBLIC_KEY,
    label: plan.name,
  };
}

// checkout-success handler → verify signature → grant. This is the primary grant
// path (works in dev with test keys, no public webhook URL needed). The webhook
// is an idempotent backstop for the same order.
export async function verifyPayment(
  input: VerifyPaymentInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    verifyPaymentSchema.parse(input);

  if (
    !verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
  ) {
    return { ok: false, error: "invalid_signature" };
  }

  const result = await grantForOrder(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  );
  if (result.userId) updateTag(`subscription:${result.userId}`);
  return { ok: true };
}
