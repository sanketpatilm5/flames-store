import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain a letter")
    .regex(/[0-9]/, "Password must contain a number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const productSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  quote: z.string().max(200).optional().or(z.literal("")),
  description: z.string().min(10).max(2000),
  scent: z.string().max(120).optional().or(z.literal("")),
  shapeLabel: z.string().max(80).optional().or(z.literal("")),
  packSize: z.string().max(40).optional().or(z.literal("")),
  price: z.coerce.number().min(1).max(100000),
  stock: z.coerce.number().int().min(0).max(100000),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  tintColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  imageUrl: z.string().url().or(z.string().startsWith("/")),
  altImageUrl: z.string().url().or(z.string().startsWith("/")).optional().or(z.literal("")),
  images: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const cartItemSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.coerce.number().int().min(1).max(20),
});

export const guestCartSchema = z.array(
  z.object({
    productId: z.string().cuid(),
    quantity: z.number().int().min(1).max(20),
  }),
);

export const checkoutSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  line1: z.string().min(5).max(200),
  line2: z.string().max(200).optional().or(z.literal("")),
  city: z.string().min(2).max(80),
  state: z.string().min(2).max(80),
  postalCode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
  country: z.string().default("IN"),
  notes: z.string().max(500).optional().or(z.literal("")),
  saveAddress: z.boolean().optional(),
});

export const searchSchema = z.object({
  q: z.string().max(100).optional(),
  sort: z.enum(["newest", "price-asc", "price-desc", "name"]).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStock: z.coerce.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
