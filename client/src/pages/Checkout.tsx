import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, CreditCard, QrCode, FileText, Loader2 } from "lucide-react";

declare global {
  interface Window {
    MercadoPago: any;
  }
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { items, subtotal, artCreationFeeTotal, clearCart } = useCart();
  const { toast } = useToast();
  
  const shipping = 45.00;
  const total = subtotal + artCreationFeeTotal + shipping;
  
  const [paymentMethod, setPaymentMethod] = useState<"card" | "pix" | "boleto">("pix");
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [mpPublicKey, setMpPublicKey] = useState("");
  const [mp, setMp] = useState<any>(null);
  const [cardForm, setCardForm] = useState<any>(null);
  const [pixQrCode, setPixQrCode] = useState("");
  const [pixCopyPaste, setPixCopyPaste] = useState("");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    if (!user) {
      setLocation("/login");
      return;
    }

    if (items.length === 0) {
      setLocation("/");
      return;
    }

    // Carregar public key do Mercado Pago
    fetch("/api/payments/public-key")
      .then(res => res.json())
      .then(data => {
        setMpPublicKey(data.publicKey);
        loadMercadoPagoSDK(data.publicKey);
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

  const loadMercadoPagoSDK = (publicKey: string) => {
    if (window.MercadoPago) {
      const mercadopago = new window.MercadoPago(publicKey, {
        locale: "pt-BR",
      });
      setMp(mercadopago);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = () => {
      const mercadopago = new window.MercadoPago(publicKey, {
        locale: "pt-BR",
      });
      setMp(mercadopago);
    };
    document.body.appendChild(script);
  };

  useEffect(() => {
    if (mp && paymentMethod === "card" && !cardForm) {
      // Aguardar DOM estar pronto antes de inicializar
      setTimeout(() => {
        initializeCardForm();
      }, 100);
    }
  }, [mp, paymentMethod]);

  const initializeCardForm = async () => {
    if (!mp) return;

    // Verificar se elementos DOM existem
    const formElement = document.getElementById("form-checkout");
    if (!formElement) {
      console.error("Elemento form-checkout não encontrado");
      return;
    }

    try {
      const form = mp.cardForm({
        amount: String(total),
        iframe: true,
        form: {
          id: "form-checkout",
          cardNumber: {
            id: "form-checkout__cardNumber",
            placeholder: "Número do cartão",
          },
          expirationDate: {
            id: "form-checkout__expirationDate",
            placeholder: "MM/AA",
          },
          securityCode: {
            id: "form-checkout__securityCode",
            placeholder: "CVV",
          },
          cardholderName: {
            id: "form-checkout__cardholderName",
            placeholder: "Nome impresso no cartão",
          },
          issuer: {
            id: "form-checkout__issuer",
            placeholder: "Banco emissor",
          },
          installments: {
            id: "form-checkout__installments",
            placeholder: "Parcelas",
          },
          identificationType: {
            id: "form-checkout__identificationType",
          },
          identificationNumber: {
            id: "form-checkout__identificationNumber",
            placeholder: "CPF",
          },
          cardholderEmail: {
            id: "form-checkout__cardholderEmail",
            placeholder: "E-mail",
          },
        },
        callbacks: {
          onFormMounted: (error: any) => {
            if (error) {
              console.error("Erro ao montar formulário:", error);
              toast({
                title: "Erro",
                description: "Não foi possível carregar formulário de cartão",
                variant: "destructive",
              });
            } else {
              console.log("Formulário de cartão montado com sucesso");
            }
          },
          onSubmit: async (event: any) => {
            event.preventDefault();
            await handleCardPayment();
          },
        },
      });

      setCardForm(form);
    } catch (error) {
      console.error("Erro ao inicializar cardForm:", error);
      toast({
        title: "Erro",
        description: "Falha ao configurar pagamento com cartão",
        variant: "destructive",
      });
    }
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
          paymentMethod: paymentMethod,
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

  const handleCardPayment = async () => {
    if (!cardForm) return;

    setLoading(true);

    try {
      const orderIdCreated = await createOrder();
      setOrderId(orderIdCreated);

      const cardData = cardForm.getCardFormData();

      const response = await fetch("/api/payments/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          token: cardData.token,
          orderId: orderIdCreated,
          transaction_amount: cardData.amount,
          installments: cardData.installments,
          payment_method_id: cardData.paymentMethodId,
          payer: {
            email: cardData.cardholderEmail || user?.email,
            identification: {
              type: cardData.identificationType,
              number: cardData.identificationNumber,
            },
          },
          description: `Pedido #${orderIdCreated} - PrintBrasil`,
        }),
      });

      const result = await response.json();

      if (result.payment.status === "approved") {
        toast({
          title: "Pagamento aprovado!",
          description: "Seu pedido foi confirmado com sucesso.",
        });
        clearCart();
        queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
        setLocation("/");
      } else {
        toast({
          title: "Pagamento não aprovado",
          description: result.payment.status_detail || "Tente outro método de pagamento",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Erro no pagamento:", error);
      toast({
        title: "Erro ao processar pagamento",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePixPayment = async () => {
    setLoading(true);

    try {
      const orderIdCreated = await createOrder();
      setOrderId(orderIdCreated);

      const response = await fetch("/api/payments/pix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          orderId: orderIdCreated,
          payer: {
            email: user?.email,
            identification: {
              type: "CPF",
              number: cpf.replace(/\D/g, ""),
            },
          },
        }),
      });

      const result = await response.json();

      if (result.qr_code) {
        setPixCopyPaste(result.qr_code);
        setPixQrCode(result.qr_code_base64 || "");
        
        toast({
          title: "PIX gerado!",
          description: "Escaneie o QR Code ou copie o código",
        });
      }
    } catch (error: any) {
      console.error("Erro ao gerar PIX:", error);
      toast({
        title: "Erro ao gerar PIX",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleBoletoPayment = async () => {
    setLoading(true);

    try {
      const orderIdCreated = await createOrder();
      setOrderId(orderIdCreated);

      const response = await fetch("/api/payments/boleto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          orderId: orderIdCreated,
          payer: {
            email: user?.email,
            identification: {
              type: "CPF",
              number: cpf.replace(/\D/g, ""),
            },
          },
        }),
      });

      const result = await response.json();

      if (result.ticket_url) {
        toast({
          title: "Boleto gerado!",
          description: "Abrindo boleto em nova aba...",
        });
        
        // Abrir boleto em nova aba
        window.open(result.ticket_url, "_blank");
        
        // Limpar carrinho e redirecionar
        setTimeout(() => {
          clearCart();
          queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
          setLocation("/");
        }, 2000);
      }
    } catch (error: any) {
      console.error("Erro ao gerar boleto:", error);
      toast({
        title: "Erro ao gerar boleto",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCopyPaste);
    toast({
      title: "Copiado!",
      description: "Código PIX copiado para a área de transferência",
    });
  };

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

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return cpf;
  };

  const isValidCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.length === 11;
  };

  if (pixQrCode) {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Pagamento via PIX</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Escaneie o QR Code abaixo com o app do seu banco
              </p>
              
              {pixQrCode && (
                <div className="flex justify-center">
                  <img 
                    src={`data:image/png;base64,${pixQrCode}`} 
                    alt="QR Code PIX"
                    className="w-64 h-64 border rounded-lg"
                  />
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium">Ou copie o código PIX:</p>
                <div className="flex gap-2">
                  <Input 
                    value={pixCopyPaste} 
                    readOnly 
                    className="font-mono text-xs"
                    data-testid="input-pix-code"
                  />
                  <Button onClick={copyPixCode} variant="outline" data-testid="button-copy-pix">
                    Copiar
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⏱️ Aguardando pagamento... Seu pedido será confirmado automaticamente após o pagamento.
                </p>
              </div>

              <Button 
                onClick={() => {
                  clearCart();
                  setLocation("/");
                }} 
                className="w-full"
                data-testid="button-finish"
              >
                Concluir
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <Button
        variant="ghost"
        onClick={() => setLocation("/")}
        className="mb-6"
        data-testid="button-back"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Resumo do pedido */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => {
                const area = item.width * item.height;
                const itemTotal = item.total;
                const artFee = item.artCreationFee;

                return (
                  <div key={item.id} className="text-sm space-y-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-muted-foreground">
                      {item.width}m × {item.height}m = {area.toFixed(2)}m²
                    </p>
                    <p className="text-muted-foreground">
                      R$ {itemTotal.toFixed(2)}
                      {artFee > 0 && ` + R$ ${artFee.toFixed(2)} (arte)`}
                    </p>
                  </div>
                );
              })}

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Frete:</span>
                  <span>R$ {shipping.toFixed(2)}</span>
                </div>

                {artCreationFeeTotal > 0 && (
                  <div className="flex justify-between">
                    <span>Criação de arte:</span>
                    <span>R$ {artCreationFeeTotal.toFixed(2)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-primary">R$ {total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulário de checkout */}
        <div className="lg:col-span-2 space-y-6">
          {/* Endereço de entrega */}
          <Card>
            <CardHeader>
              <CardTitle>Endereço de Entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                    placeholder="00000-000"
                    required
                    data-testid="input-zipcode"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="street">Rua</Label>
                  <Input
                    id="street"
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                    required
                    data-testid="input-street"
                  />
                </div>
                <div>
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={shippingAddress.number}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, number: e.target.value })}
                    required
                    data-testid="input-number"
                  />
                </div>
                <div>
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={shippingAddress.complement}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, complement: e.target.value })}
                    data-testid="input-complement"
                  />
                </div>
                <div>
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={shippingAddress.neighborhood}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, neighborhood: e.target.value })}
                    required
                    data-testid="input-neighborhood"
                  />
                </div>
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    required
                    data-testid="input-city"
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    maxLength={2}
                    required
                    data-testid="input-state"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Método de pagamento */}
          <Card>
            <CardHeader>
              <CardTitle>Método de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pix" data-testid="tab-pix">
                    <QrCode className="mr-2 h-4 w-4" />
                    PIX
                  </TabsTrigger>
                  <TabsTrigger value="card" data-testid="tab-card">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Cartão
                  </TabsTrigger>
                  <TabsTrigger value="boleto" data-testid="tab-boleto">
                    <FileText className="mr-2 h-4 w-4" />
                    Boleto
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pix" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="cpf-pix">CPF</Label>
                    <Input
                      id="cpf-pix"
                      value={cpf}
                      onChange={(e) => setCpf(formatCPF(e.target.value))}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      required
                      data-testid="input-cpf-pix"
                    />
                  </div>

                  <Button
                    onClick={handlePixPayment}
                    disabled={!validateAddress() || !isValidCPF(cpf) || loading}
                    className="w-full"
                    data-testid="button-pay-pix"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Gerar QR Code PIX
                  </Button>
                </TabsContent>

                <TabsContent value="card" className="mt-4">
                  <form id="form-checkout" className="space-y-4">
                    <div>
                      <Label>Número do cartão</Label>
                      <div id="form-checkout__cardNumber" className="border rounded-md"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Validade</Label>
                        <div id="form-checkout__expirationDate" className="border rounded-md"></div>
                      </div>
                      <div>
                        <Label>CVV</Label>
                        <div id="form-checkout__securityCode" className="border rounded-md"></div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="form-checkout__cardholderName">Nome no cartão</Label>
                      <Input id="form-checkout__cardholderName" data-testid="input-cardholder-name" />
                    </div>

                    <div>
                      <Label htmlFor="form-checkout__cardholderEmail">E-mail</Label>
                      <Input 
                        id="form-checkout__cardholderEmail" 
                        type="email" 
                        defaultValue={user?.email}
                        data-testid="input-cardholder-email"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Banco emissor</Label>
                        <select id="form-checkout__issuer" className="w-full border rounded-md p-2" data-testid="select-issuer"></select>
                      </div>
                      <div>
                        <Label>Parcelas</Label>
                        <select id="form-checkout__installments" className="w-full border rounded-md p-2" data-testid="select-installments"></select>
                      </div>
                    </div>

                    <input type="hidden" id="form-checkout__identificationType" value="CPF" />
                    <div>
                      <Label htmlFor="form-checkout__identificationNumber">CPF</Label>
                      <Input id="form-checkout__identificationNumber" placeholder="000.000.000-00" data-testid="input-cpf-card" />
                    </div>

                    <Button
                      type="submit"
                      disabled={!validateAddress() || loading}
                      className="w-full"
                      data-testid="button-pay-card"
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Pagar com Cartão
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="boleto" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="cpf-boleto">CPF</Label>
                    <Input
                      id="cpf-boleto"
                      value={cpf}
                      onChange={(e) => setCpf(formatCPF(e.target.value))}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      required
                      data-testid="input-cpf-boleto"
                    />
                  </div>

                  <Button
                    onClick={handleBoletoPayment}
                    disabled={!validateAddress() || !isValidCPF(cpf) || loading}
                    className="w-full"
                    data-testid="button-pay-boleto"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Gerar Boleto
                  </Button>

                  {pixQrCode && (
                    <div className="mt-4 p-4 bg-muted rounded-md">
                      <p className="text-sm font-semibold mb-2">Boleto gerado com sucesso!</p>
                      <p className="text-sm text-muted-foreground">
                        Use o link abaixo para visualizar e pagar seu boleto.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
