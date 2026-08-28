"use client";

import Image from "next/image";
import { useState } from "react";

type ProductGalleryProps = {
  images: string[];
  name: string;
  tintColor: string;
  shapeLabel?: string | null;
};

/** Main image plus selectable thumbnails, with a gentle zoom that follows the cursor. */
export function ProductGallery({ images, name, tintColor, shapeLabel }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [origin, setOrigin] = useState("50% 50%");
  const [zoomed, setZoomed] = useState(false);

  const current = images[active] ?? images[0];

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  function step(direction: 1 | -1) {
    setActive((i) => (i + direction + images.length) % images.length);
  }

  return (
    <div className="space-y-4">
      <div
        className="group relative aspect-square overflow-hidden rounded-[34px] shadow-[0_26px_60px_-26px_rgba(160,60,90,0.45)]"
        style={{ background: tintColor }}
        onMouseMove={handleMove}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
      >
        <Image
          key={current}
          src={current}
          alt={name}
          fill
          priority
          sizes="(max-width:1024px) 100vw, 50vw"
          className="animate-pop-in object-cover transition-transform duration-500"
          style={{ transformOrigin: origin, transform: zoomed ? "scale(1.35)" : "scale(1)" }}
        />

        {shapeLabel && (
          <span className="chip absolute left-4 top-4 z-10">
            <span aria-hidden="true">✿</span> {shapeLabel}
          </span>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-lg text-ink shadow transition hover:scale-110 hover:bg-white md:opacity-0 md:group-hover:opacity-100"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-lg text-ink shadow transition hover:scale-110 hover:bg-white md:opacity-0 md:group-hover:opacity-100"
            >
              ›
            </button>
            <span className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/85 px-3 py-1 font-display text-xs font-semibold">
              {active + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.slice(0, 8).map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1} of ${name}`}
              aria-current={i === active}
              className={`relative aspect-square overflow-hidden rounded-[16px] bg-white transition duration-300 hover:-translate-y-1 ${
                i === active
                  ? "ring-[3px] ring-flame ring-offset-2 ring-offset-blush"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" sizes="120px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
