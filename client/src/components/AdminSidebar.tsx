import { Package, ShoppingBag, Users, Settings, LogOut, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AdminSidebarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export default function AdminSidebar({ currentPage = "products", onNavigate, onLogout }: AdminSidebarProps) {
  const menuItems = [
    { id: "dashboard", icon: BarChart, label: "Dashboard" },
    { id: "products", icon: Package, label: "Produtos" },
    { id: "orders", icon: ShoppingBag, label: "Pedidos" },
    { id: "users", icon: Users, label: "Usuários" },
    { id: "settings", icon: Settings, label: "Configurações" }
  ];

  return (
    <div className="w-64 h-screen bg-foreground text-background border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">PrintBrasil</h1>
        <p className="text-sm text-muted-foreground mt-1">Painel Administrativo</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start gap-3 ${!isActive && 'text-background hover:text-background'}`}
                onClick={() => onNavigate?.(item.id)}
                data-testid={`link-admin-${item.id}`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive"
          onClick={onLogout}
          data-testid="button-logout"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  );
}
