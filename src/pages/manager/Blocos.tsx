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
import { Pencil, Trash2, Plus, Building2 } from "lucide-react";
import { useManagerAdministradoras } from "@/contexts/ManagerAdministradorasContext";
import { PlanGuard } from "@/components/PlanGuard";

import { usePlan } from "@/hooks/usePlan";

const CONDO_PLACEHOLDER_VALUE = "__no_condo_available__";

type CondoSummary = {
  id: string;
  name: string;
};

type BlockRow = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  condo_id: string;
  condo_name: string;
  created_at: string;
  updated_at: string;
};

type BlockForEdit = {
  id?: string;
  name: string;
  description: string;
  status: string;
  condo_id: string;
};

const statusBadge = (status: string) => {
  const variant = status === "active" ? "default" : "secondary";
  const label = status === "active" ? "Ativo" : "Inativo";
  return <Badge variant={variant}>{label}</Badge>;
};

const ManagerBlocosContent = () => {
  const { activeAdministratorId } = useManagerAdministradoras();
  const { currentPlan, isLoading: planLoading } = usePlan();
  const [blocks, setBlocks] = useState<BlockRow[]>([]);
  const [condos, setCondos] = useState<CondoSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCondo, setSelectedCondo] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<BlockForEdit | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCondos = useCallback(async () => {
    // // // console.log("🔍 Blocos - Iniciando busca de condomínios");
    // // // console.log("[QUERY PARAMS]", { administrator_id: activeAdministratorId });
    
    if (!activeAdministratorId) {
      // // // console.log("❌ Blocos - Sem administradora ativa, retornando");
      return;
    }

    try {
      // // // console.log("🔍 fetchCondos - Fazendo consulta ao Supabase");
      const { data, error } = await supabase
        .from("condominiums")
        .select("id, name")
        .eq("administrator_id", activeAdministratorId)
        .eq("status", "active")
        .order("name");

      // // // console.log("🔍 fetchCondos - Resposta do Supabase:", { data, error });

      if (error) throw error;
      setCondos(data || []);
      // // // console.log("✅ fetchCondos - Condomínios carregados:", data?.length || 0);
    } catch (error) {
      console.error("❌ fetchCondos - Erro:", error);
      showRadixError("Erro ao carregar condomínios");
    }
  }, [activeAdministratorId]);

  const fetchBlocks = useCallback(async () => {
    // // // console.log("🔍 Blocos - Iniciando busca de blocos");
    // // // console.log("[QUERY PARAMS]", { administrator_id: activeAdministratorId });
    
    if (!activeAdministratorId) {
      // // // console.log("❌ Blocos - Sem administradora ativa, retornando");
      return;
    }

    try {
      setLoading(true);
      
      // Primeiro buscar os condomínios da administradora
      const { data: condoData, error: condoError } = await supabase
        .from("condominiums")
        .select("id, name")
        .eq("administrator_id", activeAdministratorId);
      
      if (condoError) {
        console.error("Error fetching condominiums:", condoError);
        showRadixError("Erro ao buscar condomínios");
        setLoading(false);
        return;
      }
      
      const condoIds = condoData?.map(c => c.id) || [];
      const condoMap = new Map(condoData?.map(c => [c.id, c.name]) || []);
      
      if (condoIds.length === 0) {
        setBlocks([]);
        setLoading(false);
        return;
      }
      
      // Agora buscar blocos desses condomínios (SEM JOIN)
      const { data, error } = await supabase
        .from("blocks")
        .select("id, name, status, condo_id, created_at, updated_at")
        .in("condo_id", condoIds)
        .order("name");

      if (error) throw error;

      const blocksData: BlockRow[] = (data || []).map((block: any) => ({
        id: block.id,
        name: block.name,
        description: block.description,
        status: block.status,
        condo_id: block.condo_id,
        condo_name: condoMap.get(block.condo_id) || "N/A",
        created_at: block.created_at,
        updated_at: block.updated_at,
      }));

      setBlocks(blocksData);
    } catch (error) {
      console.error("Error fetching blocks:", error);
      showRadixError("Erro ao carregar blocos");
    } finally {
      setLoading(false);
    }
  }, [activeAdministratorId]);

  useEffect(() => {
    if (activeAdministratorId) {
      fetchCondos();
      fetchBlocks();
    } else {
      // Se não há administradora ativa, definir loading como false para mostrar a interface
      setLoading(false);
    }
  }, [activeAdministratorId]); // eslint-disable-line react-hooks/exhaustive-deps

  // SEMPRE chamar useMemo ANTES de qualquer return condicional
  const filteredBlocks = useMemo(() => {
    return blocks.filter((block) => {
      const matchesSearch = block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        block.condo_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (block.description && block.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCondo = selectedCondo === "all" || block.condo_id === selectedCondo;
      const matchesStatus = statusFilter === "all" || block.status === statusFilter;
      
      return matchesSearch && matchesCondo && matchesStatus;
    });
  }, [blocks, searchTerm, selectedCondo, statusFilter]);

  const handleCreateBlock = () => {
    setEditingBlock({
      name: "",
      description: "",
      status: "active",
      condo_id: condos.length > 0 ? condos[0].id : "",
    });
    setIsModalOpen(true);
  };

  const handleEditBlock = (block: BlockRow) => {
    setEditingBlock({
      id: block.id,
      name: block.name,
      description: block.description || "",
      status: block.status,
      condo_id: block.condo_id,
    });
    setIsModalOpen(true);
  };

  const handleDeleteBlock = async (blockId: string, blockName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o bloco "${blockName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("blocks")
        .delete()
        .eq("id", blockId);

      if (error) throw error;

      showRadixSuccess("Bloco excluído com sucesso");
      fetchBlocks();
    } catch (error) {
      console.error("Error deleting block:", error);
      showRadixError("Erro ao excluir bloco");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlock) return;

    setIsSubmitting(true);
    try {
      if (editingBlock.id) {
        // Update existing block
        const { error } = await supabase
          .from("blocks")
          .update({
            name: editingBlock.name,
            description: editingBlock.description || null,
            status: editingBlock.status,
            condo_id: editingBlock.condo_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingBlock.id);

        if (error) throw error;
        showRadixSuccess("Bloco atualizado com sucesso");
      } else {
        // Create new block
        const { error } = await supabase
          .from("blocks")
          .insert({
            name: editingBlock.name,
            description: editingBlock.description || null,
            status: editingBlock.status,
            condo_id: editingBlock.condo_id,
          });

        if (error) throw error;
        showRadixSuccess("Bloco criado com sucesso");
      }

      setIsModalOpen(false);
      setEditingBlock(null);
      fetchBlocks();
    } catch (error) {
      console.error("Error saving block:", error);
      showRadixError("Erro ao salvar bloco");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBlock(null);
  };

  // Early return DEPOIS de todos os hooks e callbacks
  if (!activeAdministratorId) {
    return (
      <div className="p-6 text-center text-gray-500">
        Selecione uma administradora para visualizar os blocos.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Verificar se atingiu o limite de blocos
  const hasReachedLimit = 
    currentPlan && 
    currentPlan.max_blocks !== null && 
    blocks.length >= currentPlan.max_blocks;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Blocos</h1>
        </div>
        {!planLoading && (
          <>
            {hasReachedLimit ? (
              // Botão de upgrade quando alcança o limite
              <Button 
                onClick={() => window.location.href = '/gestor/mi-plan'}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                Actualizar para Crear Más Blocos
              </Button>
            ) : (
              // Botão normal quando aún pode criar
              <Button onClick={handleCreateBlock} disabled={condos.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Bloco
              </Button>
            )}
          </>
        )}
      </div>



      <div className="flex gap-4 flex-wrap mb-6">
        <Input
          placeholder="Buscar por nome, condomínio ou descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[300px]"
        />
        <Select value={selectedCondo} onValueChange={setSelectedCondo}>
          <SelectTrigger className="w-[200px]">
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ManagerTable>
        <ManagerTableHeader>
          <ManagerTableRow>
            <ManagerTableHead>Nome</ManagerTableHead>
            <ManagerTableHead>Condomínio</ManagerTableHead>
            <ManagerTableHead>Descrição</ManagerTableHead>
            <ManagerTableHead>Status</ManagerTableHead>
            <ManagerTableHead>Criado em</ManagerTableHead>
            <ManagerTableHead className="text-right">Ações</ManagerTableHead>
          </ManagerTableRow>
        </ManagerTableHeader>
              <ManagerTableBody>
          {condos.length === 0 ? (
            <ManagerTableRow>
              <ManagerTableCell colSpan={6} className="text-center py-8">
                <Building2 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  Nenhum condomínio encontrado. Você precisa criar um condomínio antes de adicionar blocos.
                </p>
              </ManagerTableCell>
            </ManagerTableRow>
          ) : filteredBlocks.length === 0 ? (
            <ManagerTableRow>
              <ManagerTableCell colSpan={6} className="text-center py-8">
                <Building2 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  {searchTerm || selectedCondo !== "all" || statusFilter !== "all"
                    ? "Nenhum bloco encontrado com os filtros aplicados"
                    : "Nenhum bloco cadastrado"}
                </p>
              </ManagerTableCell>
            </ManagerTableRow>
          ) : (
            filteredBlocks.map((block) => (
                    <ManagerTableRow key={block.id}>
                      <ManagerTableCell className="font-medium">{block.name}</ManagerTableCell>
                      <ManagerTableCell>{block.condo_name}</ManagerTableCell>
                      <ManagerTableCell className="max-w-[200px] truncate">
                        {block.description || "-"}
                      </ManagerTableCell>
                      <ManagerTableCell>{statusBadge(block.status)}</ManagerTableCell>
                      <ManagerTableCell>
                        {new Date(block.created_at).toLocaleDateString("pt-BR")}
                      </ManagerTableCell>
                      <ManagerTableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBlock(block)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBlock(block.id, block.name)}
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingBlock?.id ? "Editar Bloco" : "Novo Bloco"}
              </DialogTitle>
              <DialogDescription>
                {editingBlock?.id
                  ? "Edite as informações do bloco"
                  : "Preencha as informações para criar um novo bloco"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={editingBlock?.name || ""}
                  onChange={(e) =>
                    setEditingBlock(prev => prev ? { ...prev, name: e.target.value } : null)
                  }
                  placeholder="Ex: Bloco A, Torre 1, etc."
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="condo">Condomínio *</Label>
                <Select
                  value={editingBlock?.condo_id || ""}
                  onValueChange={(value) =>
                    setEditingBlock(prev => prev ? { ...prev, condo_id: value } : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um condomínio" />
                  </SelectTrigger>
                  <SelectContent>
                    {condos.map((condo) => (
                      <SelectItem key={condo.id} value={condo.id}>
                        {condo.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={editingBlock?.description || ""}
                  onChange={(e) =>
                    setEditingBlock(prev => prev ? { ...prev, description: e.target.value } : null)
                  }
                  placeholder="Descrição opcional do bloco"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={editingBlock?.status || "active"}
                  onValueChange={(value) =>
                    setEditingBlock(prev => prev ? { ...prev, status: value } : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : editingBlock?.id ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ManagerBlocos = () => (
  <ManagerLayout>
    <ManagerBlocosContent />
  </ManagerLayout>
);

export default ManagerBlocos;

