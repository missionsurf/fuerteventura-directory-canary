import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const rawUrl = process.env.DATABASE_URL ?? "NOT_SET"
  const token = process.env.TURSO_AUTH_TOKEN ?? ""
  const baseUrl = rawUrl.replace(/^libsql:\/\//, "https://")

  // Test 1: direct fetch to Turso HTTP API (no client library)
  let fetchResult: unknown = null
  try {
    const res = await fetch(`${baseUrl}/v2/pipeline`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [{ type: "execute", stmt: { sql: "SELECT COUNT(*) as n FROM Category" } }, { type: "close" }]
      }),
    })
    const data = await res.json() as Record<string, unknown>
    fetchResult = { ok: res.ok, status: res.status, rows: (data as any)?.results?.[0]?.response?.result?.rows }
  } catch (e: unknown) {
    fetchResult = { error: (e as Error).message }
  }

  // Test 2: Prisma query
  let prismaResult: unknown = null
  try {
    const { prisma } = await import("@/lib/prisma")
    const count = await prisma.category.count()
    prismaResult = { ok: true, count }
  } catch (e: unknown) {
    const err = e as Record<string, unknown>
    prismaResult = {
      error: err.message,
      code: err.code,
      meta: err.meta,
      name: (e as Error).name,
      urlUsed: baseUrl.slice(0, 60),
    }
  }

  return NextResponse.json({
    hasToken: !!token,
    tokenLen: token.length,
    rawUrlLen: rawUrl.length,
    rawUrlEnd: JSON.stringify(rawUrl.slice(-10)), // show trailing chars
    baseUrl: baseUrl.slice(0, 60),
    fetchResult,
    prismaResult,
  })
}
