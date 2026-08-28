"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice, calculateShipping, FREE_SHIPPING_THRESHOLD_PAISE } from "@/lib/utils";
import { useCart } from "@/components/CartProvider";

export default function CartPage() {
  const { items, subtotal, loading, setQuantity, remove } = useCart();
  const [busy, setBusy] = useState<string | null>(null);

  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD_PAISE - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD_PAISE) * 100);

  async function run(productId: string, action: () => Promise<void>) {
    setBusy(productId);
    await action();
    setBusy(null);
  }

  if (loading) {
    return (
      <section className="section-y-sm">
        <div className="shell max-w-[900px]">
          <div className="skeleton mb-8 h-10 w-56" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-[26px]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-y-sm">
      <div className="shell max-w-[980px]">
        <h1 className="mb-2 text-[clamp(1.95rem,1.35rem+2.5vw,3.05rem)]">
          Your <span className="script text-gradient">cart</span>
        </h1>
        <p className="mb-8 text-ink-soft">
          {items.length === 0
            ? "Nothing in here yet."
            : `${items.length} kind${items.length !== 1 ? "s" : ""} of melt, waiting to be warmed.`}
        </p>

        {items.length === 0 ? (
          <div className="panel panel-pad mx-auto max-w-md py-14 text-center">
            <p className="mb-3 text-6xl" aria-hidden="true">
              🧺
            </p>
            <p className="font-display text-xl">Your cart is empty</p>
            <p className="mt-2 text-ink-soft">Let&apos;s find something that smells lovely.</p>
            <Link href="/shop" className="btn mt-6">
              Browse melts <span aria-hidden="true">→</span>
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
            <ul className="space-y-4">
              {items.map((item, i) => {
                const isBusy = busy === item.productId;
                return (
                  <li
                    key={item.productId}
                    className="panel flex gap-4 p-4 transition-opacity duration-200"
                    style={{
                      opacity: isBusy ? 0.55 : 1,
                      animation: `pop-in 0.4s var(--ease-pop) ${i * 60}ms both`,
                    }}
                  >
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[18px]"
                      style={{ background: `${item.product.accentColor}22` }}
                    >
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        sizes="112px"
                        className="object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </Link>

                    <div className="flex flex-1 flex-col">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="font-display text-lg font-semibold no-underline transition hover:text-flame"
                        >
                          {item.product.name}
                        </Link>
                        <span className="price">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>

                      <p className="text-sm text-ink-soft">
                        {formatPrice(item.product.price)} each
                      </p>

                      <div className="mt-auto flex flex-wrap items-center gap-3 pt-3">
                        <div className="flex items-center gap-1 rounded-full bg-blush p-1">
                          <button
                            type="button"
                            className="grid h-8 w-8 place-items-center rounded-full font-display text-lg transition hover:bg-white disabled:opacity-40"
                            disabled={isBusy}
                            onClick={() =>
                              run(item.productId, () =>
                                setQuantity(item.productId, item.quantity - 1),
                              )
                            }
                            aria-label={`Decrease quantity of ${item.product.name}`}
                          >
                            −
                          </button>
                          <span className="min-w-8 text-center font-display font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="grid h-8 w-8 place-items-center rounded-full font-display text-lg transition hover:bg-white disabled:opacity-40"
                            disabled={isBusy || item.quantity >= item.product.stock}
                            onClick={() =>
                              run(item.productId, () =>
                                setQuantity(item.productId, item.quantity + 1),
                              )
                            }
                            aria-label={`Increase quantity of ${item.product.name}`}
                          >
                            +
                          </button>
                        </div>

                        {item.quantity >= item.product.stock && (
                          <span className="text-xs text-ink-soft">
                            that&apos;s all we have right now
                          </span>
                        )}

                        <button
                          type="button"
                          className="ml-auto font-display text-sm text-ink-soft underline-offset-4 transition hover:text-flame hover:underline"
                          disabled={isBusy}
                          onClick={() => run(item.productId, () => remove(item.productId))}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <aside className="panel panel-pad h-fit lg:sticky lg:top-28">
              <h2 className="mb-4 font-display text-lg">Order summary</h2>

              <div className="mb-5">
                <div className="meter" role="presentation">
                  <span style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-2 text-xs text-ink-soft">
                  {remaining === 0 ? (
                    <>
                      <span aria-hidden="true">🎉</span> You&apos;ve unlocked free shipping!
                    </>
                  ) : (
                    <>
                      Add {formatPrice(remaining)} more for <b>free shipping</b>
                    </>
                  )}
                </p>
              </div>

              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd>{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Shipping</dt>
                  <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
                </div>
                <div className="flex justify-between border-t border-blush-dp pt-3 font-display text-base font-semibold">
                  <dt>Total</dt>
                  <dd className="price">{formatPrice(total)}</dd>
                </div>
              </dl>

              <Link href="/checkout" className="btn mt-6 w-full">
                Checkout <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/shop"
                className="mt-3 block text-center font-display text-sm text-ink-soft no-underline transition hover:text-flame"
              >
                Continue shopping
              </Link>

              <ul className="mt-6 space-y-2 border-t border-blush-dp pt-4 text-xs text-ink-soft">
                <li>
                  <span aria-hidden="true">🌱</span> 100% soy wax, always
                </li>
                <li>
                  <span aria-hidden="true">📦</span> Packed by hand within 2 days
                </li>
                <li>
                  <span aria-hidden="true">💌</span> A little note in every parcel
                </li>
              </ul>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
