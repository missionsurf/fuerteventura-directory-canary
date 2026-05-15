import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { businessId, name, email, phone, subject, message } = body

    if (!businessId || !name || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } })
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })

    await prisma.contact.create({
      data: {
        businessId,
        name,
        email: email || null,
        phone: phone || null,
        subject: subject || null,
        message,
        status: "new",
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Contact error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
