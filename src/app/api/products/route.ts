import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { searchSchema } from "@/lib/validations";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = searchSchema.safeParse(params);

  const q = parsed.success ? parsed.data.q?.trim() : undefined;
  const sort = parsed.success ? parsed.data.sort ?? "newest" : "newest";
  const minPrice = parsed.success ? parsed.data.minPrice : undefined;
  const maxPrice = parsed.success ? parsed.data.maxPrice : undefined;
  const inStock = parsed.success ? parsed.data.inStock : undefined;

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
    ...(minPrice !== undefined ? { price: { gte: minPrice * 100 } } : {}),
    ...(maxPrice !== undefined ? { price: { lte: maxPrice * 100 } } : {}),
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

  const products = await db.product.findMany({
    where,
    orderBy,
  });

  return NextResponse.json({ products, count: products.length });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { productSchema } = await import("@/lib/validations");
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const existing = await db.product.findUnique({ where: { slug: data.slug } });
  if (existing) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  const product = await db.product.create({
    data: {
      ...data,
      price: Math.round(data.price * 100),
      images: JSON.stringify(data.images),
      quote: data.quote || null,
      scent: data.scent || null,
      shapeLabel: data.shapeLabel || null,
      packSize: data.packSize || null,
      altImageUrl: data.altImageUrl || null,
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}
