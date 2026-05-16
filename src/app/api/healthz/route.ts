import { NextResponse } from "next/server"

export async function GET() {
  const dbUrl = process.env.DATABASE_URL ?? "NOT_SET"
  const token = process.env.TURSO_AUTH_TOKEN ?? ""

  // Test 1: raw libsql client
  try {
    const { createClient } = await import("@libsql/client")
    const client = createClient({ url: dbUrl, authToken: token })
    const res = await client.execute("SELECT COUNT(*) as n FROM Category")
    await client.close()
    return NextResponse.json({
      ok: true,
      categories: res.rows[0],
      dbUrlPrefix: dbUrl.slice(0, 50),
      hasToken: !!token,
    })
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      stage: "libsql-client",
      error: e.message,
      dbUrlPrefix: dbUrl.slice(0, 50),
      hasToken: !!token,
      tokenLen: token.length,
    }, { status: 500 })
  }
}
