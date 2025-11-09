import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Store, 
  MapPin, 
  Clock, 
  Mail, 
  Phone, 
  Globe, 
  CreditCard, 
  Truck,
  Save,
  CheckCircle2,
  Package
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Setting } from "@shared/schema";

export default function AdminSettings() {
  const { toast } = useToast();

  // Buscar configurações do banco de dados
  const { data, isLoading } = useQuery<{ settings: Setting[] }>({
    queryKey: ["/api/settings"],
  });

  const settings = data?.settings || [];
  
  const getSettingValue = (key: string): string => {
    const setting = settings.find(s => s.key === key);
    return setting?.value || "";
  };

  // Configurações da empresa
  const [companySettings, setCompanySettings] = useState({
    name: "PrintBrasil",
    tagline: "Comunicação Visual Profissional",
    email: "contato@printbrasil.com.br",
    phone: "(11) 3456-7890",
    website: "www.printbrasil.com.br",
    
    // Endereço de retirada
    pickupAddress: "Av. Paulista, 1000 - Bela Vista",
    pickupCity: "São Paulo - SP",
    pickupZipCode: "01310-100",
    pickupHours: "Segunda a Sexta, das 9h às 18h",
    
    // Informações adicionais
    description: "Especialistas em banners, adesivos e lonas de alta qualidade para sua empresa.",
  });

  // Configurações de API
  const [melhorEnvioToken, setMelhorEnvioToken] = useState("");
  const [melhorEnvioEnv, setMelhorEnvioEnv] = useState("sandbox");

  // Sincronizar state com dados carregados
  useEffect(() => {
    if (data?.settings) {
      const token = getSettingValue("MELHOR_ENVIO_TOKEN");
      const env = getSettingValue("MELHOR_ENVIO_ENV");
      
      setMelhorEnvioToken(token);
      setMelhorEnvioEnv(env || "sandbox");
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (settingsToSave: { key: string; value: string }[]) => {
      return apiRequest("/api/settings", {
        method: "PUT",
        body: JSON.stringify({ settings: settingsToSave }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Configurações salvas!",
        description: "As configurações de API foram atualizadas com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const settingsToSave = [
      { key: "MELHOR_ENVIO_TOKEN", value: melhorEnvioToken },
      { key: "MELHOR_ENVIO_ENV", value: melhorEnvioEnv },
    ];

    saveMutation.mutate(settingsToSave);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground mt-1">
          Gerencie as informações da sua empresa e integrações
        </p>
      </div>

      {/* Informações da Empresa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Informações da Empresa
          </CardTitle>
          <CardDescription>
            Dados principais que aparecem no site e documentos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nome da Empresa</Label>
              <Input
                id="company-name"
                value={companySettings.name}
                onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                data-testid="input-company-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Slogan</Label>
              <Input
                id="tagline"
                value={companySettings.tagline}
                onChange={(e) => setCompanySettings({ ...companySettings, tagline: e.target.value })}
                data-testid="input-tagline"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={companySettings.description}
              onChange={(e) => setCompanySettings({ ...companySettings, description: e.target.value })}
              rows={3}
              data-testid="input-description"
            />
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={companySettings.email}
                onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefone
              </Label>
              <Input
                id="phone"
                value={companySettings.phone}
                onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                data-testid="input-phone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Website
              </Label>
              <Input
                id="website"
                value={companySettings.website}
                onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                data-testid="input-website"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endereço de Retirada */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Endereço de Retirada
          </CardTitle>
          <CardDescription>
            Local onde os clientes podem retirar pedidos gratuitamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="pickup-address">Endereço Completo</Label>
              <Input
                id="pickup-address"
                value={companySettings.pickupAddress}
                onChange={(e) => setCompanySettings({ ...companySettings, pickupAddress: e.target.value })}
                placeholder="Rua, número, bairro"
                data-testid="input-pickup-address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickup-city">Cidade / Estado</Label>
              <Input
                id="pickup-city"
                value={companySettings.pickupCity}
                onChange={(e) => setCompanySettings({ ...companySettings, pickupCity: e.target.value })}
                data-testid="input-pickup-city"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickup-zip">CEP</Label>
              <Input
                id="pickup-zip"
                value={companySettings.pickupZipCode}
                onChange={(e) => setCompanySettings({ ...companySettings, pickupZipCode: e.target.value })}
                data-testid="input-pickup-zip"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickup-hours" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horário de Funcionamento
            </Label>
            <Input
              id="pickup-hours"
              value={companySettings.pickupHours}
              onChange={(e) => setCompanySettings({ ...companySettings, pickupHours: e.target.value })}
              placeholder="Segunda a Sexta, das 9h às 18h"
              data-testid="input-pickup-hours"
            />
          </div>

          <div className="bg-primary/10 p-4 rounded-lg mt-4">
            <p className="text-sm font-semibold mb-2">📍 Endereço Atual para Retirada:</p>
            <p className="text-sm">{companySettings.pickupAddress}</p>
            <p className="text-sm">{companySettings.pickupCity}, CEP: {companySettings.pickupZipCode}</p>
            <p className="text-sm text-muted-foreground mt-2">
              ⏰ {companySettings.pickupHours}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Configuração de APIs */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Configuração da API Melhor Envio
          </CardTitle>
          <CardDescription>
            Configure o token de acesso para cálculo de frete em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="melhor-envio-token">Token de Acesso</Label>
            <Input
              id="melhor-envio-token"
              type="password"
              value={melhorEnvioToken}
              onChange={(e) => setMelhorEnvioToken(e.target.value)}
              placeholder="Bearer seu-token-aqui..."
              data-testid="input-melhor-envio-token"
            />
            <p className="text-xs text-muted-foreground">
              Para obter seu token, acesse:{" "}
              <a 
                href="https://sandbox.melhorenvio.com.br/painel/gerenciar/tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Painel Melhor Envio → Tokens
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="melhor-envio-env">Ambiente</Label>
            <Select value={melhorEnvioEnv} onValueChange={setMelhorEnvioEnv}>
              <SelectTrigger id="melhor-envio-env" data-testid="select-melhor-envio-env">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">Sandbox (Testes)</SelectItem>
                <SelectItem value="production">Produção</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Use <strong>Sandbox</strong> para testes. Mude para <strong>Produção</strong> quando for ao ar.
            </p>
          </div>

          {melhorEnvioToken && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ Token configurado! O sistema está usando o Melhor Envio para calcular fretes.
              </p>
            </div>
          )}

          {!melhorEnvioToken && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Nenhum token configurado. O sistema usará fallback (preços estimados por distância).
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integrações */}
      <Card>
        <CardHeader>
          <CardTitle>Integrações Ativas</CardTitle>
          <CardDescription>
            Status das integrações com serviços externos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Mercado Pago */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border hover-elevate">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-md">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Mercado Pago</p>
                  <p className="text-xs text-muted-foreground">
                    Processamento de pagamentos (PIX, Cartão, Boleto)
                  </p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Ativo
              </Badge>
            </div>

            {/* Melhor Envio */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border hover-elevate">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-md">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Melhor Envio</p>
                  <p className="text-xs text-muted-foreground">
                    Cálculo de frete com múltiplas transportadoras
                  </p>
                </div>
              </div>
              <Badge variant="default" className={melhorEnvioToken ? "bg-green-600" : "bg-yellow-600"}>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {melhorEnvioToken ? "Ativo" : "Fallback"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Versão:</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stack:</span>
              <span className="font-medium">React + Node.js + TypeScript</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Banco de Dados:</span>
              <span className="font-medium">PostgreSQL (Neon)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ORM:</span>
              <span className="font-medium">Drizzle</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <div className="flex justify-end gap-3">
        <Button
          size="lg"
          onClick={handleSave}
          disabled={saveMutation.isPending}
          data-testid="button-save-settings"
        >
          {saveMutation.isPending ? (
            <>Salvando...</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações de API
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
