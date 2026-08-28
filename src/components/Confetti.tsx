const COLORS = ["#e8384f", "#f87ca4", "#ffd166", "#63d2b8", "#b3a2f2", "#ffab86"];

/**
 * A fixed burst of paper. Positions are deterministic so the server and client
 * render exactly the same markup — no hydration mismatch, no layout shift.
 */
export function Confetti({ pieces = 24 }: { pieces?: number }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden">
      {Array.from({ length: pieces }).map((_, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${((i * 37) % 100)}%`,
            background: COLORS[i % COLORS.length],
            animationDelay: `${(i % 8) * 0.11}s`,
            transform: `rotate(${(i * 47) % 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}
