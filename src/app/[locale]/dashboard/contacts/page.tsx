import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Mail, Phone, Calendar } from "lucide-react"

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  read: "bg-gray-100 text-gray-700",
  replied: "bg-green-100 text-green-800",
  closed: "bg-gray-200 text-gray-600",
}

async function updateContact(formData: FormData) {
  "use server"
  const session = await auth()
  if (!session) return

  const contactId = formData.get("contactId") as string
  const status = formData.get("status") as string
  const notes = formData.get("notes") as string

  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: { business: true },
  })
  if (!contact || contact.business.userId !== session.user.id) return

  await prisma.contact.update({
    where: { id: contactId },
    data: { status, notes: notes || null },
  })

  revalidatePath("/dashboard/contacts")
}

export default async function ContactsPage({
  params: routeParams,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ id?: string }>
}) {
  const { locale } = await routeParams
  const session = await auth()
  if (!session) redirect(`/${locale}/login`)

  const business = await prisma.business.findUnique({ where: { userId: session.user.id } })
  if (!business) redirect(`/${locale}/dashboard`)

  const params = await searchParams
  const selectedId = params.id

  const contacts = await prisma.contact.findMany({
    where: { businessId: business.id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  })

  const selected = selectedId ? contacts.find(c => c.id === selectedId) : contacts[0]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Enquiries CRM</h1>

      {contacts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="font-medium">No enquiries yet</p>
          <p className="text-sm mt-1">Contact forms submitted on your listing will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="space-y-2">
            {contacts.map(contact => (
              <a key={contact.id} href={`/${locale}/dashboard/contacts?id=${contact.id}`}>
                <div className={`p-3 rounded-lg border cursor-pointer hover:border-[#1B4F72] transition-colors ${contact.id === selected?.id ? "border-[#1B4F72] bg-blue-50" : "bg-white"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm text-gray-900 truncate">{contact.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[contact.status]}`}>
                      {contact.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{contact.subject ?? contact.message.slice(0, 50)}</p>
                  <p className="text-xs text-gray-400 mt-1">{format(new Date(contact.createdAt), "d MMM yyyy")}</p>
                </div>
              </a>
            ))}
          </div>

          {/* Detail */}
          {selected && (
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{selected.name}</CardTitle>
                      {selected.subject && <p className="text-gray-500 text-sm mt-1">{selected.subject}</p>}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[selected.status]}`}>
                      {selected.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contact info */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(selected.createdAt), "d MMM yyyy HH:mm")}
                    </div>
                    {selected.email && (
                      <a href={`mailto:${selected.email}`} className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700">
                        <Mail className="h-3.5 w-3.5" />{selected.email}
                      </a>
                    )}
                    {selected.phone && (
                      <a href={`tel:${selected.phone}`} className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700">
                        <Phone className="h-3.5 w-3.5" />{selected.phone}
                      </a>
                    )}
                  </div>

                  {/* Message */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800 whitespace-pre-wrap">{selected.message}</p>
                  </div>

                  {/* Update form */}
                  <form action={updateContact} className="space-y-3">
                    <input type="hidden" name="contactId" value={selected.id} />
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Update Status</label>
                      <select name="status" defaultValue={selected.status} className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full">
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Internal Notes</label>
                      <Textarea name="notes" defaultValue={selected.notes ?? ""} rows={3} placeholder="Add notes for yourself..." />
                    </div>
                    <Button type="submit" className="bg-[#1B4F72] text-white">Save Update</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
