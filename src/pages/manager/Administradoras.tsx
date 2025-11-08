import { useMemo, useState } from "react";
import { ManagerLayout } from "@/components/manager/ManagerLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, Plus, Pencil } from "lucide-react";
import { useManagerAdministradoras } from "@/contexts/ManagerAdministradorasContext";
import { NewManagerAdministratorModal } from "@/components/manager/NewManagerAdministratorModal";
import { EditManagerAdministratorModal } from "@/components/manager/EditManagerAdministratorModal";
import type { ManagerAdministrator } from "@/contexts/ManagerAdministradorasContext";
import { usePlan } from "@/hooks/usePlan";
import {
  ManagerTable,
  ManagerTableBody,
  ManagerTableCell,
  ManagerTableHead,
  ManagerTableHeader,
  ManagerTableRow,
} from "@/components/manager/ManagerTable";

const ManagerAdministradorasContent = () => {
  const { isLoading: planLoading } = usePlan();
  const {
    administrators,
    loading,
    activeAdministratorId,
    activeAdministrator,
    refetch,
    canCreateAdministrator,
    usageLimit,
  } = useManagerAdministradoras();

  const [search, setSearch] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAdministrator, setSelectedAdministrator] =
    useState<ManagerAdministrator | null>(null);

  // 📊 Consumo dinâmico baseado no array real e limite atual
  const used = administrators.length;
  const limit = usageLimit ?? 1;
  const remaining = Math.max(limit - used, 0);
  const hasSlots = remaining > 0;
  const hitLimit = used >= limit;

  // 🧪 Logs temporários de depuração (removíveis após QA)
  console.log("[ADMIN USAGE]", { used, limit, remaining, planLoading, canCreateAdministrator });

  const filteredAdministrators = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return administrators;

    return administrators.filter((admin) => {
      const responsibleName = admin.profiles
        ? `${admin.profiles.first_name || ""} ${admin.profiles.last_name || ""}`.toLowerCase()
        : "";
      const valuesToCheck = [
        admin.name,
        admin.code,
        admin.nif,
        admin.email ?? "",
        admin.phone ?? "",
        responsibleName,
      ];
      return valuesToCheck.some((value) => value?.toLowerCase().includes(term));
    });
  }, [administrators, search]);

  const activeVisible = useMemo(() => {
    if (!activeAdministratorId) return false;
    return filteredAdministrators.some((admin) => admin.id === activeAdministratorId);
  }, [filteredAdministrators, activeAdministratorId]);

  const formatSpanishPhone = (phone: string | null | undefined) => {
    if (!phone) return "N/A";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 0) return "N/A";
    if (cleaned.startsWith("34") && cleaned.length === 11) {
      const n = cleaned.slice(2);
      return `+34 ${n.slice(0, 3)} ${n.slice(3, 5)} ${n.slice(5, 7)} ${n.slice(7)}`;
    }
    if (cleaned.length === 9)
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7)}`;
    return cleaned;
  };

  const renderSkeleton = () => (
    <ManagerTable>
      <ManagerTableHeader>
        <ManagerTableRow>
          <ManagerTableHead>Nombre de la Administradora</ManagerTableHead>
          <ManagerTableHead>NIF</ManagerTableHead>
          <ManagerTableHead>Correo Electrónico</ManagerTableHead>
          <ManagerTableHead>Teléfono</ManagerTableHead>
          <ManagerTableHead className="text-right">Acciones</ManagerTableHead>
        </ManagerTableRow>
      </ManagerTableHeader>
      <ManagerTableBody>
        {Array.from({ length: 6 }).map((_, index) => (
          <ManagerTableRow key={index}>
            <ManagerTableCell><Skeleton className="h-4 w-32" /></ManagerTableCell>
            <ManagerTableCell><Skeleton className="h-4 w-24" /></ManagerTableCell>
            <ManagerTableCell><Skeleton className="h-4 w-40" /></ManagerTableCell>
            <ManagerTableCell><Skeleton className="h-4 w-28" /></ManagerTableCell>
            <ManagerTableCell><Skeleton className="h-8 w-8 ml-auto" /></ManagerTableCell>
          </ManagerTableRow>
        ))}
      </ManagerTableBody>
    </ManagerTable>
  );

  const renderEmptyState = () => (
    <ManagerTable>
      <ManagerTableHeader>
        <ManagerTableRow>
          <ManagerTableHead>Nombre de la Administradora</ManagerTableHead>
          <ManagerTableHead>NIF</ManagerTableHead>
          <ManagerTableHead>Correo Electrónico</ManagerTableHead>
          <ManagerTableHead>Teléfono</ManagerTableHead>
          <ManagerTableHead className="text-right">Acciones</ManagerTableHead>
        </ManagerTableRow>
      </ManagerTableHeader>
      <ManagerTableBody>
        <ManagerTableRow>
          <ManagerTableCell colSpan={5} className="text-center py-10 text-gray-600">
            No se encontraron administradoras.
          </ManagerTableCell>
        </ManagerTableRow>
      </ManagerTableBody>
    </ManagerTable>
  );

  const renderAdministrators = () => (
    <ManagerTable>
      <ManagerTableHeader>
        <ManagerTableRow>
          <ManagerTableHead>Nombre de la Administradora</ManagerTableHead>
          <ManagerTableHead>NIF</ManagerTableHead>
          <ManagerTableHead>Correo Electrónico</ManagerTableHead>
          <ManagerTableHead>Teléfono</ManagerTableHead>
          <ManagerTableHead className="text-right">Acciones</ManagerTableHead>
        </ManagerTableRow>
      </ManagerTableHeader>
      <ManagerTableBody>
        {filteredAdministrators.map((admin) => {
          const handleEdit = (e: React.MouseEvent) => {
            e.stopPropagation();
            setSelectedAdministrator(admin);
            setIsEditModalOpen(true);
          };

          return (
            <ManagerTableRow key={admin.id} className="transition-colors hover:bg-purple-50">
              <ManagerTableCell className="font-medium">{admin.name}</ManagerTableCell>
              <ManagerTableCell>{admin.nif || "N/A"}</ManagerTableCell>
              <ManagerTableCell>{admin.email || "N/A"}</ManagerTableCell>
              <ManagerTableCell>{formatSpanishPhone(admin.phone)}</ManagerTableCell>
              <ManagerTableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  className="h-8 w-8 p-0 hover:bg-purple-100"
                  title="Editar administradora"
                >
                  <Pencil className="h-4 w-4 text-purple-600" />
                </Button>
              </ManagerTableCell>
            </ManagerTableRow>
          );
        })}
      </ManagerTableBody>
    </ManagerTable>
  );

  return (
    <div className="space-y-6">
      {/* Header sem fundo e sem padding lateral/superior, alinhado ao de Condomínios */}
      <div className="flex flex-col gap-4">
        {/* Linha 1: Título/descrição à esquerda, busca + ações + uso à direita */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Administradoras</h1>
            <p className="text-sm text-gray-600">Lista de administradoras registradas</p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Buscar por nombre, NIF o email"
              className="w-64 bg-white"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {/* Botão de ação (criar ou atualizar), mostrado quando dados do plano carregados */}
            {!planLoading && (
              <>
                {hasSlots && canCreateAdministrator && (
                  <Button
                    className="bg-purple-600 hover:bg-purple-700 transition-all duration-300"
                    onClick={() => setIsNewModalOpen(true)}
                    title={`Vagas restantes: ${remaining}`}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Administradora
                  </Button>
                )}

                {hitLimit && (
                  <Button
                    onClick={() => (window.location.href = "/gestor/mi-plan")}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-300"
                    title="Has alcanzado el límite de administradoras de tu plan"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Actualizar para Crear Administradoras
                  </Button>
                )}

                {/* Badge de uso */}
                <Badge
                  variant="secondary"
                  className={`text-xs font-semibold ${hitLimit ? "bg-red-100 text-red-700" : "bg-purple-100 text-purple-700"}`}
                >
                  {used}/{limit} usadas
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Linha 2: Aviso quando ativa não está visível nos filtros */}
        <div>
          {!activeVisible && filteredAdministrators.length > 0 && activeAdministrator && (
            <p className="text-xs font-medium text-purple-600">
              La administradora activa no está en los resultados actuales. Limpie la búsqueda para visualizarla.
            </p>
          )}
        </div>

        {/* Linha 3 removida: ações e uso integrados na linha 1 */}
      </div>

      {/* Badge flutuante no rodapé com margem de 32px (bottom-8) */}
      {activeAdministrator && (
        <div className="fixed bottom-8 right-8 z-40">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm"
            title="Clique para trocar"
          >
            <Building className="h-4 w-4 text-purple-600" />
            <span>Administradora selecionada:</span>
            <span className="text-purple-800">{activeAdministrator.name}</span>
          </div>
        </div>
      )}

      {loading
        ? renderSkeleton()
        : filteredAdministrators.length === 0
        ? renderEmptyState()
        : renderAdministrators()}

      <NewManagerAdministratorModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={refetch}
      />

      <EditManagerAdministratorModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAdministrator(null);
        }}
        onSuccess={refetch}
        administrator={selectedAdministrator}
      />
    </div>
  );
};

const ManagerAdministradoras = () => (
  <ManagerLayout>
    <ManagerAdministradorasContent />
  </ManagerLayout>
);

export default ManagerAdministradoras;
