import Link from "next/link";
import { db } from "@/lib/db";
import { runQuery } from "@/lib/runtime-db";
import { formatPrice } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/OrderStatusSelect";

export const metadata = { title: "Manage orders" };
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await runQuery(
    () =>
      db.order.findMany({
        include: { user: { select: { email: true, name: true } }, items: true },
        orderBy: { createdAt: "desc" },
      }),
    [],
  );

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">Orders</h1>
        <p className="font-display text-sm text-ink-soft">{orders.length} total</p>
      </div>

      {orders.length === 0 ? (
        <div className="panel panel-pad py-12 text-center">
          <p className="font-display text-lg">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="panel panel-pad">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-display text-lg font-semibold no-underline transition hover:text-flame"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="text-sm text-ink-soft">
                    {order.user.name ?? order.user.email} ·{" "}
                    {new Date(order.createdAt).toLocaleString("en-IN")}
                  </p>
                  <span className={`pill pill-${order.status.toLowerCase()} mt-2`}>
                    {order.status.toLowerCase()}
                  </span>
                </div>
                <div className="text-right">
                  <p className="price">{formatPrice(order.total)}</p>
                  <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                </div>
              </div>

              <ul className="flex flex-wrap gap-2 border-t border-blush-dp pt-4">
                {order.items.map((item) => (
                  <li key={item.id} className="chip chip-tinted">
                    {item.productName} × {item.quantity}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
