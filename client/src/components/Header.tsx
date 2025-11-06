import { ShoppingCart, Menu, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface HeaderProps {
  cartItemCount?: number;
  onCartClick?: () => void;
  onLoginClick?: () => void;
}

export default function Header({ cartItemCount = 0, onCartClick, onLoginClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 bg-foreground text-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 py-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-background hover:text-background"
            data-testid="button-menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2" data-testid="link-home">
            <div className="text-2xl font-bold text-primary">PrintBrasil</div>
          </div>

          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 bg-background text-foreground border-input"
                data-testid="input-search"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-full text-primary hover:text-primary"
                data-testid="button-search"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onLoginClick}
              className="text-background hover:text-background"
              data-testid="button-login"
            >
              <User className="h-5 w-5" />
            </Button>

            <Button
              variant="default"
              size="default"
              onClick={onCartClick}
              className="relative gap-2"
              data-testid="button-cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground"
                  data-testid="text-cart-count"
                >
                  {cartItemCount}
                </Badge>
              )}
              <span className="hidden sm:inline">Carrinho</span>
            </Button>
          </div>
        </div>

        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <Input
              type="search"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 bg-background text-foreground"
              data-testid="input-search-mobile"
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-0 top-0 h-full text-primary"
              data-testid="button-search-mobile"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
