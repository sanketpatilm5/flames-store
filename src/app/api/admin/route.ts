import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [products, orders, stats] = await Promise.all([
    db.product.findMany({ orderBy: { createdAt: "desc" } }),
    db.order.findMany({
      include: { items: true, user: { select: { email: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: { paymentStatus: "COMPLETED" },
    }),
  ]);

  const lowStock = products.filter((p) => p.isActive && p.stock <= 5);

  return NextResponse.json({
    products,
    orders,
    stats: {
      totalRevenue: stats._sum.total ?? 0,
      totalOrders: stats._count,
      productCount: products.filter((p) => p.isActive).length,
      lowStock,
    },
  });
}
