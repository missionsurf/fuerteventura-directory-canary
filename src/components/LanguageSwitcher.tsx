"use client"

import { useLocale } from "next-intl"
import { useRouter, usePathname } from "next/navigation"
import { Globe } from "lucide-react"
import { useState } from "react"

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
]

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0]

  function switchLocale(newLocale: string) {
    if (newLocale === locale) { setOpen(false); return }
    // pathname includes the locale prefix: /en/directory/slug
    // Replace the first segment with the new locale
    const segments = pathname.split("/")
    segments[1] = newLocale
    router.push(segments.join("/") || "/")
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors bg-white"
        aria-label="Switch language"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden sm:inline">{current.label}</span>
        <Globe className="h-3.5 w-3.5 text-gray-400" />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLocale(lang.code)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                  lang.code === locale
                    ? "font-semibold text-[#1B4F72]"
                    : "text-gray-700"
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                {lang.label}
                {lang.code === locale && (
                  <span className="ml-auto text-[#1B4F72] text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
