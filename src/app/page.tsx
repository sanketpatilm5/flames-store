import Link from "next/link";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";
import { BrandLogo } from "@/components/BrandLogo";
import { Reveal } from "@/components/Reveal";
import { HeroCardStack, type HeroCard } from "@/components/HeroCardStack";
import { HeroBlobs, Sparkles, WaveDivider } from "@/components/Decor";

const PERKS = [
  {
    icon: "🌱",
    title: "100% soy wax",
    text: "Plant based, clean burning and slow melting — so the scent lingers for hours.",
    tint: "var(--color-mint)",
  },
  {
    icon: "🤍",
    title: "No flame, no soot",
    text: "The wax never burns. Warm it gently and your walls stay as clean as they started.",
    tint: "var(--color-sky)",
  },
  {
    icon: "🎁",
    title: "Gift ready",
    text: "Every pouch is hand designed, so it is already wrapped before you even wrap it.",
    tint: "var(--color-lav)",
  },
  {
    icon: "🫧",
    title: "Tiny batches",
    text: "Melted, scented and poured by hand — which is why no two pouches match exactly.",
    tint: "var(--color-butter)",
  },
];

const STEPS = [
  ["Pop one in", "Drop a melt into the top dish of any wax warmer."],
  ["Warm it gently", "Light the tea light underneath, or switch on your electric warmer."],
  ["Let it drift", "In a few minutes the scent fills the room and just keeps going."],
  ["Swap & repeat", "When the scent fades, let the wax set, pop it out and start a new one."],
];

const LOVE_NOTES = [
  {
    quote: "My whole room smells like a bakery and I did not have to light a single thing.",
    name: "Ananya",
    shape: "coffee bean pouch",
  },
  {
    quote: "The little strawberries are far too cute to melt. I did melt them. Worth it.",
    name: "Riya",
    shape: "strawberry pouch",
  },
  {
    quote: "Gifted a pouch to my flatmate and now she keeps stealing mine.",
    name: "Meher",
    shape: "star pouch",
  },
];

