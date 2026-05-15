import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

async function updatePlan(formData: FormData) {
  "use server"
  const id = formData.get("id") as string
  const priceStr = formData.get("price") as string
  const yearlyPriceStr = formData.get("yearlyPrice") as string

  await prisma.plan.update({
    where: { id },
    data: {
      price: Math.round(parseFloat(priceStr) * 100),
      yearlyPrice: yearlyPriceStr ? Math.round(parseFloat(yearlyPriceStr) * 100) : null,
      active: formData.get("active") === "1",
    },
  })

  revalidatePath("/admin/plans")
}

export default async function AdminPlans() {
  const plans = await prisma.plan.findMany({ orderBy: { sortOrder: "asc" } })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Plans & Pricing</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map(plan => {
          const features = JSON.parse(plan.features) as string[]
          return (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle className="text-base">{plan.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 mb-4">
                  {features.map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>

                <form action={updatePlan} className="space-y-3 border-t pt-3">
                  <input type="hidden" name="id" value={plan.id} />
                  <div>
                    <Label className="text-xs">Monthly Price (€)</Label>
                    <Input
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={(plan.price / 100).toFixed(2)}
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Yearly Price (€)</Label>
                    <Input
                      name="yearlyPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={plan.yearlyPrice ? (plan.yearlyPrice / 100).toFixed(2) : ""}
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="active" value="1" defaultChecked={plan.active} />
                    Active
                  </label>
                  <Button type="submit" size="sm" className="w-full bg-[#1B4F72] text-white">
                    Save
                  </Button>
                </form>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
