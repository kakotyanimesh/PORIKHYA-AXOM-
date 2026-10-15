import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { Prisma, prisma } from "@repo/db";

export class RateLimitExceededError extends Error {
  constructor() {
    super("Too many requests. Please wait a minute and try again.");
    this.name = "RateLimitExceededError";
  }
}

/**
 * Shared Postgres-backed limiter for server actions. The atomic upsert works
 * across Vercel instances; Better Auth's own limiter separately protects its
 * HTTP endpoints.
 */
export async function enforceRateLimit(opts: {
  name: string;
  limit: number;
  windowSeconds: number;
  identity?: string;
}): Promise<void> {
  const requestHeaders = await headers();
  const ip =
    requestHeaders.get("x-real-ip") ??
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown-ip";
  const now = BigInt(Date.now());
  const windowMs = BigInt(opts.windowSeconds * 1000);
  // Authenticated actions get both an IP bucket and a user bucket. That stops
  // one account from fanning out across IPs and one IP from rotating accounts.
  const identities = opts.identity ? [ip, `user:${opts.identity}`] : [ip];
  const counts = await Promise.all(
    identities.map(async (identity) => {
      const key = createHash("sha256")
        .update(`app:${opts.name}:${identity}`)
        .digest("hex");
      const rows = await prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`
        INSERT INTO "rate_limit" ("id", "key", "count", "lastRequest")
        VALUES (${key}, ${key}, 1, ${now})
        ON CONFLICT ("key") DO UPDATE SET
          "count" = CASE
            WHEN "rate_limit"."lastRequest" <= ${now - windowMs} THEN 1
            ELSE "rate_limit"."count" + 1
          END,
          "lastRequest" = CASE
            WHEN "rate_limit"."lastRequest" <= ${now - windowMs} THEN ${now}
            ELSE "rate_limit"."lastRequest"
          END
        RETURNING "count"
      `);
      return rows[0]?.count ?? 0;
    }),
  );

  if (counts.some((count) => count > opts.limit)) {
    throw new RateLimitExceededError();
  }
}
