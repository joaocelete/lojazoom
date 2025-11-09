import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { ArrowLeft, Package, Loader2, CheckCircle2, Truck, CreditCard, MapPin } from "lucide-react";
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

interface ShippingOption {
  id: number;
  name: string;
  service: string;
  delivery_time: number;
  price: number;
  discount: number;
  final_price: number;
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { items, subtotal, artCreationFeeTotal, clearCart } = useCart();
  const { toast } = useToast();
  
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('delivery');
  
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
  });
  
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [mpInitialized, setMpInitialized] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const shipping = deliveryType === 'pickup' ? 0 : (selectedShipping?.final_price || 0);
  const total = subtotal + artCreationFeeTotal + shipping;

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

  const calculateShipping = async (cep: string) => {
    if (cep.replace(/\D/g, "").length !== 8) {
      return;
    }

    setLoadingShipping(true);
    try {
      const response = await fetch("/api/shipping/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          destinationCEP: cep,
          packageDetails: {
            height: 10,   // cm - diâmetro do tubo
            width: 10,    // cm - diâmetro do tubo  
            length: 60,   // cm - comprimento do tubo
            weight: 0.5   // kg - peso médio
          }
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao calcular frete");
      }

      const data = await response.json();
      setShippingOptions(data.options || []);
      
      // Selecionar automaticamente a primeira opção (geralmente a mais barata)
      if (data.options && data.options.length > 0) {
        setSelectedShipping(data.options[0]);
      }

      toast({
        title: "Frete calculado!",
        description: `${data.options?.length || 0} opções disponíveis`,
      });
    } catch (error) {
      console.error("Erro ao calcular frete:", error);
      toast({
        title: "Erro",
        description: "Não foi possível calcular o frete. Verifique o CEP.",
        variant: "destructive",
      });
    } finally {
      setLoadingShipping(false);
    }
  };

  const handleZipCodeChange = (value: string) => {
    setShippingAddress({ ...shippingAddress, zipCode: value });
    
    // Auto-calcular quando CEP tiver 8 dígitos
    const cleanCEP = value.replace(/\D/g, "");
    if (cleanCEP.length === 8) {
      calculateShipping(value);
    }
  };

  const validateAddress = () => {
    // Se for retirada, não precisa validar endereço
    if (deliveryType === 'pickup') {
      return true;
    }
    
    // Se for entrega, validar endereço completo e frete selecionado
    return (
      shippingAddress.street &&
      shippingAddress.number &&
      shippingAddress.neighborhood &&
      shippingAddress.city &&
      shippingAddress.state &&
      shippingAddress.zipCode &&
      selectedShipping !== null
    );
  };

  const createOrder = async () => {
    try {
      const fullAddress = deliveryType === 'pickup' 
        ? 'Retirada no Local - Av. Paulista, 1000, São Paulo - SP'
        : `${shippingAddress.street}, ${shippingAddress.number}${shippingAddress.complement ? ' - ' + shippingAddress.complement : ''}, ${shippingAddress.neighborhood}, ${shippingAddress.city} - ${shippingAddress.state}, CEP: ${shippingAddress.zipCode}`;

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
          deliveryType,
          shippingAddress: fullAddress,
          paymentMethod: "mercadopago",
          subtotal: subtotal.toString(),
          artCreationFee: artCreationFeeTotal.toString(),
          shipping: shipping.toString(),
          total: total.toString(),
          shippingCarrier: deliveryType === 'pickup' ? 'Retirada' : selectedShipping?.name,
          shippingService: deliveryType === 'pickup' ? 'Presencial' : selectedShipping?.service,
          shippingDeliveryDays: deliveryType === 'pickup' ? 0 : selectedShipping?.delivery_time,
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
      const message = deliveryType === 'pickup' 
        ? "Erro ao validar dados do pedido"
        : "Preencha o endereço e escolha um método de envio";
      
      toast({
        title: "Dados incompletos",
        description: message,
        variant: "destructive",
      });
      return new Promise((_, reject) => reject());
    }

    try {
      const orderIdCreated = await createOrder();
      setOrderId(orderIdCreated);

      console.log("Método de pagamento:", selectedPaymentMethod);
      console.log("Dados do formulário:", formData);

      let endpoint = "/api/payments/process";
      let requestBody = {
        ...formData,
        orderId: orderIdCreated,
      };

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

      if (result.qr_code) {
        toast({
          title: "PIX gerado!",
          description: "Escaneie o QR Code ou copie o código",
        });
        return;
      }

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
    <div className="min-h-screen bg-background py-4 md:py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-4 md:mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <h1 className="text-2xl md:text-3xl font-bold mb-6">Finalizar Pedido</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Coluna Principal - Endereço e Pagamento */}
          <div className="lg:col-span-2 space-y-6">
            {/* 0. Escolher Tipo de Entrega */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Tipo de Entrega
                </CardTitle>
                <CardDescription>Escolha como deseja receber seu pedido</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={deliveryType} 
                  onValueChange={(value) => setDeliveryType(value as 'pickup' | 'delivery')}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="delivery" id="delivery" className="peer sr-only" />
                    <Label
                      htmlFor="delivery"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover-elevate cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                      data-testid="option-delivery"
                    >
                      <Truck className="mb-3 h-6 w-6" />
                      <div className="text-center">
                        <div className="font-semibold">Entrega no Endereço</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Receba em casa com frete calculado
                        </div>
                      </div>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="pickup" id="pickup" className="peer sr-only" />
                    <Label
                      htmlFor="pickup"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover-elevate cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                      data-testid="option-pickup"
                    >
                      <Package className="mb-3 h-6 w-6" />
                      <div className="text-center">
                        <div className="font-semibold">Retirada no Local</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Grátis - Retire em nossa loja
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {deliveryType === 'pickup' && (
                  <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm font-semibold mb-1">📍 Endereço para Retirada:</p>
                    <p className="text-sm">Av. Paulista, 1000 - Bela Vista</p>
                    <p className="text-sm">São Paulo - SP, CEP: 01310-100</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Horário: Segunda a Sexta, das 9h às 18h
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 1. Endereço de Entrega */}
            {deliveryType === 'delivery' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Endereço de Entrega
                  </CardTitle>
                  <CardDescription>Onde você quer receber seu pedido?</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label htmlFor="zipCode">CEP *</Label>
                    <Input
                      id="zipCode"
                      value={shippingAddress.zipCode}
                      onChange={(e) => handleZipCodeChange(e.target.value)}
                      placeholder="00000-000"
                      maxLength={9}
                      data-testid="input-zipcode"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="street">Rua *</Label>
                    <Input
                      id="street"
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      placeholder="Nome da rua"
                      data-testid="input-street"
                    />
                  </div>
                  <div>
                    <Label htmlFor="number">Número *</Label>
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
                    <Label htmlFor="neighborhood">Bairro *</Label>
                    <Input
                      id="neighborhood"
                      value={shippingAddress.neighborhood}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, neighborhood: e.target.value })}
                      placeholder="Nome do bairro"
                      data-testid="input-neighborhood"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      placeholder="Nome da cidade"
                      data-testid="input-city"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="state">Estado (UF) *</Label>
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
            )}

            {/* 2. Método de Envio */}
            {deliveryType === 'delivery' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Método de Envio
                </CardTitle>
                <CardDescription>
                  {loadingShipping ? "Calculando frete..." : "Escolha como deseja receber"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingShipping ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3">Calculando opções de frete...</span>
                  </div>
                ) : shippingOptions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Truck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Preencha o CEP para calcular o frete</p>
                  </div>
                ) : (
                  <RadioGroup
                    value={selectedShipping?.id.toString()}
                    onValueChange={(value) => {
                      const option = shippingOptions.find(opt => opt.id.toString() === value);
                      setSelectedShipping(option || null);
                    }}
                  >
                    <div className="space-y-3">
                      {shippingOptions.map((option) => (
                        <div
                          key={option.id}
                          className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedShipping?.id === option.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedShipping(option)}
                        >
                          <RadioGroupItem value={option.id.toString()} id={`shipping-${option.id}`} />
                          <Label
                            htmlFor={`shipping-${option.id}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold">{option.name} - {option.service}</p>
                                <p className="text-sm text-muted-foreground">
                                  Entrega em até {option.delivery_time} dia{option.delivery_time > 1 ? 's' : ''} úteis
                                </p>
                                {option.discount > 0 && (
                                  <p className="text-xs text-green-600">
                                    Economia de R$ {option.discount.toFixed(2)}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                {option.discount > 0 && (
                                  <p className="text-sm text-muted-foreground line-through">
                                    R$ {option.price.toFixed(2)}
                                  </p>
                                )}
                                <p className="font-bold text-lg">
                                  R$ {option.final_price.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}
              </CardContent>
            </Card>
            )}

            {/* 3. Pagamento - DESTAQUE */}
            <Card className="border-2 border-primary/20">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CreditCard className="h-6 w-6" />
                  Pagamento Seguro
                </CardTitle>
                <CardDescription className="text-base">
                  Processamento 100% seguro via <strong>Mercado Pago</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {!mpInitialized ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-muted-foreground">Carregando formas de pagamento...</span>
                  </div>
                ) : !validateAddress() ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Preencha o endereço e escolha o método de envio para continuar
                    </p>
                  </div>
                ) : (
                  <div id="payment-brick-container" className="min-h-[400px]">
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

          {/* Coluna Lateral - Resumo do Pedido (Sticky no desktop) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Resumo do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Produtos */}
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="pb-3 border-b last:border-0">
                        <div className="flex justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.width}m × {item.height}m = {(item.width * item.height).toFixed(2)}m²
                            </p>
                            {item.artOption === "create" && (
                              <p className="text-xs text-primary">+ Criação de arte</p>
                            )}
                          </div>
                          <span className="font-semibold text-sm">R$ {item.total.toFixed(2)}</span>
                        </div>
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
                      <span>
                        {selectedShipping ? (
                          <>R$ {shipping.toFixed(2)}</>
                        ) : (
                          <span className="text-xs">A calcular</span>
                        )}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold pt-2">
                      <span>Total:</span>
                      <span className="text-primary">R$ {total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Informação de Entrega */}
                  {selectedShipping && (
                    <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Previsão de entrega:</p>
                      <p className="font-semibold text-sm">
                        {selectedShipping.delivery_time} dia{selectedShipping.delivery_time > 1 ? 's' : ''} úteis
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedShipping.name} {selectedShipping.service}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
