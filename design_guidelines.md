# Design Guidelines: E-commerce de Comunicação Visual

## Design Approach
**Reference-Based:** Inspired by major Brazilian e-commerce platforms (Mercado Livre, Magazine Luiza, Americanas) with bold yellow accents characteristic of Brazilian retail.

## Color System
- **Primary:** Yellow (#FFD700 or #FFC700) - CTAs, highlights, accents
- **Neutral Dark:** Black (#000000) - text, headers, footer background
- **Neutral Light:** White (#FFFFFF) - backgrounds, cards
- **Semantic:** Green for success, Red for urgent actions

## Typography
- **Primary Font:** Inter or Poppins (Google Fonts)
- **Headings:** Bold, 700 weight, black color
  - H1: 3xl/4xl (product titles, hero)
  - H2: 2xl/3xl (section headers)
  - H3: xl/2xl (card titles)
- **Body:** Regular 400 weight, gray-800
  - Base: text-base (product descriptions)
  - Small: text-sm (metadata, labels)

## Layout System
**Spacing Units:** Tailwind 4, 6, 8, 12, 16 for consistency
- Section padding: py-12 (mobile) to py-16 (desktop)
- Card padding: p-4 to p-6
- Grid gaps: gap-4 to gap-6

## Component Library

### Navigation
- **Top Bar:** Black background, white text, yellow CTA button
- **Logo:** Left-aligned, white or yellow
- **Search Bar:** Prominent center position, white background with yellow search button
- **Cart Icon:** Yellow badge with item count
- **Mobile:** Hamburger menu (black), slide-in drawer

### Product Cards
- **Layout:** White background, subtle shadow, rounded corners (rounded-lg)
- **Structure:** Image (16:9 ratio) → Title → Price/m² → Calculator inputs → "Calcular" button (yellow)
- **Hover:** Subtle lift effect (shadow-lg)
- **Grid:** 2 columns mobile, 3-4 columns desktop

### Hero Section
- **Type:** Full-width image banner with text overlay
- **Image:** Professional print shop scene or finished banner products
- **Overlay:** Semi-transparent black gradient (bottom to top)
- **Content:** Left-aligned headline (white, bold) + yellow CTA button with blur background
- **Height:** 60vh to 70vh

### Calculator Component (Key Feature)
- **Inputs:** Side-by-side width/height fields with "m" suffix
- **Display:** Large, bold total price in yellow
- **Button:** Full-width yellow "Adicionar ao Carrinho"
- **Location:** Within product cards and product detail page

### Shopping Cart
- **Style:** Slide-in panel from right
- **Items:** Product thumbnail + name + dimensions + price
- **Summary:** Subtotal, frete (calculated), total in bold
- **CTA:** Large yellow "Finalizar Compra" button

### Admin Panel
- **Sidebar:** Black background, white text, yellow active state
- **Tables:** Striped rows, white/gray alternating
- **Actions:** Icon buttons (edit/delete) with hover states
- **Forms:** Clean white cards with labeled inputs

### Footer (Brazilian Standard)
- **Background:** Black
- **Sections:** 4-column grid (desktop) - Institucional, Atendimento, Formas de Pagamento, Selos de Segurança
- **Security Seals:** Display SSL, Site Seguro, payment provider logos (Mercado Pago, Visa, Mastercard)
- **Trust Indicators:** "Compra Segura", "Entrega Garantida", "Suporte 24/7"
- **Color:** White text, yellow links on hover

## Key Sections (Customer Site)

1. **Hero:** Full-width banner showcasing products
2. **Featured Products:** Grid of best-sellers with calculator
3. **Categories:** Icon cards for product types (Banners, Adesivos, Lonas)
4. **Diferenciais:** Trust badges (Qualidade, Entrega Rápida, Melhor Preço)
5. **Testimonials:** 2-column customer reviews
6. **FAQ:** Accordion-style, white cards
7. **Footer:** Complete with security seals

## Images
- **Hero:** High-quality image of printing process or installed banner (1920x800px)
- **Products:** Professional product photos on white/transparent background (600x600px)
- **Categories:** Icon-style illustrations or photos
- **Footer:** Payment logos, security seal badges (actual logo files)

## Forms & Inputs
- **Style:** White background, gray border, rounded corners
- **Focus:** Yellow border (2px)
- **Labels:** Bold, black, positioned above input
- **Buttons:** Yellow primary, black text, rounded-md, py-3 px-6

## Responsive Behavior
- **Mobile:** Single column, stacked layout, bottom navigation bar
- **Tablet:** 2-column grids, condensed navigation
- **Desktop:** Full multi-column layouts, expanded navigation