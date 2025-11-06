import { Button } from "@/components/ui/button";
import { ArrowRight, Calculator } from "lucide-react";
import heroImage from "@assets/generated_images/Hero_printing_shop_banner_2a5b02b6.png";

interface HeroProps {
  onExploreClick?: () => void;
}

export default function Hero({ onExploreClick }: HeroProps) {
  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-700"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/70 to-black/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      
      <div className="relative h-full container mx-auto px-4 lg:px-8 flex items-center">
        <div className="max-w-3xl text-white space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-block">
            <span className="px-4 py-2 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full text-sm font-medium text-primary">
              Desde 2010 no mercado
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight" data-testid="text-hero-title">
            Comunicação Visual
            <span className="block text-primary mt-2">de Alto Padrão</span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-white/80 font-light leading-relaxed max-w-2xl" data-testid="text-hero-subtitle">
            Materiais premium para sua marca. Produção rápida, qualidade excepcional e entrega garantida em todo Brasil.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              size="lg" 
              onClick={onExploreClick}
              className="text-base px-8 py-6 h-auto gap-2 group"
              data-testid="button-explore-products"
            >
              Explorar Produtos
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-base px-8 py-6 h-auto gap-2 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:border-white/30"
              data-testid="button-calculate"
            >
              <Calculator className="h-5 w-5" />
              Calcular Valor
            </Button>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
