import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Building2, MessageSquare, FileText, Settings, LogOut, Images } from "lucide-react"
import { signOut } from "@/auth"
import { getTranslations } from "next-intl/server"

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth()
  if (!session) redirect(`/${locale}/login`)
  const t = await getTranslations("dashboard")
  const p = (path: string) => `/${locale}${path}`

  const navItems = [
    { href: p("/dashboard"), label: t("overview"), icon: LayoutDashboard },
    { href: p("/dashboard/profile"), label: t("myListing"), icon: Building2 },
    { href: p("/dashboard/media"), label: t("photosMenu"), icon: Images },
    { href: p("/dashboard/contacts"), label: t("enquiries"), icon: MessageSquare },
    { href: p("/dashboard/invoices"), label: t("invoices"), icon: FileText },
    { href: p("/dashboard/account"), label: t("account"), icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-60 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <p className="font-semibold text-gray-900 text-sm">{session.user.name ?? session.user.email}</p>
          <p className="text-xs text-gray-500">{session.user.email}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t">
          <form action={async () => {
            "use server"
            await signOut({ redirectTo: `/${locale}/` })
          }}>
            <button className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 text-sm font-medium w-full transition-colors">
              <LogOut className="h-4 w-4" />
              {t("account")}
            </button>
          </form>
        </div>
      </aside>
      <div className="flex-1 p-8 min-w-0">{children}</div>
    </div>
  )
}
