import { useCallback, useEffect, useMemo, useState } from "react";
import { ManagerLayout } from "@/components/manager/ManagerLayout";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { showRadixSuccess, showRadixError } from "@/utils/toast";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { Pencil, Trash2, Plus, UserPlus } from "lucide-react";
import { NewResidentModal, ResidentForEdit } from "@/components/manager/NewResidentModal";
import { InviteResidentModal } from "@/components/manager/InviteResidentModal";

import { usePlan } from "@/hooks/usePlan";
import { useManagerAdministradoras } from "@/contexts/ManagerAdministradorasContext";

const CONDO_PLACEHOLDER_VALUE = "__no_condo_available__";

type CondoSummary = {
  id: string;
  name: string;
};

type BlockSummary = {
  id: string;
  name: string;
  condo_id: string;
};

type UnitSummary = {
  id: string;
  number: string;
  block_id: string;
};

type ResidentRow = {
  id: string;
  code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  document: string | null;
  status: string;
  is_owner: boolean;
  is_tenant: boolean;
  condo_id: string;
  block_id: string | null;
  block_name: string | null;
  unit_id: string | null;
  unit_number: string | null;
  birth_date: string | null;
  entry_date: string | null;
  exit_date: string | null;
  notes: string | null;
};

const statusBadge = (status: string) => {
  const normalized = status === "inactive" ? "inactive" : "active";
  if (normalized === "active") {
    return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Activo</Badge>;
  }
  return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100">Inactivo</Badge>;
};

const residentTypeLabel = (isOwner: boolean, isTenant: boolean) => {
  if (isOwner && isTenant) return "Propietario / Inquilino";
  if (isOwner) return "Propietario";
  if (isTenant) return "Inquilino";
  return "Residencial";
};

