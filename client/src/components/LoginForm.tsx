import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Mail } from "lucide-react";
import { useState } from "react";

interface LoginFormProps {
  onLogin?: (username: string, password: string) => void;
  onRegisterClick?: () => void;
}

export default function LoginForm({ onLogin, onRegisterClick }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin?.(username, password);
    console.log("Login attempt:", { username });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-primary">Print</span>
            <span className="text-foreground">Brasil</span>
          </h1>
          <p className="text-muted-foreground">Comunicação Visual de Alto Padrão</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-3 text-center pb-6">
            <CardTitle className="text-3xl font-bold">
              Bem-vindo
            </CardTitle>
            <CardDescription className="text-base">
              Entre com sua conta para continuar
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold">E-mail ou usuário</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="seu@email.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-11 h-12 text-base"
                    required
                    data-testid="input-username"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 h-12 text-base"
                    required
                    data-testid="input-password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end">
                <a href="#" className="text-sm text-primary hover:underline font-medium" data-testid="link-forgot-password">
                  Esqueceu a senha?
                </a>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-2">
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold"
                data-testid="button-login"
              >
                Entrar
              </Button>
              
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              <div className="text-sm text-center text-muted-foreground">
                Não tem uma conta?{" "}
                <button
                  type="button"
                  onClick={onRegisterClick}
                  className="text-primary hover:underline font-semibold"
                  data-testid="button-register"
                >
                  Cadastre-se gratuitamente
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade
        </p>
      </div>
    </div>
  );
}
