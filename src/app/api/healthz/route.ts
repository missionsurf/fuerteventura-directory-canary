import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  const rawUrl = process.env.DATABASE_URL ?? "NOT_SET"
  const token = process.env.TURSO_AUTH_TOKEN ?? ""
  // Use HTTPS URL for HTTP mode — always works in serverless
  const httpUrl = rawUrl.replace(/^libsql:\/\//, "https://")

  try {
    const { createClient } = await import("@libsql/client/http")
    const client = createClient({ url: httpUrl, authToken: token })
    const res = await client.execute("SELECT COUNT(*) as n FROM Category")
    return NextResponse.json({ ok: true, url: httpUrl.slice(0, 50), n: res.rows[0] })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message, url: httpUrl.slice(0, 50) }, { status: 500 })
  }
}
