import { useEffect, useState } from "react";
import { ManagerLayout } from "@/components/manager/ManagerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CondoCard, Condo } from "@/components/admin/CondoCard"; // Reusing CondoCard
import { NewCondoModal } from "@/components/admin/NewCondoModal"; // Reusing NewCondoModal
import { EditCondoModal } from "@/components/manager/EditCondoModal"; // New EditCondoModal
import { DeleteCondoModal } from "@/components/admin/DeleteCondoModal"; // Reusing DeleteCondoModal
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

const ManagerCondominios = () => {
  const { user } = useAuth();
  const [condos, setCondos] = useState<Condo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCondo, setSelectedCondo] = useState<Condo | null>(null);
  const [managerAdministratorId, setManagerAdministratorId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdministratorId = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('administrators')
          .select('id')
          .eq('responsible_id', user.id)
          .single();
        if (data) {
          setManagerAdministratorId(data.id);
        } else if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
          showError("Erro ao buscar ID da administradora.");
        }
      }
    };
    fetchAdministratorId();
  }, [user]);

  const fetchCondos = async () => {
    if (!managerAdministratorId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("condominiums") // Changed from "condos" to "condominiums"
      .select("*")
      .eq('administrator_id', managerAdministratorId);

    if (error) {
      showError("Erro ao buscar condomínios.");
    } else {
      setCondos(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (managerAdministratorId) {
      fetchCondos();
    }
  }, [managerAdministratorId]);

  const handleNewCondo = () => {
    setSelectedCondo(null);
    setIsNewModalOpen(true);
  };

  const handleEditCondo = (condo: Condo) => {
    setSelectedCondo(condo);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (condo: Condo) => {
    setSelectedCondo(condo);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedCondo) return;
    const { error } = await supabase
      .from("condominiums") // Changed from "condos" to "condominiums"
      .delete()
      .eq("id", selectedCondo.id);

    if (error) {
      showError(error.message);
    } else {
      showSuccess("Condomínio excluído com sucesso!");
      fetchCondos();
    }
    setIsDeleteModalOpen(false);
    setSelectedCondo(null);
  };

  const filteredCondos = condos.filter((condo) =>
    condo.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ManagerLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Condomínios</h1>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Buscar por nombre"
            className="w-64 bg-white border-gray-300 placeholder:text-gray-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={handleNewCondo}
            disabled={!managerAdministratorId} // Disable if no administrator ID is found
          >
            Novo Condomínio
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full bg-gray-200" />
          ))}
        </div>
      ) : filteredCondos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {managerAdministratorId ? "Nenhum condomínio encontrado para sua administradora." : "Carregando informações da administradora..."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCondos.map((condo) => (
            <CondoCard
              key={condo.id}
              condo={condo}
              onDelete={() => openDeleteModal(condo)}
              onEdit={() => handleEditCondo(condo)}
            />
          ))}
        </div>
      )}

      <NewCondoModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={fetchCondos}
        // Pass the manager's administrator ID to pre-fill the form
        initialAdministratorId={managerAdministratorId || undefined}
      />
      <EditCondoModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchCondos}
        condo={selectedCondo}
        managerAdministratorId={managerAdministratorId}
      />
      <DeleteCondoModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </ManagerLayout>
  );
};

export default ManagerCondominios;