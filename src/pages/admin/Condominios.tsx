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

const Condominios = () => {
  const [condos, setCondos] = useState<Condo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCondoId, setSelectedCondoId] = useState<string | null>(null);

  const fetchCondos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("condos")
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
    if (!selectedCondoId) return;
    const { error } = await supabase
      .from("condos")
      .delete()
      .eq("id", selectedCondoId);

    if (error) {
      showError(error.message);
    } else {
      showSuccess("Condomínio excluído com sucesso!");
      fetchCondos();
    }
    setIsDeleteModalOpen(false);
    setSelectedCondoId(null);
  };

  const openDeleteModal = (id: string) => {
    setSelectedCondoId(id);
    setIsDeleteModalOpen(true);
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
              onDelete={() => openDeleteModal(condo.id)}
            />
          ))}
        </div>
      )}

      <NewCondoModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={fetchCondos}
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