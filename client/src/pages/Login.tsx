import LoginForm from "@/components/LoginForm";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();

  const handleLogin = (username: string, password: string) => {
    console.log("Login attempt:", { username, password });
    // todo: remove mock functionality - replace with actual authentication
    if (username === "admin" && password === "admin") {
      setLocation("/admin");
    } else {
      setLocation("/");
    }
  };

  return (
    <LoginForm
      onLogin={handleLogin}
      onRegisterClick={() => console.log("Navigate to register")}
    />
  );
}
