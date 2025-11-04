import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Shield, 
  Mail,
  Phone,
  Calendar,
  Filter
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UserManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "manager" | "operator";
  status: "active" | "inactive" | "pending";
  lastLogin: string;
  createdAt: string;
}

export const UserManagementModal = ({ open, onOpenChange }: UserManagementModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddUser, setShowAddUser] = useState(false);

  // Mock data - em produção viria de uma API
  const [users] = useState<User[]>([
    {
      id: "1",
      name: "João Silva",
      email: "joao@administradora.com",
      phone: "(11) 99999-9999",
      role: "admin",
      status: "active",
      lastLogin: "2024-01-15 14:30",
      createdAt: "2024-01-01"
    },
    {
      id: "2",
      name: "Maria Santos",
      email: "maria@administradora.com",
      phone: "(11) 88888-8888",
      role: "manager",
      status: "active",
      lastLogin: "2024-01-14 09:15",
      createdAt: "2024-01-05"
    },
    {
      id: "3",
      name: "Pedro Costa",
      email: "pedro@administradora.com",
      phone: "(11) 77777-7777",
      role: "operator",
      status: "pending",
      lastLogin: "Nunca",
      createdAt: "2024-01-10"
    }
  ]);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "operator" as const,
    sendInvite: true
  });

  const getRoleLabel = (role: string) => {
    const roles = {
      admin: "Administrador",
      manager: "Gestor",
      operator: "Operador"
    };
    return roles[role as keyof typeof roles] || role;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: "Ativo",
      inactive: "Inativo",
      pending: "Pendente"
    };
    return labels[status as keyof typeof labels] || status;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = () => {
    // Aqui implementaria a lógica de adicionar usuário
    console.log("Adicionando usuário:", newUser);
    setShowAddUser(false);
    setNewUser({
      name: "",
      email: "",
      phone: "",
      role: "operator",
      sendInvite: true
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Gestão de Usuários
          </DialogTitle>
          <DialogDescription>
            Configure permissões e acesso de usuários do sistema.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="roles">Perfis</TabsTrigger>
            <TabsTrigger value="permissions">Permissões</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            {!showAddUser ? (
              <>
                {/* Filtros e Busca */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-1 gap-2">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar usuários..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os perfis</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="manager">Gestor</SelectItem>
                        <SelectItem value="operator">Operador</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={() => setShowAddUser(true)} className="bg-purple-600 hover:bg-purple-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar Usuário
                  </Button>
                </div>

                {/* Tabela de Usuários */}
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Contato</TableHead>
                          <TableHead>Perfil</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Último Acesso</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1 text-sm">
                                  <Mail className="h-3 w-3" />
                                  {user.email}
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="h-3 w-3" />
                                  {user.phone}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                <Shield className="h-3 w-3" />
                                {getRoleLabel(user.role)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(user.status)}>
                                {getStatusLabel(user.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="h-3 w-3" />
                                {user.lastLogin}
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remover
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            ) : (
              /* Formulário de Adicionar Usuário */
              <Card>
                <CardHeader>
                  <CardTitle>Adicionar Novo Usuário</CardTitle>
                  <CardDescription>
                    Preencha as informações do novo usuário
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="userName">Nome Completo *</Label>
                      <Input
                        id="userName"
                        value={newUser.name}
                        onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nome do usuário"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userEmail">E-mail *</Label>
                      <Input
                        id="userEmail"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="userPhone">Telefone</Label>
                      <Input
                        id="userPhone"
                        value={newUser.phone}
                        onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userRole">Perfil *</Label>
                      <Select value={newUser.role} onValueChange={(value: any) => setNewUser(prev => ({ ...prev, role: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="operator">Operador</SelectItem>
                          <SelectItem value="manager">Gestor</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sendInvite"
                      checked={newUser.sendInvite}
                      onCheckedChange={(checked) => setNewUser(prev => ({ ...prev, sendInvite: checked }))}
                    />
                    <Label htmlFor="sendInvite">Enviar convite por e-mail</Label>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddUser} className="bg-purple-600 hover:bg-purple-700">
                      Adicionar Usuário
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddUser(false)}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-600" />
                    Administrador
                  </CardTitle>
                  <CardDescription>Acesso total ao sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• Gerenciar usuários</li>
                    <li>• Configurar sistema</li>
                    <li>• Acessar relatórios</li>
                    <li>• Todas as permissões</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    Gestor
                  </CardTitle>
                  <CardDescription>Gerenciamento operacional</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• Gerenciar condomínios</li>
                    <li>• Visualizar relatórios</li>
                    <li>• Gerenciar reservas</li>
                    <li>• Atender solicitações</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    Operador
                  </CardTitle>
                  <CardDescription>Operações básicas</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• Visualizar dados</li>
                    <li>• Atender solicitações</li>
                    <li>• Gerenciar reservas</li>
                    <li>• Acesso limitado</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Matriz de Permissões</CardTitle>
                <CardDescription>
                  Configure as permissões específicas para cada perfil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Configuração avançada de permissões</p>
                  <p className="text-sm">Em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};