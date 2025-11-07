# PrintBrasil - E-commerce de Comunicação Visual

## Visão Geral
PrintBrasil é uma plataforma completa de e-commerce para produtos de comunicação visual (banners, adesivos de vinil, lonas, etc.) com sistema de cálculo de preço por m² (largura × altura × preço_m²).

## Tecnologias

### Backend
- **Node.js + Express** - Servidor web
- **TypeScript** - Tipagem estática
- **PostgreSQL (Neon)** - Banco de dados relacional
- **Drizzle ORM** - Type-safe SQL query builder
- **JWT + bcrypt** - Autenticação segura
- **Zod** - Validação de schemas

### Frontend
- **React 18** - UI library
- **TypeScript** - Tipagem estática
- **Wouter** - Roteamento cliente
- **TanStack Query** - Estado do servidor e cache
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes UI
- **Vite** - Build tool

## Arquitetura

### Database Schema
```
users
  - id (varchar, uuid)
  - email (unique)
  - password (bcrypt hash)
  - name
  - role (admin | customer)

products
  - id (varchar, uuid)
  - name
  - description
  - category
  - pricePerM2 (decimal)
  - image

orders
  - id (varchar, uuid)
  - userId (FK → users)
  - status (pending | paid | shipped | delivered | cancelled)
  - subtotal
  - shipping
  - total
  - shippingAddress
  - paymentMethod

order_items
  - id (varchar, uuid)
  - orderId (FK → orders)
  - productId (FK → products)
  - productName
  - width
  - height
  - area (width × height)
  - pricePerM2
  - total
```

### Autenticação
- **JWT tokens** em HttpOnly cookies
- **bcrypt** para hash de senhas (10 rounds)
- **Middleware de autenticação** para rotas protegidas
- **Autorização baseada em roles** (admin/customer)
- **Proteção contra chaves inseguras** em produção

### Segurança
- Validação server-side de totais de pedidos (previne manipulação de preços)
- SESSION_SECRET obrigatório em produção
- Cookies HttpOnly (não acessíveis via JavaScript)
- CORS configurado
- Rate limiting (TODO)
- Helmet.js (TODO)

## Credenciais de Acesso

### Usuário Admin (Seed)
- **Email:** admin@printbrasil.com
- **Senha:** admin123

### Usuário Cliente (Seed)
- **Email:** cliente@printbrasil.com
- **Senha:** cliente123

## Estrutura de Pastas

```
├── client/                 # Frontend React
│   └── src/
│       ├── components/    # Componentes reutilizáveis
│       │   ├── ui/              # Shadcn/ui components
│       │   ├── AdminDashboard.tsx        # Dashboard com métricas
│       │   ├── AdminProductsManager.tsx  # CRUD de produtos
│       │   ├── AdminProductForm.tsx      # Form criar/editar produto
│       │   ├── AdminOrdersManager.tsx    # Gestão de pedidos
│       │   └── AdminUsersManager.tsx     # Gestão de usuários
│       ├── contexts/      # AuthContext, CartContext
│       ├── pages/         
│       │   ├── Home.tsx          # Homepage com lista de produtos
│       │   ├── ProductDetail.tsx # Página individual do produto
│       │   ├── Login.tsx         # Autenticação
│       │   └── Admin.tsx         # Painel administrativo profissional
│       └── lib/           # Utilitários (queryClient, utils)
├── server/                # Backend Express
│   ├── auth.ts           # JWT/bcrypt authentication
│   ├── db.ts             # Drizzle database connection
│   ├── routes.ts         # API endpoints (admin, users, products, orders)
│   ├── storage.ts        # Database interface + operations
│   ├── seed.ts           # Database seeding
│   └── index.ts          # Entry point
├── shared/               # Código compartilhado
│   └── schema.ts         # Drizzle schemas + Zod validation
└── db/
    └── migrations/       # SQL migrations (auto-geradas)
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Login (retorna JWT em cookie)
- `POST /api/auth/logout` - Logout (limpa cookie)
- `GET /api/auth/me` - Dados do usuário atual (autenticado)

### Products
- `GET /api/products` - Listar produtos (público)
- `GET /api/products/:id` - Detalhes do produto (público)
- `POST /api/products` - Criar produto (admin only)
- `PUT /api/products/:id` - Editar produto completo (admin only)
- `PATCH /api/products/:id` - Atualizar produto (admin only)
- `DELETE /api/products/:id` - Deletar produto (admin only)

### Orders
- `POST /api/orders` - Criar pedido (autenticado)
- `GET /api/orders` - Listar pedidos (admin: todos os pedidos | customer: apenas seus pedidos)
- `PATCH /api/orders/:id/status` - Atualizar status (admin only)

### Users (Admin Only)
- `GET /api/users` - Listar todos os usuários do sistema
- `PATCH /api/users/:id/role` - Atualizar role do usuário (admin/customer)

### Admin
- `GET /api/admin/dashboard` - Estatísticas completas (receita, pedidos, clientes, produtos, gráficos)

## Variáveis de Ambiente

Ver `.env.example` para lista completa. Principais:

- `DATABASE_URL` - Connection string PostgreSQL (auto-configurado no Replit)
- `SESSION_SECRET` - Chave secreta para JWT (obrigatório em produção)
- `NODE_ENV` - development | production

## Comandos de Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar servidor (backend + frontend)
npm run dev

# Migrations
npm run db:generate  # Gerar migrations
npm run db:migrate   # Aplicar migrations
npm run db:push      # Sync schema (dev)
npm run db:studio    # Drizzle Studio GUI

# Seed database
npm run seed
```

