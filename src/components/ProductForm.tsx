"use client";

export type ProductFormData = {
  name: string;
  slug: string;
  quote: string;
  description: string;
  scent: string;
  shapeLabel: string;
  packSize: string;
  price: number;
  stock: number;
  accentColor: string;
  tintColor: string;
  imageUrl: string;
  altImageUrl: string;
  images: string;
  isActive: boolean;
  isFeatured: boolean;
};

export const emptyProductForm: ProductFormData = {
  name: "",
  slug: "",
  quote: "",
  description: "",
  scent: "",
  shapeLabel: "",
  packSize: "",
  price: 249,
  stock: 10,
  accentColor: "#E8384F",
  tintColor: "#FFEDF1",
  imageUrl: "/products/strawberry/IMG-20260809-WA0011.jpg",
  altImageUrl: "",
  images: "",
  isActive: true,
  isFeatured: false,
};

type ProductFormProps = {
  form: ProductFormData;
  updateField: <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string;
  loading: boolean;
  submitLabel: string;
};

export function ProductForm({
  form,
  updateField,
  onSubmit,
  error,
  loading,
  submitLabel,
}: ProductFormProps) {
  return (
    <form onSubmit={onSubmit} className="panel panel-pad max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Name</label>
          <input className="input" required value={form.name} onChange={(e) => updateField("name", e.target.value)} />
        </div>
        <div>
          <label className="label">Slug</label>
          <input className="input" required pattern="[a-z0-9-]+" value={form.slug} onChange={(e) => updateField("slug", e.target.value)} />
        </div>
        <div>
          <label className="label">Price (₹)</label>
          <input className="input" type="number" min={1} required value={form.price} onChange={(e) => updateField("price", Number(e.target.value))} />
        </div>
        <div>
          <label className="label">Stock</label>
          <input className="input" type="number" min={0} required value={form.stock} onChange={(e) => updateField("stock", Number(e.target.value))} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Quote</label>
          <input className="input" value={form.quote} onChange={(e) => updateField("quote", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Description</label>
          <textarea className="input min-h-[100px]" required value={form.description} onChange={(e) => updateField("description", e.target.value)} />
        </div>
        <div>
          <label className="label">Scent</label>
          <input className="input" value={form.scent} onChange={(e) => updateField("scent", e.target.value)} />
        </div>
        <div>
          <label className="label">Shape label</label>
          <input className="input" value={form.shapeLabel} onChange={(e) => updateField("shapeLabel", e.target.value)} />
        </div>
        <div>
          <label className="label">Pack size</label>
          <input className="input" value={form.packSize} onChange={(e) => updateField("packSize", e.target.value)} />
        </div>
        <div>
          <label className="label">Accent color</label>
          <input className="input" type="color" value={form.accentColor} onChange={(e) => updateField("accentColor", e.target.value)} />
        </div>
        <div>
          <label className="label">Tint color</label>
          <input className="input" type="color" value={form.tintColor} onChange={(e) => updateField("tintColor", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Main image URL</label>
          <input className="input" required value={form.imageUrl} onChange={(e) => updateField("imageUrl", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Alt image URL</label>
          <input className="input" value={form.altImageUrl} onChange={(e) => updateField("altImageUrl", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Gallery URLs (one per line)</label>
          <textarea className="input min-h-[80px]" value={form.images} onChange={(e) => updateField("images", e.target.value)} />
        </div>
        <label className="flex cursor-pointer items-center gap-2.5 font-display text-sm">
          <input type="checkbox" className="check" checked={form.isActive} onChange={(e) => updateField("isActive", e.target.checked)} />
          Active (visible in shop)
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 font-display text-sm">
          <input type="checkbox" className="check" checked={form.isFeatured} onChange={(e) => updateField("isFeatured", e.target.checked)} />
          Featured on homepage
        </label>
      </div>
      {error && <p className="text-sm text-flame">{error}</p>}
      <button type="submit" className="btn" disabled={loading}>{loading ? "Saving…" : submitLabel}</button>
    </form>
  );
}
