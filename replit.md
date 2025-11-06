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
│       ├── contexts/      # AuthContext, CartContext
│       ├── pages/         # Páginas (Home, Login, Admin, etc)
│       └── lib/           # Utilitários (queryClient, utils)
├── server/                # Backend Express
│   ├── auth.ts           # JWT/bcrypt authentication
│   ├── db.ts             # Drizzle database connection
│   ├── routes.ts         # API endpoints
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
- `PATCH /api/products/:id` - Atualizar produto (admin only)
- `DELETE /api/products/:id` - Deletar produto (admin only)

### Orders
- `POST /api/orders` - Criar pedido (autenticado)
- `GET /api/orders` - Listar pedidos do usuário (autenticado)
- `GET /api/orders/all` - Listar todos os pedidos (admin only)
- `PATCH /api/orders/:id/status` - Atualizar status (admin only)

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
- [x] Seed com admin + 6 produtos de exemplo

### Pendente 🚧
- [ ] Integração Mercado Pago (Pix, cartão, boleto)
- [ ] Cálculo automático de frete (Super Frete / Correios)
- [ ] Input de endereço real no checkout
- [ ] Seleção de método de pagamento no checkout
- [ ] Painel admin completo (gerenciar pedidos/usuários)
- [ ] Upload de imagens de produtos
- [ ] Rate limiting
- [ ] Helmet.js para security headers
- [ ] Testes E2E
- [ ] Footer com selos de segurança brasileiros

## Notas Importantes

### Segurança
- Backend valida todos os preços server-side para prevenir manipulação
- JWT_SECRET deve ser configurado em produção
- Senhas nunca são armazenadas em plain text (bcrypt)

### Preços
- Todos os valores são armazenados como strings para evitar problemas de precisão decimal
- Cálculo: `área (m²) = largura × altura` → `total = área × pricePerM2`
- Frete fixo de R$ 45,00 (temporário, aguardando integração com API)

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

3. **Admin Panel**
   - Dashboard com estatísticas
   - Gerenciamento de pedidos (status, tracking)
   - Gerenciamento de usuários
   - Upload de imagens de produtos

4. **UX Improvements**
   - Form de endereço completo no checkout
   - Histórico de pedidos com detalhes
   - Notificações de status
   - Responsividade mobile

## Contribuindo

Este projeto segue as guidelines de desenvolvimento fullstack JavaScript do Replit. Principais convenções:

- **Backend**: Rotas finas, lógica no storage layer
- **Frontend**: Componentes reutilizáveis, hooks customizados
- **Validação**: Zod schemas compartilhados entre frontend/backend
- **Estilo**: Tailwind + Shadcn/ui components
- **Estado**: TanStack Query para server state, Context API para global state
