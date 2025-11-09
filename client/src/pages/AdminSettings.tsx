import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save, Package } from "lucide-react";
import type { Setting } from "@shared/schema";

export default function AdminSettings() {
  const { toast } = useToast();
  
  const { data, isLoading } = useQuery<{ settings: Setting[] }>({
    queryKey: ["/api/settings"],
  });

  const settings = data?.settings || [];
  
  const getSettingValue = (key: string): string => {
    const setting = settings.find(s => s.key === key);
    return setting?.value || "";
  };

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
        description: "As configurações foram atualizadas com sucesso.",
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Configurações do Sistema
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure integrações e chaves de API
        </p>
      </div>

      <Card>
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            Melhor Envio - Cálculo de Frete
          </CardTitle>
          <CardDescription>
            Configure as credenciais da API do Melhor Envio para calcular frete automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="token">Token de Acesso</Label>
            <Input
              id="token"
              type="password"
              placeholder="Bearer ey..."
              value={melhorEnvioToken}
              onChange={(e) => setMelhorEnvioToken(e.target.value)}
              data-testid="input-melhor-envio-token"
            />
            <p className="text-sm text-muted-foreground">
              Obtenha o token em:{" "}
              <a 
                href="https://sandbox.melhorenvio.com.br/painel/gerenciar/tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Painel Melhor Envio (Sandbox)
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="environment">Ambiente</Label>
            <Select value={melhorEnvioEnv} onValueChange={setMelhorEnvioEnv}>
              <SelectTrigger data-testid="select-melhor-envio-env">
                <SelectValue placeholder="Selecione o ambiente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">Sandbox (Testes)</SelectItem>
                <SelectItem value="production">Produção</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Use <strong>Sandbox</strong> para testes e <strong>Produção</strong> para frete real
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">
              Como obter o token:
            </h4>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>Acesse o painel do Melhor Envio e faça login</li>
              <li>Vá em "Gerenciar" → "Tokens"</li>
              <li>Clique em "Novo Token"</li>
              <li>Selecione os escopos: <code className="bg-yellow-100 px-1 rounded">shipping-calculate</code>, <code className="bg-yellow-100 px-1 rounded">cart-read</code>, <code className="bg-yellow-100 px-1 rounded">cart-write</code></li>
              <li>Copie o token gerado e cole acima</li>
            </ol>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saveMutation.isPending}
            className="w-full"
            data-testid="button-save-settings"
          >
            <Save className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Outras Configurações</CardTitle>
          <CardDescription>
            Em breve: Configurações de Mercado Pago, email, etc.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Esta seção será expandida para incluir mais configurações do sistema
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
