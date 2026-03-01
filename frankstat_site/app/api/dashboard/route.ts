import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { authOptions } from "@/lib/auth"; // adjust to your NextAuth config path
import { prisma } from "@/lib/prisma";   // adjust to your Prisma client path


export async function GET(req: NextRequest) {
  // ── 1. Auth guard ──────────────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  const userId = session.user.id;

  // ── 2. Fetch user profile ──────────────────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      isVerified: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // ── 3. Fetch orders (scoped to this user) ──────────────────────────────────
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      serviceId: true,
      serviceName: true,
      dimensions: true,
      quantity: true,
      finishType: true,
      specialNotes: true,
      totalPrice: true,
      depositAmount: true,
      artworkUrl: true,
      mpesaPhone: true,
      status: true,
      mpesaReceipt: true,
      merchantRequestID: true,
      checkoutRequestID: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // ── 4. Build payment records from confirmed orders ─────────────────────────
  //    (Your schema stores M-Pesa data on the Order itself — no separate
  //     Payment table — so we derive payment records here.)
  const payments = orders
    .filter((o) => o.mpesaReceipt) // only orders where deposit was confirmed
    .map((o) => ({
      id: `PAY-${o.id}`,
      orderId: o.id,
      type: "Deposit" as const,
      amount: o.depositAmount,
      method: "M-Pesa" as const,
      mpesaRef: o.mpesaReceipt!,
      date: o.updatedAt,
      status: "Confirmed" as const,
    }));

  // ── 5. Compute summary stats ───────────────────────────────────────────────
  const activeStatuses = ["PENDING_PAYMENT", "PAID_DEPOSIT", "PROCESSING", "READY"];
  const activeOrders = orders.filter((o) => activeStatuses.includes(o.status));
  const completedOrders = orders.filter((o) => o.status === "COMPLETED");

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const pendingBalance = activeOrders.reduce(
    (sum, o) => sum + (o.totalPrice - o.depositAmount),
    0
  );

  // ── 6. Return ──────────────────────────────────────────────────────────────
  return NextResponse.json({
    user,
    orders,
    payments,
    stats: {
      totalOrders: orders.length,
      activeOrders: activeOrders.length,
      completedOrders: completedOrders.length,
      totalPaid,
      pendingBalance,
      totalTransactions: payments.length,
    },
  });
}
