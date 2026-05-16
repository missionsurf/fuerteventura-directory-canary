import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const count = await prisma.category.count()
    return NextResponse.json({ ok: true, categories: count, db: process.env.DATABASE_URL?.slice(0, 30) })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
