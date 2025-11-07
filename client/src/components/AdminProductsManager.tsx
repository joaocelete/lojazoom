import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Package, Search, Edit2, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminProductForm from "@/components/AdminProductForm";
import type { Product } from "@shared/schema";

export default function AdminProductsManager() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data, isLoading } = useQuery<{ products: Product[] }>({
    queryKey: ["/api/products"],
  });

  const products = data?.products || [];

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const createMutation = useMutation({
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
      setShowForm(false);
      setEditingProduct(null);
    },
    onError: () => {
      toast({
        title: "Erro ao criar produto",
        description: "Não foi possível criar o produto.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PUT", `/api/products/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Produto atualizado",
        description: "O produto foi atualizado com sucesso.",
      });
      setShowForm(false);
      setEditingProduct(null);
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar produto",
        description: "Não foi possível atualizar o produto.",
        variant: "destructive",
      });
    },
  });

  const handleSave = (data: any) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  if (showForm) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle>
            {editingProduct ? "Editar Produto" : "Novo Produto"}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <AdminProductForm
            product={editingProduct}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Produtos</CardTitle>
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search-products"
            />
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="gap-2"
            data-testid="button-add-product"
          >
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando produtos...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {searchTerm 
                ? "Nenhum produto encontrado com a busca aplicada"
                : "Nenhum produto cadastrado"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                className="flex items-center justify-between p-4 bg-card rounded-md border border-border hover-elevate"
                data-testid={`product-row-${product.id}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold">{product.name}</h3>
                    <Badge variant="default">
                      {product.active ? "Ativo" : "Inativo"}
                    </Badge>
                    <Badge variant="secondary">
                      {product.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    R$ {parseFloat(product.pricePerM2).toFixed(2)}/m²
                  </p>
                  {product.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleEdit(product)}
                    data-testid={`button-edit-${product.id}`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
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
