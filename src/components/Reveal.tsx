"use client";

import { createElement, useCallback, type CSSProperties, type ElementType, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Tag to render. Defaults to a div — pass "li"/"article" to keep markup valid. */
  as?: ElementType;
  className?: string;
  /** Stagger, in milliseconds. */
  delay?: number;
  variant?: "up" | "zoom";
};

/**
 * Fades content in the first time it scrolls into view.
 *
 * The hidden state lives behind `@media (scripting: enabled)` in globals.css,
 * so a reader without JavaScript gets the page as-is rather than a stack of
 * invisible boxes.
 */
export function Reveal({ children, as = "div", className = "", delay = 0, variant = "up" }: RevealProps) {
  // A callback ref (with React 19 cleanup) rather than useRef + useEffect: the
  // observer attaches the moment the node exists and tears itself down on unmount.
  const observe = useCallback((node: HTMLElement | null) => {
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      node.classList.add("is-in");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return createElement(
    as,
    {
      ref: observe,
      className: `${variant === "zoom" ? "reveal-zoom" : "reveal"}${className ? ` ${className}` : ""}`,
      style: delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined,
    },
    children,
  );
}
