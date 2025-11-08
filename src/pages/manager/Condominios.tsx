import { useEffect, useState, useCallback } from "react";
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
import { PlanGuard } from "@/components/PlanGuard";

import { usePlan } from "@/hooks/usePlan";
import { useManagerAdministradoras } from "@/contexts/ManagerAdministradorasContext";

const ManagerCondominios = () => {
  const { activeAdministratorId, activeAdministrator } = useManagerAdministradoras();
  const { isFreePlan, isLoading: planLoading, currentPlan } = usePlan();
  const [condos, setCondos] = useState<Condo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCondo, setSelectedCondo] = useState<Condo | null>(null);

  const fetchCondos = useCallback(async () => {
    if (!activeAdministratorId) {
      console.log('📋 Condominios: Skip fetch - no administrator selected');
      setLoading(false);
      setCondos([]);
      return;
    }
    
    setLoading(true);
    console.log('📋 Condominios: Fetching for administrator', activeAdministratorId);
    
    try {
      // Buscar condomínios e contagens em uma única query
      const { data: condosData, error: condosError } = await supabase
        .from("condominiums")
        .select(`
          *,
          blocks:blocks(count),
          units:units(count)
        `)
        .eq('administrator_id', activeAdministratorId);

      if (condosError) {
        console.error("Error fetching condominiums:", condosError);
        showRadixError(
          condosError.message === 'JWT expired'
            ? "Sesión expirada. Por favor, vuelva a iniciar sesión."
            : "Error al buscar condominios. Por favor, inténtelo de nuevo."
        );
        setCondos([]);
        setLoading(false);
        return;
      }

      // Mapear resultados com contagens
      const condosWithCounts = (condosData || []).map((condo: any) => ({
        ...condo,
        total_blocks: (condo.blocks || []).length || 0,
        total_units: (condo.units || []).length || 0,
      }));

      setCondos(condosWithCounts);
    } catch (error) {
      console.error("Unexpected error:", error);
      showRadixError("Error inesperado al cargar condominios. Por favor, actualice la página.");
      setCondos([]);
    }
    
    setLoading(false);
  }, [activeAdministratorId]);

  useEffect(() => {
    console.log('🔄 Condominios: activeAdministratorId mudou para:', activeAdministratorId);
    if (activeAdministratorId) {
      fetchCondos();
    } else {
      console.log('🔄 Condominios: Nenhuma administradora selecionada, limpando lista');
      setCondos([]);
      setLoading(false);
    }
  }, [activeAdministratorId, fetchCondos]);

  const handleNewCondo = () => {
    if (!activeAdministratorId) {
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
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Condominios</h1>
          {activeAdministrator && (
            <Badge variant="outline" className="text-sm">
              {activeAdministrator.name}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Buscar por nombre"
            className="w-64 bg-white border-gray-300 placeholder:text-gray-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {hasReachedLimit ? (
            // Botón de upgrade cuando alcanza el límite
            <Button 
              onClick={() => window.location.href = '/gestor/mi-plan'}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              Actualizar para Crear Más Condominios
            </Button>
          ) : (
            // Botón normal cuando aún puede crear
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleNewCondo}
            >
              Nuevo Condominio
            </Button>
          )}
        </div>
      </div>



      <ManagerTable>
        <ManagerTableHeader>
          <ManagerTableRow>
            <ManagerTableHead>Nombre</ManagerTableHead>
            <ManagerTableHead>NIF</ManagerTableHead>
            <ManagerTableHead>Sitio Web</ManagerTableHead>
            <ManagerTableHead>Área</ManagerTableHead>
            <ManagerTableHead>Tipo</ManagerTableHead>
            <ManagerTableHead>Total de Bloques</ManagerTableHead>
            <ManagerTableHead>Total de Unidades</ManagerTableHead>
            <ManagerTableHead className="text-right">Acciones</ManagerTableHead>
          </ManagerTableRow>
        </ManagerTableHeader>
          <ManagerTableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <ManagerTableRow key={i}>
                  <ManagerTableCell><Skeleton className="h-4 w-32" /></ManagerTableCell>
                  <ManagerTableCell><Skeleton className="h-4 w-24" /></ManagerTableCell>
                  <ManagerTableCell><Skeleton className="h-4 w-40" /></ManagerTableCell>
                  <ManagerTableCell><Skeleton className="h-4 w-20" /></ManagerTableCell>
                  <ManagerTableCell><Skeleton className="h-4 w-24" /></ManagerTableCell>
                  <ManagerTableCell><Skeleton className="h-4 w-16" /></ManagerTableCell>
                  <ManagerTableCell><Skeleton className="h-4 w-16" /></ManagerTableCell>
                  <ManagerTableCell><Skeleton className="h-4 w-16" /></ManagerTableCell>
                </ManagerTableRow>
              ))
            ) : filteredCondos.length === 0 ? (
              <ManagerTableRow>
                <ManagerTableCell colSpan={8} className="text-center py-8">
                  {!activeAdministratorId ? (
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <p className="text-lg">Selecione uma administradora primeiro</p>
                      <p className="text-sm">Use o seletor no topo da página para escolher uma administradora</p>
                    </div>
                  ) : search ? (
                    <p className="text-gray-500">Nenhum condomínio encontrado para "{search}"</p>
                  ) : (
                    <p className="text-gray-500">Nenhum condomínio cadastrado para esta administradora</p>
                  )}
                </ManagerTableCell>
              </ManagerTableRow>
            ) : (
              filteredCondos.map((condo: any) => (
                <ManagerTableRow key={condo.id} className="hover:bg-purple-50">
                  <ManagerTableCell className="font-medium">{condo.name}</ManagerTableCell>
                  <ManagerTableCell>{condo.nif || "N/A"}</ManagerTableCell>
                  <ManagerTableCell>
                    {condo.website ? (
                      <a href={condo.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                        {condo.website}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </ManagerTableCell>
                  <ManagerTableCell>{condo.area ? `${condo.area} m²` : "N/A"}</ManagerTableCell>
                  <ManagerTableCell className="capitalize">{condo.type || "N/A"}</ManagerTableCell>
                  <ManagerTableCell className="text-center font-semibold">{condo.total_blocks || 0}</ManagerTableCell>
                  <ManagerTableCell className="text-center font-semibold">{condo.total_units || 0}</ManagerTableCell>
                  <ManagerTableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditCondo(condo)}
                        className="h-8 w-8 text-gray-500 hover:text-purple-600"
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
        initialAdministratorId={activeAdministratorId || undefined}
      />
      <EditCondoModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchCondos}
        condo={selectedCondo}
        managerAdministratorId={activeAdministratorId}
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
