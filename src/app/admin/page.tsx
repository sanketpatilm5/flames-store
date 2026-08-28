import Link from "next/link";
import { db } from "@/lib/db";
import { runQuery } from "@/lib/runtime-db";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Admin dashboard" };

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [productCount, orderCount, revenue, lowStock, recentOrders] = await runQuery(
    () =>
      Promise.all([
        db.product.count({ where: { isActive: true } }),
        db.order.count({ where: { paymentStatus: "COMPLETED" } }),
        db.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "COMPLETED" } }),
        db.product.findMany({ where: { isActive: true, stock: { lte: 5 } }, orderBy: { stock: "asc" } }),
        db.order.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { email: true, name: true } } },
        }),
      ]),
    [0, 0, { _sum: { total: 0 } }, [], []],
  );

  const stats = [
    { icon: "🕯️", label: "Active products", value: productCount, tint: "var(--color-bubble-lt)" },
    { icon: "📦", label: "Completed orders", value: orderCount, tint: "var(--color-sky)" },
    {
      icon: "💰",
      label: "Total revenue",
      value: formatPrice(revenue._sum.total ?? 0),
      tint: "var(--color-butter)",
    },
  ];

  return (
    <div>
      <h1 className="mb-8 text-3xl">Dashboard</h1>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="panel panel-pad transition-transform duration-300 hover:-translate-y-1"
          >
            <span
              className="mb-3 grid h-11 w-11 place-items-center rounded-[14px] text-xl"
              style={{ background: stat.tint }}
              aria-hidden="true"
            >
              {stat.icon}
            </span>
            <p className="text-sm text-ink-soft">{stat.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold text-flame">{stat.value}</p>
          </div>
        ))}
      </div>

      {lowStock.length > 0 && (
        <div className="panel panel-pad mb-10 border-2 border-flame/30">
          <h2 className="mb-4 font-display text-lg">
            <span aria-hidden="true">⚠️</span> Low stock alert
          </h2>
          <ul className="space-y-2 text-sm">
            {lowStock.map((product) => (
              <li key={product.id} className="flex justify-between gap-3">
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="no-underline transition hover:text-flame"
                >
                  {product.name}
                </Link>
                <span className="font-display font-semibold text-flame">{product.stock} left</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="mb-4 font-display text-lg">Recent orders</h2>
      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b border-blush-dp font-display">
            <tr>
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="border-b border-blush-dp/50 transition hover:bg-blush/50">
                <td className="p-4">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-display font-semibold no-underline transition hover:text-flame"
                  >
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="p-4 text-ink-soft">{order.user.name ?? order.user.email}</td>
                <td className="p-4 font-display font-semibold">{formatPrice(order.total)}</td>
                <td className="p-4">
                  <span className={`pill pill-${order.status.toLowerCase()}`}>
                    {order.status.toLowerCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
