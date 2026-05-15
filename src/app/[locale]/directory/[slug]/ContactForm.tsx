"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

export default function ContactForm({ businessId }: { businessId: string }) {
  const t = useTranslations("contact")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("loading")
    setError("")
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, businessId }),
      })
      if (!res.ok) throw new Error(await res.text())
      setStatus("success")
      form.reset()
    } catch {
      setStatus("error")
      setError(t("error"))
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg p-4">
        <CheckCircle2 className="h-5 w-5" />
        <span className="text-sm font-medium">{t("thanks")}</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="name" className="text-xs">{t("name")} *</Label>
        <Input id="name" name="name" required className="mt-1" placeholder="John Smith" />
      </div>
      <div>
        <Label htmlFor="email" className="text-xs">{t("email")}</Label>
        <Input id="email" name="email" type="email" className="mt-1" placeholder="john@example.com" />
      </div>
      <div>
        <Label htmlFor="phone" className="text-xs">{t("phone")}</Label>
        <Input id="phone" name="phone" className="mt-1" placeholder="+34 ..." />
      </div>
      <div>
        <Label htmlFor="subject" className="text-xs">{t("subject")}</Label>
        <Input id="subject" name="subject" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="message" className="text-xs">{t("message")} *</Label>
        <Textarea id="message" name="message" required rows={3} className="mt-1" />
      </div>
      {error && <p className="text-red-600 text-xs">{error}</p>}
      <Button type="submit" disabled={status === "loading"} className="w-full bg-[#1B4F72] text-white">
        {status === "loading" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {status === "loading" ? t("sending") : t("send")}
      </Button>
    </form>
  )
}
