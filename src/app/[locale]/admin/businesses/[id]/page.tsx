import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"

async function updateBusiness(formData: FormData) {
  "use server"
  const id = formData.get("id") as string

  await prisma.business.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      status: formData.get("status") as string,
      plan: formData.get("plan") as string,
      featured: formData.get("featured") === "1",
      verified: formData.get("verified") === "1",
      categoryId: (formData.get("categoryId") as string) || null,
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
    },
  })

  revalidatePath("/admin/businesses")
  revalidatePath(`/directory/${(await prisma.business.findUnique({ where: { id }, select: { slug: true } }))?.slug}`)
  redirect("/admin/businesses")
}

export default async function AdminBusinessEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [business, categories] = await Promise.all([
    prisma.business.findUnique({
      where: { id },
      include: { user: true, category: true, contacts: { orderBy: { createdAt: "desc" }, take: 10 }, invoices: { orderBy: { createdAt: "desc" }, take: 5 } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ])

  if (!business) notFound()

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/businesses">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Edit: {business.name}</h1>
        <Link href={`/directory/${business.slug}`} target="_blank" className="ml-auto">
          <Button variant="outline" size="sm"><ExternalLink className="h-3.5 w-3.5 mr-1" /> View</Button>
        </Link>
      </div>

      <form action={updateBusiness} className="space-y-6">
        <input type="hidden" name="id" value={business.id} />

        {/* Status & Plan */}
        <Card>
          <CardHeader><CardTitle className="text-base">Status & Plan</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <Label>Status</Label>
              <select name="status" defaultValue={business.status} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm">
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div>
              <Label>Plan</Label>
              <select name="plan" defaultValue={business.plan} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm">
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div>
              <Label>Category</Label>
              <select name="categoryId" defaultValue={business.categoryId ?? ""} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">None</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex gap-4 items-end">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" name="featured" value="1" defaultChecked={business.featured} className="rounded" />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" name="verified" value="1" defaultChecked={business.verified} className="rounded" />
                Verified
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader><CardTitle className="text-base">Business Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Business Name</Label>
                <Input name="name" defaultValue={business.name} className="mt-1" />
              </div>
              <div>
                <Label>Tagline</Label>
                <Input name="tagline" defaultValue={business.tagline ?? ""} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea name="description" defaultValue={business.description ?? ""} rows={4} className="mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader><CardTitle className="text-base">Contact</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Email</Label><Input name="email" defaultValue={business.email ?? ""} className="mt-1" /></div>
            <div><Label>Phone</Label><Input name="phone" defaultValue={business.phone ?? ""} className="mt-1" /></div>
            <div><Label>WhatsApp</Label><Input name="whatsapp" defaultValue={business.whatsapp ?? ""} className="mt-1" /></div>
            <div><Label>Website</Label><Input name="website" defaultValue={business.website ?? ""} className="mt-1" /></div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader><CardTitle className="text-base">Location</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3"><Label>Address</Label><Input name="address" defaultValue={business.address ?? ""} className="mt-1" /></div>
            <div><Label>Town</Label><Input name="town" defaultValue={business.town ?? ""} className="mt-1" /></div>
            <div><Label>Postcode</Label><Input name="postcode" defaultValue={business.postcode ?? ""} className="mt-1" /></div>
          </CardContent>
        </Card>

        {/* Social */}
        <Card>
          <CardHeader><CardTitle className="text-base">Social Media</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><Label>Facebook</Label><Input name="facebook" defaultValue={business.facebook ?? ""} className="mt-1" /></div>
            <div><Label>Instagram</Label><Input name="instagram" defaultValue={business.instagram ?? ""} className="mt-1" /></div>
            <div><Label>Twitter/X</Label><Input name="twitter" defaultValue={business.twitter ?? ""} className="mt-1" /></div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" className="bg-[#1B4F72] text-white">Save Changes</Button>
          <Link href="/admin/businesses">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>

      {/* Contacts for this business */}
      {business.contacts.length > 0 && (
        <Card className="mt-8">
          <CardHeader><CardTitle className="text-base">Recent Contacts ({business.contacts.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {business.contacts.map(c => (
                <div key={c.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                  <div>
                    <span className="font-medium">{c.name}</span>
                    {c.email && <span className="text-gray-500 ml-2">{c.email}</span>}
                    <p className="text-gray-600 text-xs">{c.message.slice(0, 80)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ml-3 ${c.status === "new" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
