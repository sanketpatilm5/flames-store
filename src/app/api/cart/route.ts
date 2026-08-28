import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  getCartItems,
  getGuestCartRaw,
  setGuestCart,
  validateCartStock,
} from "@/lib/cart";
import { cartItemSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  const items = await getCartItems(session?.user?.id);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  return NextResponse.json({ items, subtotal, itemCount });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = cartItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { productId, quantity } = parsed.data;
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) {
    return NextResponse.json({ error: "Product not available" }, { status: 404 });
  }
  if (product.stock === 0) {
    return NextResponse.json({ error: "Product is out of stock" }, { status: 400 });
  }

  const session = await auth();

  if (session?.user) {
    const existing = await db.cartItem.findUnique({
      where: { userId_productId: { userId: session.user.id, productId } },
    });
    const newQty = Math.min((existing?.quantity ?? 0) + quantity, 20, product.stock);
    if (existing) {
      await db.cartItem.update({ where: { id: existing.id }, data: { quantity: newQty } });
    } else {
      await db.cartItem.create({
        data: { userId: session.user.id, productId, quantity: newQty },
      });
    }
  } else {
    const guest = await getGuestCartRaw();
    const idx = guest.findIndex((i) => i.productId === productId);
    const currentQty = idx >= 0 ? guest[idx].quantity : 0;
    const newQty = Math.min(currentQty + quantity, 20, product.stock);
    if (idx >= 0) guest[idx].quantity = newQty;
    else guest.push({ productId, quantity: newQty });
    await setGuestCart(guest);
  }

  const items = await getCartItems(session?.user?.id);
  return NextResponse.json({ items, message: "Added to cart" });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const parsed = cartItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { productId, quantity } = parsed.data;
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) {
    return NextResponse.json({ error: "Product not available" }, { status: 404 });
  }

  const cappedQty = Math.min(quantity, 20, product.stock);
  const session = await auth();

  if (session?.user) {
    if (cappedQty <= 0) {
      await db.cartItem.deleteMany({
        where: { userId: session.user.id, productId },
      });
    } else {
      await db.cartItem.upsert({
        where: { userId_productId: { userId: session.user.id, productId } },
        update: { quantity: cappedQty },
        create: { userId: session.user.id, productId, quantity: cappedQty },
      });
    }
  } else {
    const guest = await getGuestCartRaw();
    const filtered = guest.filter((i) => i.productId !== productId);
    if (cappedQty > 0) filtered.push({ productId, quantity: cappedQty });
    await setGuestCart(filtered);
  }

  const items = await getCartItems(session?.user?.id);
  return NextResponse.json({ items });
}

export async function DELETE(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("productId");
  const session = await auth();

  if (productId) {
    if (session?.user) {
      await db.cartItem.deleteMany({
        where: { userId: session.user.id, productId },
      });
    } else {
      const guest = await getGuestCartRaw();
      await setGuestCart(guest.filter((i) => i.productId !== productId));
    }
  } else if (session?.user) {
    await db.cartItem.deleteMany({ where: { userId: session.user.id } });
  } else {
    await setGuestCart([]);
  }

  const items = await getCartItems(session?.user?.id);
  return NextResponse.json({ items });
}

export async function PUT() {
  const session = await auth();
  const items = await getCartItems(session?.user?.id);
  const { adjusted, errors } = validateCartStock(items);

  if (session?.user) {
    for (const item of adjusted) {
      await db.cartItem.updateMany({
        where: { userId: session.user.id, productId: item.productId },
        data: { quantity: item.quantity },
      });
    }
    const removed = items.filter(
      (i) => !adjusted.find((a) => a.productId === i.productId),
    );
    for (const item of removed) {
      await db.cartItem.deleteMany({
        where: { userId: session.user.id, productId: item.productId },
      });
    }
  } else {
    await setGuestCart(adjusted.map((i) => ({ productId: i.productId, quantity: i.quantity })));
  }

  const refreshed = await getCartItems(session?.user?.id);
  return NextResponse.json({ items: refreshed, warnings: errors });
}
