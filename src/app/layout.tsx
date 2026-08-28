import type { Metadata, Viewport } from "next";
import { Fredoka, Pacifico, Quicksand } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { ScrollTop } from "@/components/ScrollTop";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  weight: ["400", "500", "600", "700"],
});

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  weight: ["400", "500", "600", "700"],
});

const pacifico = Pacifico({
  subsets: ["latin"],
  variable: "--font-pacifico",
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "Flames — Soy Wax Candles, Hand Poured With Love",
    template: "%s · Flames",
  },
  description:
    "Teeny hand-poured soy wax melts shaped like strawberries, stars, ghosts, coffee beans and orange slices.",
  icons: { icon: "/logo/flames-badge.png", apple: "/logo/flames-badge.png" },
};

export const viewport: Viewport = {
  themeColor: "#fff0f4",
};

// E-commerce pages read from the database — skip static generation at build time
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${fredoka.variable} ${quicksand.variable} ${pacifico.variable} flex min-h-screen flex-col antialiased`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:font-display focus:shadow"
        >
          Skip to content
        </a>
        <Providers>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <ScrollTop />
        </Providers>
      </body>
    </html>
  );
}
