import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const count = await prisma.invoice.count({
    where: { invoiceNumber: { startsWith: `INV-${year}-` } },
  })
  const seq = String(count + 1).padStart(4, "0")
  return `INV-${year}-${seq}`
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { businessId, dueDate, notes, taxRate, status, items } = body

    if (!businessId || !dueDate || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } })
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })

    const subtotal = items.reduce((sum: number, item: { quantity: number; unitPrice: number }) => {
      return sum + item.quantity * item.unitPrice
    }, 0)
    const taxRateNum = parseInt(String(taxRate)) || 21
    const taxAmount = Math.round(subtotal * taxRateNum / 100)
    const total = subtotal + taxAmount

    const invoiceNumber = await generateInvoiceNumber()

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        businessId,
        issuedById: session.user.id,
        status: status ?? "draft",
        issueDate: new Date(),
        dueDate: new Date(dueDate),
        subtotal,
        taxRate: taxRateNum,
        taxAmount,
        total,
        currency: "EUR",
        notes: notes || null,
        items: {
          create: items.map((item: { description: string; quantity: number; unitPrice: number }) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice,
          })),
        },
      },
    })

    return NextResponse.json({ id: invoice.id, invoiceNumber: invoice.invoiceNumber })
  } catch (err) {
    console.error("Create invoice error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
