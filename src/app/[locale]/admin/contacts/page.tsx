import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { revalidatePath } from "next/cache"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Mail, Phone } from "lucide-react"
import Link from "next/link"

async function updateContact(formData: FormData) {
  "use server"
  const id = formData.get("contactId") as string
  await prisma.contact.update({
    where: { id },
    data: {
      status: formData.get("status") as string,
      notes: (formData.get("notes") as string) || null,
    },
  })
  revalidatePath("/admin/contacts")
}

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  read: "bg-gray-100 text-gray-700",
  replied: "bg-green-100 text-green-800",
  closed: "bg-gray-200 text-gray-600",
}

export default async function AdminContacts({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; status?: string }>
}) {
  const params = await searchParams
  const selectedId = params.id
  const statusFilter = params.status ?? ""

  const contacts = await prisma.contact.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    include: { business: { select: { name: true, slug: true } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  })

  const selected = selectedId ? contacts.find(c => c.id === selectedId) : contacts[0]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Contacts ({contacts.length})</h1>
        <div className="flex gap-2">
          {["", "new", "read", "replied", "closed"].map(s => (
            <Link key={s} href={`/admin/contacts?${s ? `status=${s}` : ""}`}>
              <Button variant={statusFilter === s ? "default" : "outline"} size="sm" className={statusFilter === s ? "bg-[#1B4F72] text-white" : ""}>
                {s || "All"}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p>No contacts found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact list */}
          <div className="space-y-2 overflow-y-auto max-h-[70vh]">
            {contacts.map(contact => (
              <a key={contact.id} href={`/admin/contacts?id=${contact.id}${statusFilter ? `&status=${statusFilter}` : ""}`}>
                <div className={`p-3 rounded-lg border cursor-pointer hover:border-[#1B4F72] ${contact.id === selected?.id ? "border-[#1B4F72] bg-blue-50" : "bg-white"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm truncate">{contact.name}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${statusColors[contact.status]}`}>{contact.status}</span>
                  </div>
                  <p className="text-xs text-[#1B4F72] font-medium">{contact.business.name}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{contact.message.slice(0, 50)}</p>
                  <p className="text-xs text-gray-400 mt-1">{format(new Date(contact.createdAt), "d MMM HH:mm")}</p>
                </div>
              </a>
            ))}
          </div>

          {/* Detail pane */}
          {selected && (
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selected.name}</CardTitle>
                      <p className="text-sm text-[#1B4F72] mt-1">
                        Re: <Link href={`/directory/${selected.business.slug}`} className="hover:underline">{selected.business.name}</Link>
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[selected.status]}`}>{selected.status}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="text-gray-400">{format(new Date(selected.createdAt), "d MMM yyyy HH:mm")}</span>
                    {selected.email && (
                      <a href={`mailto:${selected.email}`} className="flex items-center gap-1.5 text-blue-600">
                        <Mail className="h-3.5 w-3.5" />{selected.email}
                      </a>
                    )}
                    {selected.phone && (
                      <a href={`tel:${selected.phone}`} className="flex items-center gap-1.5 text-blue-600">
                        <Phone className="h-3.5 w-3.5" />{selected.phone}
                      </a>
                    )}
                  </div>
                  {selected.subject && <p className="font-medium text-gray-800">{selected.subject}</p>}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="whitespace-pre-wrap text-gray-800">{selected.message}</p>
                  </div>
                  <form action={updateContact} className="space-y-3">
                    <input type="hidden" name="contactId" value={selected.id} />
                    <div>
                      <label className="text-sm font-medium mb-1 block">Status</label>
                      <select name="status" defaultValue={selected.status} className="w-full border rounded-lg px-3 py-2 text-sm">
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Notes</label>
                      <Textarea name="notes" defaultValue={selected.notes ?? ""} rows={3} />
                    </div>
                    <Button type="submit" className="bg-[#1B4F72] text-white">Update</Button>
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
