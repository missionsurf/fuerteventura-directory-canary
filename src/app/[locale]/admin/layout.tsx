import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard, Building2, MessageSquare, FileText,
  Users, Package, LogOut, MapPin
} from "lucide-react"
import { signOut } from "@/auth"

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await auth()
  if (!session || session.user.role !== "admin") redirect(`/${locale}/dashboard`)

  const p = (path: string) => `/${locale}${path}`

  const navItems = [
    { href: p("/admin"), label: "Dashboard", icon: LayoutDashboard },
    { href: p("/admin/businesses"), label: "Businesses", icon: Building2 },
    { href: p("/admin/contacts"), label: "All Contacts", icon: MessageSquare },
    { href: p("/admin/invoices"), label: "Invoices", icon: FileText },
    { href: p("/admin/users"), label: "Users", icon: Users },
    { href: p("/admin/plans"), label: "Plans", icon: Package },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-[#1B4F72] text-white flex flex-col">
        <div className="p-4 border-b border-blue-800">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#E67E22]" />
            <span className="font-bold text-sm">Admin Panel</span>
          </div>
          <p className="text-blue-300 text-xs mt-1">{session.user.email}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-blue-200 hover:bg-blue-800 hover:text-white text-sm font-medium transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-blue-800">
          <Link href={p("/")} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-blue-300 hover:text-white text-sm">
            ← Back to site
          </Link>
          <form action={async () => {
            "use server"
            await signOut({ redirectTo: `/${locale}/` })
          }}>
            <button className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-300 hover:bg-red-900/30 hover:text-red-200 text-sm font-medium w-full transition-colors">
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 p-8 min-w-0">
        {children}
      </div>
    </div>
  )
}
