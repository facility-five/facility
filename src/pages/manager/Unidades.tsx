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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { Pencil, Trash2, Plus, DoorOpen } from "lucide-react";
import { useManagerAdministradoras } from "@/contexts/ManagerAdministradorasContext";
import { PlanGuard } from "@/components/PlanGuard";

import { usePlan } from "@/hooks/usePlan";

const CONDO_PLACEHOLDER_VALUE = "__no_condo_available__";
const BLOCK_PLACEHOLDER_VALUE = "__no_block_available__";

type CondoSummary = {
  id: string;
  name: string;
};

type BlockSummary = {
  id: string;
  name: string;
  condo_id: string;
};

type UnitRow = {
  id: string;
  number: string;
  floor: number | null;
  bedrooms: number | null;
  status: string;
  block_id: string;
  condo_id: string;
  block_name: string;
  condo_name: string;
  created_at: string;
  updated_at: string;
};

type UnitForEdit = {
  id?: string;
  number: string;
  floor: number | null;
  bedrooms: number | null;
  status: string;
  block_id: string;
  condo_id: string;
};

const statusBadge = (status: string) => {
  const variant = status === "Disponible" ? "default" : status === "Ocupada" ? "secondary" : "destructive";
  return <Badge variant={variant}>{status}</Badge>;
};

