# PrintBrasil - E-commerce de Comunicação Visual

## Overview
PrintBrasil is a comprehensive e-commerce platform for visual communication products (banners, vinyl stickers, tarpaulins, etc.). It features a price calculation system based on square meters (width × height × price_per_m²), supporting a modern e-commerce experience from product browsing to a complete checkout process with integrated payment solutions. The project aims to provide a robust, scalable, and user-friendly platform for both customers and administrators, with a focus on secure transactions and efficient product management.

## User Preferences
- **Coding Style:** Prefer robust and maintainable codebases with clear separation of concerns.
- **Workflow:** Iterative development, ensuring core functionalities are stable before adding complex features.
- **Communication:** Prefer clear and concise updates on progress and potential issues.
- **Interaction:** Ask before making major architectural changes or introducing new dependencies.
- **Project Structure:** Adhere to the established folder structure and naming conventions.
- **Security:** Prioritize security best practices, especially concerning authentication and payment processing.
- **Testing:** Encourage comprehensive testing, particularly for critical business logic like price calculation and payment flows.

## System Architecture

### UI/UX Decisions
- **Color Scheme:** Primary: Yellow (#FFD700) for CTAs and highlights; Secondary: Black (#000000) for text and backgrounds; Tertiary: White (#FFFFFF) for backgrounds and text on dark backgrounds. Accent colors use transparent yellow for hover/active states.
- **Fonts:** Poppins (600, 700) for titles and Inter (400, 500) for body text.
- **Components:** Utilizes Shadcn/ui for pre-built, accessible, and customizable UI components, styled with Tailwind CSS.
- **Design Approach:** Modern e-commerce design with clear product listings, detailed product pages, and a streamlined checkout flow.

### Technical Implementations
- **Backend:** Node.js with Express and TypeScript. Uses PostgreSQL (Neon) with Drizzle ORM for database interactions. Implements JWT for authentication with bcrypt for password hashing and Zod for schema validation.
- **Frontend:** React 18 with TypeScript. Wouter for client-side routing, TanStack Query for server state management and caching.
- **Authentication:** JWT tokens stored in HttpOnly cookies. bcrypt for password hashing (10 rounds). Middleware for protected routes and role-based authorization (admin/customer).
- **Security:** Server-side validation of order totals to prevent manipulation. HttpOnly cookies prevent JavaScript access. CORS is configured.
- **Database Schema:** Defined for `users`, `products`, `orders`, and `order_items`, including fields for IDs, emails, passwords, roles, product details, order statuses, and pricing.
- **Price Calculation:** `area (m²) = width × height`, `subtotal = area (m²) × pricePerM2`. An optional art creation fee of R$ 35,00 is applied if selected, and a fixed shipping fee of R$ 45,00 (temporary). All values are stored as decimal strings.
- **Payment Integration:** Uses Mercado Pago **Payment Brick** (`@mercadopago/sdk-react`) for unified payment experience. Single component handles PIX, Credit/Debit Cards, and Boleto with professional Mercado Pago UI, automatic validation, and PCI compliance simplification.

### Feature Specifications
- **Product Management:** Full CRUD operations for products, including categorization, accessible by administrators.
- **Order Management:** Creation, listing, and status updates for orders. Administrators can manage all orders, while customers can view their own.
- **User Management:** Admin panel allows listing users, filtering by role, and updating user roles.
- **Shopping Cart:** Functional shopping cart with persistence via `localStorage`.
- **Admin Dashboard:** Comprehensive dashboard with metrics (revenue, orders, customers, products) and a graphical representation of order statuses.
- **Checkout Process:** Modern checkout experience with shipping address collection and **Mercado Pago Payment Brick** integration. Payment Brick provides a unified, professional interface for all payment methods (PIX, Cards, Boleto) with built-in validation, security, and Mercado Pago branding that increases customer trust and conversion.
- **Art Options:** Customers can choose to upload their own art files or request art creation (with an associated fee).
- **Payment Processing:** Backend endpoints handle PIX QR code generation (`/api/payments/pix`), card payments (`/api/payments/process`), and boleto tickets (`/api/payments/boleto`). All payments are validated server-side and stored in the orders table.

### System Design Choices
- **Monorepo Structure:** Divided into `client/` (React frontend), `server/` (Express backend), and `shared/` (shared schemas and utilities).
- **API Endpoints:** Structured API for authentication, products, orders, users (admin only), admin dashboard, and payments.
- **Environment Variables:** Utilizes `.env` files for configuration, with critical variables like `DATABASE_URL`, `SESSION_SECRET`, `MERCADOPAGO_ACCESS_TOKEN`, and `MERCADOPAGO_PUBLIC_KEY`.

## External Dependencies

- **Database:** PostgreSQL (managed by Neon).
- **ORM:** Drizzle ORM.
- **Payment Gateway:** Mercado Pago Checkout Bricks (`@mercadopago/sdk-react`). Uses Payment Brick component for unified payment experience with PIX, Credit/Debit Cards, and Boleto. Provides professional UI, automatic validation, and simplified PCI compliance.
- **Shipping Calculator:** Melhor Envio API integration with intelligent fallback system. Calculates shipping based on destination CEP and package dimensions (10x10x60cm tube for rolled banners/vinyl). When Melhor Envio API fails or returns no results, uses intelligent distance-based fallback pricing to ensure checkout always works.
- **Authentication:** JWT (JSON Web Tokens) and bcrypt.
- **Validation:** Zod.
- **UI Libraries:** React, Wouter, TanStack Query, Tailwind CSS, Shadcn/ui.

## Recent Architecture Changes (November 2025)

### Payment Integration Migration
**From:** Manual Mercado Pago SDK implementation with separate cardForm, custom tabs, and manual validation  
**To:** Mercado Pago Payment Brick (`@mercadopago/sdk-react`)

**Benefits:**
- ✅ **Unified Interface**: Single component for all payment methods (PIX, Cards, Boleto)
- ✅ **Professional UI**: Standard Mercado Pago design increases customer trust
- ✅ **Code Reduction**: Eliminated ~400 lines of manual payment form code
- ✅ **Automatic Updates**: Payment methods and security updates managed by Mercado Pago
- ✅ **Better UX**: Pre-built validation, error handling, and user feedback
- ✅ **PCI Compliance**: Simplified certification process with hosted payment fields
- ✅ **Maintainability**: Less custom code to maintain and debug

**Implementation:**
```tsx
<Payment
  initialization={{ amount: total, payer: { email: user.email } }}
  customization={{ paymentMethods: { creditCard: 'all', debitCard: 'all', ticket: 'all', bankTransfer: 'all' } }}
  onSubmit={handlePayment}
/>
```

### Shipping Integration with Intelligent Fallback
**Integration:** Melhor Envio API (`MELHOR_ENVIO_TOKEN` environment variable)  
**Endpoint:** `POST /api/shipping/calculate`

**Package Specifications:**
```javascript
{
  height: 10,   // cm - tube diameter
  width: 10,    // cm - tube diameter
  length: 60,   // cm - tube length
  weight: 0.5   // kg - average weight for rolled banners/vinyl
}
```

**Intelligent Fallback System:**
When Melhor Envio API fails or returns empty results, the system calculates realistic shipping prices based on:
- **CEP Distance Analysis**: Uses first 2 digits to estimate regional distance
- **Volumetric Weight**: Calculates `(height × width × length) / 6000`
- **Dynamic Pricing**: `Base price + Distance fee (R$2/region) + Weight fee`
- **Delivery Time**: Adjusts based on distance (PAC: 5-15 days, SEDEX: 2-7 days)

**Example Fallback Prices:**
- São Paulo (CEP 01xxx): PAC R$23, SEDEX R$37
- Rio de Janeiro (CEP 20xxx): PAC R$61, SEDEX R$75
- Curitiba (CEP 80xxx): PAC R$181, SEDEX R$195
- Manaus (CEP 69xxx): PAC R$159, SEDEX R$173

**Benefits:**
- ✅ **Real-Time Quotes**: Live shipping calculations from Melhor Envio API
- ✅ **Multiple Carriers**: Correios, JadLog, and other carriers via Melhor Envio
- ✅ **Intelligent Fallback**: Distance-based pricing ensures realistic values
- ✅ **Never Breaks**: Checkout always works, even if API is down
- ✅ **User Experience**: Auto-triggers on CEP input (8 digits), instant feedback
- ✅ **Database Tracking**: Stores carrier, service, delivery time, and price in orders table

**API Authentication:**
Melhor Envio uses OAuth 2.0. To get a token:
1. Create account at https://sandbox.melhorenvio.com.br (sandbox) or https://www.melhorenvio.com.br (production)
2. Create an application in the dashboard to get `client_id` and `client_secret`
3. Complete OAuth flow to obtain Bearer token
4. Add token to environment variable `MELHOR_ENVIO_TOKEN`
5. Set `MELHOR_ENVIO_ENV=sandbox` for testing or `MELHOR_ENVIO_ENV=production` for live use

**UI Flow:**
1. User enters 8-digit CEP → Auto-triggers calculation
2. Shows loading state: "Calculando opções de frete..."
3. Displays shipping options as selectable radio cards with carrier logos
4. First option auto-selected
5. Sidebar updates with shipping cost
6. Payment Brick unlocks when address + shipping complete

### Store Pickup Feature (Retirada no Local)
**Added:** November 2025  
**Database Field:** `deliveryType` in orders table (`'pickup' | 'delivery'`)

**Features:**
- ✅ **Free Pickup**: Customers can choose to pick up orders at the physical store (R$ 0.00 shipping)
- ✅ **Simplified Checkout**: When pickup is selected, address form and shipping options are hidden
- ✅ **Instant Payment**: Payment Brick unlocks immediately without requiring address input
- ✅ **Store Information**: Displays pickup location with address and business hours
- ✅ **Backend Validation**: Accepts shipping = "0.00" only when `deliveryType = 'pickup'`

**Pickup Address:**
- Av. Paulista, 1000 - Bela Vista, São Paulo - SP, CEP: 01310-100
- Hours: Monday to Friday, 9am to 6pm

**Implementation Details:**
```typescript
// Database schema (shared/schema.ts)
deliveryType: varchar("delivery_type").default("delivery").notNull()

// Checkout validation
if (deliveryType === 'pickup') {
  shipping = 0;
  shippingAddress = 'Retirada no Local - Av. Paulista, 1000, São Paulo - SP';
  // Address form hidden, Payment Brick immediately available
}
```

**UI/UX Flow:**
1. Card "Tipo de Entrega" with 2 radio options:
   - **Entrega no Endereço**: Shows address form + shipping calculator
   - **Retirada no Local**: Shows store info, hides forms, R$ 0.00 shipping
2. User selects pickup → Address/shipping sections collapse
3. Order summary updates: "Frete: R$ 0,00"
4. Payment Brick enables instantly (no waiting for address)
5. Order saved with `deliveryType: 'pickup'` and zero shipping cost

**Benefits:**
- ✅ **Conversion Boost**: Eliminates shipping cost barrier for local customers
- ✅ **Faster Checkout**: Skips address entry, reducing friction
- ✅ **Testing Friendly**: Allows payment testing without Melhor Envio API token
- ✅ **Cost Savings**: No shipping fees for customers willing to pick up