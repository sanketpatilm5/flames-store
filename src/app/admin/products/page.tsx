import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Manage products" };

export default async function AdminProductsPage() {
  const products = await db.product.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl">Products</h1>
        <Link href="/admin/products/new" className="btn btn-sm">
          <span aria-hidden="true">+</span> Add product
        </Link>
      </div>

      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-blush-dp font-display">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-blush-dp/50 transition hover:bg-blush/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[12px]"
                      style={{ background: product.tintColor }}
                    >
                      <Image
                        src={product.imageUrl}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </span>
                    <span>
                      <span className="block font-display font-semibold">{product.name}</span>
                      <span className="block text-xs text-ink-soft">{product.slug}</span>
                    </span>
                  </div>
                </td>
                <td className="p-4 font-display font-semibold">{formatPrice(product.price)}</td>
                <td className={`p-4 ${product.stock <= 5 ? "font-semibold text-flame" : ""}`}>
                  {product.stock}
                </td>
                <td className="p-4">
                  <span className={`pill ${product.isActive ? "pill-delivered" : "pill-cancelled"}`}>
                    {product.isActive ? "active" : "hidden"}
                  </span>
                  {product.isFeatured && <span className="pill pill-processing ml-1">featured</span>}
                </td>
                <td className="p-4">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="font-display font-semibold text-flame no-underline hover:underline"
                  >
                    Edit
                  </Link>
                  <span className="mx-2 text-ink-faint" aria-hidden="true">
                    ·
                  </span>
                  <Link
                    href={`/products/${product.slug}`}
                    className="text-ink-soft no-underline transition hover:text-flame"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
