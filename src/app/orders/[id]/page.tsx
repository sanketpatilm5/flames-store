import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { runQuery } from "@/lib/runtime-db";
import { formatPrice } from "@/lib/utils";
import { Confetti } from "@/components/Confetti";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
};

const TIMELINE = [
  { key: "PAID", label: "Paid", icon: "💳" },
  { key: "PROCESSING", label: "Being poured", icon: "🕯️" },
  { key: "SHIPPED", label: "On its way", icon: "🚚" },
  { key: "DELIVERED", label: "Delivered", icon: "🏠" },
];

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return { title: `Order ${id}` };
}

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params, searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) notFound();

  const { id } = await params;
  const { success } = await searchParams;

  const order = await runQuery(
    () =>
      db.order.findFirst({
        where: {
          OR: [{ id }, { orderNumber: id }],
          ...(session.user.role === "ADMIN" ? {} : { userId: session.user.id }),
        },
        include: { items: true },
      }),
    null,
  );

  if (!order) notFound();

  const cancelled = order.status === "CANCELLED";
  const currentStep = TIMELINE.findIndex((step) => step.key === order.status);

  return (
    <section className="section-y-sm">
      <div className="shell max-w-[760px]">
        {success === "1" && (
          <div className="relative mb-6 overflow-hidden rounded-[26px] bg-cream p-8 text-center shadow-[var(--shadow-lift)]">
            <Confetti />
            <p className="relative mb-1 text-5xl" aria-hidden="true">
              🎉
            </p>
            <p className="script relative text-3xl text-flame">Order placed!</p>
            <p className="relative mt-2 text-ink-soft">
              Thank you — we&apos;ll pack your melts with care and a little note.
            </p>
          </div>
        )}

        <div className="panel panel-pad">
          <Link
            href="/orders"
            className="mb-4 inline-block font-display text-sm text-ink-soft no-underline transition hover:text-flame"
          >
            ← All orders
          </Link>

          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="mb-1 text-3xl">{order.orderNumber}</h1>
              <p className="text-sm text-ink-soft">
                Placed on {new Date(order.createdAt).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`pill pill-${order.status.toLowerCase()}`}>
                {order.status.toLowerCase()}
              </span>
              <span className={`pill pill-${order.paymentStatus.toLowerCase()}`}>
                payment {order.paymentStatus.toLowerCase()} (demo)
              </span>
            </div>
          </div>

          {/* progress trail */}
          {!cancelled && (
            <ol className="mb-8 grid grid-cols-4 gap-2 rounded-[20px] bg-blush/70 p-4">
              {TIMELINE.map((step, i) => {
                const reached = currentStep >= i;
                return (
                  <li key={step.key} className="text-center">
                    <span
                      className={`mx-auto mb-2 grid h-11 w-11 place-items-center rounded-full text-lg transition ${
                        reached
                          ? "bg-flame text-white shadow-[0_8px_18px_-10px_rgba(232,56,79,0.9)]"
                          : "bg-white text-ink-faint"
                      }`}
                      aria-hidden="true"
                    >
                      {step.icon}
                    </span>
                    <span
                      className={`font-display text-xs ${reached ? "text-ink" : "text-ink-faint"}`}
                    >
                      {step.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}

          <h2 className="mb-3 font-display text-lg">Items</h2>
          <ul className="mb-6 space-y-2 border-b border-blush-dp pb-6">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3 text-sm">
                <span>
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="no-underline transition hover:text-flame"
                  >
                    {item.productName}
                  </Link>{" "}
                  <span className="text-ink-soft">× {item.quantity}</span>
                </span>
                <span className="font-display font-semibold">{formatPrice(item.total)}</span>
              </li>
            ))}
          </ul>

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-blush-dp pt-3 font-display text-lg font-semibold">
              <dt>Total</dt>
              <dd className="price">{formatPrice(order.total)}</dd>
            </div>
          </dl>

          <h2 className="mb-3 mt-8 font-display text-lg">Shipping to</h2>
          <address className="rounded-[18px] bg-blush/60 p-4 text-sm not-italic text-ink-soft">
            <span className="font-display font-semibold text-ink">{order.shippingName}</span>
            <br />
            {order.shippingLine1}
            <br />
            {order.shippingLine2 && (
              <>
                {order.shippingLine2}
                <br />
              </>
            )}
            {order.shippingCity}, {order.shippingState} {order.shippingPostal}
            <br />
            {order.shippingPhone}
          </address>

          {order.notes && (
            <>
              <h2 className="mb-2 mt-6 font-display text-lg">Your note</h2>
              <p className="script text-lg text-flame">&ldquo;{order.notes}&rdquo;</p>
            </>
          )}

          <Link href="/shop" className="btn mt-8">
            Shop again <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
