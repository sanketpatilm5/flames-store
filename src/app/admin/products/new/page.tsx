"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProductForm, emptyProductForm, type ProductFormData } from "@/components/ProductForm";
import { slugify } from "@/lib/utils";

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyProductForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && !prev.slug) next.slug = slugify(String(value));
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Failed to create product");
      setLoading(false);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <div>
      <Link href="/admin/products" className="mb-4 inline-block text-sm text-ink-soft no-underline hover:text-flame">← Products</Link>
      <h1 className="mb-8 text-3xl">Add product</h1>
      <ProductForm form={form} updateField={updateField} onSubmit={handleSubmit} error={error} loading={loading} submitLabel="Create product" />
    </div>
  );
}
