import { useEffect, useState, useCallback } from "react";
import { ManagerLayout } from "@/components/manager/ManagerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Condo } from "@/components/admin/CondoCard"; // Reusing Condo type
import { ManagerTable, ManagerTableBody, ManagerTableCell, ManagerTableHead, ManagerTableHeader, ManagerTableRow } from "@/components/manager/ManagerTable";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Building2 } from "lucide-react";
import { NewCondoModal } from "@/components/admin/NewCondoModal"; // Reusing NewCondoModal
import { EditCondoModal } from "@/components/manager/EditCondoModal"; // New EditCondoModal
import { DeleteCondoModal } from "@/components/admin/DeleteCondoModal"; // Reusing DeleteCondoModal
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { PlanGuard } from "@/components/PlanGuard";

import { usePlan } from "@/hooks/usePlan";
import { useManagerAdministradoras } from "@/contexts/ManagerAdministradorasContext";
import { Condominium, NormalizedCondominium } from "@/types/entities";

const ManagerCondominios = () => {
  const { activeAdministratorId, activeAdministrator, loading: adminLoading } = useManagerAdministradoras();
  const { isFreePlan, isLoading: planLoading, currentPlan } = usePlan();
  const [condos, setCondos] = useState<Condo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCondo, setSelectedCondo] = useState<Condo | null>(null);

  // Log opcional para debug
  useEffect(() => {
    // // console.log("[ACTIVE ADMIN]", activeAdministrator?.name);
  }, [activeAdministrator?.name]);

  const fetchCondos = useCallback(async () => {
    if (!activeAdministratorId) {
      console.log('📋 Condominios: Skip fetch - no administrator selected');
      setLoading(false);
      setCondos([]);
      return;
    }
    
    setLoading(true);
    console.log('==========================================');
    console.log('📋 [Condomínios] INICIANDO FETCH');
    console.log('📋 Administrator ID:', activeAdministratorId);
    console.log('📋 Administrator Name:', activeAdministrator?.name);
    console.log('📋 Timestamp:', new Date().toISOString());
    console.log('==========================================');
    
    try {
      // Preferred select includes `type` (DB column). We'll try this first and
      // fall back to a select without `type` if the server returns an error
      // (helps when schema differs / older migrations use a different name).
      const preferredSelect =
        "id,name,nif,email,phone,website,area,type,total_blocks,total_units,status,created_at,updated_at,administrator_id";

      const attempt = async (selectStr: string) =>
        supabase
          .from("condominiums")
          .select(selectStr)
          .eq("administrator_id", activeAdministratorId);

      let result = await attempt(preferredSelect);

      // If the server returned an error, we'll try two fallbacks:
      // 1) same select without `type`
      // 2) '*' (all columns) which should never reference a missing column by name
      if (result.error) {
        console.error("❌ Error fetching condominiums (first attempt):", result.error);

        const msg = String((result.error && (result.error.message || result.error.msg)) || "").toLowerCase();
        const status = (result.error && ((result.error as { status?: number }).status || 
                          (result.error as { statusCode?: number }).statusCode || 
                          (result.error as { status_code?: number }).status_code)) || null;
        const looksLikeMissingColumn = msg.includes("does not exist") || msg.includes("column") || status === 400;

        // First fallback: try without explicit `type` column
        if (looksLikeMissingColumn) {
          try {
            console.log("⚠️ Condominios: retrying fetch without 'type' column due to server error");
            const fallbackSelect = preferredSelect.replace(/,?type,?/, ",").replace(/(^,|,$)/g, "");
            result = await attempt(fallbackSelect);
          } catch (e) {
            console.error("❌ Condominios: fallback attempt without 'type' threw:", e);
          }
        }

        // Second fallback: try selecting '*' (all columns) which should work even
        // if a named column is missing.
        if (result.error) {
          try {
            console.log("⚠️ Condominios: retrying fetch with '*' as final fallback");
            result = await attempt("*");
          } catch (e) {
            console.error("❌ Condominios: final fallback '*' threw:", e);
          }
        }

      }

      if (result.error) {
        // Still an error after fallbacks
        console.error("❌ Error fetching condominiums (final):", result.error);
        if ((result.error as { code?: string }).code !== "PGRST116") {
          showRadixError("Erro ao buscar condomínios. Tente novamente.");
        }
        setCondos([]);
        return;
      }

      const condosData = result.data as Condominium[] | null;
      const list = condosData || [];
      // Normalize: ensure older code that expects `condo_type` still works and
      // expose `type` when available.
      const normalized = list.map((c) => ({ 
        ...c, 
        condo_type: c.type ?? c.condo_type ?? "residencial" 
      } as NormalizedCondominium));

      console.log('==========================================');
      console.log('✅ [Condomínios] RESPOSTA RECEBIDA');
      console.log('✅ Total de registros:', normalized.length);
      console.log('✅ Dados sample:', normalized.slice(0, 5).map((c) => ({ id: c.id, name: c.name, type: c.type ?? null })));
      console.log('✅ Filtrado por administrator_id:', activeAdministratorId);
      console.log('==========================================');

      setCondos(normalized);
    } catch (error) {
      console.error("❌ Unexpected error:", error);
      showRadixError("Erro inesperado ao carregar condomínios. Atualize a página.");
      setCondos([]);
    } finally {
      setLoading(false);
    }
  }, [activeAdministratorId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Trigger fetch when administrators context finishes loading and an administrator is selected
  useEffect(() => {
    if (adminLoading) {
      // still loading administrators - keep page loading
      setLoading(true);
      return;
    }

    if (activeAdministratorId) {
      fetchCondos();
    } else {
      // no admin available for this manager - show friendly empty state
      setCondos([]);
      setLoading(false);
    }
  }, [adminLoading, activeAdministratorId, fetchCondos]);

  // Listener em tempo real para sincronizar condomínios entre dispositivos
  useEffect(() => {
    if (!activeAdministratorId) return;

    console.log('🔔 Condominios: Setting up real-time listener for condominiums');

    const channel = supabase
      .channel(`condominiums-${activeAdministratorId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'condominiums',
          filter: `administrator_id=eq.${activeAdministratorId}`,
        },
        (payload) => {
          console.log('🔔 Condominium change detected:', payload);
          fetchCondos();
        }
      )
      .subscribe();

    return () => {
      console.log('🔕 Condominios: Removing real-time listener');
      supabase.removeChannel(channel);
    };
  }, [activeAdministratorId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fallback visual quando não há administradora selecionada
  if (!activeAdministratorId) {
    return (
      <ManagerLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
          <Building2 className="h-16 w-16 text-purple-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Nenhuma administradora selecionada
          </h3>
          <p className="text-gray-500 text-center mb-6 max-w-md">
            Para gestionar condomínios, primero necesitas crear o seleccionar una administradora.
          </p>
          <Button
            onClick={() => window.location.href = '/gestor/administradoras'}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Building2 className="h-4 w-4 mr-2" />
            Ir a Administradoras
          </Button>
        </div>
      </ManagerLayout>
    );
  }

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
            <ManagerTableHead>Administradora</ManagerTableHead>
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
                <ManagerTableCell colSpan={9} className="text-center py-8">
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
                  <ManagerTableCell>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      {activeAdministrator?.name || "N/A"}
                    </Badge>
                  </ManagerTableCell>
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
