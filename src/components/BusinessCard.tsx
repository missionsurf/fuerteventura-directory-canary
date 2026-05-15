import Link from "next/link"
import { MapPin, Star, CheckCircle2, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Business {
  id: string
  name: string
  slug: string
  tagline?: string | null
  town?: string | null
  phone?: string | null
  plan: string
  featured: boolean
  verified: boolean
  status: string
  category?: { name: string; slug: string } | null
  reviews?: { rating: number; status: string }[]
}

function planBadgeColor(plan: string) {
  switch (plan) {
    case "premium": return "bg-purple-100 text-purple-800"
    case "pro": return "bg-blue-100 text-blue-800"
    case "starter": return "bg-green-100 text-green-800"
    default: return "bg-gray-100 text-gray-600"
  }
}

function avgRating(reviews?: { rating: number; status: string }[]) {
  if (!reviews?.length) return null
  const approved = reviews.filter(r => r.status === "approved")
  if (!approved.length) return null
  return (approved.reduce((a, r) => a + r.rating, 0) / approved.length).toFixed(1)
}

export default function BusinessCard({
  business,
  locale = "en",
}: {
  business: Business
  locale?: string
}) {
  const rating = avgRating(business.reviews)
  const initials = business.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()

  return (
    <Link href={`/${locale}/directory/${business.slug}`}>
      <div className="bg-white rounded-xl border border-gray-200 hover:border-[#1B4F72] hover:shadow-md transition-all p-5 h-full flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-[#1B4F72] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">{business.name}</h3>
              {business.verified && <CheckCircle2 className="h-4 w-4 text-[#1B4F72] flex-shrink-0" />}
              {business.featured && <Zap className="h-4 w-4 text-[#E67E22] flex-shrink-0" />}
            </div>
            {business.tagline && (
              <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{business.tagline}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {business.category && (
            <Badge variant="secondary" className="text-xs">{business.category.name}</Badge>
          )}
          {business.plan !== "free" && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planBadgeColor(business.plan)}`}>
              {business.plan.charAt(0).toUpperCase() + business.plan.slice(1)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto">
          {business.town && (
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <MapPin className="h-3 w-3" />
              <span>{business.town}</span>
            </div>
          )}
          {rating && (
            <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span>{rating}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
