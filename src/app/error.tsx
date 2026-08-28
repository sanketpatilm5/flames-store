"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="section-y">
      <div className="shell max-w-lg text-center">
        <p className="mb-2 animate-wiggle text-7xl" aria-hidden="true">
          🫠
        </p>
        <p className="eyebrow w-full justify-center">something went wrong</p>
        <h1 className="mb-3 text-[clamp(1.8rem,1.3rem+2.2vw,2.6rem)]">
          That got a little <span className="script text-gradient">too warm</span>
        </h1>
        <p className="mb-8 text-ink-soft">
          Sorry — something broke on our side. Give it another try in a moment.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn">
            Try again
          </button>
          <Link href="/" className="btn btn-ghost">
            Back home
          </Link>
        </div>
        {error.digest && (
          <p className="mt-6 font-display text-xs text-ink-faint">Reference: {error.digest}</p>
        )}
      </div>
    </section>
  );
}
