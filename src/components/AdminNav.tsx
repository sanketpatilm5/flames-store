"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/products", label: "Products", exact: false },
  { href: "/admin/products/new", label: "Add product", exact: true },
  { href: "/admin/orders", label: "Orders", exact: false },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-1.5" aria-label="Admin">
      {LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3.5 py-1.5 font-display text-sm no-underline transition ${
              active ? "bg-flame text-white" : "text-ink hover:bg-blush hover:text-flame"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
      <Link
        href="/"
        className="ml-auto rounded-full px-3.5 py-1.5 font-display text-sm text-ink-soft no-underline transition hover:text-flame"
      >
        ← Storefront
      </Link>
    </nav>
  );
}
