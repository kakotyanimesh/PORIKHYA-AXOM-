import "server-only";
import { prisma } from "@repo/db";

// The one place access is actually granted. Both entry points funnel here:
//   1. verifyPayment() — client checkout-success handler (signature already checked)
//   2. the Razorpay webhook (body HMAC already checked)
// Intent (user + what was bought) lives on the Payment row we wrote at order
// creation — server-controlled, so tamper-proof, AND no Razorpay API call at
// grant time (a completed payment must not fail just because Razorpay's API is
// briefly unreachable). Idempotent: the PENDING→SUCCESS flip is an atomic claim,
// so a double delivery grants once.

export type GrantResult = { granted: boolean; userId?: string; error?: string };

const daysFromNow = (days: number): Date =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000);

export async function grantForOrder(
  orderId: string,
  paymentId: string,
  signature?: string,
): Promise<GrantResult> {
  const intent = await prisma.payment.findFirst({
    where: { razorpay_order_id: orderId },
    select: { user_id: true, kind: true, target_id: true },
  });
  if (!intent) return { granted: false, error: "unknown_order" };
  const userId = intent.user_id;

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
    if (claim.count === 0) return { granted: false, userId }; // already processed

    const payment = await tx.payment.findFirstOrThrow({
      where: { razorpay_order_id: orderId },
      select: { id: true },
    });

    if (intent.kind === "exam" && intent.target_id) {
      const purchase = await tx.examPurchase.upsert({
        where: { user_id_exam_id: { user_id: userId, exam_id: intent.target_id } },
        create: { user_id: userId, exam_id: intent.target_id },
        update: {},
        select: { id: true },
      });
      await tx.payment.update({
        where: { id: payment.id },
        data: { exam_purchase_id: purchase.id },
      });
      return { granted: true, userId };
    }

    if (intent.kind === "plan" && intent.target_id) {
      const plan = await tx.plan.findUniqueOrThrow({
        where: { id: intent.target_id },
        select: { duration_days: true, category_grants: true },
      });
      const sub = await tx.subscription.create({
        data: {
          user_id: userId,
          plan_id: intent.target_id,
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
