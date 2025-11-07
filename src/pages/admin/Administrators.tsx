import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Administrator } from "@/components/admin/AdministratorCard";
import { NewAdministratorModal } from "@/components/admin/NewAdministratorModal";
import { DeleteAdministratorModal } from "@/components/admin/DeleteAdministratorModal";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { EditAdministratorModal } from "@/components/admin/EditAdministratorModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";

const Administrators = () => {
  const [admins, setAdmins] = useState<Administrator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Administrator | null>(null);
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);

  const fetchAdmins = async () => {
    setLoading(true);

    const { data, error } = await supabase.rpc("get_administrators_with_details");
    if (error) {
      showRadixError("Erro ao buscar administradoras.");
      setAdmins([]);
    } else {
      const mapped = (data || []).map((row: any) => ({
        id: row.id,
        code: row.code,
        name: row.name,
        nif: row.nif,
        condos: [{ count: row.condos_count || 0 }],
        profiles: row.created_by_first_name || row.created_by_last_name || row.created_by_email ? {
          first_name: row.created_by_first_name,
          last_name: row.created_by_last_name,
          email: row.created_by_email
        } : null,
        created_by: null,
      })) as Administrator[];
      setAdmins(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleDelete = async () => {
    if (!selectedAdminId) return;
    const { error } = await supabase
      .from("administrators")
      .delete()
      .eq("id", selectedAdminId);

    if (error) {
      showRadixError(error.message);
    } else {
      showRadixSuccess("Administradora eliminada com sucesso!");
      fetchAdmins();
    }
    setIsDeleteModalOpen(false);
    setSelectedAdminId(null);
  };

  const openDeleteModal = (id: string) => {
    setSelectedAdminId(id);
    setIsDeleteModalOpen(true);
  };

  const openEditModal = (admin: Administrator) => {
    setSelectedAdmin(admin);
    setIsEditModalOpen(true);
  };

  const filteredAdmins = admins.filter((admin) =>
    admin.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Administradoras</h1>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Buscar por nombre"
            className="w-64 bg-admin-card border-admin-border placeholder:text-admin-foreground-muted"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => setIsNewModalOpen(true)}
          >
            Nueva Administradora
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-admin-border bg-admin-card">
        <Table>
          <TableHeader>
            <TableRow className="border-b-purple-700 bg-purple-600 hover:bg-purple-600">
              <TableHead className="text-white">Código</TableHead>
              <TableHead className="text-white">Nome</TableHead>
              <TableHead className="text-white">NIF</TableHead>
              <TableHead className="text-white">Responsável</TableHead>
              <TableHead className="text-white text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-b-admin-border">
                  <TableCell colSpan={5}>
                    <Skeleton className="h-8 w-full bg-admin-border" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredAdmins.length > 0 ? (
              filteredAdmins.map((admin) => (
                <TableRow key={admin.id} className="border-b-admin-border hover:bg-muted/50">
                  <TableCell className="font-medium text-purple-400">{admin.code}</TableCell>
                  <TableCell className="font-medium">{admin.name}</TableCell>
                  <TableCell>{admin.nif}</TableCell>
                  <TableCell>
                    {admin.profiles ? (
                      <div>
                        <p className="font-medium">{`${admin.profiles.first_name || ''} ${admin.profiles.last_name || ''}`.trim() || 'Sem nome'}</p>
                        {admin.profiles.email && (
                          <p className="text-xs text-admin-foreground-muted">{admin.profiles.email}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-admin-foreground-muted">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(admin)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteModal(admin.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="border-b-admin-border">
                <TableCell colSpan={5} className="text-center text-admin-foreground-muted">
                  Nenhuma administradora encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <NewAdministratorModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={fetchAdmins}
      />
      <EditAdministratorModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchAdmins}
        admin={selectedAdmin}
      />
      <DeleteAdministratorModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
};

export default Administrators;
