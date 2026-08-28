import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { runQuery } from "@/lib/runtime-db";
import { formatPrice } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/OrderStatusSelect";

type PageProps = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await runQuery(
    () =>
      db.order.findUnique({
        where: { id },
        include: { items: true, user: { select: { email: true, name: true } } },
      }),
    null,
  );
  if (!order) notFound();

  return (
    <div>
      <Link href="/admin/orders" className="mb-4 inline-block text-sm text-ink-soft no-underline hover:text-flame">← Orders</Link>
      <div className="rounded-[22px] bg-white p-8 shadow">
        <div className="mb-6 flex flex-wrap justify-between gap-4">
          <div>
            <h1 className="text-2xl">{order.orderNumber}</h1>
            <p className="text-ink-soft">{order.user.name ?? order.user.email}</p>
          </div>
          <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
        </div>

        <ul className="mb-6 space-y-2 border-b border-blush-dp pb-6">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span>{item.productName} × {item.quantity}</span>
              <span>{formatPrice(item.total)}</span>
            </li>
          ))}
        </ul>

        <p className="price text-xl">Total: {formatPrice(order.total)}</p>

        <address className="mt-6 not-italic text-sm text-ink-soft">
          <strong className="font-display text-ink">Ship to:</strong><br />
          {order.shippingName}<br />
          {order.shippingLine1}<br />
          {order.shippingCity}, {order.shippingState} {order.shippingPostal}<br />
          {order.shippingPhone}
        </address>
      </div>
    </div>
  );
}
