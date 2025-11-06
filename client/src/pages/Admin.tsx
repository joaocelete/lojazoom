import { useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminProductForm from "@/components/AdminProductForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// todo: remove mock functionality
const mockProductsList = [
  { id: 1, name: "Banner Vinílico Premium", pricePerM2: "45.90", active: true },
  { id: 2, name: "Adesivo Vinílico", pricePerM2: "35.00", active: true },
  { id: 3, name: "Lona para Outdoor", pricePerM2: "52.90", active: false }
];

export default function Admin() {
  const [currentPage, setCurrentPage] = useState("products");
  const [showProductForm, setShowProductForm] = useState(false);

  const renderContent = () => {
    if (currentPage === "products") {
      if (showProductForm) {
        return (
          <AdminProductForm
            onSave={(data) => {
              console.log("Product saved:", data);
              setShowProductForm(false);
            }}
            onCancel={() => setShowProductForm(false)}
          />
        );
      }

      return (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
            <CardTitle>Gerenciar Produtos</CardTitle>
            <Button 
              onClick={() => setShowProductForm(true)}
              className="gap-2"
              data-testid="button-add-product"
            >
              <Plus className="h-4 w-4" />
              Novo Produto
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockProductsList.map((product) => (
                <div 
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-card rounded-md border border-card-border hover-elevate"
                  data-testid={`product-row-${product.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{product.name}</h3>
                      <Badge variant={product.active ? "default" : "secondary"}>
                        {product.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      R$ {product.pricePerM2}/m²
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => console.log("Edit product:", product.id)}
                      data-testid={`button-edit-${product.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => console.log("Delete product:", product.id)}
                      data-testid={`button-delete-${product.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (currentPage === "orders") {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Funcionalidade de pedidos em desenvolvimento
            </p>
          </CardContent>
        </Card>
      );
    }

    if (currentPage === "users") {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Funcionalidade de usuários em desenvolvimento
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Dashboard em desenvolvimento
          </p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={() => console.log("Logout")}
      />
      
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 max-w-6xl">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
