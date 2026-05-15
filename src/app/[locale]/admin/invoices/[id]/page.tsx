import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { revalidatePath } from "next/cache"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Building2 } from "lucide-react"

async function markPaid(formData: FormData) {
  "use server"
  const id = formData.get("id") as string
  await prisma.invoice.update({
    where: { id },
    data: { status: "paid", paidDate: new Date() },
  })
  revalidatePath(`/admin/invoices/${id}`)
  revalidatePath("/admin/invoices")
}

async function markSent(formData: FormData) {
  "use server"
  const id = formData.get("id") as string
  await prisma.invoice.update({ where: { id }, data: { status: "sent" } })
  revalidatePath(`/admin/invoices/${id}`)
  revalidatePath("/admin/invoices")
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-200 text-gray-500",
}

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      items: true,
      business: { include: { user: true } },
      issuedBy: { select: { name: true, email: true } },
    },
  })

  if (!invoice) notFound()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/invoices">
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
          <span className={`text-xs px-2.5 py-1 rounded-full ${statusColors[invoice.status]}`}>
            {invoice.status}
          </span>
        </div>
        <div className="flex gap-2">
          {invoice.status === "draft" && (
            <form action={markSent}>
              <input type="hidden" name="id" value={invoice.id} />
              <Button type="submit" variant="outline" size="sm">Mark as Sent</Button>
            </form>
          )}
          {(invoice.status === "sent" || invoice.status === "overdue") && (
            <form action={markPaid}>
              <input type="hidden" name="id" value={invoice.id} />
              <Button type="submit" className="bg-green-600 text-white hover:bg-green-700" size="sm">Mark as Paid</Button>
            </form>
          )}
        </div>
      </div>

      {/* Invoice document */}
      <Card>
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#1B4F72]">INVOICE</h2>
              <p className="text-gray-500 text-sm mt-1">{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900">Fuerteventura Directory</p>
              <p className="text-sm text-gray-500">admin@fuerteventura-directory.com</p>
              <p className="text-sm text-gray-500">Fuerteventura, Canary Islands</p>
            </div>
          </div>

          {/* Bill to */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bill To</p>
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">{invoice.business.name}</p>
                  {invoice.business.address && <p className="text-sm text-gray-600">{invoice.business.address}</p>}
                  {invoice.business.town && <p className="text-sm text-gray-600">{invoice.business.town}, Fuerteventura</p>}
                  <p className="text-sm text-gray-600">{invoice.business.user.email}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Issue Date:</span>
                  <span className="font-medium">{format(new Date(invoice.issueDate), "d MMMM yyyy")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Due Date:</span>
                  <span className={`font-medium ${invoice.status === "overdue" ? "text-red-600" : ""}`}>
                    {format(new Date(invoice.dueDate), "d MMMM yyyy")}
                  </span>
                </div>
                {invoice.paidDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Paid Date:</span>
                    <span className="font-medium text-green-600">{format(new Date(invoice.paidDate), "d MMMM yyyy")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items table */}
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 text-gray-600 font-semibold">Description</th>
                <th className="text-center py-2 text-gray-600 font-semibold">Qty</th>
                <th className="text-right py-2 text-gray-600 font-semibold">Unit Price</th>
                <th className="text-right py-2 text-gray-600 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map(item => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3">{item.description}</td>
                  <td className="py-3 text-center">{item.quantity}</td>
                  <td className="py-3 text-right">€{(item.unitPrice / 100).toFixed(2)}</td>
                  <td className="py-3 text-right font-medium">€{(item.amount / 100).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-56 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>€{(invoice.subtotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">IGIC ({invoice.taxRate}%)</span>
                <span>€{(invoice.taxAmount / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span className="text-[#1B4F72]">€{(invoice.total / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-8 border-t pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Notes</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}

          {/* Issued by */}
          {invoice.issuedBy && (
            <div className="mt-4 text-xs text-gray-400">
              Issued by: {invoice.issuedBy.name ?? invoice.issuedBy.email}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
