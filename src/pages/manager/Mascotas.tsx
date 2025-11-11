import { useCallback, useEffect, useMemo, useState } from "react";
import { ManagerLayout } from "@/components/manager/ManagerLayout";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ManagerTable,
  ManagerTableBody,
  ManagerTableCell,
  ManagerTableHead,
  ManagerTableHeader,
  ManagerTableRow,
} from "@/components/manager/ManagerTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError } from "@/utils/toast";
import { Search, Users } from "lucide-react";
import { useManagerAdministradoras } from "@/contexts/ManagerAdministradorasContext";

type CondoSummary = {
  id: string;
  name: string;
};

type ResidentRow = {
  id: string;
  full_name: string;
  unit_id: string;
  unit_number: string;
  condo_name: string;
  created_at: string;
};

const ManagerMascotasContent = () => {
  const { activeAdministratorId } = useManagerAdministradoras();
  const [residents, setResidents] = useState<ResidentRow[]>([]);
  const [condos, setCondos] = useState<CondoSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCondo, setSelectedCondo] = useState<string>("all");

  const fetchCondos = useCallback(async () => {
    if (!activeAdministratorId) return;

    try {
      const { data, error } = await supabase
        .from("condominiums")
        .select("id, name")
        .eq("administrator_id", activeAdministratorId)
        .order("name");

      if (error) throw error;

      setCondos(data || []);
    } catch (error) {
      console.error("Erro ao carregar condomínios:", error);
      showRadixError("Erro ao carregar condomínios");
      setCondos([]);
    }
  }, [activeAdministratorId]);

  const fetchResidents = useCallback(async () => {
    if (!activeAdministratorId) return;

    try {
      setLoading(true);
      
      // Buscar condomínios primeiro
      const { data: condosData, error: condosError } = await supabase
        .from("condominiums")
        .select("id")
        .eq("administrator_id", activeAdministratorId);

      if (condosError) throw condosError;

      const condoIds = condosData?.map(c => c.id) || [];
      if (condoIds.length === 0) {
        setResidents([]);
        return;
      }

      // Buscar unidades
      const { data: unitsData, error: unitsError } = await supabase
        .from("units")
        .select("id")
        .in("condo_id", condoIds);

      if (unitsError) throw unitsError;

      const unitIds = unitsData?.map(u => u.id) || [];
      if (unitIds.length === 0) {
        setResidents([]);
        return;
      }

      // Buscar residentes
      const { data, error } = await supabase
        .from("residents")
        .select(`
          id,
          full_name,
          unit_id,
          created_at,
          units!inner(
            id,
            number,
            condo_id,
            condominiums!inner(
              id,
              name
            )
          )
        `)
        .in("unit_id", unitIds)
        .order("full_name");

      if (error) throw error;

      const formattedResidents: ResidentRow[] = (data || []).map((resident: any) => ({
        id: resident.id,
        full_name: resident.full_name,
        unit_id: resident.unit_id,
        unit_number: resident.units?.number || "N/A",
        condo_name: resident.units?.condominiums?.name || "N/A",
        created_at: resident.created_at,
      }));

      setResidents(formattedResidents);
    } catch (error) {
      console.error("Erro ao carregar residentes:", error);
      showRadixError("Erro ao carregar residentes");
      setResidents([]);
    } finally {
      setLoading(false);
    }
  }, [activeAdministratorId]);

  useEffect(() => {
    if (activeAdministratorId) {
      fetchCondos();
      fetchResidents();
    } else {
      setLoading(false);
    }
  }, [activeAdministratorId, fetchCondos, fetchResidents]);

  // Filtrar residentes
  const filteredResidents = useMemo(() => {
    return residents.filter((resident) => {
      const matchesSearch = resident.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resident.unit_number.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCondo = selectedCondo === "all" || resident.condo_name.toLowerCase().includes(selectedCondo.toLowerCase());
      
      return matchesSearch && matchesCondo;
    });
  }, [residents, searchTerm, selectedCondo]);

  if (loading) {
    return (
      <ManagerLayout>
        <div className="space-y-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-96 mt-2" />
            </div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-6 w-6" />
              Residentes
            </h1>
            <p className="text-gray-600">
              Visualize os residentes dos seus condomínios
            </p>
          </div>
        </div>

        <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou unidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="w-full md:w-64">
            <Select value={selectedCondo} onValueChange={setSelectedCondo}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por condomínio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os condomínios</SelectItem>
                {condos.map((condo) => (
                  <SelectItem key={condo.id} value={condo.name}>
                    {condo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ManagerTable>
          <ManagerTableHeader className="bg-gradient-to-r from-purple-600 to-purple-700">
            <ManagerTableRow>
              <ManagerTableHead className="text-white font-semibold">Nome</ManagerTableHead>
              <ManagerTableHead className="text-white font-semibold">Unidade</ManagerTableHead>
              <ManagerTableHead className="text-white font-semibold">Condomínio</ManagerTableHead>
              <ManagerTableHead className="text-white font-semibold">Data de Cadastro</ManagerTableHead>
            </ManagerTableRow>
          </ManagerTableHeader>
          <ManagerTableBody>
            {filteredResidents.length === 0 ? (
              <ManagerTableRow>
                <ManagerTableCell colSpan={4} className="text-center py-8 text-gray-500">
                  {residents.length === 0 ? "Nenhum residente encontrado" : "Nenhum residente corresponde aos filtros"}
                </ManagerTableCell>
              </ManagerTableRow>
            ) : (
              filteredResidents.map((resident) => (
                <ManagerTableRow key={resident.id}>
                  <ManagerTableCell className="font-medium">
                    {resident.full_name}
                  </ManagerTableCell>
                  <ManagerTableCell>
                    {resident.unit_number}
                  </ManagerTableCell>
                  <ManagerTableCell>
                    {resident.condo_name}
                  </ManagerTableCell>
                  <ManagerTableCell>
                    {new Date(resident.created_at).toLocaleDateString('pt-BR')}
                  </ManagerTableCell>
                </ManagerTableRow>
              ))
            )}
          </ManagerTableBody>
        </ManagerTable>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Mostrando {filteredResidents.length} de {residents.length} residentes
          </span>
        </div>
      </div>
    </ManagerLayout>
  );
};

export default ManagerMascotasContent;