"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, CheckCircle2, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

export default function ReviewForm({ businessId }: { businessId: string }) {
  const t = useTranslations("review")
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!rating) { setError(t("error")); return }
    setStatus("loading")
    setError("")
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, businessId, rating }),
      })
      if (!res.ok) throw new Error(await res.text())
      setStatus("success")
    } catch {
      setStatus("error")
      setError(t("error"))
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg p-4">
        <CheckCircle2 className="h-5 w-5" />
        <span className="text-sm">{t("thanks")}</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Star rating */}
      <div>
        <Label className="text-xs mb-1 block">{t("rating")} *</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
            >
              <Star className={`h-6 w-6 transition-colors ${star <= (hovered || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="authorName" className="text-xs">{t("yourName")} *</Label>
        <Input id="authorName" name="authorName" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="title" className="text-xs">{t("title")}</Label>
        <Input id="title" name="title" className="mt-1" placeholder={t("titlePlaceholder")} />
      </div>
      <div>
        <Label htmlFor="body" className="text-xs">{t("body")} *</Label>
        <Textarea id="body" name="body" required rows={3} className="mt-1" placeholder={t("bodyPlaceholder")} />
      </div>
      {error && <p className="text-red-600 text-xs">{error}</p>}
      <Button type="submit" disabled={status === "loading"} variant="outline" className="w-full">
        {status === "loading" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {status === "loading" ? t("submitting") : t("submit")}
      </Button>
    </form>
  )
}
