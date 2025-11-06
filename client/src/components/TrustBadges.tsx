import { Award, Zap, Shield, Headphones } from "lucide-react";

export default function TrustBadges() {
  const badges = [
    {
      icon: Award,
      title: "Qualidade Premium",
      description: "Materiais de primeira linha"
    },
    {
      icon: Zap,
      title: "Entrega Rápida",
      description: "Produção em até 48h"
    },
    {
      icon: Shield,
      title: "Melhor Preço",
      description: "Garantia de qualidade"
    },
    {
      icon: Headphones,
      title: "Suporte 24/7",
      description: "Atendimento especializado"
    }
  ];

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div 
                key={index}
                className="text-center group"
                data-testid={`trust-badge-${index}`}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Icon className="h-8 w-8 lg:h-10 lg:w-10 text-primary" />
                </div>
                <h3 className="font-bold text-base lg:text-lg mb-2">{badge.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
