import { Button } from "@/components/ui/button";
import heroImage from "@assets/generated_images/Hero_printing_shop_banner_2a5b02b6.png";

interface HeroProps {
  onExploreClick?: () => void;
}

export default function Hero({ onExploreClick }: HeroProps) {
  return (
    <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
      
      <div className="relative h-full container mx-auto px-4 flex items-center">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4" data-testid="text-hero-title">
            Comunicação Visual de Alta Qualidade
          </h1>
          <p className="text-lg md:text-xl mb-8 text-white/90" data-testid="text-hero-subtitle">
            Banners, adesivos e lonas personalizados. Cálculo automático por m². 
            Pagamento seguro e entrega rápida em todo o Brasil.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg" 
              onClick={onExploreClick}
              className="text-lg px-8"
              data-testid="button-explore-products"
            >
              Ver Produtos
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 bg-background/20 backdrop-blur-sm border-white/30 text-white hover:bg-background/30"
              data-testid="button-calculate"
            >
              Calcular Orçamento
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
