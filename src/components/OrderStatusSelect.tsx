"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

type Props = {
  orderId: string;
  currentStatus: string;
};

export function OrderStatusSelect({ orderId, currentStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value;
    setStatus(next);
    setState("saving");

    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });

    if (!res.ok) {
      setState("error");
      setStatus(currentStatus);
      return;
    }

    setState("saved");
    router.refresh();
    window.setTimeout(() => setState("idle"), 1800);
  }

  return (
    <div className="mt-2 flex items-center justify-end gap-2">
      <select
        className="input w-auto px-3 py-1.5 text-xs capitalize"
        value={status}
        onChange={handleChange}
        disabled={state === "saving"}
        aria-label="Update order status"
      >
        {STATUSES.map((option) => (
          <option key={option} value={option}>
            {option.toLowerCase()}
          </option>
        ))}
      </select>
      <span className="min-w-14 font-display text-xs" aria-live="polite">
        {state === "saving" && <span className="text-ink-soft">saving…</span>}
        {state === "saved" && <span className="text-mint">saved ✓</span>}
        {state === "error" && <span className="text-flame">failed</span>}
      </span>
    </div>
  );
}
