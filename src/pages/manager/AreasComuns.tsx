import { useEffect, useState } from "react";
import { ManagerLayout } from "@/components/manager/ManagerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ManagerTable,
  ManagerTableBody,
  ManagerTableCell,
  ManagerTableHead,
  ManagerTableHeader,
  ManagerTableRow,
} from "@/components/manager/ManagerTable";
import { Pencil, Trash2, Search, Plus } from "lucide-react";
import { NewManagerCommonAreaModal } from "@/components/manager/NewManagerCommonAreaModal";
import { DeleteManagerCommonAreaModal } from "@/components/manager/DeleteManagerCommonAreaModal";
import { useManagerAdministradoras } from "@/contexts/ManagerAdministradorasContext";
import { PlanGuard } from "@/components/PlanGuard";

import { usePlan } from "@/hooks/usePlan";

export type CommonArea = {
  id: string;
  code: string;
  name: string;
  description: string;
  capacity: number;
  opening_time: string;
  closing_time: string;
  booking_fee: number;
  requires_approval: boolean;
  condominiums: { name: string } | null;
  [key: string]: any;
};

const AreasComunsContent = () => {
  const { activeAdministratorId } = useManagerAdministradoras();
  const { isFreePlan, isLoading: planLoading } = usePlan();
  const [areas, setAreas] = useState<CommonArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<CommonArea | null>(null);

  const fetchAreas = async () => {
    setLoading(true);
    
    let query = supabase
      .from("common_areas")
      .select(`
        *,
        condominiums!inner(
          name,
          administrator_id
        )
      `)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    // No plano pago, filtra por administradora selecionada
    if (!isFreePlan && activeAdministratorId) {
      query = query.eq("condominiums.administrator_id", activeAdministratorId);
    }

    const { data, error } = await query;

    if (error) {
      showRadixError("Erro ao buscar áreas comuns.");
      console.error("Error fetching areas:", error);
    } else {
      setAreas(data as any[] || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    // No plano gratuito, sempre busca as áreas
    // No plano pago, só busca se há administradora selecionada
    if (isFreePlan || activeAdministratorId) {
      fetchAreas();
    } else {
      // Se não há activeAdministratorId no plano pago, definir loading como false para mostrar a interface
      setLoading(false);
    }
  }, [activeAdministratorId, isFreePlan]);

  const handleNewArea = () => {
    setSelectedArea(null);
    setIsFormModalOpen(true);
  };

  const handleEditArea = (area: CommonArea) => {
    setSelectedArea(area);
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (area: CommonArea) => {
    setSelectedArea(area);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedArea) return;
    
    const { error } = await supabase
      .from("common_areas")
      .update({ is_deleted: true })
      .eq("id", selectedArea.id);

    if (error) {
      showRadixError(error.message);
    } else {
      showRadixSuccess("Área comum excluída com sucesso!");
      fetchAreas();
    }
    setIsDeleteModalOpen(false);
    setSelectedArea(null);
  };

  const formatTime = (time: string) => time ? time.substring(0, 5) : '-';
  const formatCurrency = (value: number) => 
    value ? new Intl.NumberFormat("pt-BR", { 
      style: "currency", 
      currency: "BRL" 
    }).format(value) : '-';

  const filteredAreas = areas.filter(area =>
    area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.condominiums?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isFreePlan && !activeAdministratorId) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Selecione uma administradora
          </h2>
          <p className="text-gray-500">
            Para visualizar as áreas comuns, selecione uma administradora no cabeçalho.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Áreas Comuns</h1>
          <p className="text-gray-600 mt-1">
            Gerencie as áreas comuns dos condomínios
          </p>
        </div>
        {!planLoading && (
          <>
            {!isFreePlan ? (
              // Botão normal para usuários com plano pago
              <Button
                onClick={handleNewArea}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Área Comum
              </Button>
            ) : (
              // Botão de upgrade para usuários com plano gratuito
              <Button 
                onClick={() => window.location.href = '/gestor/mi-plan'}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Fazer Upgrade para Criar Áreas
              </Button>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome, código, descrição ou condomínio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>


      <div className="mt-6">
        <ManagerTable>
          <ManagerTableHeader>
            <ManagerTableRow>
              <ManagerTableHead>Código</ManagerTableHead>
              <ManagerTableHead>Nome</ManagerTableHead>
              <ManagerTableHead>Condomínio</ManagerTableHead>
              <ManagerTableHead>Capacidade</ManagerTableHead>
              <ManagerTableHead>Horário</ManagerTableHead>
              <ManagerTableHead>Taxa</ManagerTableHead>
              <ManagerTableHead>Aprovação</ManagerTableHead>
              <ManagerTableHead className="text-right">Ações</ManagerTableHead>
            </ManagerTableRow>
          </ManagerTableHeader>
          <ManagerTableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <ManagerTableRow key={i}>
                  <ManagerTableCell colSpan={8}>
                    <Skeleton className="h-12 w-full" />
                  </ManagerTableCell>
                </ManagerTableRow>
              ))
            ) : filteredAreas.length > 0 ? (
              filteredAreas.map((area) => (
                <ManagerTableRow key={area.id}>
                  <ManagerTableCell className="font-medium text-purple-600">
                    {area.code}
                  </ManagerTableCell>
                  <ManagerTableCell>
                    <div>
                      <p className="font-medium">{area.name}</p>
                      {area.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {area.description}
                        </p>
                      )}
                    </div>
                  </ManagerTableCell>
                  <ManagerTableCell>{area.condominiums?.name || 'N/A'}</ManagerTableCell>
                  <ManagerTableCell>
                    {area.capacity ? `${area.capacity} pessoas` : '-'}
                  </ManagerTableCell>
                  <ManagerTableCell>
                    {area.opening_time && area.closing_time
                      ? `${formatTime(area.opening_time)} - ${formatTime(area.closing_time)}`
                      : '-'
                    }
                  </ManagerTableCell>
                  <ManagerTableCell>{formatCurrency(area.booking_fee)}</ManagerTableCell>
                  <ManagerTableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      area.requires_approval 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {area.requires_approval ? 'Requer' : 'Livre'}
                    </span>
                  </ManagerTableCell>
                  <ManagerTableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditArea(area)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openDeleteModal(area)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </ManagerTableCell>
                </ManagerTableRow>
              ))
            ) : (
              <ManagerTableRow>
                <ManagerTableCell colSpan={8} className="text-center py-12">
                  <div className="text-gray-500">
                    <p className="text-lg font-medium">Nenhuma área comum encontrada</p>
                    <p className="text-sm mt-1">
                      {searchTerm 
                        ? "Tente ajustar os filtros de busca" 
                        : "Clique em 'Nova Área Comum' para começar"
                      }
                    </p>
                  </div>
                </ManagerTableCell>
              </ManagerTableRow>
            )}
          </ManagerTableBody>
        </ManagerTable>
      </div>

      <NewManagerCommonAreaModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={fetchAreas}
        commonArea={selectedArea}
      />
      
      <DeleteManagerCommonAreaModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        areaName={selectedArea?.name}
      />
    </div>
  );
};

const AreasComuns = () => {
  return (
    <ManagerLayout>
      <AreasComunsContent />
    </ManagerLayout>
  );
};

export default AreasComuns;
