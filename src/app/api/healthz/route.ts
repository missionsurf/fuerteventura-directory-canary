import { NextResponse } from "next/server"

export async function GET() {
  const rawUrl = process.env.DATABASE_URL ?? "NOT_SET"
  const token = process.env.TURSO_AUTH_TOKEN ?? ""

  // Try multiple URL formats
  const urls = [
    rawUrl,
    rawUrl.replace("libsql://", "wss://"),
    rawUrl.replace("libsql://", "https://"),
  ]

  for (const url of urls) {
    try {
      const { createClient } = await import("@libsql/client/node")
      const client = createClient({ url, authToken: token })
      const res = await client.execute("SELECT COUNT(*) as n FROM Category")
      await client.close()
      return NextResponse.json({ ok: true, url: url.slice(0, 50), categories: res.rows[0] })
    } catch (e: any) {
      if (url === urls[urls.length - 1]) {
        return NextResponse.json({ ok: false, tried: urls.map(u => u.slice(0, 50)), error: e.message }, { status: 500 })
      }
    }
  }
  return NextResponse.json({ ok: false }, { status: 500 })
}
