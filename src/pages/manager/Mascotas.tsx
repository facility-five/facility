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
import { Pencil, Trash2, Plus, PawPrint } from "lucide-react";
import { useManagerAdministradoras } from "@/contexts/ManagerAdministradorasContext";

import { usePlan } from "@/hooks/usePlan";

const CONDO_PLACEHOLDER_VALUE = "__no_condo_available__";
const UNIT_PLACEHOLDER_VALUE = "__no_unit_available__";

type CondoSummary = {
  id: string;
  name: string;
};

type UnitSummary = {
  id: string;
  number: string;
  condo_id: string;
};

type ResidentSummary = {
  id: string;
  first_name: string;
  last_name: string;
  unit_id: string;
};

type PetRow = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  age: number | null;
  weight: number | null;
  color: string | null;
  description: string | null;
  status: string;
  unit_id: string;
  resident_id: string;
  condo_id: string;
  unit_number: string;
  condo_name: string;
  resident_name: string;
  created_at: string;
  updated_at: string;
};

type PetForEdit = {
  id?: string;
  name: string;
  species: string;
  breed: string | null;
  age: number | null;
  weight: number | null;
  color: string | null;
  description: string | null;
  status: string;
  unit_id: string;
  resident_id: string;
  condo_id: string;
};

const statusBadge = (status: string) => {
  const variant = status === "Ativo" ? "default" : status === "Inativo" ? "secondary" : "destructive";
  return <Badge variant={variant}>{status}</Badge>;
};

