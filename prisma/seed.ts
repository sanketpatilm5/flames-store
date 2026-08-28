import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { getDatabaseUrl } from "../src/lib/db-url";
import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = getDatabaseUrl();
const adapter = connectionString.includes("neon.tech")
  ? new PrismaNeon({ connectionString })
  : new PrismaPg({ connectionString, ssl: { rejectUnauthorized: false } });
const db = new PrismaClient({ adapter });

function productImages(slug: string): { imageUrl: string; altImageUrl: string | null; images: string } {
  const dir = path.join(process.cwd(), "public", "products", slug);
  if (!fs.existsSync(dir)) {
    const fallback = "/assets/img/placeholder.svg";
    return { imageUrl: fallback, altImageUrl: null, images: JSON.stringify([fallback]) };
  }
  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort();
  const urls = files.map((f) => `/products/${slug}/${f}`);
  return {
    imageUrl: urls[0],
    altImageUrl: urls[1] ?? null,
    images: JSON.stringify(urls),
  };
}

const products = [
  {
    slug: "strawberry",
    name: "Strawberry Wax Melts",
    quote: "You're berry special",
    description:
      "Little berries in deep candy red, poured one tray at a time. Sweet and jammy up front, with a soft vanilla-cream finish that settles into the room and stays there.",
    scent: "Sweet strawberry & vanilla cream",
    shapeLabel: "🍓 strawberry shaped",
    packSize: "8–10 melts",
    price: 24900,
    stock: 50,
    accentColor: "#E8384F",
    tintColor: "#FFEDF1",
    isFeatured: true,
  },
  {
    slug: "star",
    name: "Star Wax Melts",
    quote: "We matched, and the rest is magic",
    description:
      "Tiny stars in blush pink and buttery yellow, mixed together in every pouch. Warm vanilla sugar — the gentle kind that makes a room feel like a Sunday afternoon.",
    scent: "Soft vanilla sugar",
    shapeLabel: "⭐ star shaped",
    packSize: "8–10 melts",
    price: 24900,
    stock: 45,
    accentColor: "#E0A02A",
    tintColor: "#FFF6E3",
    isFeatured: true,
  },
  {
    slug: "boo",
    name: "Boo Wax Melts",
    quote: "Hey boo!",
    description:
      "A whole dish of tiny friendly ghosts in creamy off-white, each with its own little face. Calm lavender softened with vanilla — spooky season energy without the fog machine.",
    scent: "Cosy lavender & vanilla",
    shapeLabel: "👻 ghost shaped",
    packSize: "10–12 melts",
    price: 24900,
    stock: 40,
    accentColor: "#8E70B8",
    tintColor: "#F3EFFA",
    isFeatured: true,
  },
  {
    slug: "coffee",
    name: "Coffee Wax Melts",
    quote: "We're the perfect blend",
    description:
      "Dozens of glossy little coffee beans, dark and detailed enough that people keep trying to brew them. Rich, roasty and warm — the smell of a café that never closes.",
    scent: "Fresh ground coffee",
    shapeLabel: "☕ coffee bean shaped",
    packSize: "20–25 beans",
    price: 24900,
    stock: 35,
    accentColor: "#A9714B",
    tintColor: "#F7EDE4",
    isFeatured: true,
  },
  {
    slug: "orange",
    name: "Orange Wax Melts",
    quote: "You're so a-peeling!",
    description:
      "Bright orange segments that look good enough to squeeze. Pure sweet citrus bliss — bright, juicy and instantly cheerful.",
    scent: "Pure sweet citrus",
    shapeLabel: "🍊 orange segment shaped",
    packSize: "8–10 melts",
    price: 24900,
    stock: 42,
    accentColor: "#E07A2C",
    tintColor: "#FFF0E2",
    isFeatured: true,
  },
  {
    slug: "love-spell",
    name: "Love Spell Wax Melts",
    quote: "Love is in the air",
    description: "Romantic floral notes wrapped in warm vanilla — a melt made for cosy evenings and sweet moments.",
    scent: "Floral & vanilla",
    shapeLabel: "💕 heart shaped",
    packSize: "8–10 melts",
    price: 24900,
    stock: 30,
    accentColor: "#E8384F",
    tintColor: "#FFEDF1",
    isFeatured: false,
  },
  {
    slug: "lego",
    name: "Lego Wax Melts",
    quote: "Build happy memories",
    description: "Playful brick-shaped melts with a bright, cheerful scent — fun to look at and lovely to melt.",
    scent: "Sweet candy & vanilla",
    shapeLabel: "🧱 brick shaped",
    packSize: "8–10 melts",
    price: 24900,
    stock: 30,
    accentColor: "#E0A02A",
    tintColor: "#FFF6E3",
    isFeatured: false,
  },
  {
    slug: "pink-cloud",
    name: "Pink Cloud Wax Melts",
    quote: "Float away",
    description: "Soft fluffy cloud melts in blush pink with a gentle, dreamy fragrance.",
    scent: "Soft cotton & vanilla",
    shapeLabel: "☁️ cloud shaped",
    packSize: "8–10 melts",
    price: 24900,
    stock: 30,
    accentColor: "#F87CA4",
    tintColor: "#FFEDF1",
    isFeatured: false,
  },
  {
    slug: "purple-cloud",
    name: "Purple Cloud Wax Melts",
    quote: "Dream a little",
    description: "Lilac cloud melts with a calm, relaxing scent perfect for winding down.",
    scent: "Lavender & musk",
    shapeLabel: "☁️ cloud shaped",
    packSize: "8–10 melts",
    price: 24900,
    stock: 30,
    accentColor: "#8E70B8",
    tintColor: "#F3EFFA",
    isFeatured: false,
  },
  {
    slug: "sky-cloud",
    name: "Sky Cloud Wax Melts",
    quote: "Head in the clouds",
    description: "Baby-blue cloud melts with a fresh, airy fragrance that lightens any room.",
    scent: "Fresh linen & breeze",
    shapeLabel: "☁️ cloud shaped",
    packSize: "8–10 melts",
    price: 24900,
    stock: 30,
    accentColor: "#6BA3D6",
    tintColor: "#E8F4FC",
    isFeatured: false,
  },
  {
    slug: "vanilla-sky",
    name: "Vanilla Sky Wax Melts",
    quote: "Pure comfort",
    description: "Classic vanilla in a dreamy sky-blue melt — warm, familiar and endlessly cosy.",
    scent: "Pure vanilla",
    shapeLabel: "☁️ cloud shaped",
    packSize: "8–10 melts",
    price: 24900,
    stock: 30,
    accentColor: "#C4A882",
    tintColor: "#FFF9F0",
    isFeatured: false,
  },
  {
    slug: "hydrangea",
    name: "Hydrangea Wax Melts",
    quote: "Bloom where you're planted",
    description: "Delicate floral melts inspired by hydrangea blooms — fresh, pretty and calming.",
    scent: "Floral & green",
    shapeLabel: "🌸 flower shaped",
    packSize: "8–10 melts",
    price: 24900,
    stock: 30,
    accentColor: "#9B8EC4",
    tintColor: "#F0EDFA",
    isFeatured: false,
  },
  {
    slug: "juhi",
    name: "Juhi Wax Melts",
    quote: "Night-blooming beauty",
    description: "Jasmine-inspired melts with an intoxicating floral scent that fills the room after dark.",
    scent: "Jasmine & white florals",
    shapeLabel: "🌼 flower shaped",
    packSize: "8–10 melts",
    price: 24900,
    stock: 30,
    accentColor: "#F5E6A3",
    tintColor: "#FFF9E6",
    isFeatured: false,
  },
  {
    slug: "moonlit-bloom",
    name: "Moonlit Bloom Wax Melts",
    quote: "Glow softly",
    description: "Evening florals with a hint of musk — like a garden under moonlight.",
    scent: "Night florals & musk",
    shapeLabel: "🌙 flower shaped",
    packSize: "8–10 melts",
    price: 24900,
    stock: 30,
    accentColor: "#7B6B9E",
    tintColor: "#EDE8F5",
    isFeatured: false,
  },
  {
    slug: "padma",
    name: "Padma Wax Melts",
    quote: "Sacred bloom",
    description: "Lotus-inspired melts with a serene, spa-like fragrance.",
    scent: "Lotus & sandalwood",
    shapeLabel: "🪷 lotus shaped",
    packSize: "8–10 melts",
    price: 24900,
    stock: 30,
    accentColor: "#E07A9B",
    tintColor: "#FFF0F5",
    isFeatured: false,
  },
  {
    slug: "pushpanjali",
    name: "Pushpanjali Wax Melts",
    quote: "An offering of scent",
    description: "Traditional floral incense notes in a hand-poured melt — warm, devotional and beautiful.",
    scent: "Incense & marigold",
    shapeLabel: "🌺 flower shaped",
    packSize: "8–10 melts",
    price: 24900,
    stock: 30,
    accentColor: "#E07A2C",
    tintColor: "#FFF0E2",
    isFeatured: false,
  },
  {
    slug: "tropical-bloom",
    name: "Tropical Bloom Wax Melts",
    quote: "Paradise found",
    description: "Bright tropical florals with a splash of citrus — instant holiday energy.",
    scent: "Tropical florals & citrus",
    shapeLabel: "🌴 flower shaped",
    packSize: "8–10 melts",
    price: 24900,
    stock: 30,
    accentColor: "#3CB878",
    tintColor: "#E8F8EF",
    isFeatured: false,
  },
];

async function main() {
  const adminHash = await bcrypt.hash("admin123", 12);
  const userHash = await bcrypt.hash("user123", 12);

  await db.user.upsert({
    where: { email: "admin@flames.example" },
    update: {},
    create: {
      email: "admin@flames.example",
      name: "Flames Owner",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  await db.user.upsert({
    where: { email: "hello@example.com" },
    update: {},
    create: {
      email: "hello@example.com",
      name: "Demo Customer",
      passwordHash: userHash,
      role: "CUSTOMER",
    },
  });

  for (const product of products) {
    const imgs = productImages(product.slug);
    await db.product.upsert({
      where: { slug: product.slug },
      update: { ...product, ...imgs },
      create: { ...product, ...imgs },
    });
  }

  console.log(`Seed complete — ${products.length} products with real images.`);
  console.log("Admin: admin@flames.example / admin123");
  console.log("Customer: hello@example.com / user123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
