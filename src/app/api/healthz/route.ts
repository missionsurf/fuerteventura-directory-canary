import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

export async function GET() {
  const dbUrl = process.env.DATABASE_URL ?? "NOT_SET"
  const hasToken = !!process.env.TURSO_AUTH_TOKEN
  const tokenLen = process.env.TURSO_AUTH_TOKEN?.length ?? 0

  try {
    const adapter = new PrismaLibSql({
      url: dbUrl,
      ...(process.env.TURSO_AUTH_TOKEN && { authToken: process.env.TURSO_AUTH_TOKEN }),
    })
    const prisma = new PrismaClient({ adapter })
    const count = await prisma.category.count()
    await prisma.$disconnect()
    return NextResponse.json({ ok: true, categories: count, dbUrlPrefix: dbUrl.slice(0, 40), hasToken, tokenLen })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message, dbUrlPrefix: dbUrl.slice(0, 40), hasToken, tokenLen }, { status: 500 })
  }
}
