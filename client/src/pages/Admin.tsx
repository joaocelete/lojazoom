import { useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminProductForm from "@/components/AdminProductForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Order, Product } from "@shared/schema";

function OrdersList() {
  const { data, isLoading } = useQuery<{ orders: Order[] }>({
    queryKey: ["/api/orders"],
  });

  const orders = data?.orders || [];

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      paid: "default",
      shipped: "default",
      delivered: "default",
      cancelled: "destructive",
    };
    return variants[status] || "secondary";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendente",
      paid: "Pago",
      shipped: "Enviado",
      delivered: "Entregue",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Pedidos</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando pedidos...
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-4 bg-card rounded-md border border-card-border hover-elevate"
                data-testid={`order-row-${order.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-sm">
                        Pedido #{order.id.slice(0, 8)}
                      </h3>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Cliente ID: {order.userId.slice(0, 8)}</p>
                      <p>Endereço: {order.shippingAddress}</p>
                      <p>Data: {new Date(order.createdAt!).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-semibold text-lg">
                      R$ {parseFloat(order.total).toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Subtotal: R$ {parseFloat(order.subtotal).toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Frete: R$ {parseFloat(order.shipping).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProductsList({ onShowForm }: { onShowForm: () => void }) {
  const { toast } = useToast();
  const { data, isLoading } = useQuery<{ products: Product[] }>({
    queryKey: ["/api/products"],
  });

  const products = data?.products || [];

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await apiRequest("DELETE", `/api/products/${productId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Produto deletado",
        description: "O produto foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao deletar produto",
        description: "Não foi possível deletar o produto.",
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle>Gerenciar Produtos</CardTitle>
        <Button 
          onClick={onShowForm}
          className="gap-2"
          data-testid="button-add-product"
        >
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando produtos...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum produto cadastrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div 
                key={product.id}
                className="flex items-center justify-between p-4 bg-card rounded-md border border-card-border hover-elevate"
                data-testid={`product-row-${product.id}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{product.name}</h3>
                    <Badge variant="default">
                      Ativo
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    R$ {parseFloat(product.pricePerM2).toFixed(2)}/m²
                  </p>
                  {product.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {product.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => deleteMutation.mutate(product.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${product.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Admin() {
  const [currentPage, setCurrentPage] = useState("products");
  const [showProductForm, setShowProductForm] = useState(false);
  const { toast } = useToast();

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/products", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Produto criado",
        description: "O produto foi adicionado com sucesso.",
      });
      setShowProductForm(false);
    },
    onError: () => {
      toast({
        title: "Erro ao criar produto",
        description: "Não foi possível criar o produto.",
        variant: "destructive",
      });
    },
  });

  const renderContent = () => {
    if (currentPage === "products") {
      if (showProductForm) {
        return (
          <AdminProductForm
            onSave={(data) => {
              createProductMutation.mutate(data);
            }}
            onCancel={() => setShowProductForm(false)}
          />
        );
      }

      return <ProductsList onShowForm={() => setShowProductForm(true)} />;
    }

    if (currentPage === "orders") {
      return <OrdersList />;
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
