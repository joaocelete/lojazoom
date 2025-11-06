import { X, Trash2, ShoppingBag, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "@/contexts/CartContext";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const { items, removeItem, clearCart, subtotal } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  if (!isOpen) return null;

  const shipping = 45.00;
  const total = subtotal + shipping;

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("Login necessário");
      }

      const orderItems = items.map(item => ({
        productId: item.productId,
        width: item.width.toString(),
        height: item.height.toString(),
      }));

      const res = await apiRequest("POST", "/api/orders", {
        items: orderItems,
        shippingAddress: "Endereço padrão",
        paymentMethod: "pending",
        subtotal: subtotal.toString(),
        shipping: shipping.toString(),
        total: total.toString(),
        status: "pending",
      });

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Pedido criado com sucesso!",
        description: "Você será redirecionado para o pagamento.",
      });
      clearCart();
      onClose();
    },
    onError: (error: Error) => {
      if (error.message.includes("401")) {
        toast({
          title: "Login necessário",
          description: "Faça login para finalizar sua compra.",
          variant: "destructive",
        });
        setLocation("/login");
      } else {
        toast({
          title: "Erro ao criar pedido",
          description: "Tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    },
  });

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para finalizar sua compra.",
      });
      setLocation("/login");
      return;
    }
    checkoutMutation.mutate();
  };

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
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <h3 className="font-bold text-base truncate" data-testid={`text-cart-item-name-${item.id}`}>
                        {item.productName}
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
                onClick={handleCheckout}
                disabled={checkoutMutation.isPending}
                data-testid="button-checkout"
              >
                {checkoutMutation.isPending ? "Processando..." : "Finalizar Compra"}
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
