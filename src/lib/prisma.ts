import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

function createPrismaClient() {
  const rawUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db"
  // For remote Turso/libsql URLs, convert libsql:// -> https:// so the adapter
  // uses HTTP mode — works reliably in serverless environments (Vercel, etc.)
  const url = rawUrl.startsWith("libsql://")
    ? rawUrl.replace("libsql://", "https://")
    : rawUrl
  const adapter = new PrismaLibSql({
    url,
    ...(process.env.TURSO_AUTH_TOKEN && { authToken: process.env.TURSO_AUTH_TOKEN }),
  })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
