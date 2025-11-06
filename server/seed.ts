import { db } from "./db";
import { users, products } from "@shared/schema";
import { hashPassword } from "./auth";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await hashPassword("admin123");
  const [admin] = await db.insert(users).values({
    email: "admin@printbrasil.com",
    password: adminPassword,
    name: "Administrador",
    role: "admin",
  }).returning().onConflictDoNothing();

  if (admin) {
    console.log("✅ Admin user created: admin@printbrasil.com / admin123");
  }

  // Create test customer user
  const customerPassword = await hashPassword("cliente123");
  const [customer] = await db.insert(users).values({
    email: "cliente@printbrasil.com",
    password: customerPassword,
    name: "Cliente Teste",
    role: "customer",
  }).returning().onConflictDoNothing();

  if (customer) {
    console.log("✅ Customer user created: cliente@printbrasil.com / cliente123");
  }

  // Create sample products
  const sampleProducts = [
    {
      name: "Banner Vinílico Premium",
      description: "Banner de alta qualidade, ideal para ambientes internos e externos com impressão em alta resolução",
      pricePerM2: "45.90",
      imageUrl: "/assets/generated_images/Vinyl_banner_product_photo_7f6d1908.png",
      active: true,
    },
    {
      name: "Adesivo Vinílico",
      description: "Adesivo de vinil autocolante, perfeito para aplicação em vidros, paredes e veículos",
      pricePerM2: "35.00",
      imageUrl: "/assets/generated_images/Adhesive_vinyl_sticker_product_9ad4721d.png",
      active: true,
    },
    {
      name: "Lona para Outdoor",
      description: "Lona resistente para uso externo, ideal para fachadas e outdoors com proteção UV",
      pricePerM2: "52.90",
      imageUrl: "/assets/generated_images/Outdoor_lona_banner_material_f46086fc.png",
      active: true,
    },
    {
      name: "Banner Lona 440g",
      description: "Lona premium alta gramatura, extra resistente para uso prolongado em ambientes externos",
      pricePerM2: "58.90",
      imageUrl: "/assets/generated_images/Vinyl_banner_product_photo_7f6d1908.png",
      active: true,
    },
    {
      name: "Adesivo Perfurado",
      description: "Adesivo perfurado para vidros, permite visibilidade de dentro para fora",
      pricePerM2: "42.00",
      imageUrl: "/assets/generated_images/Adhesive_vinyl_sticker_product_9ad4721d.png",
      active: true,
    },
    {
      name: "Banner Blackout",
      description: "Banner com bloqueio total de luz, ideal para backlight e iluminação interna",
      pricePerM2: "48.90",
      imageUrl: "/assets/generated_images/Outdoor_lona_banner_material_f46086fc.png",
      active: true,
    },
  ];

  const insertedProducts = await db.insert(products).values(sampleProducts).returning().onConflictDoNothing();
  console.log(`✅ ${insertedProducts.length} products created`);

  console.log("✨ Database seeded successfully!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
