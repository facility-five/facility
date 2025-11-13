import { useEffect, useState } from "react";
import { ManagerLayout } from "@/components/manager/ManagerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { CommonArea } from "@/types/entities";
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
  const { currentPlan, isLoading: planLoading } = usePlan();
  const [areas, setAreas] = useState<CommonArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<CommonArea | null>(null);

  const fetchAreas = async () => {
    if (!activeAdministratorId) {
      console.log("🔍 Áreas Comuns - Sem administradora ativa");
      setLoading(false);
      return;
    }

    console.log("🔍 Áreas Comuns - Buscando áreas para administradora:", activeAdministratorId);
    setLoading(true);
    
    try {
      // Primeiro buscar os condominios da administradora
      const { data: condoData, error: condoError } = await supabase
        .from("condominiums")
        .select("id")
        .eq("administrator_id", activeAdministratorId);

      if (condoError) throw condoError;

      const condoIds = condoData?.map(c => c.id) || [];
      
      if (condoIds.length === 0) {
        console.log("📭 Nenhum condomínio encontrado para esta administradora");
        setAreas([]);
        setLoading(false);
        return;
      }

      // Buscar áreas comuns dos condominios
      const { data, error } = await supabase
        .from("common_areas")
        .select(`
          *,
          condominiums!inner(
            name
          )
        `)
        .in("condo_id", condoIds)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log("✅ Áreas Comuns - Áreas carregadas:", data?.length || 0);
      setAreas(data as CommonArea[] || []);
    } catch (error) {
      console.error("❌ Erro ao buscar áreas comuns:", error);
      showRadixError("Error al buscar áreas comunes.");
      setAreas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, [activeAdministratorId]);

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
      showRadixSuccess("�rea comum exclu�da com sucesso!");
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

  if (!activeAdministratorId) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Seleccione una administradora
          </h2>
          <p className="text-gray-500">
            Para visualizar las áreas comunes, seleccione una administradora en el encabezado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Áreas Comunes</h1>
          <p className="text-gray-600 mt-1">
            Gerencie las áreas comunes de los condominios
          </p>
        </div>
        <Button
          onClick={handleNewArea}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Área Común
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nombre, código, descripción o condominio..."
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
              <ManagerTableHead>Nombre</ManagerTableHead>
              <ManagerTableHead>Condominio</ManagerTableHead>
              <ManagerTableHead>Capacidad</ManagerTableHead>
              <ManagerTableHead>Horario</ManagerTableHead>
              <ManagerTableHead>Tasa</ManagerTableHead>
              <ManagerTableHead>Aprobación</ManagerTableHead>
              <ManagerTableHead className="text-right">Acciones</ManagerTableHead>
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
                <ManagerTableRow key={area.id} className="hover:bg-purple-50">
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
                    {area.capacity ? `${area.capacity} personas` : '-'}
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
                      {area.requires_approval ? 'Requiere' : 'Libre'}
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
                    <p className="text-lg font-medium">Ninguna área común encontrada</p>
                    <p className="text-sm mt-1">
                      {searchTerm 
                        ? "Intente ajustar los filtros de búsqueda" 
                        : "Clique en 'Nueva Área Común' para comenzar"
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
