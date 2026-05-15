import { config } from "dotenv"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, "../.env") })

import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db"
const adapter = new PrismaLibSql({ url: dbUrl })
const prisma = new PrismaClient({ adapter })

const elFaroMenu = [
  {
    section: "Starters",
    items: [
      { name: "Papas Arrugadas", description: "Wrinkled potatoes with mojo verde & rojo", price: "€6.50" },
      { name: "Gambas al Ajillo", description: "King prawns in garlic olive oil & chilli", price: "€12.00" },
      { name: "Croquetas Caseras", description: "Homemade bacalao croquettes (6 pcs)", price: "€8.50" },
      { name: "Ensalada Tropical", description: "Mixed greens, mango, avocado & tomato", price: "€9.00" },
    ],
  },
  {
    section: "Main Courses",
    items: [
      { name: "Vieja a la Sal", description: "Parrotfish baked in sea salt, local vegetables", price: "€22.00" },
      { name: "Cherne a la Plancha", description: "Grilled stone bass, papas arrugadas, mojo", price: "€24.00" },
      { name: "Pulpo a la Gallega", description: "Octopus, paprika, olive oil, boiled potato", price: "€19.00" },
      { name: "Cabrito al Horno", description: "Slow-roasted kid goat, Canarian potatoes", price: "€21.00" },
      { name: "Cazuela de Mariscos", description: "Seafood casserole, lobster, clams, shrimp", price: "€28.00" },
    ],
  },
  {
    section: "Desserts",
    items: [
      { name: "Bienmesabe", description: "Traditional almond cream with vanilla ice cream", price: "€6.00" },
      { name: "Frangollo", description: "Canarian corn pudding with lemon & cinnamon", price: "€5.50" },
      { name: "Quesillo", description: "Local caramel custard", price: "€5.00" },
    ],
  },
  {
    section: "Drinks",
    items: [
      { name: "Vino de la Tierra", description: "House wine, white or red — glass", price: "€4.50" },
      { name: "Cerveza Tropical", description: "Local Canarian lager, draft pint", price: "€3.50" },
      { name: "Zumo Natural", description: "Fresh-squeezed orange juice", price: "€3.00" },
    ],
  },
]

async function main() {
  console.log("DB:", dbUrl)

  await prisma.business.update({
    where: { slug: "el-faro-restaurant" },
    data: {
      images: JSON.stringify([
        "/uploads/el-faro-restaurant/photo1.jpg",
        "/uploads/el-faro-restaurant/photo2.jpg",
        "/uploads/el-faro-restaurant/photo3.jpg",
        "/uploads/el-faro-restaurant/photo4.jpg",
        "/uploads/el-faro-restaurant/photo5.jpg",
      ]),
      menuItems: JSON.stringify(elFaroMenu),
    },
  })
  console.log("✓ El Faro Restaurant — 5 photos + menu")

  await prisma.business.update({
    where: { slug: "flag-beach-kite-center" },
    data: {
      images: JSON.stringify([
        "/uploads/flag-beach-kite-center/photo1.jpg",
        "/uploads/flag-beach-kite-center/photo2.jpg",
        "/uploads/flag-beach-kite-center/photo3.jpg",
        "/uploads/flag-beach-kite-center/photo4.jpg",
      ]),
    },
  })
  console.log("✓ Flag Beach Kite Center — 4 photos")

  await prisma.business.update({
    where: { slug: "villa-atlantica" },
    data: {
      images: JSON.stringify([
        "/uploads/villa-atlantica/photo1.jpg",
        "/uploads/villa-atlantica/photo2.jpg",
        "/uploads/villa-atlantica/photo3.jpg",
      ]),
    },
  })
  console.log("✓ Villa Atlantica — 3 photos")

  await prisma.business.update({
    where: { slug: "corralejo-surf-school" },
    data: {
      images: JSON.stringify([
        "/uploads/corralejo-surf-school/photo1.jpg",
        "/uploads/corralejo-surf-school/photo2.jpg",
        "/uploads/corralejo-surf-school/photo3.jpg",
      ]),
    },
  })
  console.log("✓ Corralejo Surf School — 3 photos")

  console.log("\nDone!")
}

main().catch(console.error).finally(() => prisma.$disconnect())
