import { ShoppingCart, Menu, User, Search, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useState } from "react";

interface HeaderProps {
  cartItemCount?: number;
  onCartClick?: () => void;
  onLoginClick?: () => void;
}

export default function Header({ cartItemCount = 0, onCartClick, onLoginClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout, isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-foreground/95 backdrop-blur-lg text-background border-b border-white/10 shadow-lg">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-background hover:text-background"
            data-testid="button-menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <a href="/" className="flex items-center gap-3" data-testid="link-home">
            <div className="text-2xl font-bold tracking-tight">
              <span className="text-primary">Print</span>
              <span className="text-background">Brasil</span>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-6 ml-8">
            <a href="/" className="text-background hover:text-primary transition-colors font-medium">
              Início
            </a>
            <a href="/portfolio" className="text-background hover:text-primary transition-colors font-medium" data-testid="link-portfolio">
              Portfolio
            </a>
          </nav>

          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar produtos, categorias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-background/10 backdrop-blur-sm text-background placeholder:text-background/50 border-white/20 rounded-full focus:bg-background/20 focus:border-primary/50 transition-all"
                data-testid="input-search"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-background hover:text-background hover:bg-white/10 rounded-full"
                    data-testid="button-user-menu"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation("/profile")} data-testid="menu-profile">
                    <User className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuItem onClick={() => setLocation("/admin")} data-testid="menu-admin">
                        <Settings className="mr-2 h-4 w-4" />
                        Painel Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLocation("/admin/settings")} data-testid="menu-admin-settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Configurações
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={onLoginClick}
                className="text-background hover:text-background hover:bg-white/10 rounded-full"
                data-testid="button-login"
              >
                <User className="h-5 w-5" />
              </Button>
            )}

            <Button
              variant="default"
              size="default"
              onClick={onCartClick}
              className="relative gap-2 rounded-full px-5"
              data-testid="button-cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground rounded-full border-2 border-foreground"
                  data-testid="text-cart-count"
                >
                  {cartItemCount}
                </Badge>
              )}
              <span className="hidden sm:inline font-medium">Carrinho</span>
            </Button>
          </div>
        </div>

        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 bg-background/10 backdrop-blur-sm text-background placeholder:text-background/50 border-white/20 rounded-full"
              data-testid="input-search-mobile"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
