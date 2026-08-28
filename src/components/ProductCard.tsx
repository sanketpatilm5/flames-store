import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/AddToCartButton";
import type { Product } from "@/generated/prisma/client";

type ProductCardProps = {
  product: Product;
  /** Index within a grid — used to stagger the entrance. */
  index?: number;
};

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const outOfStock = product.stock === 0;
  const lowStock = !outOfStock && product.stock <= 3;

  return (
    <article
      className="card-product flex flex-col"
      style={{
        ["--accent" as string]: product.accentColor,
        ["--tint" as string]: product.tintColor,
        animationDelay: `${Math.min(index, 8) * 70}ms`,
      }}
    >
      <Link href={`/products/${product.slug}`} className="card-media group">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width:640px) 88vw, (max-width:1080px) 44vw, 30vw"
        />
        {product.altImageUrl && (
          <Image
            src={product.altImageUrl}
            alt=""
            fill
            className="card-media-alt object-cover"
            sizes="(max-width:640px) 88vw, (max-width:1080px) 44vw, 30vw"
          />
        )}

        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {product.shapeLabel && (
          <span className="chip absolute bottom-3 left-3 z-10 text-[0.74rem]">
            <span aria-hidden="true">✿</span> {product.shapeLabel}
          </span>
        )}

        {outOfStock ? (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-ink px-3 py-1 font-display text-xs font-semibold text-white">
            Sold out
          </span>
        ) : lowStock ? (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-butter px-3 py-1 font-display text-xs font-semibold text-ink">
            Only {product.stock} left
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-5" style={{ background: "var(--tint)" }}>
        <Link href={`/products/${product.slug}`} className="no-underline">
          <h3 className="mb-1 text-lg transition-colors hover:text-flame">{product.name}</h3>
        </Link>

        {product.quote && (
          <p className="script mb-2 text-sm text-ink-soft">&ldquo;{product.quote}&rdquo;</p>
        )}

        {product.scent && (
          <p className="mb-4 line-clamp-2 flex-1 text-sm text-ink-soft">{product.scent}</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="price">{formatPrice(product.price)}</span>
          <Link
            href={`/products/${product.slug}`}
            className="font-display text-sm font-semibold text-flame no-underline"
          >
            Peek inside <span className="card-peek inline-block">→</span>
          </Link>
        </div>

        <div className="card-quick mt-4">
          <AddToCartButton
            productId={product.id}
            productName={product.name}
            disabled={outOfStock}
            maxQuantity={product.stock}
            className="btn btn-sm w-full"
            label={outOfStock ? "Sold out" : "Quick add"}
          />
        </div>
      </div>
    </article>
  );
}
