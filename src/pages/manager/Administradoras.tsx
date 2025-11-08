import { useMemo, useState } from "react";
import { ManagerLayout } from "@/components/manager/ManagerLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Plus, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { useManagerAdministradoras } from "@/contexts/ManagerAdministradorasContext";
import { NewManagerAdministratorModal } from "@/components/manager/NewManagerAdministratorModal";
import { EditManagerAdministratorModal } from "@/components/manager/EditManagerAdministratorModal";
import type { ManagerAdministrator } from "@/contexts/ManagerAdministradorasContext";
import { PlanGuard } from "@/components/PlanGuard";
import { UpgradeBanner } from "@/components/UpgradeBanner";
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
  const { isFreePlan, isLoading: planLoading } = usePlan();
  const {
    administrators,
    loading,
    activeAdministratorId,
    activeAdministrator,
    setActiveAdministratorId,
    refetch,
    canCreateAdministrator,
    remainingSlots,
  } = useManagerAdministradoras();
  const [search, setSearch] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAdministrator, setSelectedAdministrator] = useState<ManagerAdministrator | null>(null);

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
    
    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '');
    
    // Se não tem números, retorna N/A
    if (cleaned.length === 0) return "N/A";
    
    // Formato com código internacional +34 (11 ou 12 dígitos)
    if (cleaned.length >= 11 && cleaned.startsWith('34')) {
      const number = cleaned.slice(2); // Remove o 34
      if (number.length === 9) {
        return `+34 ${number.slice(0, 3)} ${number.slice(3, 5)} ${number.slice(5, 7)} ${number.slice(7)}`;
      }
    }
    
    // Formato nacional (9 dígitos)
    if (cleaned.length === 9) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7)}`;
    }
    
    // Se tiver menos de 9 dígitos, formata o que tem
    if (cleaned.length < 9 && cleaned.length >= 3) {
      let formatted = cleaned.slice(0, 3);
      if (cleaned.length > 3) formatted += ` ${cleaned.slice(3, 5)}`;
      if (cleaned.length > 5) formatted += ` ${cleaned.slice(5, 7)}`;
      if (cleaned.length > 7) formatted += ` ${cleaned.slice(7)}`;
      return formatted;
    }
    
    // Retorna o número original se não se encaixar em nenhum formato
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
            <ManagerTableRow
              key={admin.id}
              className="transition-colors hover:bg-purple-50"
            >
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Administradoras</h1>
          <p className="text-gray-600">
            Consulte la lista de administradoras registradas en la plataforma y active la que desea gestionar.
          </p>
          {activeAdministrator && (
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-700">
                <BadgeCheck className="h-4 w-4 text-purple-600" />
                <span>Administradora seleccionada desde el encabezado:</span>
                <span className="text-purple-800">{activeAdministrator.name}</span>
              </div>
          )}
          {!activeVisible && filteredAdministrators.length > 0 && activeAdministrator && (
            <p className="text-xs font-medium text-purple-600">
              La administradora activa no está en los resultados actuales. Limpie la búsqueda para visualizarla.
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Buscar por nombre, NIF o email"
            className="w-full bg-white md:w-72"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {!planLoading && (
            <>
              {!isFreePlan ? (
                // Botón normal para usuarios con plan pago
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => setIsNewModalOpen(true)}
                  disabled={!canCreateAdministrator}
                  title={!canCreateAdministrator ? `Límite del plan alcanzado (${remainingSlots === 0 ? 'máximo alcanzado' : 'sin espacios disponibles'})` : undefined}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Administradora
                </Button>
              ) : (
                // Botón de upgrade para usuarios con plan gratuito
                <Button 
                  onClick={() => window.location.href = '/gestor/mi-plan'}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Actualizar para Crear Administradoras
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {isFreePlan && (
        <UpgradeBanner
          title="Maximice el potencial de su negocio"
          description="Actualice a un plan de pago y tenga acceso completo a todas las funcionalidades de gestión."
          variant="default"
        />
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
