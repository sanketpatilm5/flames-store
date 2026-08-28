"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type HeroCard = {
  src: string;
  alt: string;
  name: string;
  href: string;
};

/**
 * Front card first, then the ones behind it — alternating sides so the deck
 * splays out left *and* right instead of leaning one way.
 */
const LAYOUT = [
  { rotate: 0, x: 0, y: 0, scale: 1, z: 40, opacity: 1 },
  { rotate: 8, x: 36, y: -18, scale: 0.94, z: 30, opacity: 1 },
  { rotate: -9, x: -36, y: -30, scale: 0.89, z: 20, opacity: 1 },
  // Everything further back waits in the middle, faded out.
  { rotate: 0, x: 0, y: -40, scale: 0.85, z: 10, opacity: 0 },
];

/** How far you have to drag before the card actually changes. */
const SWIPE_THRESHOLD = 70;
/** Past this, treat the gesture as a drag rather than a tap on the link. */
const DRAG_SLOP = 8;

type Props = {
  cards: HeroCard[];
  /** Milliseconds each card stays in front. */
  interval?: number;
};

/**
 * A hand of photos: three fanned cards with the front one face-on. Cycles on
 * its own, and can be flicked left or right like a real deck. Pauses while
 * you're touching it, and holds still for reduced-motion readers.
 */
export function HeroCardStack({ cards, interval = 3400 }: Props) {
  const [front, setFront] = useState(0);
  const [paused, setPaused] = useState(false);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const reducedMotion = useRef(false);
  const startX = useRef(0);
  const moved = useRef(false);

  const step = useCallback(
    (direction: 1 | -1) => {
      setFront((current) => (current + direction + cards.length) % cards.length);
    },
    [cards.length],
  );

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (paused || dragging || reducedMotion.current || cards.length < 2) return;
    const timer = window.setInterval(() => step(1), interval);
    return () => window.clearInterval(timer);
  }, [paused, dragging, step, interval, cards.length]);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (cards.length < 2 || event.pointerType === "mouse" && event.button !== 0) return;
    startX.current = event.clientX;
    moved.current = false;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const dx = event.clientX - startX.current;
    if (Math.abs(dx) > DRAG_SLOP) moved.current = true;
    setDrag(dx);
  }

  function handlePointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (drag <= -SWIPE_THRESHOLD) step(1);
    else if (drag >= SWIPE_THRESHOLD) step(-1);
    setDrag(0);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
  }

  if (cards.length === 0) return null;

  // How committed the current drag is, 0 → 1. Drives the frost highlight.
  const intensity = Math.min(1, Math.abs(drag) / SWIPE_THRESHOLD);

  return (
    <div className="relative">
      {/* Inset so the cards fanned out to either side stay inside the column. */}
      <div
        className="relative mx-9 aspect-square touch-pan-y select-none"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
      >
        {cards.map((card, i) => {
          const position = (i - front + cards.length) % cards.length;
          const spec = LAYOUT[Math.min(position, LAYOUT.length - 1)];
          const isFront = position === 0;

          // Only the front card follows your finger; it tilts as it slides.
          const offsetX = isFront ? spec.x + drag : spec.x;
          const rotate = isFront ? spec.rotate + drag * 0.04 : spec.rotate;

          return (
            <Link
              key={card.src}
              href={card.href}
              draggable={false}
              tabIndex={isFront ? 0 : -1}
              aria-hidden={!isFront}
              onClick={(event) => {
                // A flick shouldn't count as a click through to the product.
                if (moved.current) event.preventDefault();
              }}
              className="card-ice absolute inset-0 origin-bottom overflow-hidden rounded-[34px] bg-white shadow-[0_30px_70px_-30px_rgba(160,60,90,0.6)]"
              style={{
                transform: `translate3d(${offsetX}px, ${spec.y}px, 0) rotate(${rotate}deg) scale(${spec.scale})`,
                zIndex: spec.z,
                opacity: spec.opacity,
                pointerEvents: isFront ? "auto" : "none",
                // No transition while dragging, so the card tracks 1:1.
                transition: dragging && isFront ? "none" : "transform 0.7s var(--ease-pop), opacity 0.7s var(--ease-out)",
              }}
            >
              <Image
                src={card.src}
                alt={isFront ? card.alt : ""}
                fill
                priority={i === 0}
                draggable={false}
                sizes="(max-width:768px) 88vw, 44vw"
                className="pointer-events-none object-cover"
              />

              {/* frosted gloss — brightens as you commit to a swipe */}
              <span
                className="card-frost"
                style={isFront ? { opacity: 0.55 + intensity * 0.45 } : undefined}
                aria-hidden="true"
              />

              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 to-transparent" />
              <span className="pointer-events-none absolute bottom-5 left-5 font-display text-lg font-semibold text-white drop-shadow">
                {card.name}
              </span>
            </Link>
          );
        })}

        {/* floating stickers ride along with the stack */}
        <span className="chip absolute -left-3 top-10 z-50 animate-float [animation-delay:-1s]">
          <span aria-hidden="true">🍓</span> hand poured
        </span>
        <span className="chip absolute -right-3 top-1/2 z-50 animate-float [animation-delay:-3.5s]">
          <span aria-hidden="true">🌿</span> clean burn
        </span>
        <span className="chip absolute -left-2 bottom-12 z-50 animate-float [animation-delay:-5s]">
          <span aria-hidden="true">✨</span> from ₹249
        </span>
      </div>

      {cards.length > 1 && (
        <>
          <p className="mt-6 text-center font-display text-xs text-ink-soft">
            <span aria-hidden="true">←</span> swipe the deck <span aria-hidden="true">→</span>
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            {cards.map((card, i) => (
              <button
                key={card.src}
                type="button"
                onClick={() => setFront(i)}
                aria-label={`Show ${card.name}`}
                aria-current={i === front}
                className={`h-2.5 rounded-full transition-all duration-400 ${
                  i === front ? "w-7 bg-flame" : "w-2.5 bg-bubble-lt hover:bg-bubble"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
