"use client";

import { useEffect, useState } from "react";

const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Floating back-to-top button with a ring that tracks reading progress. */
export function ScrollTop() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;

    function onScroll() {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const y = window.scrollY;
        setProgress(scrollable > 0 ? Math.min(1, y / scrollable) : 0);
        setVisible(y > 500);
      });
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={`fixed bottom-6 right-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-white text-flame shadow-[0_16px_36px_-16px_rgba(160,60,90,0.55)] transition duration-300 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      } hover:-translate-y-1`}
    >
      <svg viewBox="0 0 48 48" className="absolute inset-0 h-12 w-12 -rotate-90" aria-hidden="true">
        <circle cx="24" cy="24" r={RADIUS} fill="none" stroke="var(--color-blush-dp)" strokeWidth="3" />
        <circle
          cx="24"
          cy="24"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
        />
      </svg>
      <span aria-hidden="true" className="relative text-lg leading-none">
        ↑
      </span>
    </button>
  );
}
