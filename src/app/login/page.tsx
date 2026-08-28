"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Blobs } from "@/components/Decor";

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@flames.example", password: "admin123" },
  { label: "Customer", email: "hello@example.com", password: "user123" },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("That email and password don't match. Try again?");
      setLoading(false);
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <section className="section-y-sm relative overflow-hidden">
      <Blobs
        specs={[
          { color: "#ffb6cd", size: "320px", top: "-10%", left: "-10%", opacity: 0.5 },
          { color: "#b3a2f2", size: "260px", bottom: "-12%", right: "-8%", opacity: 0.3, delay: "-8s" },
        ]}
      />

      <div className="shell max-w-md">
        <div className="panel panel-pad animate-pop-in">
          <p className="eyebrow w-full justify-center">welcome back</p>
          <h1 className="mb-1 text-center text-3xl">
            Sign <span className="script text-gradient">in</span>
          </h1>
          <p className="mb-7 text-center text-sm text-ink-soft">
            Your cart is waiting exactly where you left it.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="input pr-14"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 font-display text-xs font-semibold text-ink-soft transition hover:text-flame"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-2xl bg-flame/10 px-4 py-3 text-sm font-semibold text-flame" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="btn w-full" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" aria-hidden="true" /> Signing in…
                </>
              ) : (
                <>
                  Sign in <span aria-hidden="true">♥</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 rounded-[18px] border-2 border-dashed border-bubble-lt bg-blush/60 p-4">
            <p className="mb-2 font-display text-xs uppercase tracking-[0.14em] text-ink-soft">
              Demo accounts — tap to fill
            </p>
            <div className="flex flex-wrap gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  className="chip transition hover:-translate-y-0.5 hover:text-flame"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                  }}
                >
                  {account.label}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-ink-soft">
            New here?{" "}
            <Link href="/register" className="link-swipe font-semibold text-flame">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <section className="section-y-sm">
          <div className="shell max-w-md">
            <div className="skeleton h-[460px] rounded-[26px]" />
          </div>
        </section>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
