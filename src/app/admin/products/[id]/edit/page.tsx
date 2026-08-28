"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProductForm } from "@/components/ProductForm";
import { parseProductImages } from "@/lib/utils";

type PageProps = { params: Promise<{ id: string }> };

export default function EditProductPage({ params }: PageProps) {
  const router = useRouter();
  const [productId, setProductId] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    quote: "",
    description: "",
    scent: "",
    shapeLabel: "",
    packSize: "",
    price: 249,
    stock: 0,
    accentColor: "#E8384F",
    tintColor: "#FFEDF1",
    imageUrl: "",
    altImageUrl: "",
    images: "",
    isActive: true,
    isFeatured: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    params.then(async ({ id }) => {
      setProductId(id);
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      if (data.product) {
        const p = data.product;
        setForm({
          name: p.name,
          slug: p.slug,
          quote: p.quote ?? "",
          description: p.description,
          scent: p.scent ?? "",
          shapeLabel: p.shapeLabel ?? "",
          packSize: p.packSize ?? "",
          price: p.price / 100,
          stock: p.stock,
          accentColor: p.accentColor,
          tintColor: p.tintColor,
          imageUrl: p.imageUrl,
          altImageUrl: p.altImageUrl ?? "",
          images: parseProductImages(p.images).join("\n"),
          isActive: p.isActive,
          isFeatured: p.isFeatured,
        });
      }
      setFetching(false);
    });
  }, [params]);

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Failed to update");
      setLoading(false);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Hide this product from the shop?")) return;
    await fetch(`/api/products/${productId}`, { method: "DELETE" });
    router.push("/admin/products");
    router.refresh();
  }

  if (fetching) return <p>Loading…</p>;

  return (
    <div>
      <Link href="/admin/products" className="mb-4 inline-block text-sm text-ink-soft no-underline hover:text-flame">← Products</Link>
      <h1 className="mb-8 text-3xl">Edit product</h1>
      <ProductForm form={form} updateField={updateField} onSubmit={handleSubmit} error={error} loading={loading} submitLabel="Save changes" />
      <button type="button" onClick={handleDelete} className="btn btn-ghost btn-sm mt-6 text-flame">
        Hide from shop
      </button>
    </div>
  );
}
