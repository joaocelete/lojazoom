import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Star, StarOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, Review } from "@shared/schema";

export default function AdminReviews() {
  const { toast } = useToast();
  const [selectedProductId, setSelectedProductId] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { data: productsData } = useQuery<{ products: Product[] }>({
    queryKey: ["/api/products"],
  });

  const { data: reviewsData, isLoading } = useQuery<{ reviews: Review[] }>({
    queryKey: [`/api/products/${selectedProductId}/reviews`],
    enabled: !!selectedProductId,
  });

  const products = productsData?.products || [];
  const reviews = reviewsData?.reviews || [];

  const createReviewMutation = useMutation({
    mutationFn: async (data: { productId: string; authorName: string; rating: number; comment: string; isVerified: boolean }) => {
      return apiRequest("/api/admin/reviews", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${selectedProductId}/reviews`] });
      setAuthorName("");
      setRating(5);
      setComment("");
      setIsVerified(false);
      setShowForm(false);
      toast({
        title: "Review criado!",
        description: "Review adicionado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar review",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      return apiRequest(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${selectedProductId}/reviews`] });
      toast({
        title: "Review deletado!",
        description: "Review removido com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao deletar review",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !authorName.trim() || !comment.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }
    createReviewMutation.mutate({
      productId: selectedProductId,
      authorName: authorName.trim(),
      rating,
      comment: comment.trim(),
      isVerified,
    });
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && setRating(star)}
            className={interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}
            data-testid={interactive ? `admin-star-rating-${star}` : undefined}
          >
            {star <= rating ? (
              <Star className="h-5 w-5 fill-primary text-primary" />
            ) : (
              <StarOff className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Gerenciar Avaliações</CardTitle>
            {selectedProductId && !showForm && (
              <Button onClick={() => setShowForm(true)} data-testid="button-add-fake-review">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Avaliação
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="product">Produto</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger id="product" data-testid="select-product-for-reviews">
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showForm && selectedProductId && (
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="authorName">Nome do Autor</Label>
                    <Input
                      id="authorName"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Ex: João Silva"
                      data-testid="input-review-author"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Avaliação</Label>
                    {renderStars(rating, true)}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comment">Comentário</Label>
                    <Textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Escreva o comentário..."
                      rows={4}
                      data-testid="textarea-review-comment-admin"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-card rounded-md border border-card-border">
                    <div>
                      <Label htmlFor="isVerified" className="text-base">Verificado</Label>
                      <p className="text-sm text-muted-foreground">
                        Marcar como cliente verificado
                      </p>
                    </div>
                    <Switch
                      id="isVerified"
                      checked={isVerified}
                      onCheckedChange={setIsVerified}
                      data-testid="switch-review-verified"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      type="submit" 
                      disabled={createReviewMutation.isPending}
                      data-testid="button-submit-fake-review"
                    >
                      {createReviewMutation.isPending ? "Criando..." : "Criar Avaliação"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setAuthorName("");
                        setRating(5);
                        setComment("");
                        setIsVerified(false);
                      }}
                      data-testid="button-cancel-fake-review"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {selectedProductId && (
            <>
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Avaliações Existentes ({reviews.length})
                </h3>
                
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Carregando avaliações...
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma avaliação ainda.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((review) => (
                      <Card key={review.id} data-testid={`admin-review-${review.id}`}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3">
                                <span className="font-semibold">
                                  {review.authorName}
                                </span>
                                {review.isVerified && (
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                    ✓ Verificado
                                  </span>
                                )}
                                {!review.userId && (
                                  <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded-full">
                                    Fake
                                  </span>
                                )}
                              </div>
                              {renderStars(review.rating)}
                              <p className="text-muted-foreground text-sm">
                                {review.comment}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(review.createdAt).toLocaleString('pt-BR')}
                              </p>
                            </div>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => deleteReviewMutation.mutate(review.id)}
                              disabled={deleteReviewMutation.isPending}
                              data-testid={`button-delete-review-${review.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