const ManagerUnidadesContent = () => {
  const { activeAdministratorId } = useManagerAdministradoras();
  const { currentPlan, isLoading: planLoading } = usePlan();
  const [units, setUnits] = useState<UnitRow[]>([]);
  const [condos, setCondos] = useState<CondoSummary[]>([]);
  const [blocks, setBlocks] = useState<BlockSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCondo, setSelectedCondo] = useState<string>("all");
  const [selectedBlock, setSelectedBlock] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitForEdit | null>(null);

  // Debug logs
  console.log("🔍 Unidades - Administradora ativa:", activeAdministratorId);

  const fetchCondos = useCallback(async () => {
    if (!activeAdministratorId) {
      console.log("🔍 Unidades - Sem administradora ativa, pulando fetchCondos");
      return;
    }

    console.log("🔍 Unidades - Buscando condomínios...");
    console.log("[QUERY PARAMS]", { administrator_id: activeAdministratorId });
    try {
      const { data, error } = await supabase
        .from("condominiums")
        .select("id, name")
        .eq("administrator_id", activeAdministratorId)
        .order("name");

      if (error) {
        console.error("❌ Unidades - Erro ao buscar condomínios:", error);
        throw error;
      }

      console.log("✅ Unidades - Condomínios carregados:", data?.length || 0);
      setCondos(data || []);
    } catch (error) {
      console.error("❌ Unidades - Erro na fetchCondos:", error);
      showRadixError("Erro ao carregar condomínios");
    }
  }, [activeAdministratorId]);

  const fetchBlocks = useCallback(async () => {
    if (!activeAdministratorId) {
      console.log("🔍 Unidades - Sem administradora ativa, pulando fetchBlocks");
      return;
    }

    console.log("🔍 Unidades - Buscando blocos...");
    console.log("[QUERY PARAMS]", { administrator_id: activeAdministratorId });
    try {
      // Primeiro buscar os condomínios da administradora
      const { data: condoData, error: condoError } = await supabase
        .from("condominiums")
        .select("id")
        .eq("administrator_id", activeAdministratorId);

      if (condoError) {
        console.error("❌ Unidades - Erro ao buscar condomínios:", condoError);
        throw condoError;
      }

      const condoIds = condoData?.map(c => c.id) || [];

      if (condoIds.length === 0) {
        console.log("⚠️ Unidades - Nenhum condomínio encontrado");
        setBlocks([]);
        return;
      }

      // Agora buscar blocos desses condomínios
      const { data, error } = await supabase
        .from("blocks")
        .select("id, name, condo_id")
        .in("condo_id", condoIds)
        .order("name");

      if (error) {
        console.error("❌ Unidades - Erro ao buscar blocos:", error);
        throw error;
      }

      console.log("✅ Unidades - Blocos carregados:", data?.length || 0);
      setBlocks(data || []);
    } catch (error) {
      console.error("❌ Unidades - Erro na fetchBlocks:", error);
      showRadixError("Erro ao carregar blocos");
    }
  }, [activeAdministratorId]);

  const fetchUnits = useCallback(async () => {
    if (!activeAdministratorId) {
      console.log("🔍 Unidades - Sem administradora ativa, pulando fetchUnits");
      return;
    }

    console.log("🔍 Unidades - Buscando unidades...");
    console.log("[QUERY PARAMS]", { administrator_id: activeAdministratorId });
    try {
      // Primeiro buscar os condomínios da administradora
      const { data: condoData, error: condoError } = await supabase
        .from("condominiums")
        .select("id, name")
        .eq("administrator_id", activeAdministratorId);

      if (condoError) {
        console.error("❌ Unidades - Erro ao buscar condomínios:", condoError);
        throw condoError;
      }

      const condoIds = condoData?.map(c => c.id) || [];
      const condoMap = new Map(condoData?.map(c => [c.id, c.name]) || []);

      if (condoIds.length === 0) {
        console.log("⚠️ Unidades - Nenhum condomínio encontrado");
        setUnits([]);
        return;
      }

      // Buscar blocos para ter o map de nomes
      const { data: blockData } = await supabase
        .from("blocks")
        .select("id, name")
        .in("condo_id", condoIds);

      const blockMap = new Map(blockData?.map(b => [b.id, b.name]) || []);

      // Agora buscar unidades desses condomínios (SEM JOIN) - usando select * para evitar erros de colunas
      const { data, error } = await supabase
        .from("units")
        .select("*")
        .in("condo_id", condoIds)
        .order("number");

      if (error) {
        console.error("❌ Unidades - Erro ao buscar unidades:", error);
        throw error;
      }

      console.log("✅ Unidades - Unidades carregadas:", data?.length || 0);

      const formattedUnits: UnitRow[] = (data || []).map((unit: any) => ({
        id: unit.id,
        number: unit.number,
        floor: unit.floor,
        area: unit.area,
        bedrooms: unit.bedrooms,
        bathrooms: unit.bathrooms,
        status: unit.status,
        block_id: unit.block_id,
        condo_id: unit.condo_id,
        block_name: blockMap.get(unit.block_id) || "N/A",
        condo_name: condoMap.get(unit.condo_id) || "N/A",
        created_at: unit.created_at,
        updated_at: unit.updated_at,
      }));

      setUnits(formattedUnits);
    } catch (error) {
      console.error("❌ Unidades - Erro na fetchUnits:", error);
      showRadixError("Erro ao carregar unidades");
    }
  }, [activeAdministratorId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCondos(), fetchBlocks(), fetchUnits()]);
      setLoading(false);
    };
    if (activeAdministratorId) {
      loadData();
    } else {
      // Se não há administrator_id, definir loading como false para mostrar a interface
      setLoading(false);
    }
  }, [activeAdministratorId]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      const matchesSearch = unit.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           unit.block_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           unit.condo_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCondo = selectedCondo === "all" || unit.condo_id === selectedCondo;
      const matchesBlock = selectedBlock === "all" || unit.block_id === selectedBlock;
      const matchesStatus = selectedStatus === "all" || unit.status === selectedStatus;

      return matchesSearch && matchesCondo && matchesBlock && matchesStatus;
    });
  }, [units, searchTerm, selectedCondo, selectedBlock, selectedStatus]);

  const availableBlocks = useMemo(() => {
    if (selectedCondo === "all") return blocks;
    return blocks.filter(block => block.condo_id === selectedCondo);
  }, [blocks, selectedCondo]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    console.log("🔍 handleSubmit - editingUnit:", editingUnit);
    
    if (!activeAdministratorId) {
      showRadixError("Selecione uma administradora antes de criar/editar unidades.");
      return;
    }

    if (!editingUnit) {
      showRadixError("Dados da unidade não encontrados.");
      return;
    }

    setSubmitting(true);
    try {
      const unitData = {
        number: editingUnit.number,
        floor: editingUnit.floor,
        bedrooms: editingUnit.bedrooms,
        status: editingUnit.status,
        block_id: editingUnit.block_id,
        condo_id: editingUnit.condo_id,
      };

      console.log("📤 Enviando dados:", unitData);

      if (editingUnit.id) {
        const { data, error } = await supabase
          .from("units")
          .update(unitData)
          .eq("id", editingUnit.id)
          .select();

        console.log("✅ Resposta update:", { data, error });
        if (error) throw error;
        showRadixSuccess("Unidade atualizada com sucesso!");
      } else {
        const { data, error } = await supabase
          .from("units")
          .insert([unitData])
          .select();

        console.log("✅ Resposta insert:", { data, error });
        if (error) throw error;
        showRadixSuccess("Unidade criada com sucesso!");
      }

      setIsDialogOpen(false);
      setEditingUnit(null);
      await fetchUnits();
    } catch (error: any) {
      console.error("❌ Erro ao salvar unidade:", error);
      console.error("❌ Detalhes do erro:", error.message, error.details, error.hint);
      showRadixError(error.message || "Erro ao salvar unidade");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (unit: UnitRow) => {
    setEditingUnit({
      id: unit.id,
      number: unit.number,
      floor: unit.floor,
      bedrooms: unit.bedrooms,
      status: unit.status,
      block_id: unit.block_id,
      condo_id: unit.condo_id,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta unidade?")) return;

    try {
      const { error } = await supabase
        .from("units")
        .delete()
        .eq("id", id);

      if (error) throw error;
      showRadixSuccess("Unidade excluída com sucesso!");
      await fetchUnits();
    } catch (error) {
      console.error("Erro ao excluir unidade:", error);
      showRadixError("Erro ao excluir unidade");
    }
  };

  const resetForm = () => {
    setEditingUnit({
      number: "",
      floor: null,
      bedrooms: null,
      status: "Disponible",
      block_id: blocks.length > 0 ? blocks[0].id : "",
      condo_id: condos.length > 0 ? condos[0].id : "",
    });
    setIsDialogOpen(true);
  };

  const handleCancel = () => {
    setEditingUnit(null);
    setIsDialogOpen(false);
  };

  // Fallback visual quando não há administradora selecionada
  if (!activeAdministratorId) {
    return (
      <div className="p-6 text-center text-gray-500">
        Selecione uma administradora para visualizar as unidades.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DoorOpen className="h-6 w-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">Unidades</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setEditingUnit(null);
          }
          setIsDialogOpen(open);
        }}>
          {!planLoading && (
            <>
              {(currentPlan && currentPlan.max_units !== null && units.length >= currentPlan.max_units) ? (
                // Botão de upgrade quando alcança o limite
                <Button 
                  onClick={() => window.location.href = '/gestor/mi-plan'}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  Actualizar para Crear Más Unidades
                </Button>
              ) : (
                // Botão normal quando aún pode criar
                <Button onClick={resetForm} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Unidade
                </Button>
              )}
            </>
          )}
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingUnit?.id ? "Editar Unidade" : "Nova Unidade"}
                </DialogTitle>
                <DialogDescription>
                  {editingUnit?.id 
                    ? "Atualize as informações da unidade." 
                    : "Preencha as informações para criar uma nova unidade."
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="number">Número *</Label>
                    <Input
                      id="number"
                      name="number"
                      value={editingUnit?.number || ""}
                      onChange={(e) => setEditingUnit(prev => prev ? { ...prev, number: e.target.value } : null)}
                      placeholder="Ex: 101, A-201"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="floor">Andar</Label>
                    <Input
                      id="floor"
                      name="floor"
                      type="number"
                      value={editingUnit?.floor || ""}
                      onChange={(e) => setEditingUnit(prev => prev ? { ...prev, floor: e.target.value ? parseInt(e.target.value) : null } : null)}
                      placeholder="Ex: 1, 2, 3"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                    <Select 
                      name="status" 
                      defaultValue={editingUnit?.status || "Disponible"} 
                      required
                      onValueChange={(value) => {
                        if (editingUnit) {
                          setEditingUnit({ ...editingUnit, status: value });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Disponible">Disponible</SelectItem>
                        <SelectItem value="Ocupada">Ocupada</SelectItem>
                        <SelectItem value="Reservada">Reservada</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Quartos</Label>
                    <Input
                      id="bedrooms"
                      name="bedrooms"
                      type="number"
                      value={editingUnit?.bedrooms || ""}
                      onChange={(e) => setEditingUnit(prev => prev ? { ...prev, bedrooms: e.target.value ? parseInt(e.target.value) : null } : null)}
                      placeholder="Ex: 2"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condo_id">Condomínio *</Label>
                  <Select 
                    name="condo_id" 
                    defaultValue={editingUnit?.condo_id || ""} 
                    required
                    onValueChange={(value) => {
                      if (editingUnit) {
                        setEditingUnit({ ...editingUnit, condo_id: value, block_id: "" });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o condomínio" />
                    </SelectTrigger>
                    <SelectContent>
                      {condos.length === 0 ? (
                        <SelectItem value={CONDO_PLACEHOLDER_VALUE} disabled>
                          Nenhum condomínio disponível
                        </SelectItem>
                      ) : (
                        condos.map((condo) => (
                          <SelectItem key={condo.id} value={condo.id}>
                            {condo.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="block_id">Bloco *</Label>
                  <Select 
                    name="block_id" 
                    defaultValue={editingUnit?.block_id || ""} 
                    required
                    disabled={!editingUnit?.condo_id && !condos.length}
                    onValueChange={(value) => {
                      if (editingUnit) {
                        setEditingUnit({ ...editingUnit, block_id: value });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o bloco" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBlocks.length === 0 ? (
                        <SelectItem value={BLOCK_PLACEHOLDER_VALUE} disabled>
                          {editingUnit?.condo_id ? "Nenhum bloco disponível" : "Selecione um condomínio primeiro"}
                        </SelectItem>
                      ) : (
                        availableBlocks.map((block) => (
                          <SelectItem key={block.id} value={block.id}>
                            {block.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select 
                    name="status" 
                    defaultValue={editingUnit?.status || "Disponible"} 
                    required
                    onValueChange={(value) => {
                      if (editingUnit) {
                        setEditingUnit({ ...editingUnit, status: value });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Disponible">Disponível</SelectItem>
                      <SelectItem value="Ocupada">Ocupada</SelectItem>
                      <SelectItem value="Mantenimiento">Manutenção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Salvando..." : editingUnit?.id ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Buscar por número, bloco ou condomínio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={selectedCondo} onValueChange={setSelectedCondo}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Filtrar por condomínio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os condomínios</SelectItem>
            {condos.map((condo) => (
              <SelectItem key={condo.id} value={condo.id}>
                {condo.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedBlock} onValueChange={setSelectedBlock}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Filtrar por bloco" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os blocos</SelectItem>
            {availableBlocks.map((block) => (
              <SelectItem key={block.id} value={block.id}>
                {block.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="Disponible">Disponível</SelectItem>
            <SelectItem value="Ocupada">Ocupada</SelectItem>
            <SelectItem value="Mantenimiento">Manutenção</SelectItem>
          </SelectContent>
        </Select>
      </div>



      <div className="rounded-md border">
        <ManagerTable>
          <ManagerTableHeader>
            <ManagerTableRow>
              <ManagerTableHead>Número</ManagerTableHead>
              <ManagerTableHead>Andar</ManagerTableHead>
              <ManagerTableHead>Quartos</ManagerTableHead>
              <ManagerTableHead>Bloco</ManagerTableHead>
              <ManagerTableHead>Condomínio</ManagerTableHead>
              <ManagerTableHead>Status</ManagerTableHead>
              <ManagerTableHead className="text-right">Ações</ManagerTableHead>
            </ManagerTableRow>
          </ManagerTableHeader>
          <ManagerTableBody>
            {filteredUnits.length === 0 ? (
              <ManagerTableRow>
                <ManagerTableCell colSpan={7} className="text-center text-gray-500">
                  Nenhuma unidade encontrada
                </ManagerTableCell>
              </ManagerTableRow>
            ) : (
              filteredUnits.map((unit) => (
                <ManagerTableRow key={unit.id}>
                  <ManagerTableCell className="font-medium">{unit.number}</ManagerTableCell>
                  <ManagerTableCell>{unit.floor || "-"}</ManagerTableCell>
                  <ManagerTableCell>{unit.bedrooms || "-"}</ManagerTableCell>
                  <ManagerTableCell>{unit.block_name}</ManagerTableCell>
                  <ManagerTableCell>{unit.condo_name}</ManagerTableCell>
                  <ManagerTableCell>{statusBadge(unit.status)}</ManagerTableCell>
                  <ManagerTableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(unit)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(unit.id)}
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
      </div>
    </div>
  );
};

const ManagerUnidades = () => (
  <ManagerLayout>
    <ManagerUnidadesContent />
  </ManagerLayout>
);

export default ManagerUnidades;
