import { prisma } from "@/lib/prisma"
import BusinessCard from "@/components/BusinessCard"
import Link from "next/link"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getTranslations } from "next-intl/server"

export const revalidate = 60

interface SearchParams {
  q?: string
  category?: string
  town?: string
  featured?: string
  page?: string
}

const TOWNS = ["Corralejo", "Morro Jable", "El Cotillo", "Caleta de Fuste", "Puerto del Rosario", "Costa Calma", "Betancuria"]
const PER_PAGE = 12

export default async function DirectoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<SearchParams>
}) {
  const { locale } = await params
  const sp = await searchParams
  const t = await getTranslations("directory")
  const p = (path: string) => `/${locale}${path}`

  const q = sp.q ?? ""
  const categorySlug = sp.category ?? ""
  const town = sp.town ?? ""
  const featuredOnly = sp.featured === "1"
  const page = parseInt(sp.page ?? "1")

  const [categories, businesses, total] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.business.findMany({
      where: {
        status: "active",
        ...(q && {
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
            { town: { contains: q } },
            { tagline: { contains: q } },
          ],
        }),
        ...(categorySlug && { category: { slug: categorySlug } }),
        ...(town && { town }),
        ...(featuredOnly && { featured: true }),
      },
      include: { category: true, reviews: { select: { rating: true, status: true } } },
      orderBy: [{ featured: "desc" }, { plan: "desc" }, { createdAt: "desc" }],
      take: PER_PAGE,
      skip: (page - 1) * PER_PAGE,
    }),
    prisma.business.count({
      where: {
        status: "active",
        ...(q && {
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
            { town: { contains: q } },
          ],
        }),
        ...(categorySlug && { category: { slug: categorySlug } }),
        ...(town && { town }),
        ...(featuredOnly && { featured: true }),
      },
    }),
  ])

  const totalPages = Math.ceil(total / PER_PAGE)
  const activeCategory = categories.find(c => c.slug === categorySlug)

  const buildQuery = (extra: Record<string, string>) =>
    new URLSearchParams({ ...(q && { q }), ...(categorySlug && { category: categorySlug }), ...(town && { town }), ...extra }).toString()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1B4F72] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {activeCategory ? activeCategory.name : t("title")}
          </h1>
          <p className="text-blue-200">
            {total} {total === 1 ? "business" : "businesses"} found
            {q && ` for "${q}"`}
            {town && ` in ${town}`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter */}
        <form className="bg-white rounded-xl border p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input name="q" defaultValue={q} placeholder={t("searchPlaceholder")} className="pl-9" />
          </div>
          <select
            name="category"
            defaultValue={categorySlug}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white"
          >
            <option value="">{t("allCategories")}</option>
            {categories.map(c => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <select
            name="town"
            defaultValue={town}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white"
          >
            <option value="">{t("allTowns")}</option>
            {TOWNS.map(tw => <option key={tw} value={tw}>{tw}</option>)}
          </select>
          <Button type="submit" className="bg-[#1B4F72] text-white">
            <Filter className="h-4 w-4 mr-1" /> Filter
          </Button>
        </form>

        {/* Active filters */}
        {(q || categorySlug || town || featuredOnly) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {q && <Badge variant="secondary">Search: {q}</Badge>}
            {categorySlug && <Badge variant="secondary">Category: {activeCategory?.name}</Badge>}
            {town && <Badge variant="secondary">Town: {town}</Badge>}
            {featuredOnly && <Badge variant="secondary">Featured only</Badge>}
            <Link href={p("/directory")}>
              <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Clear filters ×</Badge>
            </Link>
          </div>
        )}

        {/* Results */}
        {businesses.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg font-medium">{t("noResults")}</p>
            <Link href={p("/directory")}>
              <Button className="mt-4" variant="outline">Clear filters</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {businesses.map(biz => (
              <BusinessCard key={biz.id} business={biz} locale={locale} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {page > 1 && (
              <Link href={`${p("/directory")}?${buildQuery({ page: String(page - 1) })}`}>
                <Button variant="outline">Previous</Button>
              </Link>
            )}
            <span className="flex items-center px-4 text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link href={`${p("/directory")}?${buildQuery({ page: String(page + 1) })}`}>
                <Button variant="outline">Next</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
