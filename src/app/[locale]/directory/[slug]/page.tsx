import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import {
  MapPin, Phone, Globe, Mail, MessageCircle,
  Star, CheckCircle2, ArrowLeft, Zap, Link2, FileText,
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import ContactForm from "./ContactForm"
import ReviewForm from "./ReviewForm"
import PhotoGallery from "./PhotoGallery"
import { getTranslations } from "next-intl/server"

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug } = await params
  const business = await prisma.business.findUnique({ where: { slug } })
  if (!business) return { title: "Not Found" }
  return {
    title: `${business.name} - Fuerteventura Directory`,
    description: business.metaDesc ?? business.description ?? undefined,
  }
}

function planBadge(plan: string) {
  switch (plan) {
    case "premium": return <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full font-medium">Premium</span>
    case "pro": return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-medium">Pro</span>
    case "starter": return <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium">Starter</span>
    default: return null
  }
}

interface MenuSection {
  section: string
  items: { name: string; description: string; price: string }[]
}

export default async function BusinessPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params
  const t = await getTranslations("business")
  const p = (path: string) => `/${locale}${path}`

  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: { where: { status: "approved" }, orderBy: { createdAt: "desc" } },
    },
  })

  if (!business || business.status !== "active") notFound()

  const avgRating = business.reviews.length
    ? (business.reviews.reduce((a, r) => a + r.rating, 0) / business.reviews.length).toFixed(1)
    : null

  const initials = business.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()

  const images: string[] = business.images ? JSON.parse(business.images) : []
  const menuItems: MenuSection[] = business.menuItems ? JSON.parse(business.menuItems) : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href={p("/")} className="hover:text-[#1B4F72]">Home</Link>
            <span>/</span>
            <Link href={p("/directory")} className="hover:text-[#1B4F72]">Directory</Link>
            {business.category && (
              <>
                <span>/</span>
                <Link href={p(`/categories/${business.category.slug}`)} className="hover:text-[#1B4F72]">
                  {business.category.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-gray-900 font-medium truncate">{business.name}</span>
          </div>
        </div>
      </div>

      {/* Cover image / photo strip */}
      {images.length > 0 && (
        <div className="bg-gray-900">
          <PhotoGallery images={images} businessName={business.name} />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business header */}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-start gap-4">
                {business.logo ? (
                  <img src={business.logo} alt={business.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-[#1B4F72] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
                    {business.verified && (
                      <CheckCircle2 className="h-5 w-5 text-[#1B4F72]" aria-label={t("verified")} />
                    )}
                    {business.featured && (
                      <Zap className="h-5 w-5 text-[#E67E22]" aria-label={t("featured")} />
                    )}
                  </div>
                  {business.tagline && (
                    <p className="text-gray-500 mt-1">{business.tagline}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {business.category && (
                      <Link href={p(`/categories/${business.category.slug}`)}>
                        <Badge variant="secondary">{business.category.name}</Badge>
                      </Link>
                    )}
                    {planBadge(business.plan)}
                    {avgRating && (
                      <div className="flex items-center gap-1 text-sm">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < Math.round(parseFloat(avgRating)) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                        <span className="text-gray-600 ml-1">{avgRating} ({business.reviews.length})</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {business.description && (
                <>
                  <Separator className="my-4" />
                  <p className="text-gray-700 leading-relaxed">{business.description}</p>
                </>
              )}
            </div>

            {/* Menu */}
            {(menuItems.length > 0 || business.menuPdf) && (
              <div className="bg-white rounded-xl border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("menu")}</h2>

                {/* PDF download */}
                {business.menuPdf && (
                  <a
                    href={business.menuPdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mb-5 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    {t("downloadPdf")}
                  </a>
                )}

                {/* Structured menu */}
                {menuItems.length > 0 && (
                  <div className="space-y-6">
                    {menuItems.map((section, si) => (
                      <div key={si}>
                        <h3 className="text-base font-semibold text-[#1B4F72] mb-3 pb-2 border-b border-blue-100">
                          {section.section}
                        </h3>
                        <div className="space-y-3">
                          {section.items.map((item, ii) => (
                            <div key={ii} className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                                {item.description && (
                                  <p className="text-gray-500 text-xs mt-0.5">{item.description}</p>
                                )}
                              </div>
                              {item.price && (
                                <span className="text-[#E67E22] font-semibold text-sm flex-shrink-0">
                                  {item.price}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t("reviews")} {business.reviews.length > 0 && `(${business.reviews.length})`}
              </h2>
              {business.reviews.length === 0 ? (
                <p className="text-gray-500 text-sm">{t("noReviews")}</p>
              ) : (
                <div className="space-y-4">
                  {business.reviews.map(review => (
                    <div key={review.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700">
                          {review.authorName[0]}
                        </div>
                        <span className="font-medium text-sm">{review.authorName}</span>
                        <div className="flex ml-auto">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                          ))}
                        </div>
                      </div>
                      {review.title && <p className="font-medium text-sm text-gray-800">{review.title}</p>}
                      <p className="text-gray-600 text-sm mt-1">{review.body}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-4">{t("writeReview")}</h3>
                <ReviewForm businessId={business.id} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Contact card */}
            <div className="bg-white rounded-xl border p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">{t("contact")}</h2>

              {business.phone && (
                <a href={`tel:${business.phone}`} className="flex items-center gap-3 text-sm text-gray-700 hover:text-[#1B4F72]">
                  <Phone className="h-4 w-4 text-[#1B4F72] flex-shrink-0" />
                  {business.phone}
                </a>
              )}
              {business.whatsapp && (
                <a
                  href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-green-700 hover:text-green-800"
                >
                  <MessageCircle className="h-4 w-4 flex-shrink-0" />
                  {t("whatsapp")}
                </a>
              )}
              {business.email && (
                <a href={`mailto:${business.email}`} className="flex items-center gap-3 text-sm text-gray-700 hover:text-[#1B4F72]">
                  <Mail className="h-4 w-4 text-[#1B4F72] flex-shrink-0" />
                  {business.email}
                </a>
              )}
              {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-blue-700 hover:text-blue-800"
                >
                  <Globe className="h-4 w-4 flex-shrink-0" />
                  {t("visitWebsite")}
                </a>
              )}

              {(business.facebook || business.instagram || business.twitter) && (
                <div className="flex gap-3 pt-2">
                  {business.facebook && (
                    <a href={business.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1">
                      <Link2 className="h-4 w-4" /> Facebook
                    </a>
                  )}
                  {business.instagram && (
                    <a href={business.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700 text-xs flex items-center gap-1">
                      <Link2 className="h-4 w-4" /> Instagram
                    </a>
                  )}
                  {business.twitter && (
                    <a href={business.twitter} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:text-sky-600 text-xs flex items-center gap-1">
                      <Link2 className="h-4 w-4" /> X / Twitter
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Location */}
            {(business.address || business.town) && (
              <div className="bg-white rounded-xl border p-5">
                <h2 className="font-semibold text-gray-900 mb-3">{t("location")}</h2>
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <MapPin className="h-4 w-4 text-[#E67E22] mt-0.5 flex-shrink-0" />
                  <div>
                    {business.address && <p>{business.address}</p>}
                    {business.town && <p>{business.town}</p>}
                    {business.postcode && <p>{business.postcode}</p>}
                    <p>{business.island}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Contact form */}
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-semibold text-gray-900 mb-4">{t("sendEnquiry")}</h2>
              <ContactForm businessId={business.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
