import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const rawUrl = process.env.DATABASE_URL ?? "NOT_SET"
  const token = process.env.TURSO_AUTH_TOKEN ?? ""
  const baseUrl = rawUrl.trim().replace(/^libsql:\/\//, "https://")

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
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      data: (data as any)?.results?.[0]?.response?.result?.rows,
    })
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 })
  }
}
