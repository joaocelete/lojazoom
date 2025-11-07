import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Search, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Order, OrderItem } from "@shared/schema";

interface OrderWithItems extends Order {
  items?: OrderItem[];
  expanded?: boolean;
}

export default function AdminOrdersManager() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery<{ orders: Order[] }>({
    queryKey: ["/api/orders"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Status atualizado",
        description: "O status do pedido foi atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do pedido.",
        variant: "destructive",
      });
    },
  });

  const { data: orderDetailsMap, refetch: refetchDetails } = useQuery<Record<string, { order: Order; items: OrderItem[] }>>({
    queryKey: ["/api/orders/details", Array.from(expandedOrders)],
    queryFn: async () => {
      const detailsMap: Record<string, { order: Order; items: OrderItem[] }> = {};
      const orderIds = Array.from(expandedOrders);
      for (const orderId of orderIds) {
        const res = await fetch(`/api/orders/${orderId}`, {
          credentials: 'include',
        });
        if (res.ok) {
          detailsMap[orderId] = await res.json();
        }
      }
      return detailsMap;
    },
    enabled: expandedOrders.size > 0,
  });

  const orders = data?.orders || [];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.shippingAddress || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const toggleExpand = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Pedidos</CardTitle>
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por ID, cliente ou endereço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search-orders"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48" data-testid="select-status-filter">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="shipped">Enviado</SelectItem>
              <SelectItem value="delivered">Entregue</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando pedidos...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all" 
                ? "Nenhum pedido encontrado com os filtros aplicados"
                : "Nenhum pedido encontrado"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrders.has(order.id);
              const orderDetails = orderDetailsMap?.[order.id];
              
              return (
                <div
                  key={order.id}
                  className="p-4 bg-card rounded-md border border-border hover-elevate"
                  data-testid={`order-row-${order.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
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
                        <p>Data: {new Date(order.createdAt!).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
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

                  <div className="flex gap-2 mt-4 flex-wrap">
                    <Select
                      value={order.status}
                      onValueChange={(status) => updateStatusMutation.mutate({ orderId: order.id, status })}
                      disabled={updateStatusMutation.isPending}
                    >
                      <SelectTrigger className="w-40" data-testid={`select-status-${order.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                        <SelectItem value="shipped">Enviado</SelectItem>
                        <SelectItem value="delivered">Entregue</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpand(order.id)}
                      className="gap-2"
                      data-testid={`button-toggle-details-${order.id}`}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      {isExpanded ? "Ocultar" : "Ver Detalhes"}
                    </Button>
                  </div>

                  {isExpanded && orderDetails && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3">
                      <h4 className="font-semibold text-sm">Itens do Pedido:</h4>
                      <div className="space-y-2">
                        {orderDetails.items.map((item, idx) => (
                          <div 
                            key={item.id} 
                            className="p-3 bg-muted/50 rounded-md"
                            data-testid={`order-item-${idx}`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{item.productName}</p>
                                <p className="text-sm text-muted-foreground">
                                  Dimensões: {item.width} × {item.height} m ({parseFloat(item.area).toFixed(2)} m²)
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  R$ {parseFloat(item.pricePerM2).toFixed(2)}/m²
                                </p>
                                {parseFloat(item.artCreationFee || "0") > 0 && (
                                  <p className="text-sm text-muted-foreground">
                                    + Criação de arte: R$ {parseFloat(item.artCreationFee).toFixed(2)}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-bold">R$ {parseFloat(item.total).toFixed(2)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
