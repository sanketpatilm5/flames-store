export function getDatabaseUrl(): string {
  let url = process.env.DATABASE_URL?.trim() ?? "";

  // Vercel copy-paste sometimes wraps the value in quotes
  if (
    (url.startsWith('"') && url.endsWith('"')) ||
    (url.startsWith("'") && url.endsWith("'"))
  ) {
    url = url.slice(1, -1);
  }

  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  if (!url.startsWith("postgresql://") && !url.startsWith("postgres://")) {
    throw new Error(
      "DATABASE_URL must be a PostgreSQL connection string starting with postgresql://",
    );
  }

  // channel_binding can break some serverless drivers
  return url.replace(/[&?]channel_binding=[^&]*/g, "");
}
