import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ShoppingCart, Ruler, Upload, Palette, ArrowLeft, FileText, CheckCircle2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import ProductReviews from "@/components/ProductReviews";
import useEmblaCarousel from "embla-carousel-react";

export default function ProductDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { addItem, totalItems } = useCart();
  const { toast } = useToast();

  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [artOption, setArtOption] = useState<"upload" | "create">("upload");
  const [artFile, setArtFile] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const artFileInputRef = useRef<HTMLInputElement>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  const { data, isLoading } = useQuery<{product: Product}>({
    queryKey: [`/api/products/${id}`],
  });
  
  const { data: authData } = useQuery<{user: any}>({
    queryKey: ["/api/auth/me"],
  });
  
  const product = data?.product;
  const isAuthenticated = !!authData?.user;

  const ART_CREATION_FEE = 35.00;

  const calculateTotal = () => {
    if (!product) return { productTotal: 0, artFee: 0, total: 0 };
    
    let productTotal = 0;
    
    if (product.pricingType === "fixed") {
      const qty = parseFloat(quantity) || 0;
      const fixedPrice = parseFloat(product.fixedPrice || "0");
      productTotal = qty * fixedPrice;
    } else {
      const w = parseFloat(width) || 0;
      const h = parseFloat(height) || 0;
      const pricePerM2 = parseFloat(product.pricePerM2 || "0");
      productTotal = w * h * pricePerM2;
    }
    
    const artFee = artOption === "create" ? ART_CREATION_FEE : 0;
    return { productTotal, artFee, total: productTotal + artFee };
  };

  const { productTotal, artFee, total } = calculateTotal();
  const area = product?.pricingType === "per_m2" 
    ? (parseFloat(width) || 0) * (parseFloat(height) || 0)
    : 0;

  const handleArtFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar extensão do arquivo
    const allowedExtensions = [".pdf", ".cdr"];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!hasValidExtension) {
      toast({
        title: "Formato inválido",
        description: "Use apenas arquivos PDF ou CDR",
        variant: "destructive",
      });
      if (artFileInputRef.current) {
        artFileInputRef.current.value = "";
      }
      return;
    }

    // Validar tamanho (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 20MB",
        variant: "destructive",
      });
      if (artFileInputRef.current) {
        artFileInputRef.current.value = "";
      }
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("artwork", file);

      const response = await fetch("/api/upload/artwork", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erro ao fazer upload");
      }

      const data = await response.json();
      setArtFile(data.artworkUrl);
      setUploadedFileName(data.originalName);

      toast({
        title: "Upload concluído!",
        description: `Arquivo ${data.originalName} enviado com sucesso`,
      });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar o arquivo de arte",
        variant: "destructive",
      });
      if (artFileInputRef.current) {
        artFileInputRef.current.value = "";
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveArtFile = () => {
    setArtFile("");
    setUploadedFileName("");
    if (artFileInputRef.current) {
      artFileInputRef.current.value = "";
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (product.pricingType === "fixed") {
      // Validação para produtos com preço fixo
      const qty = parseFloat(quantity) || 0;
      if (qty <= 0 || !Number.isInteger(qty)) {
        toast({
          title: "Quantidade inválida",
          description: "Por favor, informe uma quantidade inteira maior que zero.",
          variant: "destructive",
        });
        return;
      }

      // Validar que fixedPrice existe e é válido
      const fixedPrice = parseFloat(product.fixedPrice || "0");
      if (isNaN(fixedPrice) || fixedPrice <= 0) {
        toast({
          title: "Erro no preço",
          description: "Produto com preço inválido. Entre em contato com o suporte.",
          variant: "destructive",
        });
        return;
      }

      if (artOption === "upload" && !artFile.trim()) {
        toast({
          title: "Arquivo de arte necessário",
          description: "Por favor, envie o arquivo de arte ou escolha criação de arte.",
          variant: "destructive",
        });
        return;
      }

      const calculatedTotal = qty * fixedPrice;
      
      if (isNaN(calculatedTotal) || !isFinite(calculatedTotal)) {
        toast({
          title: "Erro no cálculo",
          description: "Erro ao calcular o total. Por favor, tente novamente.",
          variant: "destructive",
        });
        return;
      }
      
      addItem(product, 0, 0, calculatedTotal, artOption, artFile, qty);
    } else {
      // Validação para produtos por m²
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

      // Validar limites máximos
      if (product.maxWidth && w > parseFloat(product.maxWidth)) {
        toast({
          title: "Largura excede o limite",
          description: `A largura máxima permitida é ${parseFloat(product.maxWidth).toFixed(2)}m.`,
          variant: "destructive",
        });
        return;
      }

      if (product.maxHeight && h > parseFloat(product.maxHeight)) {
        toast({
          title: "Altura excede o limite",
          description: `A altura máxima permitida é ${parseFloat(product.maxHeight).toFixed(2)}m.`,
          variant: "destructive",
        });
        return;
      }

      if (artOption === "upload" && !artFile.trim()) {
        toast({
          title: "Arquivo de arte necessário",
          description: "Por favor, envie o arquivo de arte ou escolha criação de arte.",
          variant: "destructive",
        });
        return;
      }

      // Validar que pricePerM2 existe e é válido
      const pricePerM2 = parseFloat(product.pricePerM2 || "0");
      if (isNaN(pricePerM2) || pricePerM2 <= 0) {
        toast({
          title: "Erro no preço",
          description: "Produto com preço inválido. Entre em contato com o suporte.",
          variant: "destructive",
        });
        return;
      }

      const calculatedTotal = w * h * pricePerM2;
      
      if (isNaN(calculatedTotal) || !isFinite(calculatedTotal)) {
        toast({
          title: "Erro no cálculo",
          description: "Erro ao calcular o total. Verifique as dimensões.",
          variant: "destructive",
        });
        return;
      }
      
      addItem(product, w, h, calculatedTotal, artOption, artFile);
    }

    toast({
      title: "Produto adicionado!",
      description: "Item adicionado ao carrinho com sucesso.",
    });
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header 
          cartItemCount={totalItems}
          onCartClick={() => setIsCartOpen(true)}
          onLoginClick={() => setLocation("/login")}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Carregando produto...</div>
        </div>
        <Footer />
        <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header 
          cartItemCount={totalItems}
          onCartClick={() => setIsCartOpen(true)}
          onLoginClick={() => setLocation("/login")}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground">Produto não encontrado</p>
            <Button onClick={() => setLocation("/")} data-testid="button-back-home">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para a loja
            </Button>
          </div>
        </div>
        <Footer />
        <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        cartItemCount={totalItems}
        onCartClick={() => setIsCartOpen(true)}
        onLoginClick={() => setLocation("/login")}
      />

      <main className="flex-1 bg-gradient-to-b from-background to-muted/20">
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
            {(() => {
              const images = product.imageUrls && product.imageUrls.length > 0
                ? product.imageUrls
                : product.imageUrl
                ? [product.imageUrl]
                : [];

              return images.length > 1 ? (
                <>
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-muted to-muted/50 shadow-2xl">
                    <div className="overflow-hidden" ref={emblaRef}>
                      <div className="flex">
                        {images.map((imageUrl, index) => (
                          <div key={index} className="flex-shrink-0 w-full" data-testid={`carousel-slide-${index}`}>
                            <img
                              src={imageUrl}
                              alt={`${product.name} - Imagem ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                      onClick={scrollPrev}
                      data-testid="button-carousel-prev"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                      onClick={scrollNext}
                      data-testid="button-carousel-next"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === selectedIndex
                              ? 'bg-primary w-8'
                              : 'bg-primary/30 hover:bg-primary/50'
                          }`}
                          onClick={() => scrollTo(index)}
                          data-testid={`carousel-dot-${index}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    {images.map((imageUrl, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all hover-elevate ${
                          index === selectedIndex
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-border'
                        }`}
                        onClick={() => scrollTo(index)}
                        data-testid={`thumbnail-${index}`}
                      >
                        <img
                          src={imageUrl}
                          alt={`Miniatura ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-muted to-muted/50 shadow-2xl">
                  <img
                    src={images[0] || ""}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    data-testid="img-product"
                  />
                </div>
              );
            })()}
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold" data-testid="text-product-name">
                {product.name}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-product-description">
                {product.description}
              </p>
              {product.pricingType === "fixed" ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary" data-testid="text-fixed-price">
                    R$ {parseFloat(product.fixedPrice || "0").toFixed(2)}
                  </span>
                  <span className="text-lg text-muted-foreground">por unidade</span>
                </div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary" data-testid="text-price-per-m2">
                    R$ {parseFloat(product.pricePerM2 || "0").toFixed(2)}
                  </span>
                  <span className="text-lg text-muted-foreground">/m²</span>
                </div>
              )}
            </div>

            <div className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-lg">
              {product.pricingType === "fixed" ? (
                <>
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    Quantidade
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-sm font-medium">
                      Quantidade de unidades
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="h-12 text-lg"
                      data-testid="input-quantity"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Ruler className="h-5 w-5 text-primary" />
                    Calcule suas dimensões
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="width" className="text-sm font-medium">
                        Largura (m)
                        {product.maxWidth && (
                          <span className="text-xs text-muted-foreground ml-2">
                            (máx. {parseFloat(product.maxWidth).toFixed(2)}m)
                          </span>
                        )}
                      </Label>
                      <Input
                        id="width"
                        type="number"
                        step="0.01"
                        min="0"
                        max={product.maxWidth ? parseFloat(product.maxWidth) : undefined}
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
                        {product.maxHeight && (
                          <span className="text-xs text-muted-foreground ml-2">
                            (máx. {parseFloat(product.maxHeight).toFixed(2)}m)
                          </span>
                        )}
                      </Label>
                      <Input
                        id="height"
                        type="number"
                        step="0.01"
                        min="0"
                        max={product.maxHeight ? parseFloat(product.maxHeight) : undefined}
                        placeholder="0.00"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="h-12 text-lg"
                        data-testid="input-height"
                      />
                    </div>
                  </div>
                </>
              )}

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
                        PDF ou CDR - Sem custo adicional
                      </p>
                      {artOption === "upload" && (
                        <div className="mt-3 space-y-2">
                          {artFile && uploadedFileName ? (
                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <div>
                                  <p className="text-sm font-medium text-green-800">
                                    {uploadedFileName}
                                  </p>
                                  <p className="text-xs text-green-600">
                                    Arquivo enviado com sucesso
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={handleRemoveArtFile}
                                data-testid="button-remove-artwork"
                              >
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => artFileInputRef.current?.click()}
                                disabled={uploading}
                                data-testid="button-upload-artwork"
                              >
                                {uploading ? (
                                  <>
                                    <Upload className="h-4 w-4 mr-2 animate-pulse" />
                                    Enviando...
                                  </>
                                ) : (
                                  <>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Selecionar arquivo PDF ou CDR
                                  </>
                                )}
                              </Button>
                              <p className="text-xs text-muted-foreground text-center">
                                Tamanho máximo: 20MB
                              </p>
                            </>
                          )}
                          <input
                            ref={artFileInputRef}
                            type="file"
                            accept=".pdf,.cdr,application/pdf,application/x-cdr,application/coreldraw"
                            onChange={handleArtFileUpload}
                            className="hidden"
                            disabled={uploading}
                            data-testid="input-art-file"
                          />
                        </div>
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

        <div className="container mx-auto px-4 py-12">
          <ProductReviews productId={id!} isAuthenticated={isAuthenticated} />
        </div>
        </div>
      </main>

      <Footer />
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
