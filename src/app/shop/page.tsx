import { Suspense } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { ShopSearch } from "@/components/ShopSearch";
import { Reveal } from "@/components/Reveal";
import { Sparkles } from "@/components/Decor";
import type { Prisma } from "@prisma/client";

type SearchParams = Promise<{
  q?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
}>;

export const metadata = { title: "Shop" };

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = params.q?.trim();
  const sort = params.sort ?? "newest";
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const inStock = params.inStock === "true";

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
            { scent: { contains: q } },
            { quote: { contains: q } },
            { shapeLabel: { contains: q } },
          ],
        }
      : {}),
    ...(minPrice !== undefined && !Number.isNaN(minPrice) ? { price: { gte: minPrice * 100 } } : {}),
    ...(maxPrice !== undefined && !Number.isNaN(maxPrice) ? { price: { lte: maxPrice * 100 } } : {}),
    ...(inStock ? { stock: { gt: 0 } } : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price-asc"
      ? { price: "asc" }
      : sort === "price-desc"
        ? { price: "desc" }
        : sort === "name"
          ? { name: "asc" }
          : { createdAt: "desc" };

  const products = await db.product.findMany({ where, orderBy });

  return (
    <section className="section-y-sm relative overflow-hidden">
      <Sparkles
        specs={[
          { top: "6%", left: "5%", size: "18px", delay: "-0.4s" },
          { top: "10%", left: "92%", size: "14px", color: "#b3a2f2", delay: "-1.4s" },
        ]}
      />

      <div className="shell">
        <Reveal className="mx-auto mb-10 max-w-xl text-center">
          <p className="eyebrow">
            <span aria-hidden="true">✿</span> the collection
          </p>
          <h1 className="mb-2 text-[clamp(1.95rem,1.35rem+2.5vw,3.05rem)]">
            Shop all <span className="script text-gradient">melts</span>
          </h1>
          <p className="text-ink-soft">
            Search by name, scent or shape. Filter by price and availability.
          </p>
        </Reveal>

        <Suspense fallback={<div className="skeleton mb-8 h-44 rounded-[26px]" />}>
          <ShopSearch />
        </Suspense>

        {products.length === 0 ? (
          <div className="panel panel-pad mx-auto max-w-md py-14 text-center">
            <p className="mb-2 text-5xl" aria-hidden="true">
              🕯️
            </p>
            <p className="font-display text-xl">No melts found</p>
            <p className="mt-2 text-ink-soft">Try a different search or clear your filters.</p>
            <Link href="/shop" className="btn mt-6">
              Show everything
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 font-display text-sm text-ink-soft">
              {products.length} melt{products.length !== 1 ? "s" : ""} found
              {q ? (
                <>
                  {" "}
                  for <span className="text-flame">“{q}”</span>
                </>
              ) : null}
            </p>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product, i) => (
                <Reveal key={product.id} delay={Math.min(i, 8) * 70} className="h-full">
                  <ProductCard product={product} index={i} />
                </Reveal>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
