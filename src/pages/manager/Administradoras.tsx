import { useMemo, useState } from "react";
import { ManagerLayout } from "@/components/manager/ManagerLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useManagerAdministradoras } from "@/contexts/ManagerAdministradorasContext";
import { NewManagerAdministratorModal } from "@/components/manager/NewManagerAdministratorModal";
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

  const renderSkeleton = () => (
    <ManagerTable>
      <ManagerTableHeader>
        <ManagerTableRow>
          <ManagerTableHead>Status</ManagerTableHead>
          <ManagerTableHead>Nome</ManagerTableHead>
          <ManagerTableHead>Código</ManagerTableHead>
          <ManagerTableHead>Responsável</ManagerTableHead>
          <ManagerTableHead>NIF</ManagerTableHead>
          <ManagerTableHead>Condomínios</ManagerTableHead>
          <ManagerTableHead>E-mail</ManagerTableHead>
          <ManagerTableHead>Telefone</ManagerTableHead>
        </ManagerTableRow>
      </ManagerTableHeader>
      <ManagerTableBody>
        {Array.from({ length: 6 }).map((_, index) => (
          <ManagerTableRow key={index}>
            <ManagerTableCell><Skeleton className="h-4 w-16" /></ManagerTableCell>
            <ManagerTableCell><Skeleton className="h-4 w-32" /></ManagerTableCell>
            <ManagerTableCell><Skeleton className="h-4 w-20" /></ManagerTableCell>
            <ManagerTableCell><Skeleton className="h-4 w-28" /></ManagerTableCell>
            <ManagerTableCell><Skeleton className="h-4 w-24" /></ManagerTableCell>
            <ManagerTableCell><Skeleton className="h-4 w-16" /></ManagerTableCell>
            <ManagerTableCell><Skeleton className="h-4 w-40" /></ManagerTableCell>
            <ManagerTableCell><Skeleton className="h-4 w-28" /></ManagerTableCell>
          </ManagerTableRow>
        ))}
      </ManagerTableBody>
    </ManagerTable>
  );

  const renderEmptyState = () => (
    <ManagerTable>
      <ManagerTableHeader>
        <ManagerTableRow>
          <ManagerTableHead>Status</ManagerTableHead>
          <ManagerTableHead>Nome</ManagerTableHead>
          <ManagerTableHead>Código</ManagerTableHead>
          <ManagerTableHead>Responsável</ManagerTableHead>
          <ManagerTableHead>NIF</ManagerTableHead>
          <ManagerTableHead>Condomínios</ManagerTableHead>
          <ManagerTableHead>E-mail</ManagerTableHead>
          <ManagerTableHead>Telefone</ManagerTableHead>
        </ManagerTableRow>
      </ManagerTableHeader>
      <ManagerTableBody>
        <ManagerTableRow>
          <ManagerTableCell colSpan={8} className="text-center py-10 text-gray-600">
            Nenhuma administradora encontrada.
          </ManagerTableCell>
        </ManagerTableRow>
      </ManagerTableBody>
    </ManagerTable>
  );

  const renderAdministrators = () => (
    <ManagerTable>
      <ManagerTableHeader>
        <ManagerTableRow>
          <ManagerTableHead>Status</ManagerTableHead>
          <ManagerTableHead>Nome</ManagerTableHead>
          <ManagerTableHead>Código</ManagerTableHead>
          <ManagerTableHead>Responsável</ManagerTableHead>
          <ManagerTableHead>NIF</ManagerTableHead>
          <ManagerTableHead>Condomínios</ManagerTableHead>
          <ManagerTableHead>E-mail</ManagerTableHead>
          <ManagerTableHead>Telefone</ManagerTableHead>
        </ManagerTableRow>
      </ManagerTableHeader>
      <ManagerTableBody>
        {filteredAdministrators.map((admin) => {
          const responsibleName =
            admin.profiles && `${admin.profiles.first_name || ""} ${admin.profiles.last_name || ""}`.trim()
              ? `${admin.profiles.first_name || ""} ${admin.profiles.last_name || ""}`.trim()
              : "N/A";
          const isActive = admin.id === activeAdministratorId;

          const handleActivate = () => {
            setActiveAdministratorId(admin.id);
          };

          return (
            <ManagerTableRow
              key={admin.id}
              className={cn(
                "cursor-pointer transition-colors hover:bg-purple-50",
                isActive && "bg-purple-100 hover:bg-purple-100"
              )}
              onClick={handleActivate}
            >
              <ManagerTableCell>
                {isActive ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-600/10 px-2.5 py-1 text-xs font-semibold text-purple-600">
                    <BadgeCheck className="h-3 w-3" />
                    Ativa
                  </span>
                ) : (
                  <span className="text-gray-400 text-xs">Inativa</span>
                )}
              </ManagerTableCell>
              <ManagerTableCell className="font-medium">{admin.name}</ManagerTableCell>
              <ManagerTableCell>{admin.code || "N/A"}</ManagerTableCell>
              <ManagerTableCell>{responsibleName}</ManagerTableCell>
              <ManagerTableCell>{admin.nif || "N/A"}</ManagerTableCell>
              <ManagerTableCell className="font-semibold">
                {admin.condos[0]?.count ?? 0}
              </ManagerTableCell>
              <ManagerTableCell>{admin.email || "N/A"}</ManagerTableCell>
              <ManagerTableCell>{admin.phone || "N/A"}</ManagerTableCell>
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
            Consulte a relacao de administradoras cadastradas na plataforma e ative aquela que deseja
            gerenciar.
          </p>
          {activeAdministrator && (
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-700">
                <BadgeCheck className="h-4 w-4 text-purple-600" />
                <span>Administradora Seleccionada desde el encabezado:</span>
                <span className="text-purple-800">{activeAdministrator.name}</span>
              </div>
          )}
          {!activeVisible && filteredAdministrators.length > 0 && activeAdministrator && (
            <p className="text-xs font-medium text-purple-600">
              A administradora ativa nao esta nos resultados atuais. Limpe a busca para visualiza-la.
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Buscar por nome, NIF ou responsavel"
            className="w-full bg-white md:w-72"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {!planLoading && (
            <>
              {!isFreePlan ? (
                // Botão normal para usuários com plano pago
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => setIsNewModalOpen(true)}
                  disabled={!canCreateAdministrator}
                  title={!canCreateAdministrator ? `Limite do plano atingido (${remainingSlots === 0 ? 'máximo atingido' : 'sem slots disponíveis'})` : undefined}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Administradora
                </Button>
              ) : (
                // Botão de upgrade para usuários com plano gratuito
                <Button 
                  onClick={() => window.location.href = '/gestor/mi-plan'}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Fazer Upgrade para Criar Administradoras
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {isFreePlan && (
        <UpgradeBanner
          title="Maximize o potencial do seu negócio"
          description="Faça upgrade para um plano pago e tenha acesso completo a todas as funcionalidades de gestão."
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
    </div>
  );
};

const ManagerAdministradoras = () => (
  <ManagerLayout>
    <ManagerAdministradorasContent />
  </ManagerLayout>
);

export default ManagerAdministradoras;
