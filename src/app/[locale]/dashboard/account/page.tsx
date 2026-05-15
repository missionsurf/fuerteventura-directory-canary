import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

const PLANS = [
  { slug: "free", name: "Free", price: 0, features: ["1 photo", "Basic listing", "Contact form"] },
  { slug: "starter", name: "Starter", price: 9.99, features: ["5 photos", "Enhanced listing", "Priority in search", "WhatsApp button"] },
  { slug: "pro", name: "Pro", price: 19.99, features: ["15 photos", "Featured badge", "Top of category", "Analytics", "Social links"] },
  { slug: "premium", name: "Premium", price: 39.99, features: ["Unlimited photos", "Homepage feature", "Verified badge", "Priority support", "Custom domain"] },
]

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()
  if (!session) redirect(`/${locale}/login`)

  const business = await prisma.business.findUnique({ where: { userId: session.user.id } })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Account & Billing</h1>

      {/* Current plan */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 capitalize">{business?.plan ?? "Free"}</p>
              {business?.planExpiry && (
                <p className="text-sm text-gray-500 mt-1">
                  Expires: {format(new Date(business.planExpiry), "d MMMM yyyy")}
                </p>
              )}
            </div>
            <Badge variant="secondary" className="text-sm px-3 py-1 capitalize">
              {business?.plan ?? "free"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Upgrade Your Plan</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map(plan => {
          const isCurrent = business?.plan === plan.slug
          return (
            <Card key={plan.slug} className={`relative ${isCurrent ? "border-[#1B4F72] ring-2 ring-[#1B4F72]/20" : ""}`}>
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#1B4F72] text-white text-xs px-3 py-0.5 rounded-full">Current Plan</span>
                </div>
              )}
              <CardContent className="p-5">
                <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                <p className="text-2xl font-bold mt-2">
                  {plan.price === 0 ? "Free" : `€${plan.price.toFixed(2)}`}
                  {plan.price > 0 && <span className="text-sm font-normal text-gray-500">/mo</span>}
                </p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {!isCurrent && (
                  <Button
                    className="w-full mt-5 bg-[#1B4F72] text-white hover:bg-[#154360]"
                    onClick={() => alert("Contact admin@fuerteventura-directory.com to upgrade")}
                  >
                    Upgrade
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <p className="text-sm text-gray-500 mt-6 text-center">
        To upgrade your plan, contact{" "}
        <a href="mailto:admin@fuerteventura-directory.com" className="text-[#1B4F72] hover:underline">
          admin@fuerteventura-directory.com
        </a>
      </p>
    </div>
  )
}
