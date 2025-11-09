# 🗺️ GUIA COMPLETO DO SISTEMA - PrintBrasil E-commerce

## 📚 Índice
1. [Visão Geral](#visão-geral)
2. [Tecnologias Utilizadas](#tecnologias-utilizadas)
3. [Arquitetura do Sistema](#arquitetura-do-sistema)
4. [Estrutura de Pastas](#estrutura-de-pastas)
5. [Fluxo de Dados](#fluxo-de-dados)
6. [Guia de Arquivos](#guia-de-arquivos)
7. [Como Funciona Cada Feature](#como-funciona-cada-feature)
8. [Integrações Externas](#integrações-externas)
9. [Como Editar/Adicionar Funcionalidades](#como-editar-adicionar-funcionalidades)

---

## 🎯 Visão Geral

**PrintBrasil** é um e-commerce completo para produtos de comunicação visual (banners, adesivos, lonas). O sistema permite:
- 🛍️ Catálogo de produtos com cálculo de preço por m²
- 🛒 Carrinho de compras persistente
- 👤 Autenticação de usuários (clientes e administradores)
- 💳 Pagamentos via Mercado Pago (PIX, Cartão, Boleto)
- 📦 Cálculo de frete via Melhor Envio
- 🎨 Upload de arte ou solicitação de criação
- 📊 Painel administrativo completo
- 📱 Interface responsiva moderna

---

## 🛠️ Tecnologias Utilizadas

### **Frontend (Cliente)**
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **React** | 18 | Biblioteca para construir interfaces |
| **TypeScript** | Latest | Tipagem estática para JavaScript |
| **Vite** | Latest | Build tool e dev server ultra-rápido |
| **Wouter** | Latest | Roteamento client-side (alternativa leve ao React Router) |
| **TanStack Query** | v5 | Gerenciamento de estado do servidor + cache |
| **Tailwind CSS** | Latest | Framework CSS utility-first |
| **Shadcn/ui** | Latest | Componentes UI acessíveis e customizáveis |
| **Lucide React** | Latest | Ícones modernos |
| **React Hook Form** | Latest | Gerenciamento de formulários |
| **Zod** | Latest | Validação de schemas |
| **Mercado Pago SDK** | Latest | SDK oficial para Payment Brick |

### **Backend (Servidor)**
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Node.js** | 20+ | Runtime JavaScript no servidor |
| **Express** | Latest | Framework web minimalista |
| **TypeScript** | Latest | Tipagem estática |
| **PostgreSQL** | Latest | Banco de dados relacional (via Neon) |
| **Drizzle ORM** | Latest | ORM TypeScript-first leve e performático |
| **JWT** | Latest | Autenticação via tokens |
| **bcrypt** | Latest | Hash de senhas |
| **Zod** | Latest | Validação de dados |

### **Infraestrutura & Deploy**
- **Replit**: Hospedagem e desenvolvimento
- **Neon**: PostgreSQL serverless
- **Mercado Pago**: Gateway de pagamento
- **Melhor Envio**: API de cálculo de frete

---

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│  (React + TypeScript + Vite + TanStack Query)              │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Pages   │  │Components│  │ Contexts │  │  Hooks   │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │             │             │             │         │
│       └─────────────┴─────────────┴─────────────┘         │
│                         │                                  │
│                    TanStack Query                          │
│                         │                                  │
└─────────────────────────┼──────────────────────────────────┘
                          │ HTTP/REST
                          │
┌─────────────────────────┼──────────────────────────────────┐
│                         │                                  │
│                    Express Router                          │
│                         │                                  │
│  ┌──────────────────────┴───────────────────────┐         │
│  │              BACKEND (API REST)              │         │
│  │    (Node.js + Express + TypeScript)          │         │
│  │                                               │         │
│  │  ┌─────────┐  ┌─────────┐  ┌──────────┐    │         │
│  │  │ Routes  │→ │ Storage │→ │ Database │    │         │
│  │  │(routes.ts)│ │(storage.ts)│(Drizzle) │    │         │
│  │  └─────────┘  └─────────┘  └──────────┘    │         │
│  │                                               │         │
│  │  ┌──────────────────────────────────┐       │         │
│  │  │    Integrações Externas          │       │         │
│  │  │  • Mercado Pago (Pagamentos)     │       │         │
│  │  │  • Melhor Envio (Frete)          │       │         │
│  │  └──────────────────────────────────┘       │         │
│  └───────────────────────────────────────────────┘         │
│                         │                                  │
└─────────────────────────┼──────────────────────────────────┘
                          │
                    PostgreSQL DB
                   (Neon Serverless)
              ┌──────────────────────┐
              │ • users              │
              │ • products           │
              │ • orders             │
              │ • order_items        │
              └──────────────────────┘
```

---

## 📁 Estrutura de Pastas

```
printbrasil/
│
├── 📂 client/                    # Frontend React
│   ├── 📂 public/               # Arquivos estáticos (favicon, etc)
│   └── 📂 src/
│       ├── 📂 assets/           # Imagens, fontes (se houver)
│       ├── 📂 components/       # Componentes React reutilizáveis
│       │   ├── 📂 ui/          # Componentes Shadcn/ui (Button, Card, etc)
│       │   └── *.tsx           # Componentes customizados
│       ├── 📂 contexts/         # Context API (CartContext)
│       ├── 📂 hooks/            # Custom hooks (use-toast, etc)
│       ├── 📂 lib/              # Utilitários (queryClient, utils)
│       ├── 📂 pages/            # Páginas da aplicação
│       │   ├── Home.tsx        # Página inicial (catálogo)
│       │   ├── ProductDetail.tsx  # Detalhes do produto
│       │   ├── Checkout.tsx    # Finalização de compra
│       │   ├── Admin.tsx       # Painel admin
│       │   └── ...
│       ├── App.tsx              # Componente raiz + rotas
│       ├── main.tsx             # Entry point do React
│       └── index.css            # Estilos globais + Tailwind
│
├── 📂 server/                    # Backend Express
│   ├── index.ts                 # Entry point do servidor
│   ├── routes.ts                # TODAS as rotas da API
│   ├── storage.ts               # Interface de acesso ao banco
│   ├── db.ts                    # Configuração Drizzle ORM
│   └── vite.ts                  # Integração Vite (não mexer)
│
├── 📂 shared/                    # Código compartilhado
│   └── schema.ts                # Schemas Drizzle + Zod (tipos)
│
├── 📂 db/                        # Migrações do banco (auto-geradas)
│
├── package.json                 # Dependências do projeto
├── tsconfig.json                # Configuração TypeScript
├── tailwind.config.ts           # Configuração Tailwind CSS
├── vite.config.ts               # Configuração Vite
├── drizzle.config.ts            # Configuração Drizzle ORM
├── replit.md                    # Documentação do projeto
└── GUIA_DO_SISTEMA.md          # Este arquivo!
```

---

## 🔄 Fluxo de Dados

### **1. Autenticação**
```
[Usuário digita email/senha] 
    → Frontend envia POST /api/auth/login
    → Backend valida com bcrypt
    → Backend gera JWT token
    → Backend envia cookie HttpOnly
    → Frontend recebe confirmação
    → TanStack Query atualiza estado do usuário
```

### **2. Adicionar ao Carrinho**
```
[Usuário clica "Adicionar ao Carrinho"]
    → Frontend calcula preço (largura × altura × preço/m²)
    → CartContext.addToCart() atualiza estado
    → localStorage salva carrinho
    → UI atualiza badge do carrinho
```

### **3. Finalizar Compra**
```
[Usuário vai para Checkout]
    → Frontend preenche endereço
    → Frontend digita CEP → API calcula frete (Melhor Envio)
    → Usuário escolhe opção de frete
    → Usuário escolhe arte (upload ou solicitar)
    → Frontend mostra Payment Brick (Mercado Pago)
    → Usuário escolhe método (PIX/Cartão/Boleto)
    → Payment Brick processa pagamento
    → Backend recebe confirmação
    → Backend cria pedido no banco
    → Frontend limpa carrinho
    → Usuário vê confirmação
```

### **4. Admin Gerenciar Produtos**
```
[Admin adiciona produto]
    → Frontend envia POST /api/products
    → Backend valida se user.role === 'admin'
    → Backend valida dados com Zod
    → Backend insere no PostgreSQL via Drizzle
    → Backend retorna produto criado
    → TanStack Query invalida cache
    → Lista de produtos atualiza automaticamente
```

---

## 📄 Guia de Arquivos

### **Frontend (client/src/)**

#### **App.tsx** - Componente Raiz
```typescript
// O que faz:
// - Define TODAS as rotas da aplicação (usando Wouter)
// - Envolve tudo com providers (TanStack Query, Toast, etc)
// - Controla navegação entre páginas

// Estrutura:
<QueryClientProvider>  // Gerencia cache e requisições
  <TooltipProvider>     // Permite tooltips
    <Toaster />         // Sistema de notificações
    <Switch>            // Roteador
      <Route path="/" component={Home} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/checkout" component={Checkout} />
      // ... outras rotas
    </Switch>
  </TooltipProvider>
</QueryClientProvider>
```

#### **pages/Home.tsx** - Catálogo de Produtos
```typescript
// O que faz:
// - Lista todos os produtos do banco
// - Usa TanStack Query para buscar dados
// - Permite filtrar por categoria
// - Exibe cards de produtos clicáveis

// Query principal:
const { data: products } = useQuery({
  queryKey: ['/api/products'],  // Cache key
  // queryFn: fetch automático configurado em queryClient
});

// Fluxo:
// 1. Componente monta → TanStack Query faz GET /api/products
// 2. Backend retorna array de produtos
// 3. React renderiza grid de ProductCard
// 4. Usuário clica → Navega para /product/:id
```

#### **pages/ProductDetail.tsx** - Detalhes do Produto
```typescript
// O que faz:
// - Mostra detalhes de um produto específico
// - Permite configurar largura e altura
// - Calcula preço em tempo real (largura × altura × preço/m²)
// - Botão "Adicionar ao Carrinho"

// Como funciona:
// 1. Pega ID da URL: const { id } = useParams()
// 2. Busca produto: useQuery({ queryKey: ['/api/products', id] })
// 3. Usuário ajusta dimensões → useState atualiza
// 4. Cálculo automático: área = width * height, preço = área * pricePerM2
// 5. Adicionar ao carrinho → CartContext.addToCart()
```

#### **pages/Checkout.tsx** - Finalização de Compra
```typescript
// O que faz:
// - Mostra resumo do carrinho
// - Formulário de endereço de entrega
// - Calcula frete automaticamente ao digitar CEP
// - Opção de upload de arte ou solicitar criação (+R$ 35)
// - Payment Brick do Mercado Pago para pagamento
// - Finaliza pedido e limpa carrinho

// Fluxo completo:
// 1. Verifica autenticação (se não, redireciona para login)
// 2. Mostra itens do carrinho (CartContext)
// 3. Usuário preenche endereço
// 4. CEP com 8 dígitos → POST /api/shipping/calculate
// 5. Mostra opções de frete (PAC/SEDEX)
// 6. Usuário escolhe arte (upload ou solicitar)
// 7. Payment Brick renderiza formulário
// 8. Usuário paga → onSubmit → POST /api/payments/process
// 9. Backend cria pedido → retorna success
// 10. Frontend limpa carrinho → navega para confirmação
```

#### **contexts/CartContext.tsx** - Gerenciamento do Carrinho
```typescript
// O que faz:
// - Gerencia estado global do carrinho
// - Persiste no localStorage
// - Fornece funções: addToCart, removeFromCart, clearCart

// Como usar em qualquer componente:
const { cart, addToCart, removeFromCart } = useCart();

// Estrutura do item no carrinho:
{
  productId: string,
  name: string,
  width: number,      // largura em metros
  height: number,     // altura em metros
  pricePerM2: number,
  quantity: number,
  imageUrl?: string,
  needsArt: boolean   // solicita criação de arte?
}

// Cálculos:
// - área = width × height
// - subtotal = área × pricePerM2 × quantity
// - total = soma de todos os subtotais
```

#### **lib/queryClient.ts** - Configuração TanStack Query
```typescript
// O que faz:
// - Configura TanStack Query com defaults
// - Define fetcher padrão para requisições
// - Configura retry, cache, stale time

// Função apiRequest:
// - Facilita POST/PATCH/DELETE
// - Adiciona headers automaticamente
// - Lança erros para tratamento

// Uso:
await apiRequest('/api/products', {
  method: 'POST',
  body: JSON.stringify(newProduct)
});
```

#### **components/ui/** - Componentes Shadcn
```
Todos os componentes nesta pasta são da biblioteca Shadcn/ui:
- Button.tsx: Botões com variantes (default, outline, ghost, etc)
- Card.tsx: Cards com Header, Content, Footer
- Input.tsx: Campos de texto estilizados
- Select.tsx: Dropdowns
- Dialog.tsx: Modais
- Toast.tsx: Notificações
- Form.tsx: Wrapper react-hook-form
- ... e muitos outros

IMPORTANTE: Não edite esses arquivos! Use className para customizar.
```

---

### **Backend (server/)**

#### **index.ts** - Entry Point
```typescript
// O que faz:
// - Importa e executa registerRoutes() de routes.ts
// - Configura servidor HTTP
// - Inicia servidor na porta 5000

// Fluxo:
// 1. Cria servidor Express
// 2. Registra todas as rotas
// 3. Inicia escuta na porta 5000
// 4. Vite middleware serve o frontend
```

#### **routes.ts** - TODAS as Rotas da API
```typescript
// ============================================
// ESTRUTURA COMPLETA DAS ROTAS
// ============================================

// 🔐 AUTENTICAÇÃO
POST   /api/auth/register     // Criar nova conta
POST   /api/auth/login        // Fazer login (retorna JWT)
POST   /api/auth/logout       // Fazer logout
GET    /api/auth/me           // Dados do usuário logado

// 🛍️ PRODUTOS
GET    /api/products          // Listar todos os produtos
GET    /api/products/:id      // Buscar produto por ID
POST   /api/products          // Criar produto (ADMIN)
PATCH  /api/products/:id      // Editar produto (ADMIN)
DELETE /api/products/:id      // Deletar produto (ADMIN)

// 📦 PEDIDOS
GET    /api/orders            // Listar pedidos (user: só seus / admin: todos)
GET    /api/orders/:id        // Buscar pedido por ID
POST   /api/orders            // Criar novo pedido
PATCH  /api/orders/:id/status // Atualizar status (ADMIN)

// 👥 USUÁRIOS (ADMIN)
GET    /api/users             // Listar todos os usuários
PATCH  /api/users/:id/role    // Alterar role do usuário

// 📊 DASHBOARD ADMIN
GET    /api/admin/stats       // Estatísticas (receita, pedidos, etc)

// 💳 PAGAMENTOS
POST   /api/payments/process  // Processar pagamento (Payment Brick)
POST   /api/webhooks/mercadopago  // Webhook notificações MP
GET    /api/payments/public-key   // Obter public key do MP

// 🚚 FRETE
POST   /api/shipping/calculate    // Calcular frete (Melhor Envio)

// Cada rota:
// 1. Recebe req (request) com body, params, query
// 2. Valida dados (Zod schemas)
// 3. Chama storage.metodo() para acessar banco
// 4. Retorna res.json() com resultado
// 5. Trata erros com try/catch
```

**Exemplo de Rota Comentada:**
```typescript
// POST /api/products - Criar novo produto
app.post("/api/products", async (req: Request, res: Response) => {
  try {
    // 1. Verificar se usuário está autenticado
    if (!req.user) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    // 2. Verificar se é admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Apenas admins" });
    }

    // 3. Validar dados recebidos com Zod
    const validatedData = insertProductSchema.parse(req.body);

    // 4. Inserir no banco via storage
    const newProduct = await storage.createProduct(validatedData);

    // 5. Retornar produto criado
    res.status(201).json(newProduct);

  } catch (error) {
    // Tratar erro de validação ou banco
    res.status(400).json({ message: error.message });
  }
});
```

#### **storage.ts** - Interface com Banco de Dados
```typescript
// O que faz:
// - Define interface IStorage com todos os métodos
// - Implementa DbStorage usando Drizzle ORM
// - Abstrai SQL, fornece funções TypeScript

// Principais métodos:

// USUÁRIOS
async getUserByEmail(email: string): Promise<User | null>
async createUser(data: InsertUser): Promise<User>
async updateUserRole(id: string, role: 'customer' | 'admin'): Promise<User>

// PRODUTOS
async getProducts(): Promise<Product[]>
async getProductById(id: string): Promise<Product | null>
async createProduct(data: InsertProduct): Promise<Product>
async updateProduct(id: string, data: Partial<Product>): Promise<Product>
async deleteProduct(id: string): Promise<void>

// PEDIDOS
async getOrders(userId?: string): Promise<Order[]>
async getOrderById(id: string): Promise<Order | null>
async createOrder(data: InsertOrder): Promise<Order>
async updateOrderStatus(id: string, status: string): Promise<Order>

// ESTATÍSTICAS ADMIN
async getAdminStats(): Promise<AdminStats>

// Como funciona:
// routes.ts chama → storage.getProducts()
//     ↓
// storage.ts executa → db.select().from(products)
//     ↓
// Drizzle gera → SELECT * FROM products
//     ↓
// PostgreSQL retorna dados
//     ↓
// Drizzle converte para objetos TypeScript
//     ↓
// storage.ts retorna → Product[]
```

#### **db.ts** - Configuração Drizzle
```typescript
// O que faz:
// - Cria conexão com PostgreSQL via Neon
// - Configura Drizzle ORM
// - Exporta instância `db` para usar em storage.ts

// NÃO PRECISA EDITAR ESTE ARQUIVO

import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from '../shared/schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
```

---

### **Shared (shared/)**

#### **schema.ts** - Schemas do Banco + Validação
```typescript
// ============================================
// ESTE É O ARQUIVO MAIS IMPORTANTE!
// ============================================

// O que faz:
// - Define estrutura das tabelas do banco (Drizzle)
// - Define schemas de validação (Zod)
// - Gera tipos TypeScript automáticos
// - É usado por FRONTEND e BACKEND

// Estrutura:

// 1. DEFINIÇÃO DE TABELAS (Drizzle)
export const users = pgTable('users', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  email: varchar('email').notNull().unique(),
  password: varchar('password').notNull(),
  role: varchar('role', { enum: ['customer', 'admin'] }).default('customer'),
  name: varchar('name'),
});

export const products = pgTable('products', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name').notNull(),
  description: text('description'),
  category: varchar('category').notNull(),
  pricePerM2: varchar('price_per_m2').notNull(),  // decimal como string
  imageUrl: varchar('image_url'),
});

export const orders = pgTable('orders', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id').references(() => users.id),
  status: varchar('status').default('pending'),
  subtotal: varchar('subtotal').notNull(),
  artFee: varchar('art_fee').default('0'),
  shipping: varchar('shipping').notNull(),
  total: varchar('total').notNull(),
  // ... campos de endereço, frete, pagamento
  createdAt: timestamp('created_at').defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar('order_id').references(() => orders.id),
  productId: varchar('product_id').references(() => products.id),
  quantity: integer('quantity').notNull(),
  width: varchar('width').notNull(),
  height: varchar('height').notNull(),
  pricePerM2: varchar('price_per_m2').notNull(),
  subtotal: varchar('subtotal').notNull(),
});

// 2. SCHEMAS DE INSERÇÃO (Zod)
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,  // ID é auto-gerado
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

// 3. TIPOS TYPESCRIPT (gerados automaticamente)
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// COMO USAR:
// Backend: valida com insertProductSchema.parse(req.body)
// Frontend: tipagem automática const product: Product = ...
```

---

## 🎯 Como Funciona Cada Feature

### **1. Cálculo de Preço por m²**

**Local:** `client/src/pages/ProductDetail.tsx`

```typescript
// Fluxo:
// 1. Produto tem pricePerM2 = "120.00" (R$ 120 por m²)
// 2. Usuário define width = 2 metros, height = 1.5 metros
// 3. Cálculo:
const area = width * height;  // 2 × 1.5 = 3 m²
const price = area * parseFloat(pricePerM2);  // 3 × 120 = R$ 360

// 4. Ao adicionar ao carrinho:
addToCart({
  productId,
  name,
  width,
  height,
  pricePerM2: parseFloat(pricePerM2),
  quantity: 1
});

// 5. Carrinho calcula total:
cart.reduce((sum, item) => {
  const itemArea = item.width * item.height;
  const itemPrice = itemArea * item.pricePerM2 * item.quantity;
  return sum + itemPrice;
}, 0);
```

### **2. Autenticação JWT**

**Login:**
```typescript
// Frontend: POST /api/auth/login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

// Backend: routes.ts
app.post("/api/auth/login", async (req, res) => {
  // 1. Busca usuário no banco
  const user = await storage.getUserByEmail(email);
  
  // 2. Compara senha com hash
  const valid = await bcrypt.compare(password, user.password);
  
  // 3. Gera JWT token
  const token = jwt.sign({ userId: user.id }, SECRET);
  
  // 4. Envia cookie HttpOnly
  res.cookie('auth_token', token, {
    httpOnly: true,  // JS não consegue acessar
    secure: true,
    sameSite: 'strict'
  });
  
  // 5. Retorna usuário (sem senha)
  res.json({ id: user.id, email: user.email, role: user.role });
});
```

**Proteção de Rotas:**
```typescript
// Middleware em routes.ts
app.use((req, res, next) => {
  const token = req.cookies.auth_token;
  if (token) {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;  // Adiciona user ao request
  }
  next();
});

// Em rotas protegidas:
app.get("/api/orders", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Não autenticado" });
  }
  // ... resto do código
});
```

### **3. Cálculo de Frete (Melhor Envio)**

**Local:** `server/routes.ts` - POST /api/shipping/calculate

```typescript
// Frontend envia:
POST /api/shipping/calculate
{
  "destinationCEP": "20040020"
}

// Backend processa:
app.post("/api/shipping/calculate", async (req, res) => {
  const { destinationCEP } = req.body;
  const token = process.env.MELHOR_ENVIO_TOKEN;
  
  // 1. Monta requisição para Melhor Envio
  const requestBody = {
    from: { postal_code: "01310100" },  // Origem: São Paulo
    to: { postal_code: destinationCEP },
    package: {
      height: 10,   // cm - tubo
      width: 10,
      length: 60,
      weight: 0.5   // kg
    }
  };
  
  // 2. Chama API do Melhor Envio
  const response = await fetch('https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  
  // 3. Se API falhar, usa fallback inteligente
  if (!response.ok) {
    // Calcula preço baseado em distância do CEP
    const destPrefix = parseInt(destinationCEP.substring(0, 2));
    const regionDistance = Math.abs(destPrefix - 1);  // Distância de SP
    
    const basePacPrice = 15.00;
    const distanceFee = regionDistance * 2;
    const weightFee = 0.5 * 8;
    
    const pacPrice = basePacPrice + distanceFee + weightFee;
    
    return res.json({
      options: [
        {
          id: 1,
          name: "Correios",
          service: "PAC",
          delivery_time: 10,
          final_price: pacPrice
        }
      ],
      fallback: true
    });
  }
  
  // 4. Transforma resposta do Melhor Envio
  const data = await response.json();
  const options = data.map(item => ({
    id: item.id,
    name: item.company.name,
    service: item.name,
    delivery_time: item.delivery_time,
    final_price: item.price
  }));
  
  res.json({ options });
});
```

### **4. Payment Brick (Mercado Pago)**

**Local:** `client/src/pages/Checkout.tsx`

```typescript
import { Payment } from '@mercadopago/sdk-react';

// 1. Obter public key
const { data: keyData } = useQuery({
  queryKey: ['/api/payments/public-key']
});

// 2. Inicializar SDK
<Payment
  initialization={{
    amount: totalAmount,  // Valor total em número
    payer: { email: user.email }
  }}
  customization={{
    paymentMethods: {
      creditCard: 'all',
      debitCard: 'all',
      ticket: 'all',        // Boleto
      bankTransfer: 'all'   // PIX
    }
  }}
  onSubmit={async (formData) => {
    // 3. Enviar para backend
    const response = await fetch('/api/payments/process', {
      method: 'POST',
      body: JSON.stringify({
        paymentData: formData,
        orderData: {
          items: cart,
          address: shippingAddress,
          shipping: selectedShipping,
          total: totalAmount
        }
      })
    });
    
    // 4. Limpar carrinho se sucesso
    if (response.ok) {
      clearCart();
      navigate('/order-confirmation');
    }
  }}
/>

// Backend: routes.ts
app.post("/api/payments/process", async (req, res) => {
  const { paymentData, orderData } = req.body;
  
  // 1. Criar pedido no banco
  const order = await storage.createOrder({
    userId: req.user.id,
    status: 'pending',
    ...orderData
  });
  
  // 2. Processar pagamento com Mercado Pago
  const payment = await mercadopago.payment.create({
    ...paymentData,
    external_reference: order.id  // Link com pedido
  });
  
  // 3. Atualizar status do pedido
  if (payment.status === 'approved') {
    await storage.updateOrderStatus(order.id, 'paid');
  }
  
  res.json({ success: true, orderId: order.id });
});
```

---

## 🔌 Integrações Externas

### **Mercado Pago**
- **O que faz:** Processa pagamentos (PIX, Cartão, Boleto)
- **SDK usado:** `@mercadopago/sdk-react`
- **Componente:** Payment Brick
- **Secrets necessários:**
  - `MERCADOPAGO_ACCESS_TOKEN`: Token privado (backend)
  - `MERCADOPAGO_PUBLIC_KEY`: Chave pública (frontend)
- **Arquivos envolvidos:**
  - `client/src/pages/Checkout.tsx` (Payment Brick)
  - `server/routes.ts` (POST /api/payments/process)

### **Melhor Envio**
- **O que faz:** Calcula frete baseado em CEP e dimensões
- **API:** REST OAuth 2.0
- **Endpoint:** POST /api/v2/me/shipment/calculate
- **Secrets necessários:**
  - `MELHOR_ENVIO_TOKEN`: Bearer token
  - `MELHOR_ENVIO_ENV`: 'sandbox' ou 'production'
- **Fallback:** Sistema inteligente por distância de CEP
- **Arquivos envolvidos:**
  - `server/routes.ts` (POST /api/shipping/calculate)
  - `client/src/pages/Checkout.tsx` (consome API)

### **Neon PostgreSQL**
- **O que faz:** Banco de dados serverless
- **Secret necessário:** `DATABASE_URL`
- **Arquivos envolvidos:**
  - `server/db.ts` (conexão)
  - `shared/schema.ts` (definição de tabelas)

---

## 🛠️ Como Editar/Adicionar Funcionalidades

### **Adicionar um novo campo ao Produto**

1. **Editar schema** (`shared/schema.ts`):
```typescript
export const products = pgTable('products', {
  // ... campos existentes
  newField: varchar('new_field'),  // Adicione aqui
});
```

2. **Sincronizar banco**:
```bash
npm run db:push
```

3. **Usar no frontend** (`client/src/pages/ProductDetail.tsx`):
```typescript
const product = await storage.getProductById(id);
console.log(product.newField);  // TypeScript já reconhece!
```

### **Adicionar nova rota na API**

1. **Editar routes.ts** (`server/routes.ts`):
```typescript
app.get("/api/minha-rota", async (req, res) => {
  try {
    // Sua lógica aqui
    res.json({ message: "Sucesso!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

2. **Consumir no frontend**:
```typescript
const { data } = useQuery({
  queryKey: ['/api/minha-rota']
});
```

### **Adicionar nova página**

1. **Criar componente** (`client/src/pages/MinhaPage.tsx`):
```typescript
export default function MinhaPage() {
  return <div>Minha nova página!</div>;
}
```

2. **Adicionar rota** (`client/src/App.tsx`):
```typescript
import MinhaPage from '@/pages/MinhaPage';

// Dentro do <Switch>:
<Route path="/minha-page" component={MinhaPage} />
```

3. **Adicionar link na navegação**:
```typescript
<Link href="/minha-page">Ir para Minha Página</Link>
```

### **Modificar estilo/cores**

1. **Cores principais** (`client/src/index.css`):
```css
:root {
  --primary: 45 93% 47%;      /* Amarelo #FFD700 */
  --secondary: 0 0% 0%;       /* Preto */
  --background: 0 0% 100%;    /* Branco */
}
```

2. **Usar no componente**:
```tsx
<div className="bg-primary text-secondary">
  Texto preto em fundo amarelo
</div>
```

### **Adicionar validação de formulário**

1. **Criar schema Zod**:
```typescript
const formSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(3, "Mínimo 3 caracteres")
});
```

2. **Usar com react-hook-form**:
```typescript
const form = useForm({
  resolver: zodResolver(formSchema),
  defaultValues: { email: "", name: "" }
});

<Form {...form}>
  <FormField name="email" render={({ field }) => (
    <Input {...field} />
  )} />
</Form>
```

---

## 🐛 Debugging & Logs

### **Ver logs do backend**
```bash
# No terminal do Replit, procure por:
console.log("Calculando frete:", { from, to, package });
console.error("Erro Melhor Envio:", error);
```

### **Ver queries do banco**
Drizzle loga automaticamente as queries SQL executadas.

### **Inspecionar requests**
Use DevTools do navegador → Network → Filtrar por "Fetch/XHR"

---

## 📚 Recursos Adicionais

- **Shadcn/ui Docs:** https://ui.shadcn.com
- **TanStack Query:** https://tanstack.com/query
- **Drizzle ORM:** https://orm.drizzle.team
- **Mercado Pago:** https://www.mercadopago.com.br/developers
- **Melhor Envio:** https://docs.melhorenvio.com.br

---

## 🎓 Glossário de Termos

- **ORM:** Object-Relational Mapping (mapeia tabelas SQL para objetos)
- **JWT:** JSON Web Token (formato de token de autenticação)
- **Middleware:** Função que processa request antes da rota
- **Hook:** Função React que adiciona funcionalidades (useState, useQuery)
- **Context:** Sistema React para compartilhar estado global
- **Query:** Busca de dados (TanStack Query)
- **Mutation:** Modificação de dados (POST/PATCH/DELETE)
- **Schema:** Estrutura/formato de dados
- **Migration:** Mudança na estrutura do banco
- **Fallback:** Plano B quando algo falha

---

**🎉 FIM DO GUIA! Agora você domina o sistema PrintBrasil!**

_Última atualização: Novembro 2025_
