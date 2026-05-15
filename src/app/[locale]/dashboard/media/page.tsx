"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  ImagePlus, Trash2, Upload, FileText, Plus, GripVertical,
  Check, Loader2, X, ChevronDown, ChevronUp,
} from "lucide-react"
import { useTranslations } from "next-intl"

interface MenuItem {
  name: string
  description: string
  price: string
}

interface MenuSection {
  section: string
  items: MenuItem[]
}

export default function MediaPage() {
  const t = useTranslations("dashboard")
  const [images, setImages] = useState<string[]>([])
  const [menuPdf, setMenuPdf] = useState<string | null>(null)
  const [menuItems, setMenuItems] = useState<MenuSection[]>([])
  const [uploading, setUploading] = useState(false)
  const [savingMenu, setSavingMenu] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const imageInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/media")
      .then((r) => r.json())
      .then((d) => {
        setImages(d.images ?? [])
        setMenuPdf(d.menuPdf ?? null)
        setMenuItems(d.menuItems ?? [])
      })
  }, [])

  async function uploadImage(file: File) {
    setUploading(true)
    setError("")
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("type", "image")
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setImages(data.images)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }

  async function deleteImage(url: string) {
    setError("")
    const res = await fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, type: "image" }),
    })
    const data = await res.json()
    if (res.ok) setImages(data.images)
    else setError(data.error)
  }

  async function uploadPdf(file: File) {
    setUploading(true)
    setError("")
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("type", "menu-pdf")
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMenuPdf(data.url)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }

  async function deletePdf() {
    const res = await fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "menu-pdf" }),
    })
    if (res.ok) setMenuPdf(null)
  }

  async function saveMenuItems() {
    setSavingMenu(true)
    setSaved(false)
    const res = await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menuItems }),
    })
    setSavingMenu(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  function addSection() {
    setMenuItems([...menuItems, { section: "New Section", items: [] }])
  }

  function updateSectionName(si: number, name: string) {
    setMenuItems(menuItems.map((s, i) => i === si ? { ...s, section: name } : s))
  }

  function removeSection(si: number) {
    setMenuItems(menuItems.filter((_, i) => i !== si))
  }

  function addItem(si: number) {
    setMenuItems(menuItems.map((s, i) =>
      i === si ? { ...s, items: [...s.items, { name: "", description: "", price: "" }] } : s
    ))
  }

  function updateItem(si: number, ii: number, field: keyof MenuItem, value: string) {
    setMenuItems(menuItems.map((s, i) =>
      i === si
        ? { ...s, items: s.items.map((item, j) => j === ii ? { ...item, [field]: value } : item) }
        : s
    ))
  }

  function removeItem(si: number, ii: number) {
    setMenuItems(menuItems.map((s, i) =>
      i === si ? { ...s, items: s.items.filter((_, j) => j !== ii) } : s
    ))
  }

  function moveSection(si: number, dir: -1 | 1) {
    const next = [...menuItems]
    const target = si + dir
    if (target < 0 || target >= next.length) return
    ;[next[si], next[target]] = [next[target], next[si]]
    setMenuItems(next)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("photosMenu")}</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
          <X className="h-4 w-4 flex-shrink-0" /> {error}
        </div>
      )}

      <Tabs defaultValue="photos">
        <TabsList className="mb-6">
          <TabsTrigger value="photos">
            Photos {images.length > 0 && <Badge variant="secondary" className="ml-2">{images.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="menu">Menu</TabsTrigger>
        </TabsList>

        {/* ── PHOTOS ── */}
        <TabsContent value="photos">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("businessPhotos")}</CardTitle>
              <p className="text-sm text-gray-500">{t("photosDesc")}</p>
            </CardHeader>
            <CardContent>
              {/* Upload button */}
              <div className="mb-6">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    Array.from(e.target.files ?? []).forEach(uploadImage)
                    e.target.value = ""
                  }}
                />
                <button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploading}
                  className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl py-10 hover:border-[#1B4F72] hover:bg-blue-50 transition-colors cursor-pointer disabled:opacity-50"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    Array.from(e.dataTransfer.files).forEach(uploadImage)
                  }}
                >
                  {uploading ? (
                    <Loader2 className="h-8 w-8 text-[#1B4F72] animate-spin mb-2" />
                  ) : (
                    <ImagePlus className="h-8 w-8 text-gray-400 mb-2" />
                  )}
                  <p className="text-sm font-medium text-gray-600">
                    {uploading ? "Uploading…" : t("uploadPhotos")}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{t("photoTypes")}</p>
                </button>
              </div>

              {/* Photo grid */}
              {images.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">{t("noPhotos")}</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {images.map((url) => (
                    <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border bg-gray-100">
                      <img
                        src={url}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-image.svg" }}
                      />
                      <button
                        onClick={() => deleteImage(url)}
                        className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── MENU ── */}
        <TabsContent value="menu">
          <div className="space-y-6">
            {/* PDF menu */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("pdfMenu")}</CardTitle>
                <p className="text-sm text-gray-500">{t("pdfDesc")}</p>
              </CardHeader>
              <CardContent>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) uploadPdf(f)
                    e.target.value = ""
                  }}
                />
                {menuPdf ? (
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                    <FileText className="h-6 w-6 text-red-500 flex-shrink-0" />
                    <a href={menuPdf} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-700 hover:underline flex-1 truncate">
                      {menuPdf.split("/").pop()}
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => pdfInputRef.current?.click()}
                      disabled={uploading}
                      className="text-xs"
                    >
                      <Upload className="h-3.5 w-3.5 mr-1" /> Replace
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={deletePdf}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => pdfInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-3 w-full border-2 border-dashed border-gray-300 rounded-xl py-8 px-4 hover:border-[#1B4F72] hover:bg-blue-50 transition-colors cursor-pointer justify-center disabled:opacity-50"
                  >
                    {uploading ? (
                      <Loader2 className="h-6 w-6 text-[#1B4F72] animate-spin" />
                    ) : (
                      <Upload className="h-6 w-6 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-600">{uploading ? "Uploading…" : t("uploadPdf")}</span>
                  </button>
                )}
              </CardContent>
            </Card>

            {/* Structured menu builder */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{t("menuBuilder")}</CardTitle>
                    <p className="text-sm text-gray-500 mt-0.5">{t("menuBuilderDesc")}</p>
                  </div>
                  <Button
                    onClick={saveMenuItems}
                    disabled={savingMenu}
                    className="bg-[#1B4F72] hover:bg-[#154360] text-white flex-shrink-0"
                    size="sm"
                  >
                    {savingMenu ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : saved ? (
                      <><Check className="h-4 w-4 mr-1" /> {t("saved")}</>
                    ) : (
                      t("saveMenu")
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {menuItems.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-2">
                    No sections yet — add one below.
                  </p>
                )}

                {menuItems.map((section, si) => (
                  <div key={si} className="border rounded-xl overflow-hidden">
                    {/* Section header */}
                    <div className="flex items-center gap-2 bg-gray-50 border-b px-4 py-3">
                      <GripVertical className="h-4 w-4 text-gray-300 flex-shrink-0" />
                      <Input
                        value={section.section}
                        onChange={(e) => updateSectionName(si, e.target.value)}
                        className="h-8 font-semibold border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
                        placeholder="Section name (e.g. Starters)"
                      />
                      <div className="flex items-center gap-1 ml-auto">
                        <button
                          onClick={() => moveSection(si, -1)}
                          disabled={si === 0}
                          className="p-1 rounded text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => moveSection(si, 1)}
                          disabled={si === menuItems.length - 1}
                          className="p-1 rounded text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeSection(si)}
                          className="p-1 rounded text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="divide-y">
                      {section.items.map((item, ii) => (
                        <div key={ii} className="grid grid-cols-[1fr_1fr_auto_auto] gap-3 px-4 py-3 items-start">
                          <div>
                            <Label className="text-xs text-gray-400 mb-1 block">{t("itemName")}</Label>
                            <Input
                              value={item.name}
                              onChange={(e) => updateItem(si, ii, "name", e.target.value)}
                              className="h-8 text-sm"
                              placeholder="e.g. Grilled Sea Bass"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-400 mb-1 block">{t("itemDescription")}</Label>
                            <Input
                              value={item.description}
                              onChange={(e) => updateItem(si, ii, "description", e.target.value)}
                              className="h-8 text-sm"
                              placeholder="Optional description"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-400 mb-1 block">{t("itemPrice")}</Label>
                            <Input
                              value={item.price}
                              onChange={(e) => updateItem(si, ii, "price", e.target.value)}
                              className="h-8 text-sm w-24"
                              placeholder="€12.50"
                            />
                          </div>
                          <button
                            onClick={() => removeItem(si, ii)}
                            className="mt-6 p-1 rounded text-red-400 hover:text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="px-4 py-2 border-t bg-gray-50">
                      <button
                        onClick={() => addItem(si)}
                        className="flex items-center gap-1.5 text-sm text-[#1B4F72] hover:text-[#154360] font-medium py-1"
                      >
                        <Plus className="h-4 w-4" /> {t("addItem")}
                      </button>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={addSection}
                  className="w-full border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2" /> {t("addSection")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
