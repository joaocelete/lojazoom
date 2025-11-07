import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { ArrowLeft, Package, Loader2, CheckCircle2 } from "lucide-react";
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { items, subtotal, artCreationFeeTotal, clearCart } = useCart();
  const { toast } = useToast();
  
  const shipping = 45.00;
  const total = subtotal + artCreationFeeTotal + shipping;
  
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [mpInitialized, setMpInitialized] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      setLocation("/login");
      return;
    }

    if (items.length === 0) {
      setLocation("/");
      return;
    }

    // Inicializar Mercado Pago SDK
    fetch("/api/payments/public-key")
      .then(res => res.json())
      .then(data => {
        initMercadoPago(data.publicKey, {
          locale: "pt-BR"
        });
        setMpInitialized(true);
      })
      .catch(err => {
        console.error("Erro ao carregar public key:", err);
        toast({
          title: "Erro",
          description: "Não foi possível carregar configuração de pagamento",
          variant: "destructive",
        });
      });
  }, [user, items, setLocation, toast]);

  const validateAddress = () => {
    return (
      shippingAddress.street &&
      shippingAddress.number &&
      shippingAddress.neighborhood &&
      shippingAddress.city &&
      shippingAddress.state &&
      shippingAddress.zipCode
    );
  };

  const createOrder = async () => {
    try {
      const fullAddress = `${shippingAddress.street}, ${shippingAddress.number}${shippingAddress.complement ? ' - ' + shippingAddress.complement : ''}, ${shippingAddress.neighborhood}, ${shippingAddress.city} - ${shippingAddress.state}, CEP: ${shippingAddress.zipCode}`;

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            width: item.width,
            height: item.height,
            artOption: item.artOption,
            artFile: item.artFile,
            artCreationFee: item.artCreationFee.toString(),
          })),
          shippingAddress: fullAddress,
          paymentMethod: "mercadopago",
          subtotal: subtotal.toString(),
          artCreationFee: artCreationFeeTotal.toString(),
          shipping: shipping.toString(),
          total: total.toString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar pedido");
      }

      const data = await response.json();
      return data.order.id;
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      throw error;
    }
  };

  const onSubmit = async ({ selectedPaymentMethod, formData }: any) => {
    if (!validateAddress()) {
      toast({
        title: "Endereço incompleto",
        description: "Preencha todos os campos do endereço",
        variant: "destructive",
      });
      return new Promise((_, reject) => reject());
    }

    try {
      // Criar pedido primeiro
      const orderIdCreated = await createOrder();
      setOrderId(orderIdCreated);

      console.log("Método de pagamento:", selectedPaymentMethod);
      console.log("Dados do formulário:", formData);

      // Processar pagamento baseado no método
      let endpoint = "/api/payments/process";
      let requestBody = {
        ...formData,
        orderId: orderIdCreated,
      };

      // Ajustar endpoint e dados baseado no método
      if (selectedPaymentMethod === "pix" || formData.payment_method_id === "pix") {
        endpoint = "/api/payments/pix";
        requestBody = {
          orderId: orderIdCreated,
          payer: formData.payer,
        };
      } else if (formData.payment_method_id?.includes("bolbradesco")) {
        endpoint = "/api/payments/boleto";
        requestBody = {
          orderId: orderIdCreated,
          payer: formData.payer,
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erro ao processar pagamento");
      }

      // Tratamento especial para PIX (mostrar QR Code)
      if (result.qr_code) {
        toast({
          title: "PIX gerado!",
          description: "Escaneie o QR Code ou copie o código",
        });
        return;
      }

      // Tratamento especial para Boleto (abrir em nova aba)
      if (result.ticket_url) {
        toast({
          title: "Boleto gerado!",
          description: "Abrindo boleto em nova aba...",
        });
        window.open(result.ticket_url, "_blank");
        setPaymentSuccess(true);
        setTimeout(() => {
          clearCart();
          queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
          setLocation("/");
        }, 2000);
        return;
      }

      // Pagamento com cartão - verificar status
      if (result.payment) {
        const status = result.payment.status;
        
        if (status === "approved") {
          setPaymentSuccess(true);
          toast({
            title: "Pagamento aprovado!",
            description: "Seu pedido foi confirmado com sucesso.",
          });
          clearCart();
          queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
          setTimeout(() => setLocation("/"), 2000);
        } else if (status === "pending") {
          toast({
            title: "Pagamento pendente",
            description: "Aguardando confirmação do pagamento.",
          });
        } else {
          throw new Error(result.payment.status_detail || "Pagamento não aprovado");
        }
      }

    } catch (error: any) {
      console.error("Erro no pagamento:", error);
      toast({
        title: "Erro ao processar pagamento",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
      return new Promise((_, reject) => reject());
    }
  };

  const onReady = () => {
    console.log("Payment Brick está pronto");
  };

  const onError = (error: any) => {
    console.error("Erro no Payment Brick:", error);
    toast({
      title: "Erro",
      description: "Ocorreu um erro ao carregar o formulário de pagamento",
      variant: "destructive",
    });
  };

  // Mostrar tela de sucesso
  if (paymentSuccess) {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Pagamento Processado!</h2>
            <p className="text-muted-foreground mb-6">
              Seu pedido foi confirmado e você receberá atualizações por email.
            </p>
            <Button onClick={() => setLocation("/")}>
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Coluna Esquerda - Resumo do Pedido */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Resumo do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Produtos */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-muted-foreground">
                          {item.width}m × {item.height}m = {(item.width * item.height).toFixed(2)}m²
                        </p>
                        {item.artOption === "create" && (
                          <p className="text-xs text-muted-foreground">+ Criação de arte</p>
                        )}
                      </div>
                      <span className="font-semibold">R$ {item.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totais */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  {artCreationFeeTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Criação de arte:</span>
                      <span>R$ {artCreationFeeTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frete:</span>
                    <span>R$ {shipping.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">R$ {total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Direita - Endereço e Pagamento */}
          <div className="md:col-span-2 space-y-6">
            {/* Endereço de Entrega */}
            <Card>
              <CardHeader>
                <CardTitle>Endereço de Entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="zipCode">CEP</Label>
                    <Input
                      id="zipCode"
                      value={shippingAddress.zipCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                      placeholder="00000-000"
                      data-testid="input-zipcode"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="street">Rua</Label>
                    <Input
                      id="street"
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      placeholder="Nome da rua"
                      data-testid="input-street"
                    />
                  </div>
                  <div>
                    <Label htmlFor="number">Número</Label>
                    <Input
                      id="number"
                      value={shippingAddress.number}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, number: e.target.value })}
                      placeholder="123"
                      data-testid="input-number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="complement">Complemento</Label>
                    <Input
                      id="complement"
                      value={shippingAddress.complement}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, complement: e.target.value })}
                      placeholder="Apto, Bloco, etc"
                      data-testid="input-complement"
                    />
                  </div>
                  <div>
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input
                      id="neighborhood"
                      value={shippingAddress.neighborhood}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, neighborhood: e.target.value })}
                      placeholder="Nome do bairro"
                      data-testid="input-neighborhood"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      placeholder="Nome da cidade"
                      data-testid="input-city"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="state">Estado (UF)</Label>
                    <Input
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value.toUpperCase() })}
                      placeholder="SP"
                      maxLength={2}
                      data-testid="input-state"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Brick do Mercado Pago */}
            <Card>
              <CardHeader>
                <CardTitle>Pagamento</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Escolha a forma de pagamento. Processamento seguro via Mercado Pago.
                </p>
              </CardHeader>
              <CardContent>
                {!mpInitialized ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-muted-foreground">Carregando formas de pagamento...</span>
                  </div>
                ) : !validateAddress() ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Preencha o endereço de entrega para continuar</p>
                  </div>
                ) : (
                  <div id="payment-brick-container">
                    <Payment
                      initialization={{
                        amount: total,
                        payer: {
                          email: user?.email || '',
                        }
                      }}
                      customization={{
                        paymentMethods: {
                          creditCard: 'all',
                          debitCard: 'all',
                          ticket: 'all',
                          bankTransfer: 'all',
                        },
                        visual: {
                          style: {
                            theme: 'default'
                          }
                        }
                      }}
                      onSubmit={onSubmit}
                      onReady={onReady}
                      onError={onError}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
