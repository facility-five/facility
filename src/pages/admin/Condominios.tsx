import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CondoCard, Condo } from "@/components/admin/CondoCard";
import { NewCondoModal } from "@/components/admin/NewCondoModal";
import { DeleteCondoModal } from "@/components/admin/DeleteCondoModal";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { EditCondoModal } from "@/components/manager/EditCondoModal"; // Reusing EditCondoModal

const Condominios = () => {
  const [condos, setCondos] = useState<Condo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Added for editing
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCondo, setSelectedCondo] = useState<Condo | null>(null); // Changed to store full condo object

  const fetchCondos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("condominiums") // Changed from "condos" to "condominiums"
      .select("*");

    if (error) {
      showError("Erro ao buscar condomínios.");
    } else {
      setCondos(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCondos();
  }, []);

  const handleDelete = async () => {
    if (!selectedCondo) return; // Use selectedCondo
    const { error } = await supabase
      .from("condominiums") // Changed from "condos" to "condominiums"
      .delete()
      .eq("id", selectedCondo.id); // Use selectedCondo.id

    if (error) {
      showError(error.message);
    } else {
      showSuccess("Condomínio excluído com sucesso!");
      fetchCondos();
    }
    setIsDeleteModalOpen(false);
    setSelectedCondo(null);
  };

  const openDeleteModal = (condo: Condo) => { // Changed to accept full condo object
    setSelectedCondo(condo);
    setIsDeleteModalOpen(true);
  };

  const handleEditCondo = (condo: Condo) => { // New function for editing
    setSelectedCondo(condo);
    setIsEditModalOpen(true);
  };

  const filteredCondos = condos.filter((condo) =>
    condo.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Condomínios</h1>
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
            Novo Condomínio
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full bg-admin-border" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCondos.map((condo) => (
            <CondoCard
              key={condo.id}
              condo={condo}
              onDelete={() => openDeleteModal(condo)} // Pass full condo object
              onEdit={() => handleEditCondo(condo)} // Pass full condo object for editing
            />
          ))}
        </div>
      )}

      <NewCondoModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={fetchCondos}
      />
      <EditCondoModal // New EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchCondos}
        condo={selectedCondo}
        managerAdministratorId={null} // Admin can select any administrator
      />
      <DeleteCondoModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </AdminLayout>
  );
};

export default Condominios;