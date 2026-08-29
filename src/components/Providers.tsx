"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/components/CartProvider";
import { VisitorTracker } from "@/components/VisitorTracker";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <VisitorTracker />
      </CartProvider>
    </SessionProvider>
  );
}
