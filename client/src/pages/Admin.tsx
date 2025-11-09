import { useState } from "react";
import { BarChart, Package, ShoppingBag, Users, Settings, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminDashboard from "@/components/AdminDashboard";
import AdminProductsManager from "@/components/AdminProductsManager";
import AdminOrdersManager from "@/components/AdminOrdersManager";
import AdminUsersManager from "@/components/AdminUsersManager";
import AdminSettings from "@/components/AdminSettings";

function AppSidebar({ currentPage, onNavigate }: { currentPage: string; onNavigate: (page: string) => void }) {
  const { logout } = useAuth();
  const [, setLocation] = useLocation();

  const menuItems = [
    { id: "dashboard", icon: BarChart, label: "Dashboard" },
    { id: "products", icon: Package, label: "Produtos" },
    { id: "orders", icon: ShoppingBag, label: "Pedidos" },
    { id: "users", icon: Users, label: "Usuários" },
    { id: "settings", icon: Settings, label: "Configurações" }
  ];

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">PrintBrasil</h1>
        <p className="text-sm text-muted-foreground mt-1">Painel Administrativo</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onNavigate(item.id)}
                      isActive={currentPage === item.id}
                      data-testid={`link-admin-${item.id}`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} data-testid="button-logout">
              <LogOut className="h-5 w-5" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function Admin() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return <AdminDashboard />;
      
      case "products":
        return <AdminProductsManager />;
      
      case "orders":
        return <AdminOrdersManager />;
      
      case "users":
        return <AdminUsersManager />;
      
      case "settings":
        return <AdminSettings />;
      
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center gap-2 border-b p-4 lg:hidden">
            <SidebarTrigger data-testid="button-sidebar-toggle">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <h2 className="font-bold">PrintBrasil Admin</h2>
          </header>
          
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-4 md:p-6 max-w-7xl">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
