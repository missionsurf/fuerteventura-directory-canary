import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const rawUrl = process.env.DATABASE_URL ?? "NOT_SET"
  const token = process.env.TURSO_AUTH_TOKEN ?? ""
  const baseUrl = rawUrl.replace(/^libsql:\/\//, "https://")

  // Test 1: direct fetch to Turso HTTP API (no client library)
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
    const data = await res.json() as any
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      baseUrl: baseUrl.slice(0, 50),
      hasToken: !!token,
      tokenLen: token.length,
      data: data?.results?.[0]?.response?.result?.rows ?? data,
    })
  } catch (e: any) {
    return NextResponse.json({
      ok: false, fetchError: e.message,
      baseUrl: baseUrl.slice(0, 50),
      hasToken: !!token,
    }, { status: 500 })
  }
}
