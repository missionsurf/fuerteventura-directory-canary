import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { revalidatePath } from "next/cache"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, ExternalLink, Edit } from "lucide-react"

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  suspended: "bg-red-100 text-red-800",
}

interface SearchParams {
  q?: string
  status?: string
  page?: string
}

const PER_PAGE = 20

export default async function AdminBusinesses({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const q = params.q ?? ""
  const statusFilter = params.status ?? ""
  const page = parseInt(params.page ?? "1")

  const businesses = await prisma.business.findMany({
    where: {
      ...(q && { OR: [{ name: { contains: q } }, { town: { contains: q } }] }),
      ...(statusFilter && { status: statusFilter }),
    },
    include: { user: true, category: true },
    orderBy: { createdAt: "desc" },
    take: PER_PAGE,
    skip: (page - 1) * PER_PAGE,
  })

  const total = await prisma.business.count({
    where: {
      ...(q && { OR: [{ name: { contains: q } }, { town: { contains: q } }] }),
      ...(statusFilter && { status: statusFilter }),
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Businesses ({total})</h1>
      </div>

      {/* Filters */}
      <form className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input name="q" defaultValue={q} placeholder="Search..." className="pl-9" />
        </div>
        <select name="status" defaultValue={statusFilter} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <Button type="submit">Filter</Button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Business</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Owner</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Category</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Plan</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Added</th>
              <th className="text-right px-4 py-3 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {businesses.map(biz => (
              <tr key={biz.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{biz.name}</p>
                    {biz.town && <p className="text-xs text-gray-500">{biz.town}</p>}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{biz.user.email}</td>
                <td className="px-4 py-3 text-gray-600">{biz.category?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium capitalize text-gray-700">{biz.plan}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[biz.status]}`}>
                    {biz.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{format(new Date(biz.createdAt), "d MMM yyyy")}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/directory/${biz.slug}`} target="_blank">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Link href={`/admin/businesses/${biz.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {businesses.length === 0 && (
          <div className="text-center py-10 text-gray-500">No businesses found</div>
        )}
      </div>

      {/* Pagination */}
      {total > PER_PAGE && (
        <div className="flex justify-center gap-2 mt-4">
          {page > 1 && (
            <Link href={`/admin/businesses?${new URLSearchParams({ ...(q && { q }), ...(statusFilter && { status: statusFilter }), page: String(page - 1) })}`}>
              <Button variant="outline" size="sm">Previous</Button>
            </Link>
          )}
          <span className="flex items-center px-3 text-sm text-gray-600">
            {page} / {Math.ceil(total / PER_PAGE)}
          </span>
          {page < Math.ceil(total / PER_PAGE) && (
            <Link href={`/admin/businesses?${new URLSearchParams({ ...(q && { q }), ...(statusFilter && { status: statusFilter }), page: String(page + 1) })}`}>
              <Button variant="outline" size="sm">Next</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
