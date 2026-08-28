# Flames Store — Next.js E-commerce

Production-ready e-commerce for **Flames** soy wax melts, built with Next.js 16, TypeScript, Tailwind CSS 4, Prisma (SQLite), and Auth.js.

## Features

- **Storefront** — Homepage, shop with search/filters/sort, product detail pages
- **Cart** — Guest cart (cookie) + logged-in user cart (database)
- **Checkout** — Demo payment (no payment provider), stock validation, transactional orders
- **Auth** — Customer accounts + owner admin panel
- **Admin** — Add/edit products, prices, stock; manage order statuses; low-stock alerts

## Quick start

```bash
cd flames-store
npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo accounts

| Role     | Email                  | Password  |
|----------|------------------------|-----------|
| Owner    | admin@flames.example   | admin123  |
| Customer | hello@example.com      | user123   |

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS 4**
- **Prisma** + **SQLite** (swap to PostgreSQL for production)
- **Auth.js (NextAuth v5)** — credentials login
- **Zod** — request validation

## Product images

Place your WebP images in `public/assets/img/` using the paths from the original static site (e.g. `strawberry-packet-800.webp`). A placeholder SVG is included until you add real images.

Copy from the parent project:

```bash
cp -r ../assets/img/* public/assets/img/
```

## Production notes

1. Set `AUTH_SECRET` to a secure random string (32+ chars)
2. Use PostgreSQL: change `provider` in `prisma/schema.prisma` and `DATABASE_URL`
3. Connect a payment provider (Razorpay, Stripe) in `/api/checkout`
4. Deploy to Vercel, Railway, or similar

## Edge cases handled

- Out-of-stock and quantity caps (max 20 per item)
- Stock decremented atomically at checkout
- Price/stock re-validated before order placement
- Empty cart checkout blocked
- Admin routes protected via middleware
- Checkout requires login
- Soft-delete products (hide from shop)
- Free shipping over ₹999, ₹49 otherwise
- Indian phone (10-digit) and PIN code validation
