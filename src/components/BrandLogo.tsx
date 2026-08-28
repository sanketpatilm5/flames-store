import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  variant?: "wordmark" | "badge";
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
  linked?: boolean;
};

const sizes = {
  wordmark: { sm: { w: 120, h: 40 }, md: { w: 160, h: 48 }, lg: { w: 220, h: 66 } },
  badge: { sm: { w: 48, h: 48 }, md: { w: 72, h: 72 }, lg: { w: 120, h: 120 } },
};

export function BrandLogo({
  variant = "wordmark",
  size = "md",
  className = "",
  href = "/",
  linked = true,
}: BrandLogoProps) {
  const src = variant === "badge" ? "/logo/flames-badge.png" : "/logo/flames-wordmark.png";
  const { w, h } = sizes[variant][size];
  const label = variant === "badge" ? "Flames" : "Flames — soy wax candles";

  const img = (
    <Image
      src={src}
      alt={label}
      width={w}
      height={h}
      className={`h-auto w-auto object-contain ${className}`}
      style={{ width: w, height: "auto", maxHeight: h }}
      priority={size !== "sm"}
    />
  );

  if (linked) {
    return (
      <Link href={href} className="inline-block transition hover:opacity-90" aria-label="Flames — home">
        {img}
      </Link>
    );
  }

  return img;
}
