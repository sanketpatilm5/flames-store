"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import type { CartLine } from "@/lib/cart";

type Toast = { id: number; message: string; tone: "ok" | "error" };

type CartContextValue = {
  items: CartLine[];
  count: number;
  subtotal: number;
  loading: boolean;
  /** Bumps every time an item lands in the cart — drives the badge pop. */
  pulse: number;
  refresh: () => Promise<void>;
  add: (productId: string, quantity?: number, name?: string) => Promise<boolean>;
  setQuantity: (productId: string, quantity: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  notify: (message: string, tone?: "ok" | "error") => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [items, setItems] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [pulse, setPulse] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const notify = useCallback((message: string, tone: "ok" | "error" = "ok") => {
    const id = ++toastId.current;
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.items ?? []);
    } catch {
      /* offline or aborted — keep whatever we already have */
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-sync on navigation so server-side changes (checkout, sign in) show up.
  // Written out rather than calling refresh() so the request aborts when the
  // reader navigates again mid-flight.
  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/cart", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setItems(data.items ?? []);
        setLoading(false);
      })
      .catch(() => {
        /* aborted or offline — keep whatever we already have */
      });

    return () => controller.abort();
  }, [pathname]);

  const add = useCallback(
    async (productId: string, quantity = 1, name?: string) => {
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        });
        const data = await res.json();
        if (!res.ok) {
          notify(typeof data.error === "string" ? data.error : "Could not add that", "error");
          return false;
        }
        setItems(data.items ?? []);
        setPulse((n) => n + 1);
        notify(name ? `${name} added ♥` : "Added to your cart ♥");
        return true;
      } catch {
        notify("Something went wrong", "error");
        return false;
      }
    },
    [notify],
  );

  const setQuantity = useCallback(async (productId: string, quantity: number) => {
    const res = await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    const data = await res.json();
    if (res.ok) setItems(data.items ?? []);
  }, []);

  const remove = useCallback(
    async (productId: string) => {
      const res = await fetch(`/api/cart?productId=${productId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setItems(data.items ?? []);
        notify("Removed from cart");
      }
    },
    [notify],
  );

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    return { items, count, subtotal, loading, pulse, refresh, add, setQuantity, remove, notify };
  }, [items, loading, pulse, refresh, add, setQuantity, remove, notify]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex flex-col items-center gap-2 px-4"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.tone === "error" ? "toast-error" : ""}`}>
            <span aria-hidden="true" className="text-lg">
              {toast.tone === "error" ? "✕" : "🕯️"}
            </span>
            {toast.message}
          </div>
        ))}
      </div>
    </CartContext.Provider>
  );
}
