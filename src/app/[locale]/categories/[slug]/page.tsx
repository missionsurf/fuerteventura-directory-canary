import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import BusinessCard from "@/components/BusinessCard"
import Link from "next/link"
import {
  UtensilsCrossed, Hotel, Waves, Car, Heart, ShoppingBag,
  Home, MapPin, Wind, Wrench, GraduationCap, Stethoscope,
} from "lucide-react"

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  UtensilsCrossed, Hotel, Waves, Car, Heart, ShoppingBag,
  Home, MapPin, Wind, Wrench, GraduationCap, Stethoscope,
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug } = await params
  const category = await prisma.category.findUnique({ where: { slug } })
  if (!category) return { title: "Not Found" }
  return { title: `${category.name} in Fuerteventura - Directory` }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params
  const p = (path: string) => `/${locale}${path}`

  const category = await prisma.category.findUnique({ where: { slug } })
  if (!category) notFound()

  const businesses = await prisma.business.findMany({
    where: { categoryId: category.id, status: "active" },
    include: { category: true, reviews: { select: { rating: true, status: true } } },
    orderBy: [{ featured: "desc" }, { plan: "desc" }, { createdAt: "desc" }],
  })

  const Icon = categoryIcons[category.icon] ?? MapPin

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1B4F72] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 text-white">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <Icon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{category.name}</h1>
              <p className="text-blue-200 text-sm mt-1">
                {businesses.length} {businesses.length === 1 ? "business" : "businesses"} in Fuerteventura
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href={p("/")} className="hover:text-[#1B4F72]">Home</Link>
          <span>/</span>
          <Link href={p("/directory")} className="hover:text-[#1B4F72]">Directory</Link>
          <span>/</span>
          <span className="text-gray-900">{category.name}</span>
        </div>

        {businesses.length === 0 ? (
          <div className="text-center py-16">
            <Icon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No businesses listed yet in this category</p>
            <Link href={p("/register")} className="text-[#1B4F72] hover:underline text-sm mt-2 inline-block">
              Add your business →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {businesses.map(biz => (
              <BusinessCard key={biz.id} business={biz} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
