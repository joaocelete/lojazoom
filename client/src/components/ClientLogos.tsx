export default function ClientLogos() {
  const clients = [
    "Coca-Cola",
    "McDonald's",
    "Nike",
    "Adidas",
    "Samsung",
    "LG",
    "Magazine Luiza",
    "Casas Bahia",
    "Renner",
    "C&A",
    "Ambev",
    "Nestlé",
    "Unilever",
    "Petrobras",
    "Bradesco",
    "Itaú"
  ];

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-background to-muted/20 border-y border-border overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 mb-12">
        <div className="text-center space-y-4">
          <div className="inline-block">
            <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-semibold uppercase tracking-wide">
              Confiança
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Marcas que Confiam em Nós
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Orgulhosamente atendendo grandes empresas e negócios locais com excelência
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
        
        <div className="flex gap-12 animate-scroll">
          {[...clients, ...clients, ...clients].map((client, index) => (
            <div 
              key={index}
              className="flex-shrink-0 flex items-center justify-center w-48 h-24 bg-card rounded-lg border border-card-border hover:shadow-lg transition-shadow"
              data-testid={`client-logo-${index}`}
            >
              <span className="text-xl font-bold text-foreground/80">{client}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        
        .animate-scroll {
          animation: scroll 40s linear infinite;
          width: max-content;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
