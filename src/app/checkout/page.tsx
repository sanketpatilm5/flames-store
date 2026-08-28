"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatPrice, calculateShipping } from "@/lib/utils";
import { useCart } from "@/components/CartProvider";

const STEPS = ["Cart", "Details", "Done"];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, loading } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    notes: "",
    saveAddress: true,
  });

  // Nothing to check out — send them back to pick something.
  useEffect(() => {
    if (!loading && items.length === 0 && !submitting) router.push("/cart");
  }, [loading, items.length, submitting, router]);

  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Checkout failed");
      router.push(`/orders/${data.order.orderNumber}?success=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <section className="section-y-sm">
        <div className="shell max-w-[1000px]">
          <div className="skeleton mb-8 h-10 w-52" />
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="skeleton h-[520px] rounded-[26px]" />
            <div className="skeleton h-72 rounded-[26px]" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-y-sm">
      <div className="shell max-w-[1000px]">
        {/* step trail */}
        <ol className="mb-8 flex items-center gap-2 font-display text-sm">
          {STEPS.map((step, i) => {
            const state = i < 1 ? "done" : i === 1 ? "current" : "todo";
            return (
              <li key={step} className="flex items-center gap-2">
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                    state === "done"
                      ? "bg-flame text-white"
                      : state === "current"
                        ? "bg-flame text-white ring-4 ring-bubble-lt/60"
                        : "bg-blush-dp text-ink-faint"
                  }`}
                >
                  {state === "done" ? "✓" : i + 1}
                </span>
                <span className={state === "todo" ? "text-ink-faint" : "text-ink"}>{step}</span>
                {i < STEPS.length - 1 && (
                  <span className="mx-1 h-px w-6 bg-blush-dp sm:w-12" aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ol>

        <h1 className="mb-2 text-[clamp(1.95rem,1.35rem+2.5vw,3.05rem)]">
          Almost <span className="script text-gradient">yours</span>
        </h1>
        <p className="mb-8 text-ink-soft">Demo payment — no real charge will be made.</p>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
          <form onSubmit={handleSubmit} className="panel panel-pad space-y-6">
            <div>
              <h2 className="mb-4 font-display text-lg">
                <span aria-hidden="true">📦</span> Where should we send it?
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="label">
                    Full name
                  </label>
                  <input
                    id="name"
                    className="input"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="label">
                    Mobile
                  </label>
                  <input
                    id="phone"
                    className="input"
                    required
                    inputMode="numeric"
                    pattern="[6-9][0-9]{9}"
                    placeholder="10-digit number"
                    autoComplete="tel-national"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="postalCode" className="label">
                    PIN code
                  </label>
                  <input
                    id="postalCode"
                    className="input"
                    required
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    autoComplete="postal-code"
                    value={form.postalCode}
                    onChange={(e) => update("postalCode", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="line1" className="label">
                    Address line 1
                  </label>
                  <input
                    id="line1"
                    className="input"
                    required
                    autoComplete="address-line1"
                    value={form.line1}
                    onChange={(e) => update("line1", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="line2" className="label">
                    Address line 2 <span className="font-normal text-ink-faint">(optional)</span>
                  </label>
                  <input
                    id="line2"
                    className="input"
                    autoComplete="address-line2"
                    value={form.line2}
                    onChange={(e) => update("line2", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="city" className="label">
                    City
                  </label>
                  <input
                    id="city"
                    className="input"
                    required
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="state" className="label">
                    State
                  </label>
                  <input
                    id="state"
                    className="input"
                    required
                    autoComplete="address-level1"
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="notes" className="label">
                    A note for us <span className="font-normal text-ink-faint">(optional)</span>
                  </label>
                  <textarea
                    id="notes"
                    className="input min-h-20 resize-y"
                    placeholder="Gift wrap? A message on the card?"
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                  />
                </div>
              </div>

              <label className="mt-4 flex cursor-pointer items-center gap-2.5 font-display text-sm">
                <input
                  type="checkbox"
                  className="check"
                  checked={form.saveAddress}
                  onChange={(e) => update("saveAddress", e.target.checked)}
                />
                Save this address for next time
              </label>
            </div>

            <div className="rounded-[20px] border-2 border-dashed border-bubble-lt bg-blush/60 p-5">
              <p className="font-display font-semibold">
                <span aria-hidden="true">🧾</span> Demo payment
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                Placing the order simulates a successful payment. No payment provider is connected
                yet, and no card details are collected.
              </p>
            </div>

            {error && (
              <p className="rounded-2xl bg-flame/10 px-4 py-3 text-sm font-semibold text-flame" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="btn btn-lg w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spinner" aria-hidden="true" /> Placing order…
                </>
              ) : (
                <>Place order · {formatPrice(total)}</>
              )}
            </button>
          </form>

          <aside className="panel panel-pad h-fit lg:sticky lg:top-28">
            <h2 className="mb-4 font-display text-lg">Your order</h2>
            <ul className="mb-4 space-y-3 border-b border-blush-dp pb-4">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center gap-3">
                  <span
                    className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[12px]"
                    style={{ background: `${item.product.accentColor}22` }}
                  >
                    <Image
                      src={item.product.imageUrl}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                    <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-flame text-[0.65rem] font-bold text-white">
                      {item.quantity}
                    </span>
                  </span>
                  <span className="flex-1 text-sm">{item.product.name}</span>
                  <span className="font-display text-sm font-semibold">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

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

            <Link
              href="/cart"
              className="mt-4 block text-center font-display text-sm text-ink-soft no-underline transition hover:text-flame"
            >
              ← Back to cart
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
