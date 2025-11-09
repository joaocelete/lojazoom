import { X, Trash2, ShoppingBag, Package, Upload, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const { items, removeItem, clearCart, subtotal, artCreationFeeTotal } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const shipping = 45.00;
  const total = subtotal + artCreationFeeTotal + shipping;

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para finalizar sua compra.",
      });
      setLocation("/login");
      return;
    }
    
    if (items.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar.",
        variant: "destructive",
      });
      return;
    }

    onClose();
    setLocation("/checkout");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        data-testid="overlay-cart"
      />
      
      <div className="relative h-full w-full max-w-lg bg-background border-l border-border flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-card to-background">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
            Seu Carrinho
          </h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-muted"
            data-testid="button-close-cart"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-muted rounded-full">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-semibold mb-2" data-testid="text-empty-cart">
                  Seu carrinho está vazio
                </p>
                <p className="text-sm text-muted-foreground">
                  Adicione produtos para continuar
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div 
                    key={item.id}
                    className="flex gap-4 p-4 bg-card rounded-lg border border-card-border hover:shadow-md transition-shadow"
                    data-testid={`cart-item-${item.id}`}
                  >
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <h3 className="font-bold text-base truncate" data-testid={`text-cart-item-name-${item.id}`}>
                        {item.productName}
                      </h3>
                      {item.pricingType === "fixed" ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="px-2 py-1 bg-muted rounded">
                            Quantidade: {item.quantity}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="px-2 py-1 bg-muted rounded">
                            {item.width}m × {item.height}m
                          </span>
                          <span className="font-medium">
                            {((item.width || 0) * (item.height || 0)).toFixed(2)}m²
                          </span>
                        </div>
                      )}
                      {item.artOption === "upload" && item.artFile && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Upload className="h-3 w-3" />
                          Arte: {item.artFile}
                        </div>
                      )}
                      {item.artOption === "create" && (
                        <div className="text-xs text-primary flex items-center gap-1">
                          <Palette className="h-3 w-3" />
                          Criação de arte (+R$ 35,00)
                        </div>
                      )}
                      <p className="text-lg font-bold text-primary" data-testid={`text-cart-item-price-${item.id}`}>
                        R$ {item.total.toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="rounded-full hover:bg-destructive/10 flex-shrink-0"
                      data-testid={`button-remove-item-${item.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t border-border p-6 bg-gradient-to-t from-card to-background space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">Subtotal produtos</span>
                  <span className="font-semibold" data-testid="text-subtotal">R$ {subtotal.toFixed(2)}</span>
                </div>
                {artCreationFeeTotal > 0 && (
                  <div className="flex justify-between text-base">
                    <span className="text-muted-foreground">Criação de arte</span>
                    <span className="font-semibold" data-testid="text-art-fee">R$ {artCreationFeeTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">Frete estimado</span>
                  <span className="font-semibold" data-testid="text-shipping">R$ {shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-3 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary" data-testid="text-cart-total">R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <Button 
                className="w-full h-14 text-base font-bold shadow-lg" 
                size="lg"
                onClick={handleCheckout}
                data-testid="button-checkout"
              >
                Finalizar Compra
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                Pagamento seguro via Mercado Pago • Pix, Cartão ou Boleto
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
