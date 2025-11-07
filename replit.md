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

### Feature Specifications
- **Product Management:** Full CRUD operations for products, including categorization, accessible by administrators.
- **Order Management:** Creation, listing, and status updates for orders. Administrators can manage all orders, while customers can view their own.
- **User Management:** Admin panel allows listing users, filtering by role, and updating user roles.
- **Shopping Cart:** Functional shopping cart with persistence via `localStorage`.
- **Admin Dashboard:** Comprehensive dashboard with metrics (revenue, orders, customers, products) and a graphical representation of order statuses.
- **Checkout Process:** Integrated transparent checkout with address input, payment method selection (PIX, Credit Card, Boleto) via Mercado Pago.
- **Art Options:** Customers can choose to upload their own art files or request art creation (with an associated fee).

### System Design Choices
- **Monorepo Structure:** Divided into `client/` (React frontend), `server/` (Express backend), and `shared/` (shared schemas and utilities).
- **API Endpoints:** Structured API for authentication, products, orders, users (admin only), admin dashboard, and payments.
- **Environment Variables:** Utilizes `.env` files for configuration, with critical variables like `DATABASE_URL`, `SESSION_SECRET`, `MERCADOPAGO_ACCESS_TOKEN`, and `MERCADOPAGO_PUBLIC_KEY`.

## External Dependencies

- **Database:** PostgreSQL (managed by Neon).
- **ORM:** Drizzle ORM.
- **Payment Gateway:** Mercado Pago for transparent checkout, including PIX, Credit Card, and Boleto payments.
- **Authentication:** JWT (JSON Web Tokens) and bcrypt.
- **Validation:** Zod.
- **UI Libraries:** React, Wouter, TanStack Query, Tailwind CSS, Shadcn/ui.