const ManagerMascotasContent = () => {
  const { activeAdministratorId } = useManagerAdministradoras();
  const { isFreePlan } = usePlan();
  const [pets, setPets] = useState<PetRow[]>([]);
  const [condos, setCondos] = useState<CondoSummary[]>([]);
  const [units, setUnits] = useState<UnitSummary[]>([]);
  const [residents, setResidents] = useState<ResidentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCondo, setSelectedCondo] = useState<string>("all");
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [selectedSpecies, setSelectedSpecies] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<PetForEdit | null>(null);

  // Debug logs
  console.log("🔍 Mascotas - activeAdministratorId:", activeAdministratorId);

  const fetchCondos = useCallback(async () => {
    if (!activeAdministratorId) {
      console.log("🔍 Mascotas - Sem administradora ativa, pulando fetchCondos");
      return;
    }

    console.log("🔍 Mascotas - Buscando condomínios...");
    try {
      const { data, error } = await supabase
        .from("condominiums")
        .select("id, name")
        .eq("administrator_id", activeAdministratorId)
        .order("name");

      if (error) {
        console.error("❌ Mascotas - Erro ao buscar condomínios:", error);
        throw error;
      }

      console.log("✅ Mascotas - Condomínios carregados:", data?.length || 0);
      setCondos(data || []);
    } catch (error) {
      console.error("❌ Mascotas - Erro na fetchCondos:", error);
      showRadixError("Erro ao carregar condomínios");
    }
  }, [activeAdministratorId]);

  const fetchUnits = useCallback(async () => {
    if (!activeAdministratorId) {
      console.log("🔍 Mascotas - Sem administradora ativa, pulando fetchUnits");
      return;
    }

    console.log("🔍 Mascotas - Buscando unidades...");
    try {
      const { data, error } = await supabase
        .from("units")
        .select("id, number, condo_id")
        .eq("administrator_id", activeAdministratorId)
        .order("number");

      if (error) {
        console.error("❌ Mascotas - Erro ao buscar unidades:", error);
        throw error;
      }

      console.log("✅ Mascotas - Unidades carregadas:", data?.length || 0);
      setUnits(data || []);
    } catch (error) {
      console.error("❌ Mascotas - Erro na fetchUnits:", error);
      showRadixError("Erro ao carregar unidades");
    }
  }, [activeAdministratorId]);

  const fetchResidents = useCallback(async () => {
    if (!activeAdministratorId) {
      console.log("🔍 Mascotas - Sem administradora ativa, pulando fetchResidents");
      return;
    }

    console.log("🔍 Mascotas - Buscando residentes...");
    try {
      const { data, error } = await supabase
        .from("residents")
        .select("id, first_name, last_name, unit_id")
        .eq("administrator_id", activeAdministratorId)
        .order("first_name");

      if (error) {
        console.error("❌ Mascotas - Erro ao buscar residentes:", error);
        throw error;
      }

      console.log("✅ Mascotas - Residentes carregados:", data?.length || 0);
      setResidents(data || []);
    } catch (error) {
      console.error("❌ Mascotas - Erro na fetchResidents:", error);
      showRadixError("Erro ao carregar residentes");
    }
  }, [activeAdministratorId]);

  const fetchPets = useCallback(async () => {
    if (!activeAdministratorId) {
      console.log("🔍 Mascotas - Sem administradora ativa, pulando fetchPets");
      return;
    }

    console.log("🔍 Mascotas - Buscando mascotas...");
    try {
      const { data, error } = await supabase
        .from("pets")
        .select(`
          id,
          name,
          species,
          breed,
          age,
          weight,
          color,
          description,
          status,
          unit_id,
          resident_id,
          condo_id,
          created_at,
          updated_at,
          units!inner(number),
          condominiums!inner(name),
          residents!inner(first_name, last_name)
        `)
        .eq("administrator_id", activeAdministratorId)
        .order("name");

      if (error) {
        console.error("❌ Mascotas - Erro ao buscar mascotas:", error);
        throw error;
      }

      console.log("✅ Mascotas - Mascotas carregadas:", data?.length || 0);

      const formattedPets: PetRow[] = (data || []).map((pet: any) => ({
        id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        age: pet.age,
        weight: pet.weight,
        color: pet.color,
        description: pet.description,
        status: pet.status,
        unit_id: pet.unit_id,
        resident_id: pet.resident_id,
        condo_id: pet.condo_id,
        unit_number: pet.units?.number || "N/A",
        condo_name: pet.condominiums?.name || "N/A",
        resident_name: `${pet.residents?.first_name || ""} ${pet.residents?.last_name || ""}`.trim() || "N/A",
        created_at: pet.created_at,
        updated_at: pet.updated_at,
      }));

      setPets(formattedPets);
    } catch (error) {
      console.error("❌ Mascotas - Erro na fetchPets:", error);
      showRadixError("Erro ao carregar mascotas");
    }
  }, [activeAdministratorId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCondos(), fetchUnits(), fetchResidents(), fetchPets()]);
      setLoading(false);
    };

    if (activeAdministratorId) {
      loadData();
    } else {
      // Se não há administrator_id, definir loading como false para mostrar a interface
      setLoading(false);
    }
  }, [activeAdministratorId]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredPets = useMemo(() => {
    return pets.filter((pet) => {
      const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pet.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (pet.breed && pet.breed.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           pet.resident_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCondo = selectedCondo === "all" || pet.condo_id === selectedCondo;
      const matchesUnit = selectedUnit === "all" || pet.unit_id === selectedUnit;
      const matchesSpecies = selectedSpecies === "all" || pet.species === selectedSpecies;
      const matchesStatus = selectedStatus === "all" || pet.status === selectedStatus;

      return matchesSearch && matchesCondo && matchesUnit && matchesSpecies && matchesStatus;
    });
  }, [pets, searchTerm, selectedCondo, selectedUnit, selectedSpecies, selectedStatus]);

  const availableUnits = useMemo(() => {
    if (selectedCondo === "all") return units;
    return units.filter(unit => unit.condo_id === selectedCondo);
  }, [units, selectedCondo]);

  const availableResidents = useMemo(() => {
    if (!editingPet?.unit_id) return residents;
    return residents.filter(resident => resident.unit_id === editingPet.unit_id);
  }, [residents, editingPet?.unit_id]);

  const handleSubmit = async (formData: FormData) => {
    if (!activeAdministratorId) {
      showRadixError("Erro: administrator_id não encontrado");
      return;
    }

    setSubmitting(true);
    try {
      const petData = {
        name: formData.get("name") as string,
        species: formData.get("species") as string,
        breed: formData.get("breed") as string || null,
        age: formData.get("age") ? parseInt(formData.get("age") as string) : null,
        weight: formData.get("weight") ? parseFloat(formData.get("weight") as string) : null,
        color: formData.get("color") as string || null,
        description: formData.get("description") as string || null,
        status: formData.get("status") as string,
        unit_id: formData.get("unit_id") as string,
        resident_id: formData.get("resident_id") as string,
        condo_id: formData.get("condo_id") as string,
        administrator_id: activeAdministratorId,
      };

      if (editingPet?.id) {
        const { error } = await supabase
          .from("pets")
          .update(petData)
          .eq("id", editingPet.id);

        if (error) throw error;
        showRadixSuccess("Mascota atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from("pets")
          .insert([petData]);

        if (error) throw error;
        showRadixSuccess("Mascota criada com sucesso!");
      }

      setIsDialogOpen(false);
      setEditingPet(null);
      await fetchPets();
    } catch (error) {
      console.error("Erro ao salvar mascota:", error);
      showRadixError("Erro ao salvar mascota");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (pet: PetRow) => {
    setEditingPet({
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age,
      weight: pet.weight,
      color: pet.color,
      description: pet.description,
      status: pet.status,
      unit_id: pet.unit_id,
      resident_id: pet.resident_id,
      condo_id: pet.condo_id,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta mascota?")) return;

    try {
      const { error } = await supabase
        .from("pets")
        .delete()
        .eq("id", id);

      if (error) throw error;
      showRadixSuccess("Mascota excluída com sucesso!");
      await fetchPets();
    } catch (error) {
      console.error("Erro ao excluir mascota:", error);
      showRadixError("Erro ao excluir mascota");
    }
  };

  const resetForm = () => {
    setEditingPet(null);
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

  if (!activeAdministratorId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <PawPrint className="h-6 w-6 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Mascotas</h1>
        </div>
        <p className="text-gray-600">
          Selecione uma administradora no cabeçalho para filtrar os dados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <PawPrint className="h-6 w-6 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Mascotas</h1>
          </div>
          <p className="text-gray-600 mt-1">
            Gestione las mascotas de los residentes
          </p>
        </div>
        {!isFreePlan ? (
          // Botão normal para usuários com plano pago
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="mr-2 h-4 w-4" />
                Nova Mascota
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <form action={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingPet?.id ? "Editar Mascota" : "Nova Mascota"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingPet?.id 
                      ? "Atualize as informações da mascota." 
                      : "Preencha as informações para registrar uma nova mascota."
                    }
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={editingPet?.name || ""}
                      placeholder="Nome da mascota"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="species">Espécie *</Label>
                    <Select name="species" defaultValue={editingPet?.species || ""} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a espécie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cão">Cão</SelectItem>
                        <SelectItem value="Gato">Gato</SelectItem>
                        <SelectItem value="Pássaro">Pássaro</SelectItem>
                        <SelectItem value="Peixe">Peixe</SelectItem>
                        <SelectItem value="Roedor">Roedor</SelectItem>
                        <SelectItem value="Réptil">Réptil</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="breed">Raça</Label>
                    <Input
                      id="breed"
                      name="breed"
                      defaultValue={editingPet?.breed || ""}
                      placeholder="Raça da mascota"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Idade (anos)</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      min="0"
                      max="50"
                      defaultValue={editingPet?.age || ""}
                      placeholder="Idade em anos"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      min="0"
                      step="0.1"
                      defaultValue={editingPet?.weight || ""}
                      placeholder="Peso em kg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Cor</Label>
                    <Input
                      id="color"
                      name="color"
                      defaultValue={editingPet?.color || ""}
                      placeholder="Cor da mascota"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select name="status" defaultValue={editingPet?.status || "Ativo"} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="condo_id">Condomínio *</Label>
                    <Select 
                      name="condo_id" 
                      defaultValue={editingPet?.condo_id || ""} 
                      required
                      onValueChange={(value) => {
                        if (editingPet) {
                          setEditingPet({ ...editingPet, condo_id: value, unit_id: "", resident_id: "" });
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
                    <Label htmlFor="unit_id">Unidade *</Label>
                    <Select 
                      name="unit_id" 
                      defaultValue={editingPet?.unit_id || ""} 
                      required
                      disabled={!editingPet?.condo_id && !condos.length}
                      onValueChange={(value) => {
                        if (editingPet) {
                          setEditingPet({ ...editingPet, unit_id: value, resident_id: "" });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUnits.length === 0 ? (
                          <SelectItem value={UNIT_PLACEHOLDER_VALUE} disabled>
                            {editingPet?.condo_id ? "Nenhuma unidade disponível" : "Selecione um condomínio primeiro"}
                          </SelectItem>
                        ) : (
                          availableUnits.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.number}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resident_id">Responsável *</Label>
                    <Select 
                      name="resident_id" 
                      defaultValue={editingPet?.resident_id || ""} 
                      required
                      disabled={!editingPet?.unit_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o responsável" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableResidents.length === 0 ? (
                          <SelectItem value="__no_resident_available__" disabled>
                            {editingPet?.unit_id ? "Nenhum residente disponível" : "Selecione uma unidade primeiro"}
                          </SelectItem>
                        ) : (
                          availableResidents.map((resident) => (
                            <SelectItem key={resident.id} value={resident.id}>
                              {resident.first_name} {resident.last_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={editingPet?.description || ""}
                      placeholder="Informações adicionais sobre a mascota"
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Salvando..." : editingPet?.id ? "Atualizar" : "Salvar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        ) : (
          // Botão de upgrade para usuários com plano gratuito
          <Button 
            onClick={() => window.location.href = '/gestor/mi-plan'}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Fazer Upgrade para Criar Mascotas
          </Button>
        )}
      </div>



      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Buscar por nome, espécie, raça ou responsável..."
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
        <Select value={selectedUnit} onValueChange={setSelectedUnit}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Filtrar por unidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as unidades</SelectItem>
            {availableUnits.map((unit) => (
              <SelectItem key={unit.id} value={unit.id}>
                {unit.number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedSpecies} onValueChange={setSelectedSpecies}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Filtrar por espécie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as espécies</SelectItem>
            <SelectItem value="Cão">Cão</SelectItem>
            <SelectItem value="Gato">Gato</SelectItem>
            <SelectItem value="Pássaro">Pássaro</SelectItem>
            <SelectItem value="Peixe">Peixe</SelectItem>
            <SelectItem value="Hamster">Hamster</SelectItem>
            <SelectItem value="Coelho">Coelho</SelectItem>
            <SelectItem value="Outro">Outro</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="Ativo">Ativo</SelectItem>
            <SelectItem value="Inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <ManagerTable>
          <ManagerTableHeader>
            <ManagerTableRow>
              <ManagerTableHead>Nome</ManagerTableHead>
              <ManagerTableHead>Espécie</ManagerTableHead>
              <ManagerTableHead>Raça</ManagerTableHead>
              <ManagerTableHead>Idade</ManagerTableHead>
              <ManagerTableHead>Peso</ManagerTableHead>
              <ManagerTableHead>Cor</ManagerTableHead>
              <ManagerTableHead>Unidade</ManagerTableHead>
              <ManagerTableHead>Responsável</ManagerTableHead>
              <ManagerTableHead>Status</ManagerTableHead>
              <ManagerTableHead className="text-right">Ações</ManagerTableHead>
            </ManagerTableRow>
          </ManagerTableHeader>
          <ManagerTableBody>
            {filteredPets.length === 0 ? (
              <ManagerTableRow>
                <ManagerTableCell colSpan={10} className="text-center text-gray-500">
                  Nenhuma mascota encontrada
                </ManagerTableCell>
              </ManagerTableRow>
            ) : (
              filteredPets.map((pet) => (
                <ManagerTableRow key={pet.id}>
                  <ManagerTableCell className="font-medium">{pet.name}</ManagerTableCell>
                  <ManagerTableCell>{pet.species}</ManagerTableCell>
                  <ManagerTableCell>{pet.breed || "-"}</ManagerTableCell>
                  <ManagerTableCell>{pet.age ? `${pet.age} anos` : "-"}</ManagerTableCell>
                  <ManagerTableCell>{pet.weight ? `${pet.weight} kg` : "-"}</ManagerTableCell>
                  <ManagerTableCell>{pet.color || "-"}</ManagerTableCell>
                  <ManagerTableCell>{pet.unit_number}</ManagerTableCell>
                  <ManagerTableCell>{pet.resident_name}</ManagerTableCell>
                  <ManagerTableCell>{statusBadge(pet.status)}</ManagerTableCell>
                  <ManagerTableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(pet)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(pet.id)}
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

const ManagerMascotas = () => (
  <ManagerLayout>
    <ManagerMascotasContent />
  </ManagerLayout>
);

export default ManagerMascotas;
