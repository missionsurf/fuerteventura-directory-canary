import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

function createPrismaClient() {
  const rawUrl = (process.env.DATABASE_URL ?? "file:./prisma/dev.db").trim()

  // Convert libsql:// → https:// for HTTP transport (avoids WebSocket issues in serverless)
  const url = rawUrl.startsWith("libsql://")
    ? rawUrl.replace("libsql://", "https://")
    : rawUrl

  const authToken = process.env.TURSO_AUTH_TOKEN

  // PrismaLibSql takes a config object and creates the @libsql/client internally.
  // Because @prisma/adapter-libsql is in serverExternalPackages, it is loaded as a
  // CJS Node.js external (require), which correctly picks up lib-cjs/node.js from
  // @libsql/client — avoiding the browser/edge-light web.js bundle.
  const adapter = new PrismaLibSql({
    url,
    ...(authToken && { authToken }),
  })

  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
