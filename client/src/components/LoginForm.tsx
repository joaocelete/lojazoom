import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-center">
            Bem-vindo ao <span className="text-primary">PrintBrasil</span>
          </CardTitle>
          <CardDescription className="text-center">
            Entre com sua conta para continuar
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">E-mail ou usuário</Label>
              <Input
                id="username"
                type="text"
                placeholder="seu@email.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                data-testid="input-username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-password"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <a href="#" className="text-primary hover:underline" data-testid="link-forgot-password">
                Esqueceu a senha?
              </a>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button 
              type="submit" 
              className="w-full"
              data-testid="button-login"
            >
              Entrar
            </Button>
            
            <div className="text-sm text-center text-muted-foreground">
              Não tem uma conta?{" "}
              <button
                type="button"
                onClick={onRegisterClick}
                className="text-primary hover:underline font-medium"
                data-testid="button-register"
              >
                Cadastre-se
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
