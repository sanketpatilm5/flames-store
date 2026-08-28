import Link from "next/link";
import { Blobs, Sparkles } from "@/components/Decor";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <section className="section-y relative overflow-hidden">
      <Blobs
        specs={[
          { color: "#ffb6cd", size: "340px", top: "-8%", left: "-8%", opacity: 0.5 },
          { color: "#b3a2f2", size: "280px", bottom: "-10%", right: "-8%", opacity: 0.3, delay: "-7s" },
        ]}
      />
      <Sparkles
        specs={[
          { top: "18%", left: "18%", size: "20px" },
          { top: "30%", left: "80%", size: "14px", color: "#f87ca4", delay: "-1.2s" },
        ]}
      />

      <div className="shell max-w-lg text-center">
        <p className="mb-2 animate-bob text-7xl" aria-hidden="true">
          🕯️
        </p>
        <p className="eyebrow w-full justify-center">404</p>
        <h1 className="mb-3 text-[clamp(2rem,1.4rem+2.6vw,3rem)]">
          This one <span className="script text-gradient">melted away</span>
        </h1>
        <p className="mb-8 text-ink-soft">
          The page you were looking for isn&apos;t here. Perhaps something lovely is, though.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn">
            Browse the melts
          </Link>
          <Link href="/" className="btn btn-ghost">
            Back home
          </Link>
        </div>
      </div>
    </section>
  );
}
