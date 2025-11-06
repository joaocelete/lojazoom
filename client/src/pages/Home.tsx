import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustBadges from "@/components/TrustBadges";
import ProductCard from "@/components/ProductCard";
import Cart from "@/components/Cart";
import Footer from "@/components/Footer";
import vinylImage from "@assets/generated_images/Vinyl_banner_product_photo_7f6d1908.png";
import stickerImage from "@assets/generated_images/Adhesive_vinyl_sticker_product_9ad4721d.png";
import lonaImage from "@assets/generated_images/Outdoor_lona_banner_material_f46086fc.png";

// todo: remove mock functionality
const mockProducts = [
  {
    id: 1,
    name: "Banner Vinílico Premium",
    description: "Banner de alta qualidade, ideal para ambientes internos e externos com impressão em alta resolução",
    pricePerM2: 45.90,
    image: vinylImage
  },
  {
    id: 2,
    name: "Adesivo Vinílico",
    description: "Adesivo de vinil autocolante, perfeito para aplicação em vidros, paredes e veículos",
    pricePerM2: 35.00,
    image: stickerImage
  },
  {
    id: 3,
    name: "Lona para Outdoor",
    description: "Lona resistente para uso externo, ideal para fachadas e outdoors com proteção UV",
    pricePerM2: 52.90,
    image: lonaImage
  },
  {
    id: 4,
    name: "Banner Lona 440g",
    description: "Lona premium alta gramatura, extra resistente para uso prolongado em ambientes externos",
    pricePerM2: 58.90,
    image: vinylImage
  },
  {
    id: 5,
    name: "Adesivo Perfurado",
    description: "Adesivo perfurado para vidros, permite visibilidade de dentro para fora",
    pricePerM2: 42.00,
    image: stickerImage
  },
  {
    id: 6,
    name: "Banner Blackout",
    description: "Banner com bloqueio total de luz, ideal para backlight e iluminação interna",
    pricePerM2: 48.90,
    image: lonaImage
  }
];

interface CartItem {
  id: number;
  name: string;
  image: string;
  width: number;
  height: number;
  pricePerM2: number;
  total: number;
}

export default function Home() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAddToCart = (productId: number, width: number, height: number, total: number) => {
    const product = mockProducts.find(p => p.id === productId);
    if (!product) return;

    const newItem: CartItem = {
      id: Date.now(),
      name: product.name,
      image: product.image,
      width,
      height,
      pricePerM2: product.pricePerM2,
      total
    };

    setCartItems(prev => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const handleRemoveItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        cartItemCount={cartItems.length}
        onCartClick={() => setIsCartOpen(true)}
        onLoginClick={() => console.log("Login clicked")}
      />

      <main className="flex-1">
        <Hero onExploreClick={scrollToProducts} />
        
        <TrustBadges />

        <section id="products" className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Nossos Produtos
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Materiais de comunicação visual de alta qualidade com cálculo personalizado por m². 
                Insira as dimensões e veja o valor instantaneamente.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockProducts.map(product => (
                <ProductCard
                  key={product.id}
                  {...product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-card border-y border-card-border">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Dúvidas? Fale com a Gente!
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Nossa equipe está pronta para ajudar você a escolher o melhor produto 
              para sua necessidade de comunicação visual.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://wa.me/5511999999999" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#25D366] text-white rounded-md font-medium hover:bg-[#20BD5A] transition-colors"
                data-testid="link-whatsapp"
              >
                WhatsApp
              </a>
              <a 
                href="mailto:contato@printbrasil.com.br"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
                data-testid="link-email"
              >
                E-mail
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <Cart
        items={cartItems}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => console.log("Checkout with items:", cartItems)}
      />
    </div>
  );
}
