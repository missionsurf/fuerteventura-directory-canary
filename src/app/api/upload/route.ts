import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { put, del } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"

const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5 MB
const MAX_PDF_BYTES = 10 * 1024 * 1024  // 10 MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const ALLOWED_PDF_TYPES = ["application/pdf"]

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const business = await prisma.business.findUnique({ where: { userId: session.user.id } })
  if (!business) return NextResponse.json({ error: "No business found" }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const type = formData.get("type") as string // "image" | "menu-pdf"

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

  const isImage = type === "image"
  const isPdf = type === "menu-pdf"

  if (!isImage && !isPdf) return NextResponse.json({ error: "Invalid type" }, { status: 400 })

  const allowedTypes = isImage ? ALLOWED_IMAGE_TYPES : ALLOWED_PDF_TYPES
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: `Invalid file type: ${file.type}` }, { status: 400 })
  }

  const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_PDF_BYTES
  if (file.size > maxBytes) {
    return NextResponse.json({ error: `File too large (max ${maxBytes / 1024 / 1024}MB)` }, { status: 400 })
  }

  // Upload to Vercel Blob
  const ext = file.name.split(".").pop()?.toLowerCase() || (isImage ? "jpg" : "pdf")
  const filename = `${business.slug}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const blob = await put(filename, file, {
    access: "public",
    contentType: file.type,
  })

  if (isImage) {
    const existing: string[] = business.images ? JSON.parse(business.images) : []
    await prisma.business.update({
      where: { id: business.id },
      data: { images: JSON.stringify([...existing, blob.url]) },
    })
    return NextResponse.json({ url: blob.url, images: [...existing, blob.url] })
  } else {
    // Delete old PDF from Blob if present
    if (business.menuPdf) {
      await del(business.menuPdf).catch(() => null)
    }
    await prisma.business.update({
      where: { id: business.id },
      data: { menuPdf: blob.url },
    })
    return NextResponse.json({ url: blob.url })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const business = await prisma.business.findUnique({ where: { userId: session.user.id } })
  if (!business) return NextResponse.json({ error: "No business found" }, { status: 404 })

  const { url, type } = await req.json()

  if (type === "image") {
    const existing: string[] = business.images ? JSON.parse(business.images) : []
    const updated = existing.filter((u) => u !== url)
    await prisma.business.update({
      where: { id: business.id },
      data: { images: JSON.stringify(updated) },
    })
    await del(url).catch(() => null)
    return NextResponse.json({ images: updated })
  }

  if (type === "menu-pdf") {
    if (business.menuPdf) {
      await del(business.menuPdf).catch(() => null)
    }
    await prisma.business.update({
      where: { id: business.id },
      data: { menuPdf: null },
    })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 })
}
