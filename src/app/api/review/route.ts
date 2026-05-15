import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { businessId, authorName, authorEmail, rating, title, body: reviewBody } = body

    if (!businessId || !authorName || !rating || !reviewBody) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const ratingNum = parseInt(String(rating))
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 })
    }

    await prisma.review.create({
      data: {
        businessId,
        authorName,
        authorEmail: authorEmail || null,
        rating: ratingNum,
        title: title || null,
        body: reviewBody,
        status: "pending",
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Review error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
