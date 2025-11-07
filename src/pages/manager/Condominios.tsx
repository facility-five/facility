import { useEffect, useState } from "react";
import { ManagerLayout } from "@/components/manager/ManagerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Condo } from "@/components/admin/CondoCard"; // Reusing Condo type
import { ManagerTable, ManagerTableBody, ManagerTableCell, ManagerTableHead, ManagerTableHeader, ManagerTableRow } from "@/components/manager/ManagerTable";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { NewCondoModal } from "@/components/admin/NewCondoModal"; // Reusing NewCondoModal
import { EditCondoModal } from "@/components/manager/EditCondoModal"; // New EditCondoModal
import { DeleteCondoModal } from "@/components/admin/DeleteCondoModal"; // Reusing DeleteCondoModal
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { PlanGuard } from "@/components/PlanGuard";
import { UpgradeBanner } from "@/components/UpgradeBanner";
import { usePlan } from "@/hooks/usePlan";

const ManagerCondominios = () => {
  const { user } = useAuth();
  const { isFreePlan, isLoading: planLoading, currentPlan } = usePlan();
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
          showRadixError("Erro ao buscar ID da administradora.");
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
      showRadixError("Erro ao buscar condomínios.");
    } else {
      setCondos(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (managerAdministratorId) {
      fetchCondos();
    } else {
      // Se não há managerAdministratorId, definir loading como false para mostrar a interface
      setLoading(false);
    }
  }, [managerAdministratorId]);

  const handleNewCondo = () => {
    if (!managerAdministratorId) {
      showRadixError("Aguarde o carregamento das informações da administradora");
      return;
    }
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
      showRadixError(error.message);
    } else {
      showRadixSuccess("Condomínio excluído com sucesso!");
      fetchCondos();
    }
    setIsDeleteModalOpen(false);
    setSelectedCondo(null);
  };

  const filteredCondos = condos.filter((condo) =>
    condo.name.toLowerCase().includes(search.toLowerCase())
  );

  // Verificar se atingiu o limite de condomínios
  const hasReachedLimit = 
    currentPlan && 
    currentPlan.max_condos !== null && 
    condos.length >= currentPlan.max_condos;

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
          {hasReachedLimit ? (
            // Botão de upgrade quando atingir o limite
            <Button 
              onClick={() => window.location.href = '/gestor/mi-plan'}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              Fazer Upgrade para Criar Mais Condomínios
            </Button>
          ) : (
            // Botão normal quando ainda pode criar
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleNewCondo}
            >
              Novo Condomínio
            </Button>
          )}
        </div>
      </div>

      {hasReachedLimit && currentPlan && (
        <div className="mb-6">
          <UpgradeBanner
            title={`Limite de ${currentPlan.max_condos} condomínio${currentPlan.max_condos === 1 ? '' : 's'} atingido`}
            description={`Você está usando ${condos.length} de ${currentPlan.max_condos} condomínio${currentPlan.max_condos === 1 ? '' : 's'} do seu plano. Faça upgrade para criar mais condomínios e expandir sua gestão.`}
            variant="default"
          />
        </div>
      )}

      <ManagerTable>
        <ManagerTableHeader>
          <ManagerTableRow>
            <ManagerTableHead>Status</ManagerTableHead>
            <ManagerTableHead>Nome</ManagerTableHead>
            <ManagerTableHead>Unidades</ManagerTableHead>
            <ManagerTableHead>Moradores</ManagerTableHead>
            <ManagerTableHead>Administradora</ManagerTableHead>
            <ManagerTableHead className="text-right">Ações</ManagerTableHead>
          </ManagerTableRow>
        </ManagerTableHeader>
          <ManagerTableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <ManagerTableRow key={i}>
                  <ManagerTableCell><Skeleton className="h-4 w-16" /></ManagerTableCell>
                  <ManagerTableCell><Skeleton className="h-4 w-32" /></ManagerTableCell>
                  <ManagerTableCell><Skeleton className="h-4 w-16" /></ManagerTableCell>
                  <ManagerTableCell><Skeleton className="h-4 w-16" /></ManagerTableCell>
                  <ManagerTableCell><Skeleton className="h-4 w-24" /></ManagerTableCell>
                  <ManagerTableCell><Skeleton className="h-4 w-16" /></ManagerTableCell>
                </ManagerTableRow>
              ))
            ) : filteredCondos.length === 0 ? (
              <ManagerTableRow>
                <ManagerTableCell colSpan={6} className="text-center text-gray-500 py-8">
                  {managerAdministratorId ? "Nenhum condomínio encontrado para sua administradora." : "Carregando informações da administradora..."}
                </ManagerTableCell>
              </ManagerTableRow>
            ) : (
              filteredCondos.map((condo) => (
                <ManagerTableRow key={condo.id} className="hover:bg-gray-50">
                  <ManagerTableCell>
                    {condo.status === "active" ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>
                    ) : (
                      <Badge variant="destructive" className="capitalize">{condo.status}</Badge>
                    )}
                  </ManagerTableCell>
                  <ManagerTableCell className="font-medium">{condo.name}</ManagerTableCell>
                  <ManagerTableCell>{condo.total_units || 0}</ManagerTableCell>
                  <ManagerTableCell>124</ManagerTableCell>
                  <ManagerTableCell>{condo.responsible_name || "N/A"}</ManagerTableCell>
                  <ManagerTableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditCondo(condo)}
                        className="h-8 w-8 text-gray-500 hover:text-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteModal(condo)}
                        className="h-8 w-8 text-gray-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </ManagerTableCell>
                </ManagerTableRow>
              ))
            )}
          </ManagerTableBody>
        </ManagerTable>

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
