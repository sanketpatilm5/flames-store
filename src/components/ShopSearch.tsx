"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "name", label: "A–Z" },
  { value: "price-asc", label: "₹ low → high" },
  { value: "price-desc", label: "₹ high → low" },
];

export function ShopSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQ = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "newest";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const inStock = searchParams.get("inStock") === "true";

  const [q, setQ] = useState(currentQ);
  const firstRender = useRef(true);

  // When the URL's `q` changes from somewhere else — back/forward, "Clear all",
  // a removed filter chip — pull the box back in line. Adjusting during render
  // rather than in an effect avoids a second render pass.
  const [syncedQ, setSyncedQ] = useState(currentQ);
  if (currentQ !== syncedQ) {
    setSyncedQ(currentQ);
    setQ(currentQ);
  }

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      }
      const query = params.toString();
      startTransition(() => {
        router.push(query ? `/shop?${query}` : "/shop", { scroll: false });
      });
    },
    [router, searchParams],
  );

  // Search as you type, once typing settles.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (q === currentQ) return;
    const timer = window.setTimeout(() => updateParams({ q: q.trim() || null }), 350);
    return () => window.clearTimeout(timer);
  }, [q, currentQ, updateParams]);

  const activeFilters = [
    currentQ && { key: "q", label: `“${currentQ}”` },
    minPrice && { key: "minPrice", label: `min ₹${minPrice}` },
    maxPrice && { key: "maxPrice", label: `max ₹${maxPrice}` },
    inStock && { key: "inStock", label: "in stock" },
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <div className="panel panel-pad mb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <span
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <input
            type="search"
            className="input pl-11 pr-11"
            placeholder="Search melts, scents, shapes…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search products"
          />
          {isPending && (
            <span
              className="spinner absolute right-4 top-1/2 -translate-y-1/2 text-flame"
              aria-hidden="true"
            />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Sort products">
          {SORTS.map((option) => {
            const active = sort === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateParams({ sort: option.value === "newest" ? null : option.value })}
                aria-pressed={active}
                className={`rounded-full px-3.5 py-2 font-display text-sm font-semibold transition duration-200 ${
                  active
                    ? "bg-flame text-white shadow-[0_8px_18px_-10px_rgba(232,56,79,0.9)]"
                    : "bg-blush text-ink-soft hover:bg-blush-dp hover:text-ink"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-4 border-t border-blush-dp pt-4">
        <div>
          <label htmlFor="minPrice" className="label">
            Min ₹
          </label>
          <input
            id="minPrice"
            type="number"
            min={0}
            className="input w-28"
            defaultValue={minPrice}
            onBlur={(e) => updateParams({ minPrice: e.target.value || null })}
          />
        </div>
        <div>
          <label htmlFor="maxPrice" className="label">
            Max ₹
          </label>
          <input
            id="maxPrice"
            type="number"
            min={0}
            className="input w-28"
            defaultValue={maxPrice}
            onBlur={(e) => updateParams({ maxPrice: e.target.value || null })}
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 pb-2.5 font-display text-sm">
          <input
            type="checkbox"
            className="check"
            checked={inStock}
            onChange={(e) => updateParams({ inStock: e.target.checked ? "true" : null })}
          />
          In stock only
        </label>

        {activeFilters.length > 0 && (
          <div className="flex flex-1 flex-wrap items-center justify-end gap-2 pb-2">
            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => updateParams({ [filter.key]: null })}
                className="chip chip-tinted transition hover:bg-bubble-lt"
                aria-label={`Remove filter ${filter.label}`}
              >
                {filter.label} <span aria-hidden="true">×</span>
              </button>
            ))}
            <button
              type="button"
              className="font-display text-sm font-semibold text-flame underline-offset-4 hover:underline"
              onClick={() => {
                setQ("");
                startTransition(() => router.push("/shop", { scroll: false }));
              }}
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
