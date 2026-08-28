import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { redirect } from "next/navigation";
import { Reveal } from "@/components/Reveal";

export const metadata = { title: "Your orders" };

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/orders");

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="section-y-sm">
      <div className="shell max-w-[900px]">
        <h1 className="mb-2 text-[clamp(1.95rem,1.35rem+2.5vw,3.05rem)]">
          Your <span className="script text-gradient">orders</span>
        </h1>
        <p className="mb-8 text-ink-soft">
          {orders.length === 0
            ? "Nothing here yet."
            : `${orders.length} order${orders.length !== 1 ? "s" : ""} so far — thank you ♥`}
        </p>

        {orders.length === 0 ? (
          <div className="panel panel-pad mx-auto max-w-md py-14 text-center">
            <p className="mb-3 text-6xl" aria-hidden="true">
              📦
            </p>
            <p className="font-display text-xl">No orders yet</p>
            <p className="mt-2 text-ink-soft">Your first pouch is waiting to be picked.</p>
            <Link href="/shop" className="btn mt-6">
              Start shopping <span aria-hidden="true">→</span>
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((order, i) => (
              <Reveal
                as="li"
                key={order.id}
                delay={Math.min(i, 6) * 70}
                className="panel panel-pad transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/orders/${order.orderNumber}`}
                      className="font-display text-lg font-semibold no-underline transition hover:text-flame"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="text-sm text-ink-soft">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="price">{formatPrice(order.total)}</span>
                    <p className="mt-1">
                      <span className={`pill pill-${order.status.toLowerCase()}`}>
                        {order.status.toLowerCase()}
                      </span>
                    </p>
                  </div>
                </div>

                <ul className="flex flex-wrap gap-2 border-t border-blush-dp pt-4">
                  {order.items.map((item) => (
                    <li key={item.id} className="chip chip-tinted">
                      {item.productName} × {item.quantity}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/orders/${order.orderNumber}`}
                  className="mt-4 inline-block font-display text-sm font-semibold text-flame no-underline"
                >
                  View details →
                </Link>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
