import type { CSSProperties } from "react";

type BlobSpec = {
  color: string;
  size: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  opacity?: number;
  blur?: string;
  delay?: string;
  duration?: string;
};

/** Soft drifting colour blobs. Purely decorative, never interactive. */
export function Blobs({ specs, className = "" }: { specs: BlobSpec[]; className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}>
      {specs.map((blob, i) => (
        <span
          key={i}
          className="blob"
          style={
            {
              width: blob.size,
              height: blob.size,
              top: blob.top,
              left: blob.left,
              right: blob.right,
              bottom: blob.bottom,
              background: blob.color,
              opacity: blob.opacity ?? 0.45,
              filter: `blur(${blob.blur ?? "42px"})`,
              animationDelay: blob.delay ?? "0s",
              animationDuration: blob.duration ?? "20s",
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

const HERO_BLOBS: BlobSpec[] = [
  { color: "#ffb6cd", size: "clamp(200px, 30vw, 420px)", top: "-8%", left: "-6%", opacity: 0.55 },
  { color: "#b3a2f2", size: "clamp(160px, 24vw, 340px)", top: "36%", right: "-8%", opacity: 0.35, delay: "-6s" },
  { color: "#ffd166", size: "clamp(140px, 20vw, 280px)", bottom: "-12%", left: "38%", opacity: 0.32, delay: "-12s" },
];

export function HeroBlobs() {
  return <Blobs specs={HERO_BLOBS} />;
}

type SparkleSpec = { top: string; left: string; size?: string; color?: string; delay?: string };

/** Twinkling four-point stars scattered over a section. */
export function Sparkles({ specs }: { specs: SparkleSpec[] }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {specs.map((s, i) => (
        <svg
          key={i}
          className="sparkle"
          viewBox="0 0 24 24"
          style={{
            top: s.top,
            left: s.left,
            width: s.size ?? "18px",
            height: s.size ?? "18px",
            color: s.color ?? "#ffd166",
            animationDelay: s.delay ?? "0s",
          }}
        >
          <path
            fill="currentColor"
            d="M12 0c.5 6.2 5.8 11.5 12 12-6.2.5-11.5 5.8-12 12-.5-6.2-5.8-11.5-12-12C6.2 11.5 11.5 6.2 12 0Z"
          />
        </svg>
      ))}
    </div>
  );
}

/** Wavy divider that sits between two sections of different colour. */
export function WaveDivider({ from = "transparent", to = "#fff9f0", flip = false }: { from?: string; to?: string; flip?: boolean }) {
  return (
    <div aria-hidden="true" className="relative -mb-px w-full leading-[0]" style={{ background: from }}>
      <svg
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        className="block h-[clamp(38px,6vw,80px)] w-full"
        style={flip ? { transform: "scaleX(-1)" } : undefined}
      >
        <path
          fill={to}
          d="M0 44c120 30 240 44 360 34s240-46 360-52 240 20 360 30 240-2 360-24v58H0Z"
        />
      </svg>
    </div>
  );
}
