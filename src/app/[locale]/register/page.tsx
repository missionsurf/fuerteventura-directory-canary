"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { MapPin, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTranslations } from "next-intl"

const CATEGORIES = [
  { slug: "restaurants-bars", name: "Restaurants & Bars" },
  { slug: "hotels-accommodation", name: "Hotels & Accommodation" },
  { slug: "water-sports", name: "Water Sports" },
  { slug: "car-bike-rental", name: "Car & Bike Rental" },
  { slug: "health-beauty", name: "Health & Beauty" },
  { slug: "shops-retail", name: "Shops & Retail" },
  { slug: "real-estate", name: "Real Estate" },
  { slug: "tours-activities", name: "Tours & Activities" },
  { slug: "surfing-kiting", name: "Surfing & Kiting" },
  { slug: "services-trades", name: "Services & Trades" },
  { slug: "education-lessons", name: "Education & Lessons" },
  { slug: "medical-dental", name: "Medical & Dental" },
]

export default function RegisterPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations("auth")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const p = (path: string) => `/${locale}${path}`

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const data = Object.fromEntries(new FormData(e.currentTarget))

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Registration failed")
      router.push(p("/login?registered=1"))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-center mb-6">
          <Link href={p("/")} className="flex items-center gap-2 text-[#1B4F72] font-bold text-xl">
            <MapPin className="h-6 w-6 text-[#E67E22]" />
            Fuerteventura <span className="text-[#E67E22]">Directory</span>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t("register")}</CardTitle>
            <CardDescription>{t("registerSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="name">Your Name *</Label>
                  <Input id="name" name="name" required className="mt-1" placeholder="Jane Smith" />
                </div>
                <div>
                  <Label htmlFor="email">{t("email")} *</Label>
                  <Input id="email" name="email" type="email" required className="mt-1" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <Label htmlFor="password">{t("password")} *</Label>
                <Input id="password" name="password" type="password" required minLength={6} className="mt-1" placeholder="Minimum 6 characters" />
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Business Details</p>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input id="businessName" name="businessName" required className="mt-1" placeholder="My Amazing Business" />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select name="category" id="category" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                      <option value="">Select a category</option>
                      {CATEGORIES.map(c => (
                        <option key={c.slug} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" className="mt-1" placeholder="+34 928 ..." />
                    </div>
                    <div>
                      <Label htmlFor="town">Town</Label>
                      <Input id="town" name="town" className="mt-1" placeholder="Corralejo" />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={loading} className="w-full bg-[#1B4F72] hover:bg-[#154360] text-white">
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t("listBusiness")}
              </Button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-4">
              {t("alreadyHaveAccount")}{" "}
              <Link href={p("/login")} className="text-[#1B4F72] hover:underline font-medium">{t("signInLink")}</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
