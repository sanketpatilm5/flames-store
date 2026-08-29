"use client";

import { useEffect, useRef } from "react";

const SESSION_KEY = "flames_visit_session";

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
  }).catch(() => {});
}

/**
 * Logs approximate IP place, then asks the browser for precise GPS.
 * Only the native browser permission dialog is shown — no custom UI.
 */
export function VisitorTracker() {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    const sessionId = getOrCreateSessionId();
    const path = window.location.pathname;

    // Always store approximate city/region from IP
    void postVisit({ sessionId, path });

    if (!("geolocation" in navigator)) return;

    // Browser shows its own Allow / Never allow prompt
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
      () => {
        // User denied or unavailable — IP visit already saved
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    );
  }, []);

  return null;
}
