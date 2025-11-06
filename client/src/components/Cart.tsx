import { X, Trash2, ShoppingBag, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CartItem {
  id: number;
  name: string;
  image: string;
  width: number;
  height: number;
  pricePerM2: number;
  total: number;
}

interface CartProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveItem?: (id: number) => void;
  onCheckout?: () => void;
}

export default function Cart({ items, isOpen, onClose, onRemoveItem, onCheckout }: CartProps) {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const shipping = 45.00; // todo: remove mock functionality
  const total = subtotal + shipping;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
        data-testid="overlay-cart"
      />
      
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-background border-l border-border z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
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
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <h3 className="font-bold text-base truncate" data-testid={`text-cart-item-name-${item.id}`}>
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="px-2 py-1 bg-muted rounded">
                          {item.width}m × {item.height}m
                        </span>
                        <span className="font-medium">
                          {(item.width * item.height).toFixed(2)}m²
                        </span>
                      </div>
                      <p className="text-lg font-bold text-primary" data-testid={`text-cart-item-price-${item.id}`}>
                        R$ {item.total.toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem?.(item.id)}
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
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold" data-testid="text-subtotal">R$ {subtotal.toFixed(2)}</span>
                </div>
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
                onClick={onCheckout}
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
    </>
  );
}
