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
import { useAuth } from "@/contexts/AuthContext";
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
  type: string;
  area: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
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
  type: string;
  area: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  status: string;
  block_id: string;
  condo_id: string;
};

const statusBadge = (status: string) => {
  const variant = status === "Disponible" ? "default" : status === "Ocupada" ? "secondary" : "destructive";
  return <Badge variant={variant}>{status}</Badge>;
};

const ManagerUnidadesContent = () => {
  const { profile } = useAuth();
  const { isFreePlan, isLoading: planLoading } = usePlan();
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
  console.log("🔍 Unidades - Profile administradora_id:", profile?.administradora_id);

  const fetchCondos = useCallback(async () => {
    if (!profile?.administradora_id) {
      console.log("🔍 Unidades - Sem administradora_id, pulando fetchCondos");
      return;
    }

    console.log("🔍 Unidades - Buscando condomínios...");
    try {
      const { data, error } = await supabase
        .from("condominiums")
        .select("id, name")
        .eq("administradora_id", profile.administradora_id)
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
  }, [profile?.administradora_id]);

  const fetchBlocks = useCallback(async () => {
    if (!profile?.administradora_id) {
      console.log("🔍 Unidades - Sem administradora_id, pulando fetchBlocks");
      return;
    }

    console.log("🔍 Unidades - Buscando blocos...");
    try {
      const { data, error } = await supabase
        .from("blocks")
        .select("id, name, condo_id")
        .eq("administradora_id", profile.administradora_id)
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
  }, [profile?.administradora_id]);

  const fetchUnits = useCallback(async () => {
    if (!profile?.administradora_id) {
      console.log("🔍 Unidades - Sem administradora_id, pulando fetchUnits");
      return;
    }

    console.log("🔍 Unidades - Buscando unidades...");
    try {
      const { data, error } = await supabase
        .from("units")
        .select(`
          id,
          number,
          floor,
          type,
          area,
          bedrooms,
          bathrooms,
          status,
          block_id,
          condo_id,
          created_at,
          updated_at,
          blocks!inner(name),
          condominiums!inner(name)
        `)
        .eq("administradora_id", profile.administradora_id)
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
        type: unit.type,
        area: unit.area,
        bedrooms: unit.bedrooms,
        bathrooms: unit.bathrooms,
        status: unit.status,
        block_id: unit.block_id,
        condo_id: unit.condo_id,
        block_name: unit.blocks?.name || "N/A",
        condo_name: unit.condominiums?.name || "N/A",
        created_at: unit.created_at,
        updated_at: unit.updated_at,
      }));

      setUnits(formattedUnits);
    } catch (error) {
      console.error("❌ Unidades - Erro na fetchUnits:", error);
      showRadixError("Erro ao carregar unidades");
    }
  }, [profile?.administradora_id]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCondos(), fetchBlocks(), fetchUnits()]);
      setLoading(false);
    };

    if (profile?.administradora_id) {
      loadData();
    } else {
      // Se não há administradora_id, definir loading como false para mostrar a interface
      setLoading(false);
    }
  }, [profile?.administradora_id, fetchCondos, fetchBlocks, fetchUnits]);

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

  const handleSubmit = async (formData: FormData) => {
    if (!profile?.administradora_id) {
      showRadixError("Erro: administradora_id não encontrado");
      return;
    }

    setSubmitting(true);
    try {
      const unitData = {
        number: formData.get("number") as string,
        floor: formData.get("floor") ? parseInt(formData.get("floor") as string) : null,
        type: formData.get("type") as string,
        area: formData.get("area") ? parseFloat(formData.get("area") as string) : null,
        bedrooms: formData.get("bedrooms") ? parseInt(formData.get("bedrooms") as string) : null,
        bathrooms: formData.get("bathrooms") ? parseInt(formData.get("bathrooms") as string) : null,
        status: formData.get("status") as string,
        block_id: formData.get("block_id") as string,
        condo_id: formData.get("condo_id") as string,
        administradora_id: profile.administradora_id,
      };

      if (editingUnit?.id) {
        const { error } = await supabase
          .from("units")
          .update(unitData)
          .eq("id", editingUnit.id);

        if (error) throw error;
        showRadixSuccess("Unidade atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from("units")
          .insert([unitData]);

        if (error) throw error;
        showRadixSuccess("Unidade criada com sucesso!");
      }

      setIsDialogOpen(false);
      setEditingUnit(null);
      await fetchUnits();
    } catch (error) {
      console.error("Erro ao salvar unidade:", error);
      showRadixError("Erro ao salvar unidade");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (unit: UnitRow) => {
    setEditingUnit({
      id: unit.id,
      number: unit.number,
      floor: unit.floor,
      type: unit.type,
      area: unit.area,
      bedrooms: unit.bedrooms,
      bathrooms: unit.bathrooms,
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
    setEditingUnit(null);
    setIsDialogOpen(false);
  };

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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          {!planLoading && (
            <>
              {!isFreePlan ? (
                // Botão normal para usuários com plano pago
                <DialogTrigger asChild>
                  <Button onClick={resetForm} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Unidade
                  </Button>
                </DialogTrigger>
              ) : (
                // Botão de upgrade para usuários com plano gratuito
                <Button 
                  onClick={() => window.location.href = '/gestor/mi-plan'}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Fazer Upgrade para Criar Unidades
                </Button>
              )}
            </>
          )}
          <DialogContent className="sm:max-w-[600px]">
            <form action={handleSubmit}>
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
                      defaultValue={editingUnit?.number || ""}
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
                      defaultValue={editingUnit?.floor || ""}
                      placeholder="Ex: 1, 2, 3"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo *</Label>
                    <Select 
                      name="type" 
                      defaultValue={editingUnit?.type || ""} 
                      required
                      onValueChange={(value) => {
                        if (editingUnit) {
                          setEditingUnit({ ...editingUnit, type: value });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Apartamento">Apartamento</SelectItem>
                        <SelectItem value="Casa">Casa</SelectItem>
                        <SelectItem value="Cobertura">Cobertura</SelectItem>
                        <SelectItem value="Loft">Loft</SelectItem>
                        <SelectItem value="Studio">Studio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Área (m²)</Label>
                    <Input
                      id="area"
                      name="area"
                      type="number"
                      step="0.01"
                      defaultValue={editingUnit?.area || ""}
                      placeholder="Ex: 85.5"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Quartos</Label>
                    <Input
                      id="bedrooms"
                      name="bedrooms"
                      type="number"
                      defaultValue={editingUnit?.bedrooms || ""}
                      placeholder="Ex: 2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Banheiros</Label>
                    <Input
                      id="bathrooms"
                      name="bathrooms"
                      type="number"
                      defaultValue={editingUnit?.bathrooms || ""}
                      placeholder="Ex: 1"
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
                <Button type="button" variant="outline" onClick={resetForm}>
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
              <ManagerTableHead>Tipo</ManagerTableHead>
              <ManagerTableHead>Andar</ManagerTableHead>
              <ManagerTableHead>Área (m²)</ManagerTableHead>
              <ManagerTableHead>Quartos</ManagerTableHead>
              <ManagerTableHead>Banheiros</ManagerTableHead>
              <ManagerTableHead>Bloco</ManagerTableHead>
              <ManagerTableHead>Condomínio</ManagerTableHead>
              <ManagerTableHead>Status</ManagerTableHead>
              <ManagerTableHead className="text-right">Ações</ManagerTableHead>
            </ManagerTableRow>
          </ManagerTableHeader>
          <ManagerTableBody>
            {filteredUnits.length === 0 ? (
              <ManagerTableRow>
                <ManagerTableCell colSpan={10} className="text-center text-gray-500">
                  Nenhuma unidade encontrada
                </ManagerTableCell>
              </ManagerTableRow>
            ) : (
              filteredUnits.map((unit) => (
                <ManagerTableRow key={unit.id}>
                  <ManagerTableCell className="font-medium">{unit.number}</ManagerTableCell>
                  <ManagerTableCell>{unit.type}</ManagerTableCell>
                  <ManagerTableCell>{unit.floor || "-"}</ManagerTableCell>
                  <ManagerTableCell>{unit.area ? `${unit.area} m²` : "-"}</ManagerTableCell>
                  <ManagerTableCell>{unit.bedrooms || "-"}</ManagerTableCell>
                  <ManagerTableCell>{unit.bathrooms || "-"}</ManagerTableCell>
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
