"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Blobs } from "@/components/Decor";

/** Cheap, friendly strength read-out — the API is still the real validator. */
function scorePassword(value: string) {
  let score = 0;
  if (value.length >= 8) score++;
  if (/[a-zA-Z]/.test(value) && /[0-9]/.test(value)) score++;
  if (value.length >= 12) score++;
  if (/[^a-zA-Z0-9]/.test(value)) score++;
  return Math.min(score, 4);
}

const STRENGTH = [
  { label: "too short", color: "var(--color-blush-dp)" },
  { label: "getting there", color: "#ffab86" },
  { label: "good", color: "#ffd166" },
  { label: "strong", color: "#63d2b8" },
  { label: "lovely", color: "#63d2b8" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = scorePassword(form.password);
  const mismatch =
    form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      const message = data.error?.fieldErrors
        ? Object.values(data.error.fieldErrors).flat().join(", ")
        : (data.error ?? "Registration failed");
      setError(message);
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      router.push("/login");
      return;
    }

    router.push("/shop");
    router.refresh();
  }

  return (
    <section className="section-y-sm relative overflow-hidden">
      <Blobs
        specs={[
          { color: "#ffd166", size: "300px", top: "-12%", right: "-10%", opacity: 0.35 },
          { color: "#ffb6cd", size: "280px", bottom: "-14%", left: "-10%", opacity: 0.5, delay: "-6s" },
        ]}
      />

      <div className="shell max-w-md">
        <div className="panel panel-pad animate-pop-in">
          <p className="eyebrow w-full justify-center">join us</p>
          <h1 className="mb-1 text-center text-3xl">
            Create an <span className="script text-gradient">account</span>
          </h1>
          <p className="mb-7 text-center text-sm text-ink-soft">
            So your cart and orders follow you around.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="label">
                Name
              </label>
              <input
                id="name"
                className="input"
                required
                autoComplete="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input"
                required
                minLength={8}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
              />
              <div className="mt-2 flex items-center gap-2">
                <div className="flex flex-1 gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 flex-1 rounded-full transition-colors duration-300"
                      style={{
                        background: i < strength ? STRENGTH[strength].color : "var(--color-blush-dp)",
                      }}
                    />
                  ))}
                </div>
                <span className="font-display text-xs text-ink-soft">
                  {form.password ? STRENGTH[strength].label : "8+ characters"}
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-soft">
                At least 8 characters with a letter and a number.
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="input"
                required
                autoComplete="new-password"
                aria-invalid={mismatch}
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
              />
              {mismatch && (
                <p className="mt-1 text-xs font-semibold text-flame">
                  These two don&apos;t match yet.
                </p>
              )}
            </div>

            {error && (
              <p className="rounded-2xl bg-flame/10 px-4 py-3 text-sm font-semibold text-flame" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="btn w-full" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" aria-hidden="true" /> Creating account…
                </>
              ) : (
                <>
                  Create account <span aria-hidden="true">♥</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-soft">
            Already have an account?{" "}
            <Link href="/login" className="link-swipe font-semibold text-flame">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
