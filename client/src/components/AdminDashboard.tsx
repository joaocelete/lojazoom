import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, Clock, ArrowUpRight, AlertCircle } from "lucide-react";
import type { Order } from "@shared/schema";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  recentOrders: Order[];
  ordersByStatus: Record<string, number>;
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard"],
  });

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Carregando dashboard...
      </div>
    );
  }

  const stats = data || {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    recentOrders: [],
    ordersByStatus: {},
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

  const getStatusVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      paid: "default",
      shipped: "default",
      delivered: "default",
      cancelled: "destructive",
    };
    return variants[status] || "secondary";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Visão geral do seu negócio
          </p>
        </div>
        <Badge variant="default" className="text-sm px-3 py-1">
          <Clock className="h-3 w-3 mr-1" />
          Atualizado agora
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-revenue" className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <div className="p-2 bg-green-100 rounded-md">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-revenue">
              R$ {stats.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              {stats.totalOrders} pedidos realizados
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-orders" className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <div className="p-2 bg-blue-100 rounded-md">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-orders">
              {stats.totalOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              Todos os status
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-customers" className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <div className="p-2 bg-purple-100 rounded-md">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-customers">
              {stats.totalCustomers}
            </div>
            <p className="text-xs text-muted-foreground">
              Cadastrados
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-products" className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <div className="p-2 bg-yellow-100 rounded-md">
              <Package className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-products">
              {stats.totalProducts}
            </div>
            <p className="text-xs text-muted-foreground">
              No catálogo
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Status dos Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusVariant(status)}>
                      {getStatusLabel(status)}
                    </Badge>
                  </div>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
              {Object.keys(stats.ordersByStatus).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum pedido ainda
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pedidos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                  data-testid={`recent-order-${order.id}`}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt!).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      R$ {parseFloat(order.total).toFixed(2)}
                    </p>
                    <Badge variant={getStatusVariant(order.status)} className="text-xs">
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                </div>
              ))}
              {stats.recentOrders.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum pedido recente
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
