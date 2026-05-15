import createMiddleware from "next-intl/middleware"
import { routing } from "@/i18n/routing"
import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextRequest, NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)
const intlMiddleware = createMiddleware(routing)

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Extract locale from path (e.g. /en/dashboard -> "en")
  const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/)
  const locale = localeMatch ? localeMatch[1] : routing.defaultLocale

  // Strip locale prefix to get the real path
  const strippedPath = localeMatch
    ? pathname.slice(locale.length + 1) || "/"
    : pathname

  const isProtected =
    strippedPath.startsWith("/dashboard") || strippedPath.startsWith("/admin")

  if (isProtected) {
    const session = await auth()
    if (!session) {
      const loginUrl = new URL(`/${locale}/login`, req.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (strippedPath.startsWith("/admin") && session.user?.role !== "admin") {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url))
    }
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
