import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Ruler } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  pricePerM2: number;
  image: string;
  onAddToCart?: (productId: string, width: number, height: number, total: number) => void;
}

export default function ProductCard({ 
  id, 
  name, 
  description, 
  pricePerM2, 
  image,
  onAddToCart 
}: ProductCardProps) {
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  const calculateTotal = () => {
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    return w * h * pricePerM2;
  };

  const total = calculateTotal();
  const area = (parseFloat(width) || 0) * (parseFloat(height) || 0);

  const handleAddToCart = () => {
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    if (w > 0 && h > 0) {
      onAddToCart?.(id, w, h, total);
      console.log("Added to cart:", { id, width: w, height: h, total });
    }
  };

  return (
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300" data-testid={`card-product-${id}`}>
      <div className="aspect-square overflow-hidden bg-gradient-to-br from-muted to-muted/50 relative">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          data-testid={`img-product-${id}`}
        />
        <div className="absolute top-4 right-4">
          <div className="bg-primary px-3 py-1 rounded-full shadow-lg">
            <span className="text-sm font-bold text-primary-foreground">Premium</span>
          </div>
        </div>
      </div>
      
      <CardHeader className="space-y-3 pb-4">
        <h3 className="font-bold text-xl tracking-tight" data-testid={`text-product-name-${id}`}>
          {name}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-product-description-${id}`}>
          {description}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-primary" data-testid={`text-product-price-${id}`}>
            R$ {pricePerM2.toFixed(2)}
          </span>
          <span className="text-sm text-muted-foreground font-medium">/m²</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <Ruler className="h-4 w-4" />
          <span>Calcule suas dimensões</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`width-${id}`} className="text-sm font-medium">Largura (m)</Label>
            <Input
              id={`width-${id}`}
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="h-11 text-base"
              data-testid={`input-width-${id}`}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`height-${id}`} className="text-sm font-medium">Altura (m)</Label>
            <Input
              id={`height-${id}`}
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="h-11 text-base"
              data-testid={`input-height-${id}`}
            />
          </div>
        </div>

        {total > 0 && (
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-lg p-5 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">Área total</span>
              <span className="font-semibold">{area.toFixed(2)} m²</span>
            </div>
            <div className="pt-2 border-t border-primary/20">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Valor Total</div>
              <div className="text-3xl font-bold text-primary" data-testid={`text-total-${id}`}>
                R$ {total.toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2">
        <Button 
          className="w-full gap-2 h-12 text-base font-semibold" 
          disabled={!width || !height || parseFloat(width) <= 0 || parseFloat(height) <= 0}
          onClick={handleAddToCart}
          data-testid={`button-add-to-cart-${id}`}
        >
          <ShoppingCart className="h-5 w-5" />
          Adicionar ao Carrinho
        </Button>
      </CardFooter>
    </Card>
  );
}
