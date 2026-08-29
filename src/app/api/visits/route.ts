import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isBuildTime } from "@/lib/runtime-db";
import { z } from "zod";

const visitSchema = z.object({
  sessionId: z.string().min(8).max(80),
  path: z.string().max(200).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  accuracy: z.number().min(0).max(50000).optional(),
});

function clientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return request.headers.get("x-real-ip");
}

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 24);
}

async function lookupIpLocation(ip: string | null): Promise<{
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}> {
  if (!ip || ip === "127.0.0.1" || ip === "::1") return {};
  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
    });
    if (!res.ok) return {};
    const data = (await res.json()) as {
      city?: string;
      region?: string;
      country_name?: string;
      latitude?: number;
      longitude?: number;
      error?: boolean;
    };
    if (data.error) return {};
    return {
      city: data.city,
      region: data.region,
      country: data.country_name,
      latitude: typeof data.latitude === "number" ? data.latitude : undefined,
      longitude: typeof data.longitude === "number" ? data.longitude : undefined,
    };
  } catch {
    return {};
  }
}

export async function POST(request: NextRequest) {
  if (isBuildTime()) return NextResponse.json({ ok: true });

  const body = await request.json().catch(() => null);
  const parsed = visitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid visit payload" }, { status: 400 });
  }

  const { sessionId, path, latitude, longitude, accuracy } = parsed.data;
  const ip = clientIp(request);
  const hasGps =
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  const ipLocation = hasGps ? {} : await lookupIpLocation(ip);

  await db.siteVisit.create({
    data: {
      sessionId,
      ipHash: ip ? hashIp(ip) : null,
      city: ipLocation.city ?? null,
      region: ipLocation.region ?? null,
      country: ipLocation.country ?? null,
      latitude: hasGps ? latitude : (ipLocation.latitude ?? null),
      longitude: hasGps ? longitude : (ipLocation.longitude ?? null),
      accuracy: hasGps ? (accuracy ?? null) : null,
      source: hasGps ? "gps" : "ip",
      path: path ?? null,
      userAgent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
    },
  });

  return NextResponse.json({ ok: true, source: hasGps ? "gps" : "ip" });
}

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const visits = await db.siteVisit.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ visits });
}