const FAQ = [
  {
    q: "Do I need a special warmer?",
    a: "Any wax warmer works — a tea light burner or an electric one. Just pop a melt in the top dish and let it do its thing.",
  },
  {
    q: "How long does one melt last?",
    a: "Most melts keep scenting for around 8 to 12 hours of warming, spread over several sessions. When the scent fades, let the wax harden and pop it out.",
  },
  {
    q: "Is it safe around pets and kids?",
    a: "There is no open flame touching the wax and no soot. Keep the warmer itself out of reach the same way you would any warm surface.",
  },
  {
    q: "How is it packed?",
    a: "Each pouch is hand sealed and tucked into a padded mailer with a little note, so it arrives ready to gift.",
  },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await connection();

  const products = await db.product.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: { name: "asc" },
    take: 6,
  });

  // The hero deck is just the featured melts, shuffled to the front of the hand.
  const heroCards: HeroCard[] = products.map((product) => ({
    src: product.imageUrl,
    alt: `${product.name} — hand poured soy wax melts`,
    name: product.name.replace(/ wax melts$/i, ""),
    href: `/products/${product.slug}`,
  }));

  return (
    <>
      {/* ---------------------------------------------------------------- hero */}
      <section className="relative overflow-hidden py-[clamp(3rem,8vw,6.5rem)]">
        <HeroBlobs />
        <Sparkles
          specs={[
            { top: "12%", left: "6%", size: "22px", delay: "0s" },
            { top: "26%", left: "48%", size: "14px", color: "#f87ca4", delay: "-0.8s" },
            { top: "72%", left: "10%", size: "16px", color: "#b3a2f2", delay: "-1.6s" },
            { top: "8%", left: "88%", size: "18px", delay: "-2.2s" },
          ]}
        />

        <div className="shell grid gap-12 md:grid-cols-[1.05fr_1fr] md:items-center">
          <Reveal>
            <p className="eyebrow">
              <span aria-hidden="true">✿</span> 100% soy wax · poured in tiny batches
            </p>
            <h1 className="mb-5 mt-2 text-[clamp(2.4rem,1.5rem+4vw,4.3rem)]">
              Cute little wax melts,
              <br />
              <span className="script text-gradient">hand poured with love</span>
            </h1>
            <p className="mb-8 max-w-lg text-lg text-ink-soft">
              Strawberries, stars, ghosts, coffee beans and orange slices — teeny soy wax melts
              that fill your whole room with something lovely.
            </p>

            <div className="mb-9 flex flex-wrap gap-3">
              <Link href="/shop" className="btn btn-lg">
                Shop the melts
              </Link>
              <Link href="#how" className="btn btn-ghost btn-lg">
                How they work
              </Link>
            </div>

            <ul className="flex flex-wrap gap-x-9 gap-y-4 font-display">
              {[
                ["5", "little shapes"],
                ["100%", "soy wax"],
                ["♥", "hand poured"],
                ["₹999+", "ships free"],
              ].map(([big, small]) => (
                <li key={small}>
                  <b className="block text-2xl text-flame">{big}</b>
                  <span className="text-sm text-ink-soft">{small}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal variant="zoom" delay={120} className="relative">
            {/* offset colour card behind the deck */}
            <div
              aria-hidden="true"
              className="absolute -inset-4 -z-10 rounded-[46px] bg-bubble-lt/55 [animation:blob_24s_ease-in-out_infinite]"
            />
            <HeroCardStack cards={heroCards} />
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------- ribbon */}
      <div className="marquee overflow-hidden bg-flame py-3 text-white" aria-hidden="true">
        <div className="ribbon-track flex w-max whitespace-nowrap font-display text-sm font-semibold">
          {[0, 1].map((i) => (
            <span key={i} className="px-4">
              soy wax candles ♥ hand poured with love ♥ small batch ♥ cruelty free ♥ made to be
              gifted ♥&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* --------------------------------------------------------- collection */}
      <section id="shop" className="section-y">
        <div className="shell">
          <Reveal className="mx-auto mb-12 max-w-xl text-center">
            <p className="eyebrow">the collection</p>
            <h2 className="mb-2 text-[clamp(1.95rem,1.35rem+2.5vw,3.05rem)]">Meet the melts</h2>
            <p className="text-ink-soft">Five little shapes, each in its own hand-designed pouch.</p>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, i) => (
              <Reveal key={product.id} as="div" delay={i * 80} className="h-full">
                <ProductCard product={product} index={i} />
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12 text-center">
            <Link href="/shop" className="btn btn-lg">
              View all melts <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------------------------------------- perks */}
      <WaveDivider to="#fff9f0" />
      <section className="bg-cream pb-[clamp(4rem,9vw,7.5rem)] pt-[clamp(2rem,4vw,3rem)]">
        <div className="shell">
          <Reveal className="mx-auto mb-12 max-w-xl text-center">
            <p className="eyebrow">why you&apos;ll love them</p>
            <h2 className="text-[clamp(1.8rem,1.3rem+2.2vw,2.7rem)]">Small things, done properly</h2>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PERKS.map((perk, i) => (
              <Reveal
                key={perk.title}
                delay={i * 90}
                className="panel panel-pad h-full transition-transform duration-300 hover:-translate-y-2"
              >
                <span
                  className="mb-4 grid h-14 w-14 place-items-center rounded-[20px] text-2xl"
                  style={{ background: perk.tint, opacity: 0.95 }}
                  aria-hidden="true"
                >
                  {perk.icon}
                </span>
                <h3 className="mb-2 text-lg">{perk.title}</h3>
                <p className="text-sm text-ink-soft">{perk.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ how it works */}
      <section id="how" className="section-y relative overflow-hidden">
        <Sparkles
          specs={[
            { top: "14%", left: "4%", size: "16px", color: "#ffb6cd", delay: "-1s" },
            { top: "78%", left: "93%", size: "20px", color: "#b3a2f2", delay: "-2s" },
          ]}
        />
        <div className="shell">
          <Reveal className="mx-auto mb-14 max-w-xl text-center">
            <p className="eyebrow">so easy</p>
            <h2 className="mb-2 text-[clamp(1.95rem,1.35rem+2.5vw,3.05rem)]">How a wax melt works</h2>
            <p className="text-ink-soft">
              No flame near the wax, no soot, no mess. Just warmth and a lovely smell.
            </p>
          </Reveal>

          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([title, text], i) => (
              <Reveal as="li" key={title} delay={i * 110} className="step text-center">
                <span className="step-num mx-auto mb-4">{i + 1}</span>
                <h3 className="mb-2 text-lg">{title}</h3>
                <p className="text-sm text-ink-soft">{text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------- love notes */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blush-dp/70 to-transparent py-[clamp(3.5rem,8vw,6rem)]">
        <div className="shell">
          <Reveal className="mx-auto mb-12 max-w-xl text-center">
            <p className="eyebrow">love notes</p>
            <h2 className="text-[clamp(1.8rem,1.3rem+2.2vw,2.7rem)]">
              What people tell us <span className="script text-flame">♥</span>
            </h2>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-3">
            {LOVE_NOTES.map((note, i) => (
              <Reveal
                key={note.name}
                delay={i * 100}
                className="panel panel-pad flex h-full flex-col transition-transform duration-300 hover:-translate-y-2"
              >
                <span className="mb-3 text-2xl text-butter" aria-hidden="true">
                  ★★★★★
                </span>
                <p className="mb-5 flex-1 text-ink">&ldquo;{note.quote}&rdquo;</p>
                <p className="font-display font-semibold">{note.name}</p>
                <p className="text-sm text-ink-soft">bought the {note.shape}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- about */}
      <section id="about" className="section-y relative overflow-hidden bg-cream/70">
        <div className="shell grid gap-12 md:grid-cols-2 md:items-center">
          <Reveal variant="zoom" className="relative flex items-center justify-center py-8">
            <span
              aria-hidden="true"
              className="absolute h-56 w-56 rounded-full bg-bubble-lt/50 blur-2xl"
            />
            <span className="relative inline-block animate-bob">
              <BrandLogo variant="badge" size="lg" linked={false} />
            </span>
          </Reveal>

          <Reveal delay={100}>
            <p className="eyebrow">about flames</p>
            <h2 className="mb-4 text-[clamp(1.8rem,1.3rem+2.2vw,2.7rem)]">
              Every single one, poured by hand
            </h2>
            <p className="mb-4 text-ink-soft">
              Flames is a small-batch soy wax studio. Everything is melted, scented, poured and
              packed by hand — which is why every pouch is a little bit different.
            </p>
            <p className="text-ink-soft">
              We use 100% soy wax because it burns clean, melts slowly and holds scent beautifully.
            </p>
            <p className="script mt-5 text-2xl text-flame">
              hand poured with love <span className="inline-block animate-heartbeat">♥</span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------- faq */}
      <section id="faq" className="section-y">
        <div className="shell max-w-3xl">
          <Reveal className="mb-10 text-center">
            <p className="eyebrow">questions</p>
            <h2 className="text-[clamp(1.8rem,1.3rem+2.2vw,2.7rem)]">Things people ask</h2>
          </Reveal>

          {FAQ.map((item, i) => (
            <Reveal key={item.q} delay={i * 70}>
              <details className="faq">
                <summary>{item.q}</summary>
                <p className="faq-body">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ cta band */}
      <section className="pb-[clamp(4rem,9vw,7rem)]">
        <div className="shell">
          <Reveal
            variant="zoom"
            className="relative overflow-hidden rounded-[34px] px-6 py-14 text-center text-white"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 -z-10"
              style={{ background: "var(--grad-candy)" }}
            />
            <div className="dots absolute inset-0 -z-10 opacity-20" aria-hidden="true" />
            <p className="script mb-2 text-2xl">ready when you are</p>
            <h2 className="mx-auto mb-6 max-w-xl text-[clamp(1.7rem,1.2rem+2.2vw,2.6rem)] text-white">
              Make your room smell like your favourite memory
            </h2>
            <Link href="/shop" className="btn btn-white btn-lg">
              Pick your melts <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
