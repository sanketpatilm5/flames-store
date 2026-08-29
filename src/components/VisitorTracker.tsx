"use client";

import { useEffect, useRef, useState } from "react";

const SESSION_KEY = "flames_visit_session";
const GPS_PREF_KEY = "flames_gps_pref";

function getOrCreateSessionId(): string {
  try {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return `tmp-${Date.now()}`;
  }
}

async function postVisit(payload: Record<string, unknown>) {
  await fetch("/api/visits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  });
}

/**
 * Records approximate location from IP on first visit.
 * Precise GPS is only sent after the visitor taps Allow.
 */
export function VisitorTracker() {
  const sent = useRef(false);
  const [askGps, setAskGps] = useState(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    const sessionId = getOrCreateSessionId();
    const path = window.location.pathname;
    const pref = localStorage.getItem(GPS_PREF_KEY);

    // Always log approximate visit (city/region via IP on the server)
    void postVisit({ sessionId, path });

    if (pref === "denied") return;
    if (pref === "allowed" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          void postVisit({
            sessionId,
            path,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        () => localStorage.setItem(GPS_PREF_KEY, "denied"),
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 600_000 },
      );
      return;
    }

    // Soft prompt — never silent GPS
    const timer = window.setTimeout(() => setAskGps(true), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  function allowGps() {
    localStorage.setItem(GPS_PREF_KEY, "allowed");
    setAskGps(false);
    if (!("geolocation" in navigator)) return;
    const sessionId = getOrCreateSessionId();
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void postVisit({
          sessionId,
          path: window.location.pathname,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      () => localStorage.setItem(GPS_PREF_KEY, "denied"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function denyGps() {
    localStorage.setItem(GPS_PREF_KEY, "denied");
    setAskGps(false);
  }

  if (!askGps) return null;

  return (
    <div
      role="dialog"
      aria-label="Location preference"
      className="fixed bottom-4 left-4 right-4 z-[90] mx-auto max-w-md rounded-[22px] border border-blush-dp bg-white/95 p-4 shadow-[0_18px_44px_-18px_rgba(160,60,90,0.45)] backdrop-blur md:left-auto"
    >
      <p className="font-display text-sm font-semibold text-ink">Share your location?</p>
      <p className="mt-1 text-sm text-ink-soft">
        We already note your city from your network. Allow GPS only if you want a more precise pin —
        you can decline anytime.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="btn btn-sm" onClick={allowGps}>
          Allow
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={denyGps}>
          Not now
        </button>
      </div>
    </div>
  );
}
