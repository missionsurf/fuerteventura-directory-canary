import { config } from "dotenv"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, "../.env") })

import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import bcrypt from "bcryptjs"

const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db"
const authToken = process.env.TURSO_AUTH_TOKEN
const adapter = new PrismaLibSql({ url: dbUrl, ...(authToken && { authToken }) })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Starting seed... DB:", dbUrl)

  // Create plans
  const plans = [
    { name: "Free", slug: "free", price: 0, features: JSON.stringify(["1 photo", "Basic listing", "Contact form"]), maxImages: 1, sortOrder: 0 },
    { name: "Starter", slug: "starter", price: 999, yearlyPrice: 9990, features: JSON.stringify(["5 photos", "Enhanced listing", "Priority in search", "WhatsApp button"]), maxImages: 5, sortOrder: 1 },
    { name: "Pro", slug: "pro", price: 1999, yearlyPrice: 19990, features: JSON.stringify(["15 photos", "Featured badge", "Top of category", "Analytics", "Social links"]), maxImages: 15, featured: true, sortOrder: 2 },
    { name: "Premium", slug: "premium", price: 3999, yearlyPrice: 39990, features: JSON.stringify(["Unlimited photos", "Homepage feature", "Verified badge", "Priority support", "Custom domain"]), maxImages: -1, featured: true, sortOrder: 3 },
  ]
  for (const plan of plans) {
    await prisma.plan.upsert({ where: { slug: plan.slug }, update: plan, create: plan })
  }
  console.log("Plans seeded")

  // Create categories
  const categories = [
    { name: "Restaurants & Bars", slug: "restaurants-bars", icon: "UtensilsCrossed" },
    { name: "Hotels & Accommodation", slug: "hotels-accommodation", icon: "Hotel" },
    { name: "Water Sports", slug: "water-sports", icon: "Waves" },
    { name: "Car & Bike Rental", slug: "car-bike-rental", icon: "Car" },
    { name: "Health & Beauty", slug: "health-beauty", icon: "Heart" },
    { name: "Shops & Retail", slug: "shops-retail", icon: "ShoppingBag" },
    { name: "Real Estate", slug: "real-estate", icon: "Home" },
    { name: "Tours & Activities", slug: "tours-activities", icon: "MapPin" },
    { name: "Surfing & Kiting", slug: "surfing-kiting", icon: "Wind" },
    { name: "Services & Trades", slug: "services-trades", icon: "Wrench" },
    { name: "Education & Lessons", slug: "education-lessons", icon: "GraduationCap" },
    { name: "Medical & Dental", slug: "medical-dental", icon: "Stethoscope" },
  ]
  for (const cat of categories) {
    await prisma.category.upsert({ where: { slug: cat.slug }, update: cat, create: cat })
  }
  console.log("Categories seeded")

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10)
  await prisma.user.upsert({
    where: { email: "admin@fuerteventura-directory.com" },
    update: {},
    create: {
      email: "admin@fuerteventura-directory.com",
      name: "Admin",
      password: adminPassword,
      role: "admin",
    },
  })

  // Create demo business users
  const bizPassword = await bcrypt.hash("demo123", 10)
  const bizUser = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: { email: "demo@example.com", name: "Demo Business", password: bizPassword, role: "business" },
  })

  const restCategory = await prisma.category.findUnique({ where: { slug: "restaurants-bars" } })
  await prisma.business.upsert({
    where: { slug: "el-faro-restaurant" },
    update: {},
    create: {
      userId: bizUser.id,
      categoryId: restCategory?.id,
      name: "El Faro Restaurant",
      slug: "el-faro-restaurant",
      description: "Traditional Canarian cuisine with stunning ocean views. Fresh fish daily, local wines, and authentic recipes passed down through generations.",
      tagline: "Authentic Canarian flavours by the sea",
      email: "info@elfaro.com",
      phone: "+34 928 123 456",
      whatsapp: "+34 628 123 456",
      address: "Calle del Mar 12",
      town: "Corralejo",
      postcode: "35660",
      status: "active",
      plan: "pro",
      featured: true,
      verified: true,
    },
  })

  const waterSports = await prisma.category.findUnique({ where: { slug: "water-sports" } })
  const surfing = await prisma.category.findUnique({ where: { slug: "surfing-kiting" } })
  const hotels = await prisma.category.findUnique({ where: { slug: "hotels-accommodation" } })

  const bizUser2 = await prisma.user.upsert({
    where: { email: "surf@example.com" },
    update: {},
    create: { email: "surf@example.com", name: "Surf School Owner", password: bizPassword, role: "business" },
  })
  await prisma.business.upsert({
    where: { slug: "corralejo-surf-school" },
    update: {},
    create: {
      userId: bizUser2.id,
      categoryId: surfing?.id,
      name: "Corralejo Surf School",
      slug: "corralejo-surf-school",
      description: "Professional surf lessons for all levels. Certified instructors, quality equipment, and lessons in English and Spanish.",
      tagline: "Ride the Atlantic waves",
      email: "info@correlejosurfschool.com",
      phone: "+34 928 234 567",
      whatsapp: "+34 628 234 567",
      address: "Playa de Corralejo",
      town: "Corralejo",
      postcode: "35660",
      status: "active",
      plan: "starter",
      verified: true,
    },
  })

  const bizUser3 = await prisma.user.upsert({
    where: { email: "hotel@example.com" },
    update: {},
    create: { email: "hotel@example.com", name: "Hotel Owner", password: bizPassword, role: "business" },
  })
  await prisma.business.upsert({
    where: { slug: "villa-atlantica" },
    update: {},
    create: {
      userId: bizUser3.id,
      categoryId: hotels?.id,
      name: "Villa Atlantica",
      slug: "villa-atlantica",
      description: "Boutique hotel with stunning views over the Atlantic. 12 individually designed rooms, pool, spa, and rooftop terrace. Adults only.",
      tagline: "Luxury on the edge of the Atlantic",
      email: "reservas@villa-atlantica.com",
      phone: "+34 928 345 678",
      address: "Avenida del Mar 45",
      town: "El Cotillo",
      postcode: "35650",
      status: "active",
      plan: "premium",
      featured: true,
      verified: true,
    },
  })

  const bizUser4 = await prisma.user.upsert({
    where: { email: "kite@example.com" },
    update: {},
    create: { email: "kite@example.com", name: "Kite Center Owner", password: bizPassword, role: "business" },
  })
  await prisma.business.upsert({
    where: { slug: "flag-beach-kite-center" },
    update: {},
    create: {
      userId: bizUser4.id,
      categoryId: waterSports?.id,
      name: "Flag Beach Kite Center",
      slug: "flag-beach-kite-center",
      description: "World-class kitesurfing center on Flag Beach. IKO certified instructors. Equipment rental and lessons for all levels.",
      tagline: "Kite the best winds in Europe",
      email: "info@flagbeachkite.com",
      phone: "+34 928 456 789",
      whatsapp: "+34 628 456 789",
      address: "Flag Beach",
      town: "Corralejo",
      postcode: "35660",
      status: "active",
      plan: "pro",
      featured: true,
      verified: true,
    },
  })

  console.log("Seed complete!")
  console.log("Admin: admin@fuerteventura-directory.com / admin123")
  console.log("Demo: demo@example.com / demo123")
}

main().catch(console.error).finally(() => prisma.$disconnect())
