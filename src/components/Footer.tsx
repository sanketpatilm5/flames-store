import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All melts" },
      { href: "/shop?sort=price-asc", label: "Best value" },
      { href: "/shop?inStock=true", label: "In stock now" },
      { href: "/cart", label: "Your cart" },
    ],
  },
  {
    title: "Good to know",
    links: [
      { href: "/#how", label: "How a melt works" },
      { href: "/#about", label: "About Flames" },
      { href: "/#faq", label: "Questions" },
      { href: "/orders", label: "Track an order" },
    ],
  },
];

const PROMISES = ["100% soy wax", "Cruelty free", "Small batch", "Gift ready"];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-blush-dp bg-cream/80">
      <div className="dots absolute inset-x-0 top-0 h-24 opacity-30" aria-hidden="true" />

      <div className="shell relative py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <BrandLogo variant="wordmark" size="sm" linked={false} />
            <p className="mt-3 max-w-xs text-ink-soft">
              Teeny soy wax melts, hand poured in small batches — strawberries, stars, ghosts,
              coffee beans and orange slices.
            </p>
            <p className="script mt-4 text-xl text-flame">
              hand poured with love <span className="inline-block animate-heartbeat">♥</span>
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {PROMISES.map((promise) => (
                <li key={promise} className="chip chip-tinted text-[0.72rem]">
                  {promise}
                </li>
              ))}
            </ul>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="mb-3 font-display text-sm uppercase tracking-[0.16em] text-ink-soft">
                {column.title}
              </h3>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="link-swipe font-display text-[0.98rem] text-ink transition-colors hover:text-flame"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col-reverse items-center gap-4 border-t border-blush-dp pt-6 text-sm text-ink-soft md:flex-row md:justify-between">
          <p>© {year} Flames · Soy Wax Candles · Hand Poured With Love</p>
          <p className="flex items-center gap-2">
            <span aria-hidden="true">🕯️</span> Made in tiny batches, packed by hand
          </p>
        </div>
      </div>
    </footer>
  );
}
