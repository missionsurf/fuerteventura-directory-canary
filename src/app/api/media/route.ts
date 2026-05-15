import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const business = await prisma.business.findUnique({ where: { userId: session.user.id } })
  if (!business) return NextResponse.json({ error: "No business found" }, { status: 404 })

  return NextResponse.json({
    images: business.images ? JSON.parse(business.images) : [],
    menuPdf: business.menuPdf ?? null,
    menuItems: business.menuItems ? JSON.parse(business.menuItems) : [],
  })
}
