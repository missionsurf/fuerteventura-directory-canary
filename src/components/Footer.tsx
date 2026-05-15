"use client"

import Link from "next/link"
import { MapPin } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"

export default function Footer() {
  const t = useTranslations("footer")
  const locale = useLocale()
  const p = (path: string) => `/${locale}${path}`

  return (
    <footer className="bg-[#1B4F72] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href={p("/")} className="flex items-center gap-2 font-bold text-xl mb-3">
              <MapPin className="h-5 w-5 text-[#E67E22]" />
              <span>Fuerteventura <span className="text-[#E67E22]">Directory</span></span>
            </Link>
            <p className="text-blue-200 text-sm leading-relaxed max-w-sm">
              {t("tagline")}
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4 text-white">{t("categories")}</h3>
            <ul className="space-y-2 text-blue-200 text-sm">
              <li><Link href={p("/categories/restaurants-bars")} className="hover:text-white transition-colors">Restaurants & Bars</Link></li>
              <li><Link href={p("/categories/hotels-accommodation")} className="hover:text-white transition-colors">Hotels & Accommodation</Link></li>
              <li><Link href={p("/categories/surfing-kiting")} className="hover:text-white transition-colors">Surfing & Kiting</Link></li>
              <li><Link href={p("/categories/water-sports")} className="hover:text-white transition-colors">Water Sports</Link></li>
              <li><Link href={p("/categories/car-bike-rental")} className="hover:text-white transition-colors">Car & Bike Rental</Link></li>
              <li><Link href={p("/directory")} className="hover:text-white transition-colors">All Categories →</Link></li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">{t("forBusinesses")}</h3>
            <ul className="space-y-2 text-blue-200 text-sm">
              <li><Link href={p("/register")} className="hover:text-white transition-colors">{t("listYourBusiness")}</Link></li>
              <li><Link href={p("/login")} className="hover:text-white transition-colors">{t("businessLogin")}</Link></li>
              <li><Link href={p("/dashboard")} className="hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-blue-300 text-sm">
            © {new Date().getFullYear()} Fuerteventura Directory. {t("allRightsReserved")}
          </p>
          <p className="text-blue-400 text-xs">{t("location")}</p>
        </div>
      </div>
    </footer>
  )
}
