import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustBadges from "@/components/TrustBadges";
import ClientLogos from "@/components/ClientLogos";
import ProductCard from "@/components/ProductCard";
import Cart from "@/components/Cart";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
import vinylImage from "@assets/generated_images/Vinyl_banner_product_photo_7f6d1908.png";
import stickerImage from "@assets/generated_images/Adhesive_vinyl_sticker_product_9ad4721d.png";
import lonaImage from "@assets/generated_images/Outdoor_lona_banner_material_f46086fc.png";

export default function Home() {
  const [, setLocation] = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { addItem, totalItems } = useCart();

  const { data: productsData, isLoading } = useQuery<{ products: Product[] }>({
    queryKey: ["/api/products?active=true"],
  });

  const products = productsData?.products || [];


  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        cartItemCount={totalItems}
        onCartClick={() => setIsCartOpen(true)}
        onLoginClick={() => setLocation("/login")}
      />

      <main className="flex-1">
        <Hero onExploreClick={scrollToProducts} />
        
        <TrustBadges />

        <section id="products" className="py-20 lg:py-28 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16 space-y-4">
              <div className="inline-block">
                <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-semibold uppercase tracking-wide">
                  Catálogo
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Nossos Produtos
              </h2>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Materiais de comunicação visual de alta qualidade com cálculo personalizado por m². 
                Insira as dimensões e veja o valor instantaneamente.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {isLoading ? (
                <div className="col-span-full text-center py-20 text-muted-foreground">
                  Carregando produtos...
                </div>
              ) : products.length === 0 ? (
                <div className="col-span-full text-center py-20 text-muted-foreground">
                  Nenhum produto disponível no momento.
                </div>
              ) : (
                products.map(product => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    description={product.description}
                    pricePerM2={parseFloat(product.pricePerM2)}
                    image={product.imageUrl || vinylImage}
                  />
                ))
              )}
            </div>
          </div>
        </section>

        <ClientLogos />

        <section className="py-20 lg:py-28 bg-card border-y border-card-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 space-y-6">
                <div className="inline-block">
                  <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-semibold uppercase tracking-wide">
                    Portfólio
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                  Projetos que Transformam Marcas
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Veja alguns dos trabalhos que realizamos para grandes empresas e negócios locais. 
                  Cada projeto é executado com atenção aos detalhes e compromisso com a excelência.
                </p>
                <div className="pt-4">
                  <Button 
                    size="lg"
                    onClick={() => setLocation('/portfolio')}
                    className="text-base px-8 py-6 h-auto"
                    data-testid="button-view-portfolio"
                  >
                    Ver Portfolio Completo
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
                    <img src={vinylImage} alt="Projeto 1" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
                    <img src={stickerImage} alt="Projeto 2" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
                    <img src={lonaImage} alt="Projeto 3" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
                    <img src={vinylImage} alt="Projeto 4" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-28 bg-gradient-to-br from-card via-card/50 to-background border-y border-card-border relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
          <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                Precisa de Ajuda?
              </h2>
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                Nossa equipe especializada está pronta para ajudar você a escolher 
                a solução perfeita de comunicação visual para o seu negócio.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <a 
                  href="https://wa.me/5511999999999" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#25D366] text-white rounded-lg font-semibold hover:bg-[#20BD5A] transition-all hover:scale-105 shadow-lg"
                  data-testid="link-whatsapp"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Chamar no WhatsApp
                </a>
                <a 
                  href="mailto:contato@printbrasil.com.br"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all hover:scale-105 shadow-lg"
                  data-testid="link-email"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Enviar E-mail
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
}