const ManagerResidentesContent = () => {
  const { isFreePlan } = usePlan();
  const { activeAdministratorId, loading: administratorsLoading } = useManagerAdministradoras();
  const { showError } = useErrorHandler();
  const [condominiums, setCondominiums] = useState<CondoSummary[]>([]);
  const [selectedCondoId, setSelectedCondoId] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<BlockSummary[]>([]);
  const [units, setUnits] = useState<UnitSummary[]>([]);
  const [residents, setResidents] = useState<ResidentRow[]>([]);
  const [loadingResidents, setLoadingResidents] = useState(true);
  const [search, setSearch] = useState("");

  const [isResidentModalOpen, setIsResidentModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<ResidentForEdit | null>(null);
  const [residentToDelete, setResidentToDelete] = useState<ResidentRow | null>(null);

  const selectedAdministratorName = "Administradora";

  const filteredResidents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return residents;
    return residents.filter((resident) => {
      const haystack = `${resident.full_name} ${resident.email ?? ""} ${resident.phone ?? ""} ${
        resident.document ?? ""
      } ${resident.code}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [residents, search]);

  const blockOptions = useMemo(
    () =>
      blocks
        .filter((block) => (selectedCondoId ? block.condo_id === selectedCondoId : true))
        .map((block) => ({ id: block.id, name: block.name, condo_id: block.condo_id })),
    [blocks, selectedCondoId],
  );

  const unitOptions = useMemo(
    () => units.map((unit) => ({ id: unit.id, label: unit.number, block_id: unit.block_id })),
    [units],
  );

  const fetchCondominiums = useCallback(async () => {
    if (administratorsLoading) return;

    if (!activeAdministratorId) {
      setCondominiums([]);
      setSelectedCondoId(null);
      return;
    }

    const { data, error } = await supabase
      .from("condominiums")
      .select("id, name")
      .eq("administrator_id", activeAdministratorId)
      .order("name", { ascending: true });

    if (error) {
      console.error("ManagerResidentes: error loading condominiums", error);
      showError("Erro ao carregar os condominios da administradora.", "condos_load_error");
      setCondominiums([]);
      setSelectedCondoId(null);
      return;
    }

    const summaries = data ?? [];
    setCondominiums(summaries);
    setSelectedCondoId((current) => {
      if (summaries.length === 0) return null;
      if (current && summaries.some((condo) => condo.id === current)) {
        return current;
      }
      return summaries[0].id;
    });
  }, [administratorsLoading, activeAdministratorId]);

  const fetchBlocksAndUnits = useCallback(async () => {
    if (!selectedCondoId) {
      setBlocks([]);
      setUnits([]);
      return;
    }

    const [{ data: blocksData, error: blocksError }, { data: unitsData, error: unitsError }] = await Promise.all([
      supabase
        .from("blocks")
        .select("id, name")
        .eq("condo_id", selectedCondoId)
        .order("name", { ascending: true }),
      supabase
        .from("units")
        .select("id, number, block_id")
        .eq("condo_id", selectedCondoId)
        .order("number", { ascending: true }),
    ]);

    if (blocksError) {
      console.error("ManagerResidentes: error loading blocks", blocksError);
      showError("Erro ao carregar os blocos do condominio.", "blocks_load_error");
      setBlocks([]);
    } else {
      setBlocks(
        blocksData?.map((block) => ({
          id: block.id,
          name: block.name,
          condo_id: selectedCondoId,
        })) ?? [],
      );
    }

    if (unitsError) {
      console.error("ManagerResidentes: error loading units", unitsError);
      showError("Erro ao carregar as unidades do condominio.", "units_load_error");
      setUnits([]);
    } else {
      setUnits(
        unitsData?.map((unit) => ({
          id: unit.id,
          number: unit.number,
          block_id: unit.block_id,
        })) ?? [],
      );
    }
  }, [selectedCondoId]);

  const fetchResidents = useCallback(async () => {
    if (!selectedCondoId) {
      setResidents([]);
      setLoadingResidents(false);
      return;
    }

    setLoadingResidents(true);

    const { data, error } = await supabase
      .from("residents")
      .select(
        "id, code, full_name, email, phone, document, status, is_owner, is_tenant, condo_id, block_id, unit_id, birth_date, entry_date, exit_date, notes, blocks(id, name), units(id, number)"
      )
      .eq("condo_id", selectedCondoId)
      .order("full_name", { ascending: true });

    if (error) {
      console.error("ManagerResidentes: error loading residents", error);
      showRadixError("Erro ao carregar os residentes.");
      setResidents([]);
      setLoadingResidents(false);
      return;
    }

    const normalized =
      data?.map((resident) => ({
        id: resident.id,
        code: resident.code,
        full_name: resident.full_name,
        email: resident.email,
        phone: resident.phone,
        document: resident.document,
        status: resident.status,
        is_owner: resident.is_owner,
        is_tenant: resident.is_tenant,
        condo_id: resident.condo_id,
        block_id: resident.block_id,
        block_name: resident.blocks?.name ?? null,
        unit_id: resident.unit_id,
        unit_number: resident.units?.number ?? null,
        birth_date: resident.birth_date,
        entry_date: resident.entry_date,
        exit_date: resident.exit_date,
        notes: resident.notes,
      })) ?? [];

    setResidents(normalized);
    setLoadingResidents(false);
  }, [selectedCondoId]);

  useEffect(() => {
    fetchCondominiums();
  }, [fetchCondominiums]);

  useEffect(() => {
    fetchBlocksAndUnits();
    fetchResidents();
  }, [fetchBlocksAndUnits, fetchResidents]);

  const openCreateModal = () => {
    setEditingResident(null);
    setIsResidentModalOpen(true);
  };

  const openEditModal = (resident: ResidentRow) => {
    setEditingResident({
      id: resident.id,
      code: resident.code,
      full_name: resident.full_name,
      email: resident.email,
      phone: resident.phone,
      document: resident.document,
      birth_date: resident.birth_date,
      entry_date: resident.entry_date,
      exit_date: resident.exit_date,
      is_owner: resident.is_owner,
      is_tenant: resident.is_tenant,
      status: resident.status,
      condo_id: resident.condo_id,
      block_id: resident.block_id,
      unit_id: resident.unit_id,
      notes: resident.notes,
    });
    setIsResidentModalOpen(true);
  };

  const closeResidentModal = () => {
    setIsResidentModalOpen(false);
    setEditingResident(null);
  };

  const handleDeleteResident = async () => {
    if (!residentToDelete) return;
    
    try {
      // Primeiro, buscar o profile_id do residente para excluir o usuário se existir
      const { data: residentData, error: fetchError } = await supabase
        .from("residents")
        .select("profile_id")
        .eq("id", residentToDelete.id)
        .single();

      if (fetchError) {
        console.error("Erro ao buscar dados do residente:", fetchError);
        showError("Erro ao buscar dados do residente.", "resident_fetch_error");
        return;
      }

      // Excluir o residente da tabela
      const { error: deleteResidentError } = await supabase
        .from("residents")
        .delete()
        .eq("id", residentToDelete.id);

      if (deleteResidentError) {
        console.error("ManagerResidentes: error deleting resident", deleteResidentError);
        showError(deleteResidentError.message || "No fue posible eliminar el residente.", "resident_delete_error");
        return;
      }

      // Se o residente tinha um usuário vinculado, excluir o usuário também
      if (residentData?.profile_id) {
        try {
          const { error: deleteUserError } = await supabase.functions.invoke('delete-user', {
            body: { userId: residentData.profile_id }
          });

          if (deleteUserError) {
            console.error("Erro ao excluir usuário:", deleteUserError);
            showError("Residente excluído, mas houve erro ao excluir a conta de usuário.", "user_delete_error");
          } else {
            showRadixSuccess("Residente e conta de usuário eliminados con exito.");
          }
        } catch (userDeleteError) {
          console.error("Erro ao processar exclusão de usuário:", userDeleteError);
          showError("Residente excluído, mas houve erro ao excluir a conta de usuário.", "user_delete_process_error");
        }
      } else {
        showRadixSuccess("Residente eliminado con exito.");
      }

      setResidentToDelete(null);
      fetchResidents();
    } catch (error) {
      console.error("Erro geral na exclusão:", error);
      showError("Erro inesperado ao excluir residente.", "general_delete_error");
    }
  };

  const hasResidents = residents.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Residentes</h1>
          <p className="text-sm text-muted-foreground">
            Administre los moradores vinculados a la administradora{" "}
            <span className="font-semibold text-foreground">{selectedAdministratorName}</span>.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={selectedCondoId ?? undefined}
            onValueChange={(value) => setSelectedCondoId(value)}
            disabled={condominiums.length === 0}
          >
            <SelectTrigger className="w-full bg-white sm:w-64">
              <SelectValue placeholder="Seleccionar condominio" />
            </SelectTrigger>
            <SelectContent>
              {condominiums.length === 0 ? (
                <SelectItem value={CONDO_PLACEHOLDER_VALUE} disabled>
                  Ningun condominio disponible
                </SelectItem>
              ) : (
                condominiums.map((condo) => (
                  <SelectItem key={condo.id} value={condo.id}>
                    {condo.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Input
            placeholder="Buscar por nombre, documento o email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full bg-white sm:w-64"
          />
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsInviteModalOpen(true)} 
              disabled={!selectedCondoId}
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Convidar Morador
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={openCreateModal} disabled={!selectedCondoId}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Residente
            </Button>
          </div>
        </div>
      </div>



      {loadingResidents ? (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <ManagerTable>
            <ManagerTableHeader>
              <ManagerTableRow>
                <ManagerTableHead className="w-[140px] text-sm font-semibold">Codigo</ManagerTableHead>
                <ManagerTableHead className="text-sm font-semibold">Nombre</ManagerTableHead>
                <ManagerTableHead className="text-sm font-semibold">Tipo</ManagerTableHead>
                <ManagerTableHead className="text-sm font-semibold">Documento</ManagerTableHead>
                <ManagerTableHead className="text-sm font-semibold">Telefono</ManagerTableHead>
                <ManagerTableHead className="text-sm font-semibold">Correo</ManagerTableHead>
                <ManagerTableHead className="text-sm font-semibold">Estado</ManagerTableHead>
                <ManagerTableHead className="w-[120px] text-right text-sm font-semibold">Acciones</ManagerTableHead>
              </ManagerTableRow>
            </ManagerTableHeader>
            <ManagerTableBody>
              {Array.from({ length: 6 }).map((_, index) => (
                <ManagerTableRow key={index}>
                  <ManagerTableCell colSpan={8}>
                    <Skeleton className="my-2 h-6 w-full" />
                  </ManagerTableCell>
                </ManagerTableRow>
              ))}
            </ManagerTableBody>
          </ManagerTable>
        </div>
      ) : !hasResidents ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white text-center shadow-sm">
          <div className="py-12">
            <h3 className="text-lg font-semibold text-foreground">No hay nada registrado aqui.</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Aun no hay ningun residente registrado en esta seccion.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <ManagerTable>
            <ManagerTableHeader>
              <ManagerTableRow>
                <ManagerTableHead className="w-[140px] text-sm font-semibold">Codigo</ManagerTableHead>
                <ManagerTableHead className="text-sm font-semibold">Nombre</ManagerTableHead>
                <ManagerTableHead className="text-sm font-semibold">Tipo</ManagerTableHead>
                <ManagerTableHead className="text-sm font-semibold">Documento</ManagerTableHead>
                <ManagerTableHead className="text-sm font-semibold">Telefono</ManagerTableHead>
                <ManagerTableHead className="text-sm font-semibold">Correo</ManagerTableHead>
                <ManagerTableHead className="text-sm font-semibold">Unidad</ManagerTableHead>
                <ManagerTableHead className="text-sm font-semibold">Estado</ManagerTableHead>
                <ManagerTableHead className="w-[120px] text-right text-sm font-semibold text-purple-700">Acciones</ManagerTableHead>
              </ManagerTableRow>
            </ManagerTableHeader>
            <ManagerTableBody>
              {filteredResidents.length === 0 ? (
                <ManagerTableRow>
                  <ManagerTableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                    Ningun residente encontrado con los filtros aplicados.
                  </ManagerTableCell>
                </ManagerTableRow>
              ) : (
                filteredResidents.map((resident) => (
                  <ManagerTableRow key={resident.id} className="border-b border-slate-100">
                    <ManagerTableCell className="text-sm font-medium text-foreground">{resident.code}</ManagerTableCell>
                    <ManagerTableCell className="text-sm text-foreground">{resident.full_name}</ManagerTableCell>
                    <ManagerTableCell className="text-sm text-foreground">
                      {residentTypeLabel(resident.is_owner, resident.is_tenant)}
                    </ManagerTableCell>
                    <ManagerTableCell className="text-sm text-muted-foreground">{resident.document ?? "-"}</ManagerTableCell>
                    <ManagerTableCell className="text-sm text-muted-foreground">{resident.phone ?? "-"}</ManagerTableCell>
                    <ManagerTableCell className="text-sm text-muted-foreground">{resident.email ?? "-"}</ManagerTableCell>
                    <ManagerTableCell className="text-sm text-muted-foreground">{resident.unit_number ?? "-"}</ManagerTableCell>
                    <ManagerTableCell className="text-sm">{statusBadge(resident.status)}</ManagerTableCell>
                    <ManagerTableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(resident)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setResidentToDelete(resident)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </ManagerTableCell>
                  </ManagerTableRow>
                ))
              )}
            </ManagerTableBody>
          </ManagerTable>
        </div>
      )}

      <NewResidentModal
        isOpen={isResidentModalOpen}
        onClose={closeResidentModal}
        onSuccess={fetchResidents}
        resident={editingResident}
        condos={condominiums}
        blocks={blockOptions}
        units={unitOptions}
        defaultCondoId={selectedCondoId}
      />

      <InviteResidentModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={fetchResidents}
        condominiumId={selectedCondoId || undefined}
      />
      <AlertDialog
        open={Boolean(residentToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setResidentToDelete(null);
          }
        }}
      >
        <AlertDialogContent className="border-admin-border bg-admin-card text-admin-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar residente</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que quieres eliminar a{" "}
              <strong>{residentToDelete?.full_name ?? "este residente"}</strong>? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setResidentToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteResident} className="bg-red-600 hover:bg-red-700">
              Eliminar residente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const ManagerResidentes = () => (
  <ManagerLayout>
    <ManagerResidentesContent />
  </ManagerLayout>
);

export default ManagerResidentes;
