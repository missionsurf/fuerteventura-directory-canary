import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = slugify(base)
  let i = 1
  while (await prisma.business.findUnique({ where: { slug } })) {
    slug = `${slugify(base)}-${i++}`
  }
  return slug
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password, businessName, category: categorySlug, phone, town } = body

    if (!name || !email || !password || !businessName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if email exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 10)

    // Find category
    const category = categorySlug
      ? await prisma.category.findUnique({ where: { slug: categorySlug } })
      : null

    const slug = await uniqueSlug(businessName)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: "business",
        business: {
          create: {
            name: businessName,
            slug,
            categoryId: category?.id ?? null,
            phone: phone || null,
            town: town || null,
            status: "pending",
            plan: "free",
          },
        },
      },
    })

    return NextResponse.json({ success: true, userId: user.id })
  } catch (err) {
    console.error("Register error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
