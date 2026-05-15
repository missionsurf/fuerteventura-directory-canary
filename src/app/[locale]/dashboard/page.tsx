import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { MessageSquare, Star, FileText, Building2, ArrowRight, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    active: "bg-green-100 text-green-800",
    suspended: "bg-red-100 text-red-800",
  }
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>{status}</span>
}

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()
  if (!session) redirect(`/${locale}/login`)
  const p = (path: string) => `/${locale}${path}`

  const business = await prisma.business.findUnique({
    where: { userId: session.user.id },
    include: {
      contacts: { orderBy: { createdAt: "desc" }, take: 5 },
      reviews: { orderBy: { createdAt: "desc" }, take: 3 },
      invoices: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  })

  if (!business) {
    return (
      <div className="text-center py-20">
        <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">No business listing yet</h2>
        <p className="text-gray-500 mb-4">Your business listing is being set up.</p>
      </div>
    )
  }

  const newContacts = business.contacts.filter(c => c.status === "new").length
  const pendingReviews = business.reviews.filter(r => r.status === "pending").length
  const unpaidInvoices = business.invoices.filter(i => i.status === "sent" || i.status === "overdue").length

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            {statusBadge(business.status)}
            <span className="text-xs text-gray-500 capitalize">{business.plan} plan</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={p(`/directory/${business.slug}`)} target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-3.5 w-3.5 mr-1" /> View Listing
            </Button>
          </Link>
          <Link href={p("/dashboard/profile")}>
            <Button size="sm" className="bg-[#1B4F72] text-white">Edit Listing</Button>
          </Link>
        </div>
      </div>

      {business.status === "pending" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm text-yellow-800">
          Your listing is pending review. It will be visible once approved by our team.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">New Enquiries</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{newContacts}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{pendingReviews}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Unpaid Invoices</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{unpaidInvoices}</p>
              </div>
              <FileText className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Enquiries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Enquiries</CardTitle>
            <Link href={p("/dashboard/contacts")} className="text-xs text-[#1B4F72] hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {business.contacts.length === 0 ? (
              <p className="text-sm text-gray-500">No enquiries yet</p>
            ) : (
              <div className="space-y-3">
                {business.contacts.slice(0, 5).map(contact => (
                  <div key={contact.id} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{contact.name}</p>
                      <p className="text-xs text-gray-500 truncate">{contact.subject ?? contact.message.slice(0, 40)}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${contact.status === "new" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                      {contact.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Invoices</CardTitle>
            <Link href={p("/dashboard/invoices")} className="text-xs text-[#1B4F72] hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {business.invoices.length === 0 ? (
              <p className="text-sm text-gray-500">No invoices yet</p>
            ) : (
              <div className="space-y-3">
                {business.invoices.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{inv.invoiceNumber}</p>
                      <p className="text-xs text-gray-500">{new Date(inv.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">€{(inv.total / 100).toFixed(2)}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        inv.status === "paid" ? "bg-green-100 text-green-700"
                        : inv.status === "overdue" ? "bg-red-100 text-red-700"
                        : inv.status === "sent" ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
