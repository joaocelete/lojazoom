import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Shield, User as UserIcon } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

export default function AdminUsersManager() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const { data, isLoading } = useQuery<{ users: Omit<User, 'password'>[] }>({
    queryKey: ["/api/users"],
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'customer' }) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}/role`, { role });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Role atualizado",
        description: "O role do usuário foi atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o role do usuário.",
        variant: "destructive",
      });
    },
  });

  const users = data?.users || [];

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role: string) => {
    return role === "admin" ? "default" : "secondary";
  };

  const getRoleLabel = (role: string) => {
    return role === "admin" ? "Administrador" : "Cliente";
  };

  const getRoleIcon = (role: string) => {
    return role === "admin" ? Shield : UserIcon;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Usuários</CardTitle>
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search-users"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-48" data-testid="select-role-filter">
              <SelectValue placeholder="Filtrar por role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Roles</SelectItem>
              <SelectItem value="admin">Administradores</SelectItem>
              <SelectItem value="customer">Clientes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando usuários...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {searchTerm || roleFilter !== "all" 
                ? "Nenhum usuário encontrado com os filtros aplicados"
                : "Nenhum usuário encontrado"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => {
              const RoleIcon = getRoleIcon(user.role);
              
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-card rounded-md border border-border hover-elevate"
                  data-testid={`user-row-${user.id}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <RoleIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold">{user.name}</h3>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ID: {user.id.slice(0, 8)} • Cadastrado em {new Date(user.createdAt!).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="ml-4">
                    <Select
                      value={user.role}
                      onValueChange={(role) => updateRoleMutation.mutate({ 
                        userId: user.id, 
                        role: role as 'admin' | 'customer' 
                      })}
                      disabled={updateRoleMutation.isPending}
                    >
                      <SelectTrigger className="w-40" data-testid={`select-role-${user.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Cliente</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
