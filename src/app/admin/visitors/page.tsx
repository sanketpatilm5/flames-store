import { db } from "@/lib/db";
import { runQuery } from "@/lib/runtime-db";

export const metadata = { title: "Visitors" };
export const dynamic = "force-dynamic";

function formatPlace(visit: {
  city: string | null;
  region: string | null;
  country: string | null;
}) {
  return [visit.city, visit.region, visit.country].filter(Boolean).join(", ") || "Unknown";
}

function mapsLink(lat: number | null, lng: number | null) {
  if (lat == null || lng == null) return null;
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export default async function AdminVisitorsPage() {
  const visits = await runQuery(
    () =>
      db.siteVisit.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    [],
  );

  const withGps = visits.filter((v) => v.source === "gps").length;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl">Visitors</h1>
          <p className="mt-1 text-sm text-ink-soft">
            City/region from network (approximate). Precise GPS only when a visitor allows it.
          </p>
        </div>
        <p className="font-display text-sm text-ink-soft">
          {visits.length} recent · {withGps} with GPS
        </p>
      </div>

      {visits.length === 0 ? (
        <div className="panel panel-pad text-center">
          <p className="font-display text-lg">No visits logged yet</p>
          <p className="mt-2 text-sm text-ink-soft">Open the storefront once to create the first entry.</p>
        </div>
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-blush-dp font-display">
              <tr>
                <th className="p-4">When</th>
                <th className="p-4">Place</th>
                <th className="p-4">Source</th>
                <th className="p-4">Page</th>
                <th className="p-4">Map</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit) => {
                const link = mapsLink(visit.latitude, visit.longitude);
                return (
                  <tr key={visit.id} className="border-b border-blush-dp/50">
                    <td className="p-4 whitespace-nowrap text-ink-soft">
                      {new Date(visit.createdAt).toLocaleString("en-IN")}
                    </td>
                    <td className="p-4">{formatPlace(visit)}</td>
                    <td className="p-4 capitalize">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-display ${
                          visit.source === "gps"
                            ? "bg-blush text-flame"
                            : "bg-cream text-ink-soft"
                        }`}
                      >
                        {visit.source}
                        {visit.accuracy != null ? ` · ±${Math.round(visit.accuracy)}m` : ""}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-ink-soft">{visit.path ?? "—"}</td>
                    <td className="p-4">
                      {link ? (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-display text-flame no-underline hover:underline"
                        >
                          Open
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
