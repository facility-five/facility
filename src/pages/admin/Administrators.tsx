import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdministratorCard, Administrator } from "@/components/admin/AdministratorCard";
import { NewAdministratorModal } from "@/components/admin/NewAdministratorModal";
import { DeleteAdministratorModal } from "@/components/admin/DeleteAdministratorModal";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";

const Administrators = () => {
  const [admins, setAdmins] = useState<Administrator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);

  const fetchAdmins = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("administrators")
      .select("*, condos(count), profiles(first_name, last_name)");

    if (error) {
      showError("Erro ao buscar administradoras.");
    } else {
      setAdmins(data as any[] || []);
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
      showError(error.message);
    } else {
      showSuccess("Administradora eliminada com sucesso!");
      fetchAdmins();
    }
    setIsDeleteModalOpen(false);
    setSelectedAdminId(null);
  };

  const openDeleteModal = (id: string) => {
    setSelectedAdminId(id);
    setIsDeleteModalOpen(true);
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
            className="w-64"
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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdmins.map((admin) => (
            <AdministratorCard
              key={admin.id}
              admin={admin}
              onDelete={() => openDeleteModal(admin.id)}
            />
          ))}
        </div>
      )}

      <NewAdministratorModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={fetchAdmins}
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