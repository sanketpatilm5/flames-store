import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { guestCartSchema } from "@/lib/validations";

export const GUEST_CART_COOKIE = "flames_guest_cart";

export type CartLine = {
  productId: string;
  quantity: number;
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    stock: number;
    imageUrl: string;
    accentColor: string;
    isActive: boolean;
  };
};

export async function getGuestCartRaw(): Promise<{ productId: string; quantity: number }[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(GUEST_CART_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = guestCartSchema.safeParse(JSON.parse(decodeURIComponent(raw)));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export async function setGuestCart(items: { productId: string; quantity: number }[]) {
  const cookieStore = await cookies();
  cookieStore.set(GUEST_CART_COOKIE, encodeURIComponent(JSON.stringify(items)), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function getUserCartItems(userId: string): Promise<CartLine[]> {
  const items = await db.cartItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });

  return items
    .filter((item) => item.product.isActive)
    .map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        slug: item.product.slug,
        name: item.product.name,
        price: item.product.price,
        stock: item.product.stock,
        imageUrl: item.product.imageUrl,
        accentColor: item.product.accentColor,
        isActive: item.product.isActive,
      },
    }));
}

export async function getGuestCartItems(): Promise<CartLine[]> {
  const raw = await getGuestCartRaw();
  if (raw.length === 0) return [];

  const productIds = raw.map((i) => i.productId);
  const products = await db.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  return raw
    .map((item) => {
      const product = productMap.get(item.productId);
      if (!product) return null;
      return {
        productId: item.productId,
        quantity: item.quantity,
        product: {
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          stock: product.stock,
          imageUrl: product.imageUrl,
          accentColor: product.accentColor,
          isActive: product.isActive,
        },
      };
    })
    .filter((item): item is CartLine => item !== null);
}

export async function getCartItems(userId?: string): Promise<CartLine[]> {
  if (userId) return getUserCartItems(userId);
  return getGuestCartItems();
}

export function validateCartStock(items: CartLine[]): {
  valid: boolean;
  errors: string[];
  adjusted: CartLine[];
} {
  const errors: string[] = [];
  const adjusted: CartLine[] = [];

  for (const item of items) {
    if (!item.product.isActive) {
      errors.push(`${item.product.name} is no longer available.`);
      continue;
    }
    if (item.product.stock === 0) {
      errors.push(`${item.product.name} is out of stock.`);
      continue;
    }
    const qty = Math.min(item.quantity, item.product.stock, 20);
    if (qty < item.quantity) {
      errors.push(`Only ${qty} of ${item.product.name} available. Quantity adjusted.`);
    }
    adjusted.push({ ...item, quantity: qty });
  }

  return { valid: errors.length === 0, errors, adjusted };
}

export async function mergeGuestCartIntoUser(userId: string) {
  const guestItems = await getGuestCartRaw();
  if (guestItems.length === 0) return;

  for (const guest of guestItems) {
    const existing = await db.cartItem.findUnique({
      where: { userId_productId: { userId, productId: guest.productId } },
    });
    if (existing) {
      await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: Math.min(existing.quantity + guest.quantity, 20) },
      });
    } else {
      const product = await db.product.findUnique({ where: { id: guest.productId } });
      if (product?.isActive) {
        await db.cartItem.create({
          data: {
            userId,
            productId: guest.productId,
            quantity: Math.min(guest.quantity, 20),
          },
        });
      }
    }
  }

  await setGuestCart([]);
}
