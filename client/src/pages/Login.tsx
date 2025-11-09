import LoginForm from "@/components/LoginForm";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      const user = data?.user;
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta.",
      });
      
      setLocation(user?.role === "admin" ? "/admin" : "/");
    } catch (error) {
      toast({
        title: "Erro ao fazer login",
        description: "Email ou senha inválidos. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <LoginForm
      onLogin={handleLogin}
      onRegisterClick={() => setLocation("/register")}
    />
  );
}
