import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-200 text-gray-500",
}

export default async function InvoicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()
  if (!session) redirect(`/${locale}/login`)

  const business = await prisma.business.findUnique({ where: { userId: session.user.id } })
  if (!business) redirect(`/${locale}/dashboard`)

  const invoices = await prisma.invoice.findMany({
    where: { businessId: business.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  })

  const totalOwed = invoices
    .filter(i => i.status === "sent" || i.status === "overdue")
    .reduce((sum, i) => sum + i.total, 0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Invoices</h1>

      {totalOwed > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 font-medium">
            Outstanding balance: <span className="text-xl font-bold">€{(totalOwed / 100).toFixed(2)}</span>
          </p>
          <p className="text-red-600 text-sm mt-1">Please contact us to arrange payment</p>
        </div>
      )}

      {invoices.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="font-medium">No invoices yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map(inv => (
            <Card key={inv.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">{inv.invoiceNumber}</p>
                      <p className="text-xs text-gray-500">
                        Issued: {format(new Date(inv.issueDate), "d MMM yyyy")} · Due: {format(new Date(inv.dueDate), "d MMM yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-gray-900">€{(inv.total / 100).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{inv.currency}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[inv.status]}`}>
                      {inv.status}
                    </span>
                  </div>
                </div>

                {inv.items.length > 0 && (
                  <div className="mt-3 border-t pt-3 space-y-1">
                    {inv.items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm text-gray-600">
                        <span>{item.description} × {item.quantity}</span>
                        <span>€{(item.amount / 100).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm text-gray-500 pt-1 border-t">
                      <span>IGIC ({inv.taxRate}%)</span>
                      <span>€{(inv.taxAmount / 100).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {inv.notes && (
                  <p className="text-xs text-gray-500 mt-2 italic">{inv.notes}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
