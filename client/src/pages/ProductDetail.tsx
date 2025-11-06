import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ShoppingCart, Ruler, Upload, Palette, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

export default function ProductDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { addItem } = useCart();
  const { toast } = useToast();

  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [artOption, setArtOption] = useState<"upload" | "create">("upload");
  const [artFile, setArtFile] = useState("");

  const { data, isLoading } = useQuery<{product: Product}>({
    queryKey: [`/api/products/${id}`],
  });
  
  const product = data?.product;

  const ART_CREATION_FEE = 35.00;

  const calculateTotal = () => {
    if (!product) return { productTotal: 0, artFee: 0, total: 0 };
    
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    const pricePerM2 = parseFloat(product.pricePerM2);
    
    if (isNaN(pricePerM2)) return { productTotal: 0, artFee: 0, total: 0 };
    
    const productTotal = w * h * pricePerM2;
    const artFee = artOption === "create" ? ART_CREATION_FEE : 0;
    return { productTotal, artFee, total: productTotal + artFee };
  };

  const { productTotal, artFee, total } = calculateTotal();
  const area = (parseFloat(width) || 0) * (parseFloat(height) || 0);

  const handleAddToCart = () => {
    if (!product) return;

    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;

    if (w <= 0 || h <= 0) {
      toast({
        title: "Dimensões inválidas",
        description: "Por favor, informe largura e altura maiores que zero.",
        variant: "destructive",
      });
      return;
    }

    if (artOption === "upload" && !artFile.trim()) {
      toast({
        title: "Arquivo de arte necessário",
        description: "Por favor, informe o nome do arquivo de arte ou escolha criação de arte.",
        variant: "destructive",
      });
      return;
    }

    const pricePerM2 = parseFloat(product.pricePerM2);
    
    if (isNaN(pricePerM2) || pricePerM2 <= 0) {
      toast({
        title: "Erro no preço",
        description: "Erro ao calcular o preço do produto. Por favor, tente novamente.",
        variant: "destructive",
      });
      return;
    }
    
    const calculatedProductTotal = w * h * pricePerM2;
    
    if (isNaN(calculatedProductTotal) || !isFinite(calculatedProductTotal)) {
      toast({
        title: "Erro no cálculo",
        description: "Erro ao calcular o total. Verifique as dimensões.",
        variant: "destructive",
      });
      return;
    }
    
    addItem(product, w, h, calculatedProductTotal, artOption, artFile);
    toast({
      title: "Produto adicionado!",
      description: "Item adicionado ao carrinho com sucesso.",
    });
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando produto...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">Produto não encontrado</p>
          <Button onClick={() => setLocation("/")} data-testid="button-back-home">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para a loja
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para a loja
        </Button>

        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          <div className="space-y-6">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-muted to-muted/50 shadow-2xl">
              <img
                src={product.imageUrl || ""}
                alt={product.name}
                className="w-full h-full object-cover"
                data-testid="img-product"
              />
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold" data-testid="text-product-name">
                {product.name}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-product-description">
                {product.description}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary" data-testid="text-price-per-m2">
                  R$ {parseFloat(product.pricePerM2).toFixed(2)}
                </span>
                <span className="text-lg text-muted-foreground">/m²</span>
              </div>
            </div>

            <div className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-lg">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Ruler className="h-5 w-5 text-primary" />
                Calcule suas dimensões
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width" className="text-sm font-medium">
                    Largura (m)
                  </Label>
                  <Input
                    id="width"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="h-12 text-lg"
                    data-testid="input-width"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-sm font-medium">
                    Altura (m)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="h-12 text-lg"
                    data-testid="input-height"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <Label className="text-base font-semibold">Opções de Arte</Label>
                <RadioGroup
                  value={artOption}
                  onValueChange={(value) => setArtOption(value as "upload" | "create")}
                  className="space-y-3"
                  data-testid="radio-art-option"
                >
                  <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-border hover-elevate cursor-pointer transition-all">
                    <RadioGroupItem value="upload" id="upload" data-testid="radio-upload" />
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="upload" className="flex items-center gap-2 font-semibold text-base cursor-pointer">
                        <Upload className="h-5 w-5 text-primary" />
                        Enviar arte pronta
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        PDF, CDR ou AI - Sem custo adicional
                      </p>
                      {artOption === "upload" && (
                        <Input
                          type="text"
                          placeholder="Nome do arquivo (ex: arte.pdf)"
                          value={artFile}
                          onChange={(e) => setArtFile(e.target.value)}
                          className="mt-3 h-10"
                          data-testid="input-art-file"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-border hover-elevate cursor-pointer transition-all">
                    <RadioGroupItem value="create" id="create" data-testid="radio-create" />
                    <div className="flex-1">
                      <Label htmlFor="create" className="flex items-center gap-2 font-semibold text-base cursor-pointer">
                        <Palette className="h-5 w-5 text-primary" />
                        Criação de arte
                      </Label>
                      <p className="text-sm text-muted-foreground mt-2">
                        Nossa equipe cria sua arte + R$ 35,00
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {total > 0 && (
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-xl p-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Área total</span>
                    <span className="font-semibold text-base">{area.toFixed(2)} m²</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Produto</span>
                    <span className="font-semibold text-base">R$ {productTotal.toFixed(2)}</span>
                  </div>
                  {artFee > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Criação de arte</span>
                      <span className="font-semibold text-base">R$ {artFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-primary/30">
                    <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                      Valor Total
                    </div>
                    <div className="text-4xl font-bold text-primary" data-testid="text-total">
                      R$ {total.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleAddToCart}
                className="w-full h-14 text-lg font-bold gap-3 shadow-lg"
                size="lg"
                disabled={!width || !height}
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="h-5 w-5" />
                Adicionar ao Carrinho
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
