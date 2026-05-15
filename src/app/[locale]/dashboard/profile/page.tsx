import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

const TOWNS = ["Corralejo", "Morro Jable", "El Cotillo", "Caleta de Fuste", "Puerto del Rosario", "Costa Calma", "Betancuria", "Antigua", "La Oliva"]

async function saveProfile(formData: FormData) {
  "use server"
  const session = await auth()
  if (!session) return

  const business = await prisma.business.findUnique({ where: { userId: session.user.id } })
  if (!business) return

  await prisma.business.update({
    where: { id: business.id },
    data: {
      name: formData.get("name") as string,
      tagline: (formData.get("tagline") as string) || null,
      description: (formData.get("description") as string) || null,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      website: (formData.get("website") as string) || null,
      whatsapp: (formData.get("whatsapp") as string) || null,
      address: (formData.get("address") as string) || null,
      town: (formData.get("town") as string) || null,
      postcode: (formData.get("postcode") as string) || null,
      facebook: (formData.get("facebook") as string) || null,
      instagram: (formData.get("instagram") as string) || null,
      twitter: (formData.get("twitter") as string) || null,
      metaTitle: (formData.get("metaTitle") as string) || null,
      metaDesc: (formData.get("metaDesc") as string) || null,
    },
  })

  revalidatePath("/dashboard/profile")
  revalidatePath(`/directory/${business.slug}`)
}

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()
  if (!session) redirect(`/${locale}/login`)

  const business = await prisma.business.findUnique({
    where: { userId: session.user.id },
    include: { category: true },
  })

  if (!business) {
    return <div className="text-gray-500">No business listing found.</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Listing</h1>

      <form action={saveProfile} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Business Name *</Label>
              <Input id="name" name="name" defaultValue={business.name} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" name="tagline" defaultValue={business.tagline ?? ""} className="mt-1" placeholder="Short catchy description" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={business.description ?? ""} rows={4} className="mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader><CardTitle className="text-base">Contact Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={business.email ?? ""} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={business.phone ?? ""} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" name="whatsapp" defaultValue={business.whatsapp ?? ""} className="mt-1" placeholder="+34 628..." />
            </div>
            <div>
              <Label htmlFor="website">Website URL</Label>
              <Input id="website" name="website" defaultValue={business.website ?? ""} className="mt-1" placeholder="https://..." />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader><CardTitle className="text-base">Location</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="address">Street Address</Label>
              <Input id="address" name="address" defaultValue={business.address ?? ""} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="town">Town</Label>
              <select name="town" id="town" defaultValue={business.town ?? ""} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="">Select town</option>
                {TOWNS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="postcode">Postcode</Label>
              <Input id="postcode" name="postcode" defaultValue={business.postcode ?? ""} className="mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* Social */}
        <Card>
          <CardHeader><CardTitle className="text-base">Social Media</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="facebook">Facebook URL</Label>
              <Input id="facebook" name="facebook" defaultValue={business.facebook ?? ""} className="mt-1" placeholder="https://facebook.com/..." />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram URL</Label>
              <Input id="instagram" name="instagram" defaultValue={business.instagram ?? ""} className="mt-1" placeholder="https://instagram.com/..." />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter/X URL</Label>
              <Input id="twitter" name="twitter" defaultValue={business.twitter ?? ""} className="mt-1" placeholder="https://x.com/..." />
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader><CardTitle className="text-base">SEO</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input id="metaTitle" name="metaTitle" defaultValue={business.metaTitle ?? ""} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="metaDesc">Meta Description</Label>
              <Textarea id="metaDesc" name="metaDesc" defaultValue={business.metaDesc ?? ""} rows={2} className="mt-1" />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="bg-[#1B4F72] hover:bg-[#154360] text-white px-8">
          <CheckCircle2 className="h-4 w-4 mr-2" /> Save Changes
        </Button>
      </form>
    </div>
  )
}
