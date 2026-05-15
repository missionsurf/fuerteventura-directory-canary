import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Plus, FileText } from "lucide-react"
import { revalidatePath } from "next/cache"

async function updateStatus(formData: FormData) {
  "use server"
  const id = formData.get("id") as string
  const status = formData.get("status") as string
  await prisma.invoice.update({
    where: { id },
    data: {
      status,
      paidDate: status === "paid" ? new Date() : null,
    },
  })
  revalidatePath("/admin/invoices")
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-200 text-gray-500",
}

export default async function AdminInvoices({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const statusFilter = params.status ?? ""

  const invoices = await prisma.invoice.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    include: { business: { select: { name: true, slug: true } }, issuedBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  })

  const totals = await prisma.invoice.groupBy({
    by: ["status"],
    _sum: { total: true },
    _count: true,
  })

  const summary = totals.reduce((acc, t) => {
    acc[t.status] = { count: t._count, total: t._sum.total ?? 0 }
    return acc
  }, {} as Record<string, { count: number; total: number }>)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <Link href="/admin/invoices/new">
          <Button className="bg-[#1B4F72] text-white">
            <Plus className="h-4 w-4 mr-1" /> New Invoice
          </Button>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { status: "sent", label: "Outstanding" },
          { status: "paid", label: "Paid" },
          { status: "overdue", label: "Overdue" },
          { status: "draft", label: "Draft" },
        ].map(({ status, label }) => (
          <Link key={status} href={`/admin/invoices?status=${status}`}>
            <div className={`rounded-lg border p-3 cursor-pointer hover:shadow-sm ${statusFilter === status ? "border-[#1B4F72] bg-blue-50" : "bg-white"}`}>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">€{((summary[status]?.total ?? 0) / 100).toFixed(0)}</p>
              <p className="text-xs text-gray-400">{summary[status]?.count ?? 0} invoices</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {["", "draft", "sent", "paid", "overdue", "cancelled"].map(s => (
          <Link key={s} href={s ? `/admin/invoices?status=${s}` : "/admin/invoices"}>
            <Button variant={statusFilter === s ? "default" : "outline"} size="sm" className={statusFilter === s ? "bg-[#1B4F72] text-white" : ""}>
              {s || "All"}
            </Button>
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Invoice #</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Business</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Issue Date</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Due Date</th>
              <th className="text-right px-4 py-3 text-gray-600 font-medium">Total</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
              <th className="text-right px-4 py-3 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invoices.map(inv => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-[#1B4F72]">
                  <Link href={`/admin/invoices/${inv.id}`} className="hover:underline">{inv.invoiceNumber}</Link>
                </td>
                <td className="px-4 py-3 text-gray-700">{inv.business.name}</td>
                <td className="px-4 py-3 text-gray-500">{format(new Date(inv.issueDate), "d MMM yyyy")}</td>
                <td className="px-4 py-3 text-gray-500">{format(new Date(inv.dueDate), "d MMM yyyy")}</td>
                <td className="px-4 py-3 text-right font-semibold">€{(inv.total / 100).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[inv.status]}`}>{inv.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={updateStatus} className="flex items-center justify-end gap-2">
                    <input type="hidden" name="id" value={inv.id} />
                    <select name="status" defaultValue={inv.status} className="text-xs border rounded px-2 py-1">
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <Button type="submit" size="sm" variant="outline">Update</Button>
                    <Link href={`/admin/invoices/${inv.id}`}>
                      <Button size="sm" variant="ghost">View</Button>
                    </Link>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 && (
          <div className="text-center py-10 text-gray-500 flex flex-col items-center gap-3">
            <FileText className="h-10 w-10 text-gray-300" />
            <p>No invoices found</p>
            <Link href="/admin/invoices/new">
              <Button className="bg-[#1B4F72] text-white" size="sm">Create First Invoice</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
