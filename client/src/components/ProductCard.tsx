import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Link } from "wouter";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  pricingType: 'per_m2' | 'fixed';
  pricePerM2?: number;
  fixedPrice?: number;
  image: string;
}

export default function ProductCard({ 
  id, 
  name, 
  description, 
  pricingType,
  pricePerM2, 
  fixedPrice,
  image,
}: ProductCardProps) {
  return (
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300" data-testid={`card-product-${id}`}>
      <Link href={`/product/${id}`}>
        <div className="aspect-square overflow-hidden bg-gradient-to-br from-muted to-muted/50 relative cursor-pointer">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            data-testid={`img-product-${id}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="bg-primary/90 backdrop-blur-sm text-primary-foreground px-6 py-3 rounded-full font-semibold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <Eye className="h-5 w-5" />
              Ver Detalhes
            </div>
          </div>
        </div>
      </Link>

      <CardHeader className="space-y-3 pb-4">
        <div className="space-y-2">
          <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors" data-testid={`text-product-name-${id}`}>
            {name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3" data-testid={`text-product-description-${id}`}>
            {description}
          </p>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-primary" data-testid={`text-price-${id}`}>
            {pricingType === 'per_m2' && pricePerM2 !== undefined
              ? `R$ ${pricePerM2.toFixed(2)}`
              : pricingType === 'fixed' && fixedPrice !== undefined
              ? `R$ ${fixedPrice.toFixed(2)}`
              : 'Preço sob consulta'}
          </span>
          {pricingType === 'per_m2' && (
            <span className="text-sm text-muted-foreground">/m²</span>
          )}
          {pricingType === 'fixed' && (
            <span className="text-sm text-muted-foreground">/unidade</span>
          )}
        </div>
      </CardHeader>

      <CardFooter className="pt-2">
        <Link href={`/product/${id}`} className="w-full">
          <Button 
            className="w-full gap-2 h-12 text-base font-semibold" 
            size="lg"
            data-testid={`button-view-product-${id}`}
          >
            <Eye className="h-5 w-5" />
            Ver Produto
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
