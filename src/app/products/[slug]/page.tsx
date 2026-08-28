import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice, parseProductImages, FREE_SHIPPING_THRESHOLD_PAISE } from "@/lib/utils";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";

type PageProps = { params: Promise<{ slug: string }> };

const PROMISES = [
  { icon: "🌱", label: "100% soy wax" },
  { icon: "🤍", label: "No soot, no flame" },
  { icon: "🎁", label: "Arrives gift ready" },
];

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await db.product.findFirst({ where: { slug, isActive: true } });
  if (!product) return { title: "Product not found" };
  return { title: product.name, description: product.description };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await db.product.findFirst({ where: { slug, isActive: true } });
  if (!product) notFound();

  const related = await db.product.findMany({
    where: { isActive: true, NOT: { id: product.id } },
    orderBy: { isFeatured: "desc" },
    take: 3,
  });

  const images = [product.imageUrl, product.altImageUrl, ...parseProductImages(product.images)].filter(
    Boolean,
  ) as string[];
  const uniqueImages = [...new Set(images)];

  const outOfStock = product.stock === 0;
  const lowStock = !outOfStock && product.stock <= 3;

  return (
    <>
      <section className="section-y-sm">
        <div className="shell">
          <nav aria-label="Breadcrumb" className="mb-6 font-display text-sm text-ink-soft">
            <Link href="/" className="no-underline transition hover:text-flame">
              Home
            </Link>
            <span className="mx-2" aria-hidden="true">
              /
            </span>
            <Link href="/shop" className="no-underline transition hover:text-flame">
              Shop
            </Link>
            <span className="mx-2" aria-hidden="true">
              /
            </span>
            <span className="text-ink">{product.name}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <Reveal variant="zoom">
              <ProductGallery
                images={uniqueImages}
                name={product.name}
                tintColor={product.tintColor}
                shapeLabel={product.shapeLabel}
              />
            </Reveal>

            <Reveal delay={100} className="lg:sticky lg:top-28">
              <h1 className="mb-2 text-[clamp(1.95rem,1.35rem+2.5vw,3.05rem)]">{product.name}</h1>

              {product.quote && (
                <p className="script mb-4 text-xl text-flame">&ldquo;{product.quote}&rdquo;</p>
              )}

              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="price text-2xl">{formatPrice(product.price)}</span>
                {outOfStock ? (
                  <span className="pill pill-cancelled">Sold out</span>
                ) : lowStock ? (
                  <span className="pill pill-pending">Only {product.stock} left</span>
                ) : (
                  <span className="pill pill-delivered">In stock</span>
                )}
              </div>

              <p className="mb-6 text-ink-soft">{product.description}</p>

              <div className="mb-6">
                <AddToCartButton
                  productId={product.id}
                  productName={product.name}
                  disabled={outOfStock}
                  maxQuantity={product.stock}
                  withQuantity
                  className="btn btn-lg"
                  label={outOfStock ? "Sold out" : "Add to cart"}
                />
              </div>

              <p className="mb-8 text-sm text-ink-soft">
                <span aria-hidden="true">🚚</span> Free shipping on orders over{" "}
                {formatPrice(FREE_SHIPPING_THRESHOLD_PAISE)} · packed by hand within 2 days
              </p>

              <dl className="panel panel-pad mb-6 space-y-3">
                {product.scent && (
                  <div className="flex gap-4">
                    <dt className="w-24 shrink-0 font-display font-semibold">Scent</dt>
                    <dd className="text-ink-soft">{product.scent}</dd>
                  </div>
                )}
                <div className="flex gap-4">
                  <dt className="w-24 shrink-0 font-display font-semibold">Wax</dt>
                  <dd className="text-ink-soft">100% soy</dd>
                </div>
                {product.packSize && (
                  <div className="flex gap-4">
                    <dt className="w-24 shrink-0 font-display font-semibold">Pack</dt>
                    <dd className="text-ink-soft">{product.packSize}</dd>
                  </div>
                )}
                {product.shapeLabel && (
                  <div className="flex gap-4">
                    <dt className="w-24 shrink-0 font-display font-semibold">Shape</dt>
                    <dd className="text-ink-soft">{product.shapeLabel}</dd>
                  </div>
                )}
                <div className="flex gap-4">
                  <dt className="w-24 shrink-0 font-display font-semibold">Stock</dt>
                  <dd className={outOfStock ? "font-semibold text-flame" : "text-ink-soft"}>
                    {outOfStock ? "Sold out" : `${product.stock} available`}
                  </dd>
                </div>
              </dl>

              <ul className="flex flex-wrap gap-2">
                {PROMISES.map((promise) => (
                  <li key={promise.label} className="chip">
                    <span aria-hidden="true">{promise.icon}</span> {promise.label}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section-y-sm bg-cream/70">
          <div className="shell">
            <Reveal className="mb-10 text-center">
              <p className="eyebrow">you might also like</p>
              <h2 className="text-[clamp(1.6rem,1.2rem+1.8vw,2.3rem)]">More little melts</h2>
            </Reveal>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, i) => (
                <Reveal key={item.id} delay={i * 80} className="h-full">
                  <ProductCard product={item} index={i} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
