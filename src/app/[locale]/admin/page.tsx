import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, MessageSquare, FileText, Users, AlertCircle, TrendingUp } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboard() {
  const [
    totalBusinesses,
    pendingBusinesses,
    activeBusinesses,
    totalContacts,
    newContacts,
    totalInvoices,
    paidInvoices,
    overdueInvoices,
    totalUsers,
    recentBusinesses,
    recentContacts,
  ] = await Promise.all([
    prisma.business.count(),
    prisma.business.count({ where: { status: "pending" } }),
    prisma.business.count({ where: { status: "active" } }),
    prisma.contact.count(),
    prisma.contact.count({ where: { status: "new" } }),
    prisma.invoice.count(),
    prisma.invoice.count({ where: { status: "paid" } }),
    prisma.invoice.count({ where: { status: "overdue" } }),
    prisma.user.count(),
    prisma.business.findMany({
      where: { status: "pending" },
      include: { user: true, category: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.contact.findMany({
      where: { status: "new" },
      include: { business: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])

  // Revenue
  const revenue = await prisma.invoice.aggregate({
    where: { status: "paid" },
    _sum: { total: true },
  })
  const totalRevenue = revenue._sum.total ?? 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Alert for pending items */}
      {(pendingBusinesses > 0 || overdueInvoices > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            {pendingBusinesses > 0 && (
              <span>{pendingBusinesses} business{pendingBusinesses > 1 ? "es" : ""} awaiting approval. </span>
            )}
            {overdueInvoices > 0 && (
              <span>{overdueInvoices} overdue invoice{overdueInvoices > 1 ? "s" : ""}. </span>
            )}
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Businesses</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalBusinesses}</p>
                <p className="text-xs text-gray-400 mt-1">{activeBusinesses} active · {pendingBusinesses} pending</p>
              </div>
              <Building2 className="h-8 w-8 text-[#1B4F72]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Contacts</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalContacts}</p>
                <p className="text-xs text-gray-400 mt-1">{newContacts} new</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">€{(totalRevenue / 100).toFixed(0)}</p>
                <p className="text-xs text-gray-400 mt-1">{paidInvoices} paid invoices</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending businesses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Pending Approval</CardTitle>
            <Link href="/admin/businesses?status=pending" className="text-xs text-[#1B4F72] hover:underline">View all →</Link>
          </CardHeader>
          <CardContent>
            {recentBusinesses.length === 0 ? (
              <p className="text-sm text-gray-500">No pending businesses</p>
            ) : (
              <div className="space-y-3">
                {recentBusinesses.map(biz => (
                  <Link key={biz.id} href={`/admin/businesses/${biz.id}`}>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{biz.name}</p>
                        <p className="text-xs text-gray-500">{biz.user.email} · {biz.category?.name ?? "No category"}</p>
                      </div>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">pending</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* New contacts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">New Enquiries</CardTitle>
            <Link href="/admin/contacts" className="text-xs text-[#1B4F72] hover:underline">View all →</Link>
          </CardHeader>
          <CardContent>
            {recentContacts.length === 0 ? (
              <p className="text-sm text-gray-500">No new enquiries</p>
            ) : (
              <div className="space-y-3">
                {recentContacts.map(contact => (
                  <div key={contact.id} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                      <p className="text-xs text-gray-500 truncate">{contact.business.name}</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex-shrink-0">new</span>
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
