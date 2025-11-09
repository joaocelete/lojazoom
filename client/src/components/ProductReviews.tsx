import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, StarOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Review } from "@shared/schema";

interface ProductReviewsProps {
  productId: string;
  isAuthenticated: boolean;
}

export default function ProductReviews({ productId, isAuthenticated }: ProductReviewsProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: reviewsData, isLoading } = useQuery<{ reviews: Review[] }>({
    queryKey: [`/api/products/${productId}/reviews`],
  });

  const reviews = reviewsData?.reviews || [];
  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  const createReviewMutation = useMutation({
    mutationFn: async (data: { rating: number; comment: string }) => {
      return apiRequest(`/api/products/${productId}/reviews`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/reviews`] });
      setComment("");
      setRating(5);
      setShowForm(false);
      toast({
        title: "Avaliação enviada!",
        description: "Obrigado pelo seu feedback.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar avaliação",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast({
        title: "Comentário obrigatório",
        description: "Por favor, escreva um comentário sobre o produto",
        variant: "destructive",
      });
      return;
    }
    createReviewMutation.mutate({ rating, comment: comment.trim() });
  };

  const renderStars = (rating: number, interactive: boolean = false, size: string = "h-5 w-5") => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && setRating(star)}
            className={interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}
            data-testid={interactive ? `star-rating-${star}` : undefined}
          >
            {star <= rating ? (
              <Star className={`${size} fill-primary text-primary`} />
            ) : (
              <StarOff className={`${size} text-muted-foreground`} />
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Avaliações de Clientes</CardTitle>
              {reviews.length > 0 && (
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    {renderStars(Math.round(averageRating))}
                  </div>
                  <span className="text-lg font-semibold">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    ({reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'})
                  </span>
                </div>
              )}
            </div>
            {isAuthenticated && !showForm && (
              <Button onClick={() => setShowForm(true)} data-testid="button-write-review">
                Escrever Avaliação
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {showForm && (
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sua Avaliação</label>
                    {renderStars(rating, true, "h-6 w-6")}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="comment" className="text-sm font-medium">
                      Seu Comentário
                    </label>
                    <Textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Compartilhe sua experiência com este produto..."
                      rows={4}
                      data-testid="textarea-review-comment"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      type="submit" 
                      disabled={createReviewMutation.isPending}
                      data-testid="button-submit-review"
                    >
                      {createReviewMutation.isPending ? "Enviando..." : "Enviar Avaliação"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setComment("");
                        setRating(5);
                      }}
                      data-testid="button-cancel-review"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando avaliações...
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma avaliação ainda. Seja o primeiro a avaliar!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id} data-testid={`review-${review.id}`}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold" data-testid={`review-author-${review.id}`}>
                              {review.authorName}
                            </span>
                            {review.isVerified && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                ✓ Verificado
                              </span>
                            )}
                          </div>
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed" data-testid={`review-comment-${review.id}`}>
                        {review.comment}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
