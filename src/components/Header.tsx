"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { useCart } from "@/components/CartProvider";

const LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/#how", label: "How it works" },
  { href: "/#about", label: "About" },
];

/** Past this many pixels the bar pulls in to a floating pill. */
const MINIMIZE_AFTER = 24;

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { count, pulse } = useCart();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  // Lock background scrolling while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  /**
   * Full-bleed bar at the very top; once you scroll it shrinks into a rounded
   * island floating over the page. It stays put from there — the nav and cart
   * remain one tap away however far down you are.
   */
  useEffect(() => {
    function onScroll() {
      setMinimized(window.scrollY > MINIMIZE_AFTER);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="marquee overflow-hidden bg-ink py-2 text-[0.78rem] text-blush">
        <div className="marquee-track flex w-max whitespace-nowrap font-display font-medium [animation-duration:34s]">
          {[0, 1].map((i) => (
            <span key={i} className="px-3">
              ✿ free shipping over ₹999 ✿ hand poured in tiny batches ✿ 100% soy wax ✿ cruelty free ✿
              packed with a little note ✿ made to be gifted&nbsp;
            </span>
          ))}
        </div>
      </div>

      <header className="sticky top-0 z-50">
        {/* Full-width frosted backing at the top; steps aside once minimized. */}
        <div
          className={`transition-all duration-500 ${
            minimized ? "bg-transparent px-3 pt-3 backdrop-blur-0" : "glass px-0 pt-0"
          }`}
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        >
          <div
            className={`mx-auto flex items-center justify-between gap-4 transition-all duration-500 ${
              minimized
                ? "max-w-[1120px] rounded-[28px] border border-white/80 bg-white/85 px-5 py-2 shadow-[0_18px_44px_-22px_rgba(160,60,90,0.6)] backdrop-blur-xl"
                : "max-w-[1180px] rounded-none border border-transparent px-[clamp(1.15rem,4vw,2.5rem)] py-3"
            }`}
            style={{ transitionTimingFunction: "var(--ease-out)" }}
          >
            <span
              className={`inline-block origin-left transition-transform duration-500 ${
                minimized ? "scale-[0.86]" : "scale-100"
              }`}
              style={{ transitionTimingFunction: "var(--ease-out)" }}
            >
              <BrandLogo variant="wordmark" size="md" />
            </span>

            <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
              {LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-full px-3.5 py-2 font-display text-[0.98rem] font-medium no-underline transition-colors duration-200 hover:bg-blush hover:text-flame ${
                      active ? "bg-blush text-flame" : "text-ink"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <CartLink count={count} pulse={pulse} />

              {session ? (
                <>
                  {session.user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="rounded-full px-3.5 py-2 font-display font-medium text-ink no-underline transition hover:bg-blush hover:text-flame"
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/orders"
                    className="rounded-full px-3.5 py-2 font-display font-medium text-ink no-underline transition hover:bg-blush hover:text-flame"
                  >
                    Orders
                  </Link>
                  <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="btn btn-sm ml-1">
                    Sign out
                  </button>
                </>
              ) : (
                <Link href="/login" className="btn btn-sm ml-1">
                  Sign in <span aria-hidden="true">♥</span>
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-1 md:hidden">
              <CartLink count={count} pulse={pulse} compact />
              <button
                type="button"
                className="grid h-11 w-11 place-items-center rounded-full transition hover:bg-blush"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
              >
                <span className="relative block h-4 w-6">
                  <span
                    className={`absolute left-0 block h-0.5 w-6 rounded bg-ink transition-all duration-300 ${
                      open ? "top-1/2 rotate-45" : "top-0"
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-1/2 block h-0.5 w-6 -translate-y-1/2 rounded bg-ink transition-all duration-200 ${
                      open ? "scale-x-0 opacity-0" : ""
                    }`}
                  />
                  <span
                    className={`absolute left-0 block h-0.5 w-6 rounded bg-ink transition-all duration-300 ${
                      open ? "top-1/2 -rotate-45" : "top-full"
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer — hugs the pill's shape once minimized. */}
        <div
          className={`grid transition-all duration-500 md:hidden ${
            minimized ? "mx-3 mt-2 overflow-hidden rounded-[26px]" : "overflow-hidden"
          } ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        >
          <nav
            className={`min-h-0 bg-blush/95 backdrop-blur ${minimized ? "" : "border-t border-blush-dp"}`}
            aria-label="Mobile"
          >
            <div className={`flex flex-col gap-1 py-4 ${minimized ? "px-4" : "shell"}`}>
              {LINKS.map((link, i) => (
                <MobileLink key={link.href} href={link.href} index={i} open={open} onNavigate={close}>
                  {link.label}
                </MobileLink>
              ))}
              <MobileLink href="/cart" index={LINKS.length} open={open} onNavigate={close}>
                Cart {count > 0 ? `(${count})` : ""}
              </MobileLink>
              {session ? (
                <>
                  {session.user.role === "ADMIN" && (
                    <MobileLink href="/admin" index={LINKS.length + 1} open={open} onNavigate={close}>
                      Admin
                    </MobileLink>
                  )}
                  <MobileLink href="/orders" index={LINKS.length + 2} open={open} onNavigate={close}>
                    Your orders
                  </MobileLink>
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      signOut({ callbackUrl: "/" });
                    }}
                    className="btn btn-sm mt-3 w-fit"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={close} className="btn btn-sm mt-3 w-fit">
                  Sign in <span aria-hidden="true">♥</span>
                </Link>
              )}
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}

function MobileLink({
  href,
  children,
  index,
  open,
  onNavigate,
}: {
  href: string;
  children: React.ReactNode;
  index: number;
  open: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="rounded-2xl px-3 py-3 font-display text-lg no-underline transition-all duration-300 hover:bg-white"
      style={{
        transitionDelay: open ? `${80 + index * 45}ms` : "0ms",
        opacity: open ? 1 : 0,
        transform: open ? "none" : "translateX(-10px)",
      }}
    >
      {children}
    </Link>
  );
}

function CartLink({ count, pulse, compact = false }: { count: number; pulse: number; compact?: boolean }) {
  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
      className={`group relative grid h-11 w-11 place-items-center rounded-full font-display font-medium text-ink no-underline transition hover:bg-blush hover:text-flame ${
        compact ? "" : "md:ml-1"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[22px] w-[22px] transition-transform duration-300 group-hover:scale-110"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Handle */}
        <path d="M4.5 6.5 7 9.2" />
        {/* Basket rim */}
        <path d="M7 9.2h12.5" />
        {/* Trapezoid basket body */}
        <path d="M8.2 9.2 9.6 17.2h7.6L18.6 9.2" />
        {/* Wheels */}
        <circle cx="10.6" cy="19.2" r="1.15" />
        <circle cx="16.2" cy="19.2" r="1.15" />
      </svg>
      {count > 0 && (
        <span
          key={pulse}
          className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-flame px-1 font-display text-[0.68rem] font-bold text-white [animation:count-pop_0.45s_var(--ease-pop)]"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