## Design System

### Cores
- **Primária:** Amarelo (#FFD700) - CTAs, destaques
- **Secundária:** Preto (#000000) - Textos, backgrounds
- **Terciária:** Branco (#FFFFFF) - Backgrounds, textos em fundos escuros
- **Accent:** Amarelo com transparências para hover/active states

### Fontes
- **Títulos:** Poppins (600, 700)
- **Corpo:** Inter (400, 500)

## Estado do Projeto

### Implementado ✅
- [x] Database schema completo com Drizzle ORM
- [x] Sistema de autenticação (JWT + bcrypt + HttpOnly cookies)
- [x] CRUD completo de produtos (com proteção admin)
- [x] Sistema de pedidos (criar, listar, atualizar status)
- [x] Integração frontend/backend (AuthContext, CartContext)
- [x] Cálculo de preço por m² (área × price_m²)
- [x] Validação server-side de totais (anti-tampering)
- [x] Proteção de rotas baseada em roles
- [x] Seed com admin + cliente de teste + 6 produtos de exemplo
- [x] Sistema de carrinho de compras funcional
- [x] **Página de produto individual** - Estilo e-commerce moderno
- [x] **Opções de arte** - Upload de arquivo ou criação (+R$ 35)
- [x] **Persistência de carrinho** - localStorage (mantém após login)
- [x] Validação backend de taxa de criação de arte
- [x] **Painel Admin Profissional Completo**:
  - [x] Dashboard com métricas (receita, pedidos, clientes, produtos)
  - [x] Gráfico de status de pedidos
  - [x] Gerenciamento de produtos (criar, editar, deletar, buscar, filtrar)
  - [x] Gerenciamento de pedidos (listar, buscar, filtrar por status, atualizar status, ver detalhes)
  - [x] Gerenciamento de usuários (listar, buscar, filtrar por role, atualizar roles)
  - [x] Página de configurações
  - [x] Campo "category" adicionado aos produtos
- [x] **Novos Endpoints Admin**:
  - [x] GET /api/admin/dashboard - Estatísticas completas
  - [x] GET /api/users - Listar todos os usuários
  - [x] PATCH /api/users/:id/role - Atualizar role do usuário
  - [x] PUT /api/products/:id - Editar produto existente

### Pendente 🚧
- [ ] Integração Mercado Pago (Pix, cartão, boleto)
- [ ] Cálculo automático de frete (Super Frete / Correios)
- [ ] Input de endereço real no checkout
- [ ] Seleção de método de pagamento no checkout
- [ ] Upload de imagens de produtos
- [ ] Rate limiting
- [ ] Helmet.js para security headers
- [ ] Footer com selos de segurança brasileiros
- [ ] Histórico de pedidos para clientes (/orders)

## Notas Importantes

### Nova Arquitetura de Produtos
- **Homepage**: Lista de produtos com botão "Ver Produto"
- **Página de Produto** (`/product/:id`): Configuração completa
  - Cálculo de dimensões (largura × altura)
  - Escolha de opções de arte (upload ou criação)
  - Visualização de preço em tempo real
  - Adicionar ao carrinho
- **Fluxo**: Homepage → ProductDetail → Carrinho → Checkout

### Opções de Arte
- **Upload** (padrão): Cliente envia PDF/CDR/AI - sem custo
- **Criação**: PrintBrasil cria a arte - R$ 35,00 por item
- Taxa de criação validada no backend

### Segurança
- Backend valida todos os preços server-side (produtos + arte)
- JWT_SECRET deve ser configurado em produção
- Senhas nunca são armazenadas em plain text (bcrypt)

### Preços
- Todos os valores são armazenados como strings (decimal PostgreSQL)
- Cálculo: `área (m²) = largura × altura` → `subtotal = área × pricePerM2`
- Taxa de arte: R$ 35,00 se opção "create"
- Frete fixo: R$ 45,00 (temporário)
- **Total = subtotal + artCreationFee + shipping**

### Roles
- **admin**: Acesso completo (produtos, pedidos, usuários)
- **customer**: Pode fazer pedidos, ver histórico próprio

### Redirect após Login
- Admin → `/admin`
- Customer → `/`

## Próximos Passos

1. **Mercado Pago Integration**
   - Buscar integration no search_integrations
   - Implementar checkout com Pix/cartão/boleto
   - Webhooks para atualização de status

2. **Freight Calculation**
   - Integrar com Super Frete ou Correios API
   - Permitir usuário escolher transportadora
   - Calcular baseado em CEP + dimensões

3. **Admin Panel Enhancements**
   - ✅ Dashboard com estatísticas completo
   - ✅ Gerenciamento de pedidos (status, tracking, filtros)
   - ✅ Gerenciamento de usuários
   - [ ] Upload de imagens de produtos
   - [ ] Relatórios e exportação de dados

4. **UX Improvements**
   - Form de endereço completo no checkout
   - Histórico de pedidos com detalhes
   - Notificações de status
   - Responsividade mobile

## Acesso ao Painel Admin

### Credenciais
- **URL:** `/admin` (após login)
- **Email:** admin@printbrasil.com
- **Senha:** admin123

> ⚠️ **IMPORTANTE:** Troque a senha padrão em produção!

### Funcionalidades Disponíveis
- ✅ **Dashboard Completo**
  - Métricas de receita total, pedidos, clientes e produtos
  - Gráfico visual de status de pedidos
  - Lista de pedidos recentes
  
- ✅ **Gerenciar Produtos**
  - Criar novos produtos com categoria
  - Editar produtos existentes
  - Deletar produtos
  - Buscar por nome, descrição ou categoria
  - Ativar/desativar produtos
  
- ✅ **Gerenciar Pedidos**
  - Visualizar todos os pedidos do sistema
  - Buscar por ID, cliente ou endereço
  - Filtrar por status (Pendente, Pago, Enviado, Entregue, Cancelado)
  - Atualizar status de pedidos
  - Ver detalhes expandidos dos itens
  
- ✅ **Gerenciar Usuários**
  - Listar todos os usuários
  - Buscar por nome, email ou ID
  - Filtrar por role (Admin/Cliente)
  - Promover usuários a admin ou rebaixar a cliente
  
- ✅ **Configurações**
  - Informações sobre integrações (Mercado Pago, SuperFrete)
  - Versão do sistema

📖 **Guia Completo:** Consulte [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) para instruções detalhadas sobre configuração de chaves de API, deployment e mais.

## Configuração de Chaves de API

### Como Adicionar Secrets no Replit

1. Abra a ferramenta **Secrets** (ícone 🔒) no painel lateral
2. Clique em "New Secret"
3. Preencha:
   - **Key:** Nome da variável (ex: `MERCADOPAGO_ACCESS_TOKEN`)
   - **Value:** Valor secreto
4. Clique em "Add Secret"

### Secrets Disponíveis

Automaticamente configuradas:
- `DATABASE_URL` - Conexão PostgreSQL
- `SESSION_SECRET` - Chave JWT (obrigatório em produção)

Para integrações futuras, adicione:
- `MERCADOPAGO_ACCESS_TOKEN` - Token Mercado Pago
- `MERCADOPAGO_PUBLIC_KEY` - Chave pública MP
- `SUPERFRETE_TOKEN` - Token Super Frete

## Contribuindo

Este projeto segue as guidelines de desenvolvimento fullstack JavaScript do Replit. Principais convenções:

- **Backend**: Rotas finas, lógica no storage layer
- **Frontend**: Componentes reutilizáveis, hooks customizados
- **Validação**: Zod schemas compartilhados entre frontend/backend
- **Estilo**: Tailwind + Shadcn/ui components
- **Estado**: TanStack Query para server state, Context API para global state
