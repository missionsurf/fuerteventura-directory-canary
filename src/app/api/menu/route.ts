import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const business = await prisma.business.findUnique({ where: { userId: session.user.id } })
  if (!business) return NextResponse.json({ error: "No business found" }, { status: 404 })

  const { menuItems } = await req.json()
  await prisma.business.update({
    where: { id: business.id },
    data: { menuItems: JSON.stringify(menuItems) },
  })

  return NextResponse.json({ ok: true })
}
