import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { NewUserModal } from "./NewUserModal";
import { DeleteUserModal } from "./DeleteUserModal";

type SystemUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  status: string;
  last_sign_in_at: string;
  whatsapp: string;
};

export const SystemUsersTab = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<SystemUser | null>(null);
  const [query, setQuery] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_system_users");
    if (error) {
      showRadixError("Erro ao buscar usuários.");
    } else {
      setUsers((data as SystemUser[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      `${u.first_name ?? ""} ${u.last_name ?? ""} ${u.email ?? ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [users, query]);

  const getInitials = (firstName = "", lastName = "") => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const openNew = () => {
    setSelected(null);
    setIsModalOpen(true);
  };

  const openEdit = (u: SystemUser) => {
    setSelected(u);
    setIsModalOpen(true);
  };

  const openDelete = (u: SystemUser) => {
    setSelected(u);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selected) return;
    const { error } = await supabase.functions.invoke("delete-user", {
      body: { userId: selected.id },
    });
    if (error) {
      showRadixError(`Erro ao eliminar usuário: ${error.message}`);
    } else {
      showRadixSuccess("Usuário eliminado com sucesso!");
      fetchUsers();
    }
    setIsDeleteOpen(false);
    setSelected(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">Usuários do Sistema</h2>
          <p className="text-admin-foreground-muted">Gerencie todos os usuários da plataforma</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={openNew}>
          + Adicionar Usuário
        </Button>
      </div>
      <div className="border border-admin-border rounded-lg p-4 bg-admin-card">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Lista de Usuários</h3>
            <Input
              placeholder="Buscar usuários..."
              className="w-64 bg-admin-background border-admin-border"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-b-admin-border">
              <TableHead>Usuário</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Último Acesso</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i} className="border-b-admin-border">
                  <TableCell colSpan={5}><Skeleton className="h-10 w-full bg-admin-border" /></TableCell>
                </TableRow>
              ))
            ) : filtered.map((user) => (
              <TableRow key={user.id} className="border-b-admin-border">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage />
                      <AvatarFallback>
                        {user.first_name ? getInitials(user.first_name, user.last_name) : <User />}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{`${user.first_name || ''} ${user.last_name || ''}`.trim()}</p>
                      <p className="text-sm text-admin-foreground-muted">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === 'Administrador' ? 'destructive' : 'secondary'}>{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'Ativo' ? 'default' : 'outline'}>{user.status}</Badge>
                </TableCell>
                <TableCell>
                  {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(user)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openDelete(user)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <NewUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUsers}
        user={selected}
      />
      <DeleteUserModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
