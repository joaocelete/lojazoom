# PrintBrasil - E-commerce de Comunicação Visual

## Overview
PrintBrasil is a comprehensive e-commerce platform for visual communication products. It features a flexible price calculation system (per square meter or fixed price), a modern e-commerce experience from product browsing to a complete checkout process, and integrated payment solutions. The platform aims to be robust, scalable, and user-friendly for both customers and administrators, with a focus on secure transactions and efficient product/order management.

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
- **Color Scheme:** Primary Yellow (#FFD700), Secondary Black (#000000), Tertiary White (#FFFFFF). Accent colors use transparent yellow.
- **Fonts:** Poppins (titles) and Inter (body text).
- **Components:** Shadcn/ui for accessible components, styled with Tailwind CSS.
- **Design Approach:** Modern e-commerce design with clear product listings, detailed product pages, and a streamlined checkout.

### Technical Implementations
- **Backend:** Node.js with Express and TypeScript.
- **Frontend:** React 18 with TypeScript, Wouter for routing, TanStack Query for server state.
- **Database:** PostgreSQL (Neon) with Drizzle ORM.
- **Authentication:** JWT for tokens (HttpOnly cookies), bcrypt for password hashing (10 rounds), Zod for schema validation. Role-based authorization (admin/customer).
- **Security:** Server-side validation for order totals, HttpOnly cookies, CORS configuration.
- **Price Calculation:** Supports `area (m²) = width × height × pricePerM2` or `quantity × fixedPrice`. Includes optional art creation fee (R$ 35,00) and shipping. All values stored as decimal strings.
- **Dual Pricing System:** Products can be priced "per_m2" (with optional `maxWidth`/`maxHeight`) or "fixed" (with `quantity`). Backend enforces dimension limits and validates pricing based on type.
- **File Upload System:** Uses Multer for local storage in `uploads/`. Allows admin product image uploads (JPG, PNG, WebP, max 5MB) and customer artwork uploads (PDF, CDR, max 20MB) with server-side validation.

### Feature Specifications
- **Product Management:** Full CRUD for admins, including categorization and flexible pricing configuration.
- **Order Management:** Create, list, and update orders; admin oversight, customer viewing.
- **User Management:** Admin panel for user listing, filtering, and role updates.
- **Shopping Cart:** Persistent shopping cart via `localStorage`.
- **Admin Dashboard:** Metrics for revenue, orders, customers, products, and order status graphs.
- **Checkout Process:** Modern checkout with shipping address collection, "Retirada no Local" (store pickup) option, and Mercado Pago Payment Brick integration. Store pickup bypasses shipping calculation and address forms, enabling immediate payment.
- **Art Options:** Upload art files or request art creation service.
- **Payment Processing:** Backend endpoints for PIX QR code generation, card payments, and Boleto tickets, all validated server-side and integrated with Mercado Pago Payment Brick for a unified experience.

### System Design Choices
- **Monorepo Structure:** `client/` (React), `server/` (Express), `shared/` (schemas/utilities).
- **API Endpoints:** Structured API for authentication, products, orders, users, admin dashboard, and payments.
- **Environment Variables:** `.env` for `DATABASE_URL`, `SESSION_SECRET`, `MERCADOPAGO_ACCESS_TOKEN`, `MELHOR_ENVIO_TOKEN`, etc.

## External Dependencies

- **Database:** PostgreSQL (managed by Neon).
- **ORM:** Drizzle ORM.
- **Payment Gateway:** Mercado Pago Checkout Bricks (`@mercadopago/sdk-react`) using Payment Brick for unified PIX, Credit/Debit Cards, and Boleto integration.
- **Shipping Calculator:** Melhor Envio API with an intelligent fallback system based on CEP distance, volumetric weight, and dynamic pricing if the API fails or returns no results. Supports Correios, JadLog, etc.
- **File Upload:** Multer for handling multipart/form-data.
- **Authentication:** JWT (JSON Web Tokens) and bcrypt.
- **Validation:** Zod.
- **UI Libraries:** React, Wouter, TanStack Query, Tailwind CSS, Shadcn/ui.