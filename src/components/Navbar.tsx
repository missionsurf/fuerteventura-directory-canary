"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Menu, X, Building2, ChevronDown } from "lucide-react"
import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import GoatLogo from "@/components/GoatLogo"

export default function Navbar() {
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const t = useTranslations("nav")
  const locale = useLocale()
  const p = (path: string) => `/${locale}${path}`

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={p("/")} className="flex items-center gap-2 font-bold text-xl text-[#1B4F72]">
            <GoatLogo className="h-9 w-auto" />
            <span className="hidden sm:inline">Fuerteventura</span>
            <span className="text-[#E67E22]">Directory</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href={p("/directory")} className="text-gray-600 hover:text-[#1B4F72] font-medium transition-colors">
              {t("directory")}
            </Link>
            <Link href={p("/categories/restaurants-bars")} className="text-gray-600 hover:text-[#1B4F72] font-medium transition-colors">
              {t("eatDrink")}
            </Link>
            <Link href={p("/categories/hotels-accommodation")} className="text-gray-600 hover:text-[#1B4F72] font-medium transition-colors">
              {t("stay")}
            </Link>
            <Link href={p("/categories/surfing-kiting")} className="text-gray-600 hover:text-[#1B4F72] font-medium transition-colors">
              {t("activities")}
            </Link>
          </nav>

          {/* Right side: language switcher + auth */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-200 text-sm font-medium hover:bg-gray-50">
                  <Building2 className="h-4 w-4" />
                  {session.user.name ?? session.user.email}
                  <ChevronDown className="h-3 w-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {session.user.role === "admin" ? (
                    <>
                      <DropdownMenuItem onClick={() => window.location.href = p("/admin")}>
                        {t("adminPanel")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.location.href = p("/admin/businesses")}>
                        Businesses
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.location.href = p("/admin/invoices")}>
                        Invoices
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => window.location.href = p("/dashboard")}>
                        {t("dashboard")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.location.href = p("/dashboard/profile")}>
                        {t("myListing")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.location.href = p("/dashboard/contacts")}>
                        {t("enquiries")}
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer"
                    onClick={() => signOut({ callbackUrl: p("/") })}
                  >
                    {t("signOut")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href={p("/login")}>
                  <Button variant="ghost" size="sm">{t("signIn")}</Button>
                </Link>
                <Link href={p("/register")}>
                  <Button size="sm" className="bg-[#1B4F72] hover:bg-[#154360] text-white">
                    {t("listBusiness")}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <button
              className="p-2 text-gray-600"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-3">
          <Link href={p("/directory")} className="block text-gray-700 font-medium py-2" onClick={() => setMobileOpen(false)}>
            {t("directory")}
          </Link>
          <Link href={p("/categories/restaurants-bars")} className="block text-gray-700 py-2" onClick={() => setMobileOpen(false)}>
            {t("eatDrink")}
          </Link>
          <Link href={p("/categories/hotels-accommodation")} className="block text-gray-700 py-2" onClick={() => setMobileOpen(false)}>
            {t("stay")}
          </Link>
          <Link href={p("/categories/surfing-kiting")} className="block text-gray-700 py-2" onClick={() => setMobileOpen(false)}>
            {t("activities")}
          </Link>
          <div className="pt-2 border-t flex gap-2">
            {session ? (
              <>
                <Link href={p("/dashboard")} onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm">{t("dashboard")}</Button>
                </Link>
                <Button size="sm" variant="ghost" onClick={() => signOut({ callbackUrl: p("/") })}>
                  {t("signOut")}
                </Button>
              </>
            ) : (
              <>
                <Link href={p("/login")} onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm">{t("signIn")}</Button>
                </Link>
                <Link href={p("/register")} onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="bg-[#1B4F72] text-white">{t("listBusiness")}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
