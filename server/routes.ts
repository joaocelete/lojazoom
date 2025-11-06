import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import { storage } from "./storage";
import { hashPassword, comparePassword, generateToken, setAuthCookie, clearAuthCookie, authenticateToken, requireAdmin, type AuthRequest } from "./auth";
import { insertUserSchema, insertProductSchema, insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(cookieParser());

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email já cadastrado" });
      }

      const hashedPassword = await hashPassword(data.password);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      const token = generateToken(user.id);
      setAuthCookie(res, token);

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar usuário" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email e senha são obrigatórios" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Email ou senha inválidos" });
      }

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Email ou senha inválidos" });
      }

      const token = generateToken(user.id);
      setAuthCookie(res, token);

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Erro ao fazer login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    clearAuthCookie(res);
    res.json({ message: "Logout realizado com sucesso" });
  });

  app.get("/api/auth/me", authenticateToken, (req: AuthRequest, res) => {
    const { password: _, ...userWithoutPassword } = req.user!;
    res.json({ user: userWithoutPassword });
  });

  // Product Routes
  app.get("/api/products", async (req, res) => {
    try {
      const activeOnly = req.query.active === "true";
      const products = await storage.getAllProducts(activeOnly);
      res.json({ products });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar produtos" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      res.json({ product });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar produto" });
    }
  });

  app.post("/api/products", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.status(201).json({ product });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar produto" });
    }
  });

  app.put("/api/products/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const data = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, data);
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      res.json({ product });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar produto" });
    }
  });

  app.delete("/api/products/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      res.json({ message: "Produto deletado com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar produto" });
    }
  });

  // Order Routes
  app.post("/api/orders", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { items, shippingAddress, paymentMethod, subtotal: clientSubtotal, shipping: clientShipping, total: clientTotal } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Carrinho vazio" });
      }

      let calculatedSubtotal = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(404).json({ message: `Produto ${item.productId} não encontrado` });
        }

        const area = parseFloat(item.width) * parseFloat(item.height);
        const itemTotal = area * parseFloat(product.pricePerM2);
        calculatedSubtotal += itemTotal;

        orderItemsData.push({
          productId: product.id,
          productName: product.name,
          width: item.width.toString(),
          height: item.height.toString(),
          area: area.toString(),
          pricePerM2: product.pricePerM2,
          total: itemTotal.toString(),
        });
      }

      const calculatedShipping = 45.00;
      const calculatedTotal = calculatedSubtotal + calculatedShipping;

      if (Math.abs(calculatedSubtotal - parseFloat(clientSubtotal)) > 0.01 ||
          Math.abs(calculatedShipping - parseFloat(clientShipping)) > 0.01 ||
          Math.abs(calculatedTotal - parseFloat(clientTotal)) > 0.01) {
        return res.status(400).json({ message: "Valores calculados não conferem. Por favor, recarregue o carrinho." });
      }

      const order = await storage.createOrder({
        userId: req.user!.id,
        status: "pending",
        subtotal: calculatedSubtotal.toString(),
        shipping: calculatedShipping.toString(),
        total: calculatedTotal.toString(),
        shippingAddress,
        paymentMethod,
      });

      for (const itemData of orderItemsData) {
        await storage.createOrderItem({
          orderId: order.id,
          ...itemData,
        });
      }

      const items_created = await storage.getOrderItems(order.id);

      res.status(201).json({ order, items: items_created });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Erro ao criar pedido" });
    }
  });

  app.get("/api/orders", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const orders = req.user!.role === "admin" 
        ? await storage.getAllOrders()
        : await storage.getUserOrders(req.user!.id);
      res.json({ orders });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar pedidos" });
    }
  });

  app.get("/api/orders/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }

      if (order.userId !== req.user!.id && req.user!.role !== "admin") {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const items = await storage.getOrderItems(order.id);
      res.json({ order, items });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar pedido" });
    }
  });

  app.patch("/api/orders/:id/status", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status é obrigatório" });
      }

      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }

      res.json({ order });
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar status do pedido" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
