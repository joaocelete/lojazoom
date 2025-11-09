import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Mail, Lock, Phone, MapPin, FileText } from "lucide-react";

export default function Register() {
  const [, setLocation] = useLocation();
  const { register } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    fullName: "",
    cpf: "",
    phone: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
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
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "As senhas digitadas são diferentes",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
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
      });

      toast({
        title: "Cadastro realizado!",
        description: "Sua conta foi criada com sucesso",
      });

      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar",
        description: error.message || "Não foi possível criar sua conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <Button
            variant="ghost"
            onClick={() => setLocation("/login")}
            className="w-fit mb-2"
            data-testid="button-back-login"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <CardTitle className="text-3xl font-bold">Criar Conta</CardTitle>
          <CardDescription>
            Preencha seus dados para criar sua conta na PrintBrasil
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados de Acesso */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Dados de Acesso
              </h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="pl-10"
                      required
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome de Usuário</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="usuario"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="pl-10"
                      required
                      data-testid="input-name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    required
                    data-testid="input-password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    required
                    data-testid="input-confirm-password"
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
                    required
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
                    required
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
                      required
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
                    required
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
                    required
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
                    required
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
                    required
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
                    required
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
                    required
                    data-testid="input-state"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg"
              disabled={loading}
              data-testid="button-register"
            >
              {loading ? "Criando conta..." : "Criar Conta"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <button
                type="button"
                onClick={() => setLocation("/login")}
                className="text-primary font-semibold hover:underline"
                data-testid="link-login"
              >
                Fazer login
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
