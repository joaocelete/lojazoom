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
import { normalizeFormPayload } from "@/lib/formUtils";

import type { Product } from "@shared/schema";

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  pricingType: string;
  pricePerM2: string;
  fixedPrice: string;
  maxWidth: string;
  maxHeight: string;
  imageUrl?: string;
  imageUrls?: string[];
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
    maxWidth: product?.maxWidth || "",
    maxHeight: product?.maxHeight || "",
    imageUrl: product?.imageUrl || "",
    imageUrls: product?.imageUrls || [],
    active: product?.active ?? true
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Formato inválido",
          description: `${file.name}: Use apenas imagens JPG, PNG ou WebP`,
          variant: "destructive",
        });
        continue;
      }

      if (file.size > maxSize) {
        toast({
          title: "Arquivo muito grande",
          description: `${file.name}: A imagem deve ter no máximo 5MB`,
          variant: "destructive",
        });
        continue;
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
        
        setFormData(prev => ({
          ...prev,
          imageUrls: [...(prev.imageUrls || []), data.imageUrl],
          imageUrl: prev.imageUrl || data.imageUrl
        }));

        toast({
          title: "Upload concluído!",
          description: `${file.name} enviada com sucesso`,
        });
      } catch (error) {
        console.error("Erro ao fazer upload:", error);
        toast({
          title: "Erro no upload",
          description: `Não foi possível enviar ${file.name}`,
          variant: "destructive",
        });
      }
    }
    
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImageUrls = [...(formData.imageUrls || [])];
    newImageUrls.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      imageUrls: newImageUrls,
      imageUrl: newImageUrls[0] || ""
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedData = normalizeFormPayload(formData);
    onSave?.(normalizedData as ProductFormData);
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
              onValueChange={(value) => {
                const newFormData = { ...formData, pricingType: value };
                if (value === "per_m2") {
                  newFormData.fixedPrice = "";
                } else {
                  newFormData.pricePerM2 = "";
                  newFormData.maxWidth = "";
                  newFormData.maxHeight = "";
                }
                setFormData(newFormData);
              }}
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
            <>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxWidth">Largura Máxima (m)</Label>
                  <Input
                    id="maxWidth"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.maxWidth}
                    onChange={(e) => setFormData({ ...formData, maxWidth: e.target.value })}
                    placeholder="Ex: 5.00"
                    data-testid="input-product-max-width"
                  />
                  <p className="text-xs text-muted-foreground">Deixe vazio para sem limite</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxHeight">Altura Máxima (m)</Label>
                  <Input
                    id="maxHeight"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.maxHeight}
                    onChange={(e) => setFormData({ ...formData, maxHeight: e.target.value })}
                    placeholder="Ex: 3.00"
                    data-testid="input-product-max-height"
                  />
                  <p className="text-xs text-muted-foreground">Deixe vazio para sem limite</p>
                </div>
              </div>
            </>
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
            <Label htmlFor="image">Imagens do Produto</Label>
            
            {formData.imageUrls && formData.imageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {formData.imageUrls.map((imageUrl, index) => (
                  <div key={index} className="relative border border-border rounded-md overflow-hidden group">
                    <img 
                      src={imageUrl} 
                      alt={`Produto ${index + 1}`} 
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute top-0 left-0 bg-primary text-primary-foreground px-2 py-1 text-xs font-semibold">
                      {index === 0 ? "Principal" : index + 1}
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                      data-testid={`button-remove-image-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
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
                    Clique para adicionar imagens
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG ou WebP (máx. 5MB cada) - Selecione múltiplas imagens
                  </p>
                </>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              id="image"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
              multiple
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
