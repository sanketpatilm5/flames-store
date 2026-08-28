import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { productSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  const product = await db.product.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
      ...(isAdmin ? {} : { isActive: true }),
    },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ product });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (parsed.data.slug !== existing.slug) {
    const slugTaken = await db.product.findUnique({ where: { slug: parsed.data.slug } });
    if (slugTaken) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
  }

  const data = parsed.data;
  const product = await db.product.update({
    where: { id },
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

  return NextResponse.json({ product });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  await db.product.update({
    where: { id },
    data: { isActive: false },
  });
  return NextResponse.json({ success: true });
}
