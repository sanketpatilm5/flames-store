"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";

type AddToCartButtonProps = {
  productId: string;
  productName?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  /** Show the −/+ stepper next to the button (product page). */
  withQuantity?: boolean;
  maxQuantity?: number;
};

export function AddToCartButton({
  productId,
  productName,
  disabled,
  className = "btn",
  label = "Add to cart",
  withQuantity = false,
  maxQuantity = 20,
}: AddToCartButtonProps) {
  const router = useRouter();
  const { add } = useCart();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const cap = Math.max(1, Math.min(maxQuantity, 20));

  async function handleAdd() {
    setLoading(true);
    const ok = await add(productId, quantity, productName);
    setLoading(false);
    if (ok) {
      setDone(true);
      window.setTimeout(() => setDone(false), 1600);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {withQuantity && !disabled && (
        <div className="flex items-center gap-1 rounded-full bg-white p-1 shadow-[var(--shadow-soft)]">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="grid h-9 w-9 place-items-center rounded-full font-display text-lg transition hover:bg-blush disabled:opacity-40"
          >
            −
          </button>
          <span className="min-w-8 text-center font-display font-semibold" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(cap, q + 1))}
            disabled={quantity >= cap}
            aria-label="Increase quantity"
            className="grid h-9 w-9 place-items-center rounded-full font-display text-lg transition hover:bg-blush disabled:opacity-40"
          >
            +
          </button>
        </div>
      )}

      <button
        type="button"
        className={className}
        disabled={disabled || loading}
        onClick={handleAdd}
      >
        {loading ? (
          <>
            <span className="spinner" aria-hidden="true" /> Adding…
          </>
        ) : done ? (
          <>
            <span aria-hidden="true">✓</span> In your cart
          </>
        ) : (
          <>
            {label}
            {!disabled && <span aria-hidden="true">♥</span>}
          </>
        )}
      </button>
    </div>
  );
}
