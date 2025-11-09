import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import type { Product } from "@shared/schema";

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  pricingType: string;
  pricePerM2: string;
  fixedPrice: string;
  imageUrl?: string;
  active: boolean;
}

interface AdminProductFormProps {
  product?: Product | null;
  onSave?: (data: ProductFormData) => void;
  onCancel?: () => void;
}

export default function AdminProductForm({ product, onSave, onCancel }: AdminProductFormProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || "",
    description: product?.description || "",
    category: product?.category || "banner",
    pricingType: product?.pricingType || "per_m2",
    pricePerM2: product?.pricePerM2 || "",
    fixedPrice: product?.fixedPrice || "",
    imageUrl: product?.imageUrl || "",
    active: product?.active ?? true
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Formato inválido",
        description: "Use apenas imagens JPG, PNG ou WebP",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("image", file);

      const response = await fetch("/api/upload/product-image", {
        method: "POST",
        credentials: "include",
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error("Erro ao fazer upload");
      }

      const data = await response.json();
      setFormData({ ...formData, imageUrl: data.imageUrl });

      toast({
        title: "Upload concluído!",
        description: "Imagem enviada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar a imagem",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, imageUrl: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.(formData);
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
            <Label htmlFor="pricingType">Tipo de Precificação</Label>
            <Select
              value={formData.pricingType}
              onValueChange={(value) => setFormData({ ...formData, pricingType: value })}
            >
              <SelectTrigger id="pricingType" data-testid="select-pricing-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="per_m2">Preço por m² (área)</SelectItem>
                <SelectItem value="fixed">Preço Fixo (unitário)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {formData.pricingType === "per_m2" 
                ? "Cliente informa largura × altura. Ex: banners, lonas, adesivos."
                : "Produto com preço fixo. Ex: cartões de visita, flyers, placas."}
            </p>
          </div>

          {formData.pricingType === "per_m2" ? (
            <div className="space-y-2">
              <Label htmlFor="pricePerM2">Preço por m² (R$)</Label>
              <Input
                id="pricePerM2"
                type="number"
                step="0.01"
                min="0"
                value={formData.pricePerM2}
                onChange={(e) => setFormData({ ...formData, pricePerM2: e.target.value })}
                placeholder="0.00"
                required
                data-testid="input-product-price-m2"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="fixedPrice">Preço Fixo (R$)</Label>
              <Input
                id="fixedPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.fixedPrice}
                onChange={(e) => setFormData({ ...formData, fixedPrice: e.target.value })}
                placeholder="0.00"
                required
                data-testid="input-product-price-fixed"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="image">Imagem do Produto</Label>
            
            {formData.imageUrl ? (
              <div className="relative border border-border rounded-md overflow-hidden">
                <img 
                  src={formData.imageUrl} 
                  alt="Preview do produto" 
                  className="w-full h-48 object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                  data-testid="button-remove-image"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-border rounded-md p-8 text-center hover-elevate cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <>
                    <Upload className="h-8 w-8 mx-auto mb-2 text-primary animate-pulse" />
                    <p className="text-sm text-muted-foreground">
                      Fazendo upload...
                    </p>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Clique para fazer upload da imagem
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG ou WebP (máx. 5MB)
                    </p>
                  </>
                )}
              </div>
            )}
            
            <input
              ref={fileInputRef}
              id="image"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
              data-testid="input-product-image"
            />
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
