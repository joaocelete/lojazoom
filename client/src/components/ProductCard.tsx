import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  id: number;
  name: string;
  description: string;
  pricePerM2: number;
  image: string;
  onAddToCart?: (productId: number, width: number, height: number, total: number) => void;
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

  const handleAddToCart = () => {
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    if (w > 0 && h > 0) {
      onAddToCart?.(id, w, h, total);
      console.log("Added to cart:", { id, width: w, height: h, total });
    }
  };

  return (
    <Card className="overflow-hidden hover-elevate" data-testid={`card-product-${id}`}>
      <div className="aspect-square overflow-hidden bg-muted">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover"
          data-testid={`img-product-${id}`}
        />
      </div>
      
      <CardHeader className="space-y-2">
        <h3 className="font-semibold text-lg" data-testid={`text-product-name-${id}`}>
          {name}
        </h3>
        <p className="text-sm text-muted-foreground" data-testid={`text-product-description-${id}`}>
          {description}
        </p>
        <div className="text-primary font-bold text-xl" data-testid={`text-product-price-${id}`}>
          R$ {pricePerM2.toFixed(2)}/m²
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor={`width-${id}`} className="text-xs">Largura (m)</Label>
            <Input
              id={`width-${id}`}
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              data-testid={`input-width-${id}`}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`height-${id}`} className="text-xs">Altura (m)</Label>
            <Input
              id={`height-${id}`}
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              data-testid={`input-height-${id}`}
            />
          </div>
        </div>

        {total > 0 && (
          <div className="bg-primary/10 border border-primary/20 rounded-md p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Total</div>
            <div className="text-2xl font-bold text-primary" data-testid={`text-total-${id}`}>
              R$ {total.toFixed(2)}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full gap-2" 
          disabled={!width || !height || parseFloat(width) <= 0 || parseFloat(height) <= 0}
          onClick={handleAddToCart}
          data-testid={`button-add-to-cart-${id}`}
        >
          <ShoppingCart className="h-4 w-4" />
          Adicionar ao Carrinho
        </Button>
      </CardFooter>
    </Card>
  );
}
