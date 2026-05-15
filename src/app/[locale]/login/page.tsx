"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import Link from "next/link"
import { MapPin, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTranslations } from "next-intl"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations("auth")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const data = new FormData(e.currentTarget)
    const result = await signIn("credentials", {
      email: data.get("email"),
      password: data.get("password"),
      redirect: false,
    })

    if (result?.error) {
      setError(t("invalidCredentials"))
      setLoading(false)
    } else {
      const callbackUrl = searchParams.get("callbackUrl") ?? `/${locale}/dashboard`
      router.push(callbackUrl)
      router.refresh()
    }
  }

  const p = (path: string) => `/${locale}${path}`

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" name="email" type="email" required className="mt-1" placeholder="you@example.com" />
      </div>
      <div>
        <Label htmlFor="password">{t("password")}</Label>
        <Input id="password" name="password" type="password" required className="mt-1" placeholder="••••••••" />
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={loading} className="w-full bg-[#1B4F72] hover:bg-[#154360] text-white">
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {t("signIn")}
      </Button>
      <p className="text-center text-sm text-gray-500">
        {t("noAccount")}{" "}
        <Link href={p("/register")} className="text-[#1B4F72] hover:underline font-medium">
          {t("listBusiness")}
        </Link>
      </p>
    </form>
  )
}

export default function LoginPage() {
  const t = useTranslations("auth")

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2 text-[#1B4F72] font-bold text-xl">
            <MapPin className="h-6 w-6 text-[#E67E22]" />
            Fuerteventura <span className="text-[#E67E22]">Directory</span>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t("signIn")}</CardTitle>
            <CardDescription>{t("accessDashboard")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
