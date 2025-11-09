import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import { storage } from "./storage";
import { hashPassword, comparePassword, generateToken, setAuthCookie, clearAuthCookie, authenticateToken, requireAdmin, type AuthRequest } from "./auth";
import { insertUserSchema, insertProductSchema, insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
import { z } from "zod";
import { MercadoPagoConfig, Payment, MerchantOrder } from "mercadopago";
import { uploadProductImage, uploadArtwork } from "./upload";
import express from "express";

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
      const { 
        items, 
        deliveryType,
        shippingAddress, 
        paymentMethod, 
        subtotal: clientSubtotal, 
        artCreationFee: clientArtFee,
        shipping: clientShipping, 
        total: clientTotal,
        shippingCarrier,
        shippingService,
        shippingDeliveryDays
      } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Carrinho vazio" });
      }

      let calculatedSubtotal = 0;
      let calculatedArtFee = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(404).json({ message: `Produto ${item.productId} não encontrado` });
        }

        const width = parseFloat(item.width);
        const height = parseFloat(item.height);
        
        if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
          return res.status(400).json({ message: "Dimensões inválidas" });
        }
        
        const area = width * height;
        const pricePerM2 = parseFloat(product.pricePerM2);
        
        if (isNaN(pricePerM2)) {
          return res.status(500).json({ message: "Erro no preço do produto" });
        }
        
        const itemTotal = area * pricePerM2;
        calculatedSubtotal += itemTotal;

        const rawArtFee = item.artCreationFee || "0";
        const artCreationFee = parseFloat(rawArtFee);
        
        if (isNaN(artCreationFee) || artCreationFee < 0) {
          return res.status(400).json({ message: "Taxa de criação de arte inválida" });
        }
        calculatedArtFee += artCreationFee;

        orderItemsData.push({
          productId: product.id,
          productName: product.name,
          width: item.width.toString(),
          height: item.height.toString(),
          area: area.toString(),
          pricePerM2: product.pricePerM2,
          total: itemTotal.toString(),
          artOption: item.artOption || "upload",
          artFile: item.artFile || null,
          artCreationFee: artCreationFee.toString(),
        });
      }

      // Validar valores enviados pelo cliente
      const clientSubtotalNum = parseFloat(clientSubtotal);
      const clientArtFeeNum = parseFloat(clientArtFee || "0");
      const clientShippingNum = parseFloat(clientShipping);
      const clientTotalNum = parseFloat(clientTotal);

      if (!isFinite(clientSubtotalNum) || !isFinite(clientArtFeeNum) || 
          !isFinite(clientShippingNum) || !isFinite(clientTotalNum)) {
        return res.status(400).json({ message: "Valores inválidos enviados" });
      }

      // Validar frete baseado no tipo de entrega
      if (deliveryType === 'pickup') {
        // Retirada no local: frete deve ser R$ 0,00
        if (clientShippingNum !== 0) {
          return res.status(400).json({ 
            message: "Frete deve ser R$ 0,00 para retirada no local" 
          });
        }
      } else {
        // Entrega: frete entre R$ 10 e R$ 200
        if (clientShippingNum < 10 || clientShippingNum > 200) {
          return res.status(400).json({ 
            message: "Valor de frete inválido. Deve estar entre R$ 10,00 e R$ 200,00" 
          });
        }
      }

      // Usar o shipping selecionado pelo cliente
      const calculatedTotal = calculatedSubtotal + calculatedArtFee + clientShippingNum;

      console.log("Order validation:", {
        calculatedSubtotal,
        clientSubtotalNum,
        calculatedArtFee,
        clientArtFeeNum,
        clientShipping: clientShippingNum,
        calculatedTotal,
        clientTotalNum
      });

      // Validar subtotal, taxa de arte e total
      if (Math.abs(calculatedSubtotal - clientSubtotalNum) > 0.01 ||
          Math.abs(calculatedArtFee - clientArtFeeNum) > 0.01 ||
          Math.abs(calculatedTotal - clientTotalNum) > 0.01) {
        console.error("Order validation failed", {
          subtotalDiff: Math.abs(calculatedSubtotal - clientSubtotalNum),
          artFeeDiff: Math.abs(calculatedArtFee - clientArtFeeNum),
          totalDiff: Math.abs(calculatedTotal - clientTotalNum)
        });
        return res.status(400).json({ message: "Valores calculados não conferem. Por favor, recarregue o carrinho." });
      }

      const order = await storage.createOrder({
        userId: req.user!.id,
        status: "pending",
        deliveryType: deliveryType || "delivery",
        subtotal: calculatedSubtotal.toString(),
        shipping: clientShippingNum.toString(),
        total: calculatedTotal.toString(),
        shippingAddress: deliveryType === 'pickup' ? 'Retirada no Local' : shippingAddress,
        paymentMethod,
        shippingCarrier: deliveryType === 'pickup' ? 'Retirada' : shippingCarrier,
        shippingService: deliveryType === 'pickup' ? 'Presencial' : shippingService,
        shippingDeliveryDays: deliveryType === 'pickup' ? 0 : shippingDeliveryDays,
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

  // User Management Routes (Admin only)
  app.get("/api/users", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const usersWithoutPasswords = allUsers.map(({ password: _, ...user }) => user);
      res.json({ users: usersWithoutPasswords });
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar usuários" });
    }
  });

  app.patch("/api/users/:id/role", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { role } = req.body;
      if (!role || !['admin', 'customer'].includes(role)) {
        return res.status(400).json({ message: "Role inválido. Use 'admin' ou 'customer'" });
      }

      const user = await storage.updateUserRole(req.params.id, role);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar role do usuário" });
    }
  });

  // Update user profile
  app.patch("/api/users/profile", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Não autorizado" });
      }

      const { fullName, cpf, phone, street, number, complement, neighborhood, city, state, zipCode } = req.body;

      const user = await storage.updateUserProfile(userId, {
        fullName,
        cpf,
        phone,
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        zipCode,
      });

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar perfil" });
    }
  });

  // Dashboard Stats (Admin only)
  app.get("/api/admin/dashboard", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar estatísticas" });
    }
  });

  // Mercado Pago - Checkout Transparente
  const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!mpAccessToken) {
    console.warn("⚠️  MERCADOPAGO_ACCESS_TOKEN não configurado. Pagamentos não funcionarão.");
  }

  const mpClient = new MercadoPagoConfig({
    accessToken: mpAccessToken || "",
    options: {
      timeout: 5000,
    },
  });

  const payment = new Payment(mpClient);

  // Processar pagamento com cartão de crédito
  app.post("/api/payments/process", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const {
        token,
        orderId,
        transaction_amount,
        installments,
        payment_method_id,
        payer,
        description,
      } = req.body;

      if (!token || !orderId || !transaction_amount || !payment_method_id || !payer) {
        return res.status(400).json({ message: "Dados de pagamento incompletos" });
      }

      // Verificar se a order pertence ao usuário
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }

      if (order.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      // Processar pagamento no Mercado Pago
      const paymentData: any = {
        token,
        transaction_amount: Number(transaction_amount),
        description: description || `Pedido #${orderId}`,
        installments: Number(installments),
        payment_method_id,
        payer: {
          email: payer.email,
          identification: {
            type: payer.identification.type,
            number: payer.identification.number,
          },
        },
        external_reference: orderId,
      };

      // Adicionar notification_url apenas em produção com domínio válido
      const replitDomain = process.env.REPLIT_DOMAINS?.split(',')[0];
      if (replitDomain && replitDomain.includes('replit.app')) {
        paymentData.notification_url = `${replitDomain}/api/payments/webhook`;
      }

      const response = await payment.create({ body: paymentData });

      // Atualizar status do pedido baseado na resposta
      if (response.status === "approved") {
        await storage.updateOrderStatus(orderId, "paid");
      } else if (response.status === "rejected") {
        await storage.updateOrderStatus(orderId, "cancelled");
      }

      res.json({
        payment: response,
        order: await storage.getOrder(orderId),
      });
    } catch (error: any) {
      console.error("Erro ao processar pagamento:", error);
      res.status(500).json({
        message: "Erro ao processar pagamento",
        error: error.message || "Erro desconhecido",
      });
    }
  });

  // Criar pagamento PIX
  app.post("/api/payments/pix", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { orderId, payer } = req.body;

      if (!orderId || !payer) {
        return res.status(400).json({ message: "Dados de pagamento incompletos" });
      }

      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }

      if (order.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      // Construir dados do pagamento
      const paymentData: any = {
        transaction_amount: Number(order.total),
        description: `Pedido #${orderId} - PrintBrasil`,
        payment_method_id: "pix",
        payer: {
          email: payer.email,
        },
        external_reference: orderId,
      };

      // Adicionar identificação se fornecida
      if (payer.identification?.type && payer.identification?.number) {
        paymentData.payer.identification = {
          type: payer.identification.type,
          number: payer.identification.number,
        };
      }

      // Adicionar notification_url apenas em produção com domínio válido
      const replitDomain = process.env.REPLIT_DOMAINS?.split(',')[0];
      if (replitDomain && replitDomain.includes('replit.app')) {
        paymentData.notification_url = `${replitDomain}/api/payments/webhook`;
      }

      const response = await payment.create({ body: paymentData });

      res.json({
        payment: response,
        qr_code: response.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: response.point_of_interaction?.transaction_data?.qr_code_base64,
        ticket_url: response.point_of_interaction?.transaction_data?.ticket_url,
      });
    } catch (error: any) {
      console.error("Erro ao criar pagamento PIX:", error);
      res.status(500).json({
        message: "Erro ao criar pagamento PIX",
        error: error.message || "Erro desconhecido",
      });
    }
  });

  // Criar pagamento Boleto
  app.post("/api/payments/boleto", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { orderId, payer } = req.body;

      if (!orderId || !payer) {
        return res.status(400).json({ message: "Dados de pagamento incompletos" });
      }

      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }

      if (order.userId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      // Construir dados do pagamento
      const paymentData: any = {
        transaction_amount: Number(order.total),
        description: `Pedido #${orderId} - PrintBrasil`,
        payment_method_id: "bolbradesco", // Boleto Bradesco
        payer: {
          email: payer.email,
        },
        external_reference: orderId,
      };

      // Adicionar identificação se fornecida
      if (payer.identification?.type && payer.identification?.number) {
        paymentData.payer.identification = {
          type: payer.identification.type,
          number: payer.identification.number,
        };
      }

      // Adicionar notification_url apenas em produção com domínio válido
      const replitDomain = process.env.REPLIT_DOMAINS?.split(',')[0];
      if (replitDomain && replitDomain.includes('replit.app')) {
        paymentData.notification_url = `${replitDomain}/api/payments/webhook`;
      }

      const response = await payment.create({ body: paymentData });

      res.json({
        payment: response,
        ticket_url: response.transaction_details?.external_resource_url,
      });
    } catch (error: any) {
      console.error("Erro ao criar pagamento Boleto:", error);
      res.status(500).json({
        message: "Erro ao criar pagamento Boleto",
        error: error.message || "Erro desconhecido",
      });
    }
  });

  // Webhook para notificações do Mercado Pago
  app.post("/api/payments/webhook", async (req, res) => {
    try {
      const { type, data } = req.body;

      console.log("Webhook recebido:", { type, data });

      if (type === "payment") {
        const paymentId = data.id;
        const paymentInfo = await payment.get({ id: paymentId });

        const orderId = paymentInfo.external_reference;
        if (orderId) {
          // Atualizar status do pedido baseado no status do pagamento
          if (paymentInfo.status === "approved") {
            await storage.updateOrderStatus(orderId, "paid");
          } else if (paymentInfo.status === "rejected" || paymentInfo.status === "cancelled") {
            await storage.updateOrderStatus(orderId, "cancelled");
          }
        }
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Erro no webhook:", error);
      res.status(500).json({ error: "Erro ao processar webhook" });
    }
  });

  // Obter public key do Mercado Pago
  app.get("/api/payments/public-key", (req, res) => {
    const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY;
    if (!publicKey) {
      return res.status(500).json({ message: "Public key não configurada" });
    }
    res.json({ publicKey });
  });

  // Upload de imagem de produto (apenas admin)
  app.post("/api/upload/product-image", authenticateToken, requireAdmin, uploadProductImage.single("image"), (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhuma imagem enviada" });
      }

      // Retornar URL relativa do arquivo
      const imageUrl = `/uploads/products/${req.file.filename}`;
      res.json({ imageUrl, filename: req.file.filename });
    } catch (error) {
      console.error("Erro ao fazer upload de imagem:", error);
      res.status(500).json({ message: "Erro ao fazer upload da imagem" });
    }
  });

  // Upload de arquivo de arte (cliente logado)
  app.post("/api/upload/artwork", authenticateToken, uploadArtwork.single("artwork"), (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
      }

      // Retornar URL relativa do arquivo
      const artworkUrl = `/uploads/artwork/${req.file.filename}`;
      res.json({ 
        artworkUrl, 
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
    } catch (error) {
      console.error("Erro ao fazer upload de arquivo de arte:", error);
      res.status(500).json({ message: "Erro ao fazer upload do arquivo" });
    }
  });

  // Servir arquivos estáticos de upload
  app.use('/uploads', express.static('uploads'));

  // Calcular frete com Melhor Envio
  app.post("/api/shipping/calculate", async (req, res) => {
    try {
      const { destinationCEP, packageDetails } = req.body;
      const token = process.env.MELHOR_ENVIO_TOKEN;

      if (!token) {
        return res.status(500).json({ message: "Token do Melhor Envio não configurado" });
      }

      if (!destinationCEP) {
        return res.status(400).json({ message: "CEP de destino é obrigatório" });
      }

      // CEP de origem (PrintBrasil - ajuste para seu CEP)
      const originCEP = "01310100"; // Av Paulista, São Paulo - SP

      // Dados padrão do pacote se não fornecido
      // Dimensões para produto enrolado em tubo (banner/adesivo)
      const pkg = packageDetails || {
        height: 10,   // cm - diâmetro do tubo
        width: 10,    // cm - diâmetro do tubo
        length: 60,   // cm - comprimento do tubo
        weight: 0.5   // kg - peso médio
      };

      console.log("Calculando frete Melhor Envio:", { from: originCEP, to: destinationCEP, package: pkg });

      // Usar sandbox ou produção conforme o ambiente
      const apiUrl = process.env.MELHOR_ENVIO_ENV === 'production' 
        ? "https://www.melhorenvio.com.br/api/v2/me/shipment/calculate"
        : "https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate";

      console.log("Melhor Envio URL:", apiUrl);

      const requestBody = {
        from: {
          postal_code: originCEP.replace(/\D/g, "")
        },
        to: {
          postal_code: destinationCEP.replace(/\D/g, "")
        },
        package: {
          height: Number(pkg.height),
          width: Number(pkg.width),
          length: Number(pkg.length),
          weight: Number(pkg.weight)
        },
        options: {
          insurance_value: 100,
          receipt: false,
          own_hand: false
        }
      };

      console.log("Melhor Envio request body:", JSON.stringify(requestBody, null, 2));

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
          "User-Agent": "PrintBrasil (integracao@printbrasil.com)"
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Erro Melhor Envio:", JSON.stringify(error, null, 2));
        
        // Fallback inteligente: calcular preço baseado na distância estimada
        console.log("Usando opções de frete fallback com preços estimados");
        
        // Estimar distância baseada nos 2 primeiros dígitos do CEP
        const destPrefix = parseInt(destinationCEP.substring(0, 2));
        const originPrefix = 1; // São Paulo (01xxx-xxx)
        
        // Calcular diferença de região (quanto maior, mais longe)
        const regionDistance = Math.abs(destPrefix - originPrefix);
        
        // Calcular peso volumétrico
        const volumetricWeight = (pkg.height * pkg.width * pkg.length) / 6000;
        const chargeableWeight = Math.max(pkg.weight, volumetricWeight);
        
        // Preço base por kg
        const basePacPrice = 15.00;
        const baseSedexPrice = 25.00;
        
        // Adicional por distância (R$ 2 por diferença de região)
        const distanceFee = regionDistance * 2;
        
        // Adicional por peso
        const weightFeePac = chargeableWeight * 8;
        const weightFeeSedex = chargeableWeight * 12;
        
        const pacPrice = basePacPrice + distanceFee + weightFeePac;
        const sedexPrice = baseSedexPrice + distanceFee + weightFeeSedex;
        
        // Prazo baseado na distância
        const pacDays = Math.min(15, 5 + Math.floor(regionDistance / 3));
        const sedexDays = Math.min(7, 2 + Math.floor(regionDistance / 5));
        
        return res.json({
          options: [
            {
              id: 1,
              name: "Correios",
              service: "PAC",
              delivery_time: pacDays,
              price: Math.round(pacPrice * 100) / 100,
              discount: 0,
              final_price: Math.round(pacPrice * 100) / 100
            },
            {
              id: 2,
              name: "Correios",
              service: "SEDEX",
              delivery_time: sedexDays,
              price: Math.round(sedexPrice * 100) / 100,
              discount: 0,
              final_price: Math.round(sedexPrice * 100) / 100
            }
          ],
          originCEP,
          fallback: true,
          fallbackReason: error.message || "Melhor Envio indisponível"
        });
      }

      const data = await response.json();
      console.log("Melhor Envio resposta:", JSON.stringify(data, null, 2));
      
      // Se não retornou nenhuma opção, usar fallback inteligente
      if (!data || data.length === 0) {
        console.log("Melhor Envio não retornou opções, usando fallback com preços estimados");
        
        // Estimar distância baseada nos 2 primeiros dígitos do CEP
        const destPrefix = parseInt(destinationCEP.substring(0, 2));
        const originPrefix = 1; // São Paulo (01xxx-xxx)
        
        // Calcular diferença de região
        const regionDistance = Math.abs(destPrefix - originPrefix);
        
        // Calcular peso volumétrico
        const volumetricWeight = (pkg.height * pkg.width * pkg.length) / 6000;
        const chargeableWeight = Math.max(pkg.weight, volumetricWeight);
        
        // Preço base
        const basePacPrice = 15.00;
        const baseSedexPrice = 25.00;
        
        // Adicionais
        const distanceFee = regionDistance * 2;
        const weightFeePac = chargeableWeight * 8;
        const weightFeeSedex = chargeableWeight * 12;
        
        const pacPrice = basePacPrice + distanceFee + weightFeePac;
        const sedexPrice = baseSedexPrice + distanceFee + weightFeeSedex;
        
        // Prazo baseado na distância
        const pacDays = Math.min(15, 5 + Math.floor(regionDistance / 3));
        const sedexDays = Math.min(7, 2 + Math.floor(regionDistance / 5));
        
        return res.json({
          options: [
            {
              id: 1,
              name: "Correios",
              service: "PAC",
              delivery_time: pacDays,
              price: Math.round(pacPrice * 100) / 100,
              discount: 0,
              final_price: Math.round(pacPrice * 100) / 100
            },
            {
              id: 2,
              name: "Correios",
              service: "SEDEX",
              delivery_time: sedexDays,
              price: Math.round(sedexPrice * 100) / 100,
              discount: 0,
              final_price: Math.round(sedexPrice * 100) / 100
            }
          ],
          originCEP,
          fallback: true,
          fallbackReason: "Nenhuma transportadora disponível"
        });
      }
      
      // Transformar resposta do Melhor Envio para o formato esperado
      const options = data.map((item: any, index: number) => ({
        id: item.id || index + 1,
        name: item.company?.name || "Transportadora",
        service: item.name || "Serviço",
        delivery_time: item.custom_delivery_time || item.delivery_time || 0,
        price: item.custom_price || item.price || 0,
        discount: item.discount || 0,
        final_price: item.custom_price || item.price || 0
      }));

      res.json({
        options,
        originCEP
      });

    } catch (error) {
      console.error("Erro ao calcular frete:", error);
      res.status(500).json({ message: "Erro ao calcular frete" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
