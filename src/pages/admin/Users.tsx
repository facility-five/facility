import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/admin/StatCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Users as UsersIcon, UserCheck, UserCog } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { NewUserModal } from "@/components/admin/NewUserModal";
import { DeleteUserModal } from "@/components/admin/DeleteUserModal";

export type SystemUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  status: string;
  last_sign_in_at: string;
  whatsapp: string;
};

const Users = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [stats, setStats] = useState({ total: 0, managers: 0, admins: 0 });
  const [loading, setLoading] = useState(true);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);

  const fetchUsersAndStats = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_system_users");
    
    if (error) {
      showRadixError("Erro ao buscar usuários.");
      setUsers([]);
    } else {
      setUsers(data || []);
      const total = data?.length || 0;
      const managers = data?.filter(u => u.role === 'Gestor').length || 0;
      const admins = data?.filter(u => u.role === 'Administrador').length || 0;
      setStats({ total, managers, admins });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsersAndStats();
  }, []);

  const handleEdit = (user: SystemUser) => {
    setSelectedUser(user);
    setIsNewModalOpen(true);
  };

  const handleNew = () => {
    setSelectedUser(null);
    setIsNewModalOpen(true);
  };

  const openDeleteModal = (user: SystemUser) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    const { error } = await supabase.functions.invoke('delete-user', {
      body: { userId: selectedUser.id }
    });

    if (error) {
      showRadixError(`Erro ao eliminar usuário: ${error.message}`);
    } else {
      showRadixSuccess("Usuário eliminado com sucesso!");
      fetchUsersAndStats();
    }
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Usuarios</h1>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleNew}>
          + Novo Usuário
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Usuários Totales" value={loading ? "..." : stats.total.toString()} icon={UsersIcon} />
        <StatCard title="Gerentes" value={loading ? "..." : stats.managers.toString()} icon={UserCheck} />
        <StatCard title="Administradores" value={loading ? "..." : stats.admins.toString()} icon={UserCog} />
      </div>

      <div className="rounded-lg border border-admin-border bg-admin-card">
        <div className="p-4">
            <h3 className="font-bold text-lg">Lista de Usuários</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-b-purple-700 bg-purple-600 hover:bg-purple-600">
              <TableHead className="text-white">Nombre</TableHead>
              <TableHead className="text-white">Tipo de Usuário</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Data</TableHead>
              <TableHead className="text-white text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-b-admin-border"><TableCell colSpan={5}><Skeleton className="h-10 w-full bg-admin-border" /></TableCell></TableRow>
              ))
            ) : users.map((user) => (
              <TableRow key={user.id} className="border-b-admin-border hover:bg-muted/50">
                <TableCell>
                  <p className="font-medium">{`${user.first_name || ''} ${user.last_name || ''}`.trim()}</p>
                  <p className="text-sm text-admin-foreground-muted">{user.email}</p>
                </TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell><Badge variant={user.status === 'Ativo' ? 'default' : 'destructive'}>{user.status}</Badge></TableCell>
                <TableCell>{formatDate(user.last_sign_in_at)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => openDeleteModal(user)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <NewUserModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} onSuccess={fetchUsersAndStats} user={selectedUser} />
      <DeleteUserModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDelete} />
    </AdminLayout>
  );
};

export default Users;
