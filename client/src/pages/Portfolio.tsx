import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, MapPin } from "lucide-react";
import vinylImage from "@assets/generated_images/Vinyl_banner_product_photo_7f6d1908.png";
import stickerImage from "@assets/generated_images/Adhesive_vinyl_sticker_product_9ad4721d.png";
import lonaImage from "@assets/generated_images/Outdoor_lona_banner_material_f46086fc.png";

// todo: remove mock functionality
const portfolioItems = [
  {
    id: 1,
    title: "Fachada Comercial - Shopping Center",
    client: "Magazine Luiza",
    category: "Lona Outdoor",
    location: "São Paulo, SP",
    date: "Janeiro 2025",
    size: "15m × 3m",
    image: lonaImage,
    description: "Instalação de fachada em lona 440g com iluminação LED integrada para shopping center."
  },
  {
    id: 2,
    title: "Banner Promocional - Black Friday",
    client: "Casas Bahia",
    category: "Banner Vinílico",
    location: "Rio de Janeiro, RJ",
    date: "Novembro 2024",
    size: "8m × 2m",
    image: vinylImage,
    description: "Banner de alta resolução para campanha promocional em ponto de venda."
  },
  {
    id: 3,
    title: "Envelopamento de Frota",
    client: "Ambev",
    category: "Adesivo Vinílico",
    location: "Belo Horizonte, MG",
    date: "Dezembro 2024",
    size: "Frota de 20 veículos",
    image: stickerImage,
    description: "Envelopamento completo de frota comercial com adesivo premium."
  },
  {
    id: 4,
    title: "Comunicação Visual - Evento Corporativo",
    client: "Itaú",
    category: "Banner + Adesivo",
    location: "Brasília, DF",
    date: "Outubro 2024",
    size: "Múltiplas peças",
    image: vinylImage,
    description: "Produção de material para evento corporativo com mais de 5000 participantes."
  },
  {
    id: 5,
    title: "Outdoor Rodoviário",
    client: "Nike",
    category: "Lona Outdoor",
    location: "Curitiba, PR",
    date: "Setembro 2024",
    size: "9m × 3m",
    image: lonaImage,
    description: "Outdoor em rodovia principal com proteção UV e resistência a intempéries."
  },
  {
    id: 6,
    title: "Identidade Visual - Loja Conceito",
    client: "Renner",
    category: "Projeto Completo",
    location: "Porto Alegre, RS",
    date: "Agosto 2024",
    size: "Loja de 500m²",
    image: stickerImage,
    description: "Projeto completo de comunicação visual para loja conceito incluindo fachada, sinalização interna e vitrines."
  }
];

const categories = ["Todos", "Banner Vinílico", "Adesivo Vinílico", "Lona Outdoor", "Projeto Completo"];

export default function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filteredItems = selectedCategory === "Todos" 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        cartItemCount={0}
        onCartClick={() => console.log("Cart clicked")}
        onLoginClick={() => console.log("Login clicked")}
      />

      <main className="flex-1">
        <section className="py-20 lg:py-28 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16 space-y-6">
              <div className="inline-block">
                <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-semibold uppercase tracking-wide">
                  Nosso Trabalho
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Portfolio de Projetos
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Conheça alguns dos projetos que desenvolvemos para grandes marcas e empresas de todo o Brasil.
                Qualidade, criatividade e entrega no prazo.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full"
                  data-testid={`filter-${category}`}
                >
                  {category}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {filteredItems.map((item) => (
                <Card 
                  key={item.id}
                  className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300"
                  data-testid={`portfolio-item-${item.id}`}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                    <img 
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <Button 
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Badge className="mb-2">{item.category}</Badge>
                      <h3 className="font-bold text-xl tracking-tight line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-semibold text-foreground">{item.client}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {item.location}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {item.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-primary">
                          Dimensões: {item.size}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-20">
                <p className="text-lg text-muted-foreground">
                  Nenhum projeto encontrado nesta categoria.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="py-20 lg:py-28 bg-gradient-to-br from-card via-card/50 to-background border-y border-card-border">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                Pronto para Iniciar Seu Projeto?
              </h2>
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                Entre em contato conosco e descubra como podemos transformar sua comunicação visual
                com a mesma qualidade e dedicação dos projetos acima.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  size="lg"
                  className="text-base px-8 py-6 h-auto"
                  onClick={() => window.location.href = '/'}
                >
                  Ver Produtos
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="text-base px-8 py-6 h-auto"
                >
                  Solicitar Orçamento
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
