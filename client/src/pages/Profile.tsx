import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Mail, Phone, MapPin, FileText, Save } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Profile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    cpf: user?.cpf || "",
    phone: user?.phone || "",
    street: user?.street || "",
    number: user?.number || "",
    complement: user?.complement || "",
    neighborhood: user?.neighborhood || "",
    city: user?.city || "",
    state: user?.state || "",
    zipCode: user?.zipCode || "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{3})\d+?$/, "$1");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fullName: formData.fullName,
          cpf: formData.cpf.replace(/\D/g, ""),
          phone: formData.phone.replace(/\D/g, ""),
          street: formData.street,
          number: formData.number,
          complement: formData.complement,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode.replace(/\D/g, ""),
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar perfil");
      }

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso",
      });

      // Recarregar dados do usuário
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Não foi possível atualizar suas informações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-6"
            data-testid="button-back-home"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <User className="h-6 w-6 text-primary" />
                Meu Perfil
              </CardTitle>
              <CardDescription>
                Gerencie suas informações pessoais e endereço de entrega
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informações da Conta */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Informações da Conta
                  </h3>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>E-mail</Label>
                      <Input
                        type="email"
                        value={user.email}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        O e-mail não pode ser alterado
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Nome de Usuário</Label>
                      <Input
                        type="text"
                        value={user.name}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Dados Pessoais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Dados Pessoais
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="fullName">Nome Completo</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="João da Silva Santos"
                        value={formData.fullName}
                        onChange={(e) => handleChange("fullName", e.target.value)}
                        data-testid="input-full-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        type="text"
                        placeholder="000.000.000-00"
                        value={formData.cpf}
                        onChange={(e) => handleChange("cpf", formatCPF(e.target.value))}
                        maxLength={14}
                        data-testid="input-cpf"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(11) 99999-9999"
                          value={formData.phone}
                          onChange={(e) => handleChange("phone", formatPhone(e.target.value))}
                          className="pl-10"
                          maxLength={15}
                          data-testid="input-phone"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Endereço */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Endereço de Entrega
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="zipCode">CEP</Label>
                      <Input
                        id="zipCode"
                        type="text"
                        placeholder="00000-000"
                        value={formData.zipCode}
                        onChange={(e) => handleChange("zipCode", formatCEP(e.target.value))}
                        maxLength={9}
                        data-testid="input-zip-code"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-3">
                      <Label htmlFor="street">Rua</Label>
                      <Input
                        id="street"
                        type="text"
                        placeholder="Av. Paulista"
                        value={formData.street}
                        onChange={(e) => handleChange("street", e.target.value)}
                        data-testid="input-street"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="number">Número</Label>
                      <Input
                        id="number"
                        type="text"
                        placeholder="1000"
                        value={formData.number}
                        onChange={(e) => handleChange("number", e.target.value)}
                        data-testid="input-number"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        type="text"
                        placeholder="Apto 101"
                        value={formData.complement}
                        onChange={(e) => handleChange("complement", e.target.value)}
                        data-testid="input-complement"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input
                        id="neighborhood"
                        type="text"
                        placeholder="Bela Vista"
                        value={formData.neighborhood}
                        onChange={(e) => handleChange("neighborhood", e.target.value)}
                        data-testid="input-neighborhood"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-3">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        type="text"
                        placeholder="São Paulo"
                        value={formData.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        data-testid="input-city"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">UF</Label>
                      <Input
                        id="state"
                        type="text"
                        placeholder="SP"
                        value={formData.state}
                        onChange={(e) => handleChange("state", e.target.value.toUpperCase())}
                        maxLength={2}
                        data-testid="input-state"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-lg"
                  disabled={loading}
                  data-testid="button-save-profile"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
