import "server-only";
import { prisma } from "@repo/db";
import { razorpay } from "@/lib/razorpay";

// The one place access is actually granted. Both entry points funnel here:
//   1. verifyPayment() — client checkout-success handler (signature already checked)
//   2. the Razorpay webhook (body HMAC already checked)
// Intent (what was bought) is read from the Razorpay ORDER notes, not the client
// — the client cannot alter order notes, so this is tamper-proof. Idempotent: the
// PENDING→SUCCESS flip is an atomic claim, so a double delivery grants once.

export type GrantResult = { granted: boolean; userId?: string; error?: string };

const daysFromNow = (days: number): Date =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000);

export async function grantForOrder(
  orderId: string,
  paymentId: string,
  signature?: string,
): Promise<GrantResult> {
  // authoritative intent from the order we created server-side
  const order = await razorpay.orders.fetch(orderId);
  const notes = (order.notes ?? {}) as {
    kind?: string;
    exam_id?: string;
    plan_id?: string;
    user_id?: string;
  };
  const userId = notes.user_id;
  if (!userId) return { granted: false, error: "order_missing_user" };

  return prisma.$transaction(async (tx) => {
    // atomic claim — only the first caller to move this row out of PENDING wins.
    const claim = await tx.payment.updateMany({
      where: { razorpay_order_id: orderId, status: "PENDING" },
      data: {
        status: "SUCCESS",
        razorpay_payment_id: paymentId,
        ...(signature ? { razorpay_signature: signature } : {}),
      },
    });
    if (claim.count === 0) return { granted: false, userId }; // already processed / unknown

    const payment = await tx.payment.findFirstOrThrow({
      where: { razorpay_order_id: orderId },
      select: { id: true },
    });

    if (notes.kind === "exam" && notes.exam_id) {
      const purchase = await tx.examPurchase.upsert({
        where: { user_id_exam_id: { user_id: userId, exam_id: notes.exam_id } },
        create: { user_id: userId, exam_id: notes.exam_id },
        update: {},
        select: { id: true },
      });
      await tx.payment.update({
        where: { id: payment.id },
        data: { exam_purchase_id: purchase.id },
      });
      return { granted: true, userId };
    }

    if (notes.kind === "plan" && notes.plan_id) {
      const plan = await tx.plan.findUniqueOrThrow({
        where: { id: notes.plan_id },
        select: { duration_days: true, category_grants: true },
      });
      const sub = await tx.subscription.create({
        data: {
          user_id: userId,
          plan_id: notes.plan_id,
          expires_at: daysFromNow(plan.duration_days),
        },
        select: { id: true },
      });
      // grant every active exam in the plan's categories
      const exams = await tx.exam.findMany({
        where: { category: { in: plan.category_grants }, is_active: true },
        select: { id: true },
      });
      if (exams.length > 0) {
        await tx.subscriptionExam.createMany({
          data: exams.map((e) => ({ subscription_id: sub.id, exam_id: e.id })),
          skipDuplicates: true,
        });
      }
      await tx.payment.update({
        where: { id: payment.id },
        data: { subscription_id: sub.id },
      });
      return { granted: true, userId };
    }

    return { granted: false, userId, error: "unknown_order_kind" };
  });
}
