/** Skip database calls during `next build` static generation */
export function isBuildTime(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

export async function runQuery<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  if (isBuildTime()) return fallback;
  try {
    return await query();
  } catch (error) {
    console.error("[db]", error);
    return fallback;
  }
}
