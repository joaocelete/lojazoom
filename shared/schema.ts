import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  fullName: text("full_name"),
  cpf: text("cpf"),
  phone: text("phone"),
  street: text("street"),
  number: text("number"),
  complement: text("complement"),
  neighborhood: text("neighborhood"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  role: text("role").notNull().default("client"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("banner"),
  pricingType: text("pricing_type").notNull().default("per_m2"),
  pricePerM2: decimal("price_per_m2", { precision: 10, scale: 2 }),
  fixedPrice: decimal("fixed_price", { precision: 10, scale: 2 }),
  maxWidth: decimal("max_width", { precision: 10, scale: 2 }),
  maxHeight: decimal("max_height", { precision: 10, scale: 2 }),
  imageUrl: text("image_url"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(products)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    pricingType: z.enum(["per_m2", "fixed"]),
    pricePerM2: z.string().optional(),
    fixedPrice: z.string().optional(),
    maxWidth: z.string().optional(),
    maxHeight: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.pricingType === "per_m2") {
        const price = parseFloat(data.pricePerM2 || "0");
        return !isNaN(price) && price > 0;
      }
      return true;
    },
    {
      message: "pricePerM2 é obrigatório e deve ser maior que zero para produtos por m²",
      path: ["pricePerM2"],
    }
  )
  .refine(
    (data) => {
      if (data.pricingType === "fixed") {
        const price = parseFloat(data.fixedPrice || "0");
        return !isNaN(price) && price > 0;
      }
      return true;
    },
    {
      message: "fixedPrice é obrigatório e deve ser maior que zero para produtos com preço fixo",
      path: ["fixedPrice"],
    }
  )
  .refine(
    (data) => {
      if (data.maxWidth) {
        const width = parseFloat(data.maxWidth);
        return !isNaN(width) && width > 0;
      }
      return true;
    },
    {
      message: "maxWidth deve ser um número positivo",
      path: ["maxWidth"],
    }
  )
  .refine(
    (data) => {
      if (data.maxHeight) {
        const height = parseFloat(data.maxHeight);
        return !isNaN(height) && height > 0;
      }
      return true;
    },
    {
      message: "maxHeight deve ser um número positivo",
      path: ["maxHeight"],
    }
  );

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: text("status").notNull().default("pending"),
  deliveryType: text("delivery_type").notNull().default("delivery"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  shipping: decimal("shipping", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: text("shipping_address"),
  paymentMethod: text("payment_method"),
  shippingCarrier: text("shipping_carrier"),
  shippingService: text("shipping_service"),
  shippingDeliveryDays: integer("shipping_delivery_days"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  productName: text("product_name").notNull(),
  pricingType: text("pricing_type").notNull().default("per_m2"),
  width: decimal("width", { precision: 10, scale: 2 }),
  height: decimal("height", { precision: 10, scale: 2 }),
  area: decimal("area", { precision: 10, scale: 2 }),
  pricePerM2: decimal("price_per_m2", { precision: 10, scale: 2 }),
  quantity: integer("quantity"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  artOption: text("art_option").notNull().default("upload"),
  artFile: text("art_file"),
  artCreationFee: decimal("art_creation_fee", { precision: 10, scale: 2 }).notNull().default("0"),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  updatedAt: true,
});

export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;
