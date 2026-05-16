import { NextResponse } from "next/server"

export async function GET() {
  const dbUrl = process.env.DATABASE_URL ?? "NOT_SET"
  const token = process.env.TURSO_AUTH_TOKEN ?? ""

  try {
    // Use the node-specific entry point to avoid browser bundle resolution
    const { createClient } = await import("@libsql/client/node")
    const client = createClient({ url: dbUrl, authToken: token })
    const res = await client.execute("SELECT COUNT(*) as n FROM Category")
    await client.close()
    return NextResponse.json({
      ok: true,
      categories: res.rows[0],
      dbUrlPrefix: dbUrl.slice(0, 50),
    })
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      error: e.message,
      dbUrlPrefix: dbUrl.slice(0, 50),
      hasToken: !!token,
    }, { status: 500 })
  }
}
