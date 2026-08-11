/**
 * Prisma Client Singleton
 * ------------------------------------------------------------------
 * Design Pattern: SINGLETON
 *
 * In Next.js development, the module cache is reset on nearly every file
 * change ("hot reload"). If we naively did `new PrismaClient()` at the top
 * of this module, every reload would create a brand new connection pool
 * against PostgreSQL, and old ones would leak until the dev server was
 * restarted - eventually exhausting the database's connection limit.
 *
 * The fix is the Singleton pattern: we stash the single PrismaClient
 * instance on the Node.js `global` object (which *does* survive hot
 * reloads within the same process) and reuse it if it already exists.
 * In production (`NODE_ENV === "production"`) each server process should
 * simply own exactly one instance for its lifetime, so we skip the
 * global cache there and create the client once per process.
 *
 * Every part of the application (repositories, services, server actions)
 * imports `db` from this module rather than instantiating PrismaClient
 * itself - guaranteeing a single, shared instance application-wide.
 */
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and configure it.",
    );
  }

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

type GlobalWithPrisma = typeof globalThis & {
  __gradeflowPrisma__?: PrismaClient;
};

const globalForPrisma = globalThis as GlobalWithPrisma;

export const db: PrismaClient =
  globalForPrisma.__gradeflowPrisma__ ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__gradeflowPrisma__ = db;
}
