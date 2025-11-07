import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Upload } from "lucide-react";

import type { Product } from "@shared/schema";

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  pricePerM2: string;
  imageUrl?: string;
  active: boolean;
}

interface AdminProductFormProps {
  product?: Product | null;
  onSave?: (data: ProductFormData) => void;
  onCancel?: () => void;
}

export default function AdminProductForm({ product, onSave, onCancel }: AdminProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || "",
    description: product?.description || "",
    category: product?.category || "banner",
    pricePerM2: product?.pricePerM2 || "",
    imageUrl: product?.imageUrl || "",
    active: product?.active ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.(formData);
    console.log("Save product:", formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {product?.id ? "Editar Produto" : "Novo Produto"}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Banner Vinílico Premium"
              required
              data-testid="input-product-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o produto..."
              rows={4}
              required
              data-testid="input-product-description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Ex: banner, adesivo, lona"
              required
              data-testid="input-product-category"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Preço por m² (R$)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.pricePerM2}
              onChange={(e) => setFormData({ ...formData, pricePerM2: e.target.value })}
              placeholder="0.00"
              required
              data-testid="input-product-price"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Imagem do Produto</Label>
            <div className="border-2 border-dashed border-border rounded-md p-8 text-center hover-elevate cursor-pointer">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Clique para fazer upload ou arraste a imagem
              </p>
              <input
                id="image"
                type="file"
                accept="image/*"
                className="hidden"
                data-testid="input-product-image"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-card rounded-md border border-card-border">
            <div>
              <Label htmlFor="active" className="text-base">Produto Ativo</Label>
              <p className="text-sm text-muted-foreground">
                Mostrar produto no catálogo
              </p>
            </div>
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              data-testid="switch-product-active"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1"
              data-testid="button-save-product"
            >
              Salvar Produto
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={onCancel}
              data-testid="button-cancel"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
