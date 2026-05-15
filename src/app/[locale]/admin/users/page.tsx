import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { revalidatePath } from "next/cache"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import { auth } from "@/auth"

async function changeRole(formData: FormData) {
  "use server"
  const id = formData.get("userId") as string
  const role = formData.get("role") as string
  const session = await auth()
  if (!session || session.user.role !== "admin") return
  if (id === session.user.id) return // can't change own role
  await prisma.user.update({ where: { id }, data: { role } })
  revalidatePath("/admin/users")
}

export default async function AdminUsers() {
  const users = await prisma.user.findMany({
    include: { business: { select: { name: true, status: true, plan: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users ({users.length})</h1>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">User</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Business</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Role</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Joined</th>
              <th className="text-right px-4 py-3 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{user.name ?? "—"}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {user.business ? (
                    <div>
                      <p>{user.business.name}</p>
                      <p className="text-xs text-gray-400">{user.business.status} · {user.business.plan}</p>
                    </div>
                  ) : <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    user.role === "admin" ? "bg-purple-100 text-purple-800"
                    : user.role === "business" ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-600"
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {format(new Date(user.createdAt), "d MMM yyyy")}
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={changeRole} className="flex items-center justify-end gap-2">
                    <input type="hidden" name="userId" value={user.id} />
                    <select name="role" defaultValue={user.role} className="text-xs border rounded px-2 py-1">
                      <option value="user">User</option>
                      <option value="business">Business</option>
                      <option value="admin">Admin</option>
                    </select>
                    <Button type="submit" size="sm" variant="outline">Save</Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
