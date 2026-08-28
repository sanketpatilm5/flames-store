import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  getCartItems,
  setGuestCart,
  validateCartStock,
} from "@/lib/cart";
import { checkoutSchema } from "@/lib/validations";
import {
  calculateShipping,
  generateOrderNumber,
} from "@/lib/utils";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Please sign in to checkout" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const items = await getCartItems(session.user.id);
  if (items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
  }

  const { adjusted, errors } = validateCartStock(items);
  if (adjusted.length === 0) {
    return NextResponse.json(
      { error: "No valid items in cart", warnings: errors },
      { status: 400 },
    );
  }

  const subtotal = adjusted.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;
  const data = parsed.data;

  const orderNumber = generateOrderNumber();

  try {
    const order = await db.$transaction(async (tx) => {
      for (const item of adjusted) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count === 0) {
          throw new Error(`Insufficient stock for ${item.product.name}`);
        }
      }

      let addressId: string | undefined;
      if (data.saveAddress) {
        const address = await tx.address.create({
          data: {
            userId: session.user.id,
            name: data.name,
            phone: data.phone,
            line1: data.line1,
            line2: data.line2 || null,
            city: data.city,
            state: data.state,
            postalCode: data.postalCode,
            country: data.country,
          },
        });
        addressId = address.id;
      }

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          addressId,
          status: "PAID",
          paymentStatus: "COMPLETED",
          subtotal,
          shipping,
          total,
          shippingName: data.name,
          shippingPhone: data.phone,
          shippingLine1: data.line1,
          shippingLine2: data.line2 || null,
          shippingCity: data.city,
          shippingState: data.state,
          shippingPostal: data.postalCode,
          shippingCountry: data.country,
          notes: data.notes || null,
          items: {
            create: adjusted.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              productSlug: item.product.slug,
              unitPrice: item.product.price,
              quantity: item.quantity,
              total: item.product.price * item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      await tx.cartItem.deleteMany({ where: { userId: session.user.id } });
      return created;
    });

    await setGuestCart([]);

    return NextResponse.json({
      order,
      warnings: errors.length > 0 ? errors : undefined,
      message: "Order placed successfully (demo payment — no real charge)",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
