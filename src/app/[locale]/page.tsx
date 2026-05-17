import Link from "next/link"
import { prisma } from "@/lib/prisma"
import {
  UtensilsCrossed, Hotel, Waves, Car, Heart, ShoppingBag,
  Home, MapPin, Wind, Wrench, GraduationCap, Stethoscope,
  Search, ArrowRight
} from "lucide-react"
import BusinessCard from "@/components/BusinessCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getTranslations } from "next-intl/server"

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  UtensilsCrossed, Hotel, Waves, Car, Heart, ShoppingBag,
  Home, MapPin, Wind, Wrench, GraduationCap, Stethoscope,
}

export const revalidate = 60

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations("home")
  const p = (path: string) => `/${locale}${path}`

  const [categories, featuredBusinesses, recentBusinesses] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.business.findMany({
      where: { featured: true, status: "active" },
      include: { category: true, reviews: { select: { rating: true, status: true } } },
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
    prisma.business.findMany({
      where: { status: "active" },
      include: { category: true, reviews: { select: { rating: true, status: true } } },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
  ])

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[560px] flex items-center justify-center overflow-hidden">
        {/* Beach photo background */}
        {/* Photo: Fuerteventura beach at sunset – Unsplash (free to use) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1653999904379-112dd805bfaa?w=1920&q=80&auto=format&fit=crop"
          alt="Fuerteventura beach"
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="eager"
        />
        {/* Dark gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d2d44]/70 via-[#1B4F72]/60 to-[#0d2d44]/80" />

        {/* Wave divider at bottom */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none z-10">
          <svg viewBox="0 0 1440 80" className="fill-white w-full">
            <path d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,42.7C960,43,1056,53,1152,53.3C1248,53,1344,43,1392,37.3L1440,32L1440,80L1392,80C1344,80,1248,80,1152,80C1056,80,960,80,864,80C768,80,672,80,576,80C480,80,384,80,288,80C192,80,96,80,48,80L0,80Z" />
          </svg>
        </div>

        <div className="relative z-10 text-center px-4 py-20">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
            {t("heroTitle")}<br />
            <span className="text-[#F0A500]">{t("heroPlace")}</span>
          </h1>
          <p className="text-white/90 text-lg md:text-xl mb-8 max-w-xl mx-auto drop-shadow">
            {t("heroSubtitle")}
          </p>
          <form action={p("/directory")} method="get" className="max-w-xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                name="q"
                placeholder={t("searchPlaceholder")}
                className="pl-10 h-12 bg-white border-0 shadow-lg text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <Button type="submit" className="h-12 px-6 bg-[#E67E22] hover:bg-[#CA6F1E] text-white font-semibold shadow-lg">
              {t("searchButton")}
            </Button>
          </form>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {["Corralejo", "Morro Jable", "El Cotillo", "Caleta de Fuste"].map(town => (
              <Link key={town} href={`${p("/directory")}?town=${encodeURIComponent(town)}`}
                className="text-white/80 hover:text-white text-sm underline underline-offset-2 transition-colors drop-shadow">
                {town}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">{t("browseCategories")}</h2>
          <Link href={p("/directory")} className="text-[#1B4F72] hover:text-[#154360] text-sm font-medium flex items-center gap-1">
            {t("allCategories")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map(cat => {
            const Icon = categoryIcons[cat.icon] ?? MapPin
            return (
              <Link key={cat.id} href={p(`/categories/${cat.slug}`)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-[#1B4F72] hover:bg-blue-50 transition-all text-center group">
                <div className="w-12 h-12 rounded-full bg-blue-50 group-hover:bg-[#1B4F72] flex items-center justify-center transition-colors">
                  <Icon className="h-6 w-6 text-[#1B4F72] group-hover:text-white transition-colors" />
                </div>
                <span className="text-xs font-medium text-gray-700 leading-tight">{cat.name}</span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Featured Businesses */}
      {featuredBusinesses.length > 0 && (
        <section className="bg-gray-50 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">{t("featuredBusinesses")}</h2>
              <Link href={p("/directory")} className="text-[#1B4F72] hover:text-[#154360] text-sm font-medium flex items-center gap-1">
                {t("viewAll")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredBusinesses.map(biz => (
                <BusinessCard key={biz.id} business={biz} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t("recentListings")}</h2>
            <p className="text-gray-500 text-sm mt-1">{t("newlyAdded")}</p>
          </div>
          <Link href={p("/directory")} className="text-[#1B4F72] hover:text-[#154360] text-sm font-medium flex items-center gap-1">
            {t("viewAll")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentBusinesses.map(biz => (
            <BusinessCard key={biz.id} business={biz} locale={locale} />
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-[#1B4F72] py-14 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-3">Own a Business in Fuerteventura?</h2>
          <p className="text-blue-200 mb-6">
            Get your business listed and reach thousands of tourists and locals every month.
            Free listing available, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={p("/register")}>
              <Button className="bg-[#E67E22] hover:bg-[#CA6F1E] text-white font-semibold px-8 h-12">
                List Your Business Free
              </Button>
            </Link>
            <Link href={p("/directory")}>
              <Button variant="outline" className="border-white text-white hover:bg-blue-800 h-12">
                Browse Directory
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
