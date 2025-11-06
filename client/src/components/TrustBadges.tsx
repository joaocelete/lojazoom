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
    <section className="py-12 bg-card border-y border-card-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div 
                key={index}
                className="text-center"
                data-testid={`trust-badge-${index}`}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mb-3">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{badge.title}</h3>
                <p className="text-sm text-muted-foreground">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
