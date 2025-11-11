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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { Pencil, Trash2, Plus, PawPrint, Search } from "lucide-react";
import { useManagerAdministradoras } from "@/contexts/ManagerAdministradorasContext";

type PetRow = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  color: string | null;
  size: string | null;
  status: string;
  owner_name: string;
  unit_number: string | null;
  condo_name: string;
  notes: string | null;
  created_at: string;
};

type PetFormData = {
  name: string;
  species: string;
  breed: string;
  color: string;
  size: string;
  status: string;
  resident_id: string;
  notes: string;
};

type CondoSummary = {
  id: string;
  name: string;
};

type ResidentSummary = {
  id: string;
  full_name: string;
  unit_id: string;
  unit_number: string;
  condo_name: string;
};

const PET_SPECIES = [
  { value: "dog", label: "Perro" },
  { value: "cat", label: "Gato" },
  { value: "bird", label: "Ave" },
  { value: "other", label: "Otro" },
];

const PET_SIZES = [
  { value: "small", label: "Pequeño" },
  { value: "medium", label: "Mediano" },
  { value: "large", label: "Grande" },
];

const PET_STATUS = [
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },
];

const statusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-700 border border-green-200">Activo</Badge>;
    case "inactive":
      return <Badge className="bg-gray-100 text-gray-700 border border-gray-200">Inactivo</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const ManagerPetsContent = () => {
  const { activeAdministratorId } = useManagerAdministradoras();
  const [pets, setPets] = useState<PetRow[]>([]);
  const [condos, setCondos] = useState<CondoSummary[]>([]);
  const [residents, setResidents] = useState<ResidentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCondo, setSelectedCondo] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedSpecies, setSelectedSpecies] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [petToDelete, setPetToDelete] = useState<PetRow | null>(null);
  const [editingPet, setEditingPet] = useState<PetRow | null>(null);
  const [formData, setFormData] = useState<PetFormData>({
    name: "",
    species: "dog",
    breed: "",
    color: "",
    size: "medium",
    status: "active",
    resident_id: "",
    notes: "",
  });

  const fetchCondos = useCallback(async () => {
    if (!activeAdministratorId) return;
    try {
      const { data, error } = await supabase
        .from("condominiums")
        .select("id, name")
        .eq("administrator_id", activeAdministratorId)
        .eq("status", "active")
        .order("name");
      if (error) throw error;
      setCondos(data || []);
    } catch (error) {
      console.error("Error al cargar condominios:", error);
      showRadixError("Error al cargar condominios");
    }
  }, [activeAdministratorId]);

  const fetchResidents = useCallback(async () => {
    if (!activeAdministratorId) return;
    try {
      const { data: condosData, error: condosError } = await supabase
        .from("condominiums")
        .select("id")
        .eq("administrator_id", activeAdministratorId);
      if (condosError) throw condosError;
      const condoIds = condosData?.map((c) => c.id) || [];
      if (condoIds.length === 0) {
        setResidents([]);
        return;
      }

      const { data: unitsData, error: unitsError } = await supabase
        .from("units")
        .select("id")
        .in("condo_id", condoIds);
      if (unitsError) throw unitsError;
      const unitIds = unitsData?.map((u) => u.id) || [];
      if (unitIds.length === 0) {
        setResidents([]);
        return;
      }

      const { data, error } = await supabase
        .from("residents")
        .select(`
          id,
          full_name,
          unit_id,
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
      const formatted: ResidentSummary[] = (data || []).map((resident: any) => ({
        id: resident.id,
        full_name: resident.full_name,
        unit_id: resident.unit_id,
        unit_number: resident.units?.number || "N/A",
        condo_name: resident.units?.condominiums?.name || "N/A",
      }));
      setResidents(formatted);
    } catch (error) {
      console.error("Error al buscar residentes:", error);
      setResidents([]);
    }
  }, [activeAdministratorId]);

  const fetchPets = useCallback(async () => {
    if (!activeAdministratorId) return;
    try {
      setLoading(true);
      console.log("[Pets] Fetching pets for administrator:", activeAdministratorId);
      
      // Try the complex query with proper joins
      const { data, error } = await supabase
        .from("pets")
        .select(`
          *,
          residents!inner(
            id,
            full_name,
            units!inner(
              id,
              number,
              condominiums!inner(
                id,
                name,
                administrator_id
              )
            )
          )
        `)
        .eq("residents.units.condominiums.administrator_id", activeAdministratorId)
        .order("name");
        
      console.log("[Pets] Query result:", { data, error });
      
      if (error) {
        console.error("[Pets] Complex query failed:", error);
        // Fallback to simple query without filtering by administrator
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("pets")
          .select("*, residents(full_name)")
          .order("name");
          
        if (fallbackError) throw fallbackError;
        
        const petsData: PetRow[] = (fallbackData || []).map((pet: any) => ({
          id: pet.id,
          name: pet.name ?? "",
          species: pet.species ?? "other",
          breed: pet.breed ?? null,
          color: pet.color ?? null,
          size: pet.size ?? null,
          status: pet.status ?? "active",
          owner_name: pet.residents?.full_name ?? "N/A",
          unit_number: "N/A",
          condo_name: "N/A",
          notes: pet.notes ?? null,
          created_at: pet.created_at ?? new Date().toISOString(),
        }));
        
        setPets(petsData);
        return;
      }
      
      const petsData: PetRow[] = (data || []).map((pet: any) => ({
        id: pet.id,
        name: pet.name ?? "",
        species: pet.species ?? "other",
        breed: pet.breed ?? null,
        color: pet.color ?? null,
        size: pet.size ?? null,
        status: pet.status ?? "active",
        owner_name: pet.residents?.full_name ?? "N/A",
        unit_number: pet.residents?.units?.number ?? "N/A",
        condo_name: pet.residents?.units?.condominiums?.name ?? "N/A",
        notes: pet.notes ?? null,
        created_at: pet.created_at ?? new Date().toISOString(),
      }));
      
      console.log("[Pets] Final processed pets data:", petsData);
      setPets(petsData);
      
    } catch (error) {
      console.error("Error al cargar mascotas:", error);
      showRadixError(`Error al cargar mascotas: ${(error as any).message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  }, [activeAdministratorId]);

  useEffect(() => {
    if (activeAdministratorId) {
      fetchCondos();
      fetchResidents();
      fetchPets();
    } else {
      setLoading(false);
    }
  }, [fetchCondos, fetchResidents, fetchPets, activeAdministratorId]);
  const filteredPets = useMemo(() => {
    return pets.filter((pet) => {
      const matchesSearch =
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pet.breed || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.owner_name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCondo =
        selectedCondo === "all" || condos.find((c) => c.id === selectedCondo)?.name === pet.condo_name;

      const matchesStatus = selectedStatus === "all" || pet.status === selectedStatus;
      const matchesSpecies = selectedSpecies === "all" || pet.species === selectedSpecies;

      return matchesSearch && matchesCondo && matchesStatus && matchesSpecies;
    });
  }, [pets, searchTerm, selectedCondo, selectedStatus, selectedSpecies, condos]);

  if (!activeAdministratorId) {
    return (
      <div className="p-6 text-center text-gray-500">
        Seleccione una administradora para visualizar las mascotas.
      </div>
    );
  }

  const resetForm = () => {
    setFormData({
      name: "",
      species: "dog",
      breed: "",
      color: "",
      size: "medium",
      status: "active",
      resident_id: "",
      notes: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation checks
    if (!formData.name.trim()) {
      showRadixError("El nombre es obligatorio");
      return;
    }
    
    if (!formData.resident_id) {
      showRadixError("Debe seleccionar un residente");
      return;
    }
    
    try {
      const payload = {
        name: formData.name.trim(),
        species: formData.species,
        breed: formData.breed?.trim() || null,
        color: formData.color?.trim() || null,
        size: formData.size,
        status: formData.status,
        resident_id: formData.resident_id,
        notes: formData.notes?.trim() || null,
      };
      
      console.log("[Pets] Submitting payload:", payload);

      if (editingPet) {
        const { error } = await supabase
          .from("pets")
          .update(payload)
          .eq("id", editingPet.id);
        if (error) throw error;
        showRadixSuccess("Mascota actualizada con éxito!");
      } else {
        const { data, error } = await supabase
          .from("pets")
          .insert(payload)
          .select();
        console.log("[Pets] Insert result:", { data, error });
        if (error) throw error;
        showRadixSuccess("Mascota creada con éxito!");
      }
      
      setIsModalOpen(false);
      setEditingPet(null);
      resetForm();
      fetchPets();
    } catch (error) {
      const err = error as any;
      console.error("Error al guardar mascota:", err);
      showRadixError(`Error al guardar mascota: ${err.message || 'Error desconocido'}`);
    }
  };

  const openNewPetModal = () => {
    resetForm();
    setEditingPet(null);
    setIsModalOpen(true);
  };

  const handleEdit = (pet: PetRow) => {
    const resident = residents.find((r) => r.full_name === pet.owner_name && r.unit_number === (pet.unit_number || ""));
    setFormData({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || "",
      color: pet.color || "",
      size: pet.size || "medium",
      status: pet.status,
      resident_id: resident?.id || "",
      notes: pet.notes || "",
    });
    setEditingPet(pet);
    setIsModalOpen(true);
  };

  const confirmDeletePet = (pet: PetRow) => {
    setPetToDelete(pet);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!petToDelete) return;
    try {
      const { error } = await supabase
        .from("pets")
        .delete()
        .eq("id", petToDelete.id);
      if (error) throw error;
      showRadixSuccess("Mascota eliminada con éxito!");
      setIsDeleteOpen(false);
      setPetToDelete(null);
      fetchPets();
    } catch (error) {
      console.error("Error al eliminar mascota:", error);
      showRadixError("Error al eliminar mascota");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <PawPrint className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Mascotas</h1>
        </div>
        <Button onClick={openNewPetModal}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Mascota
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nombre, especie, raza o propietario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedCondo} onValueChange={setSelectedCondo}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Condominio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Condominios</SelectItem>
            {condos.map((condo) => (
              <SelectItem key={condo.id} value={condo.id}>
                {condo.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {PET_STATUS.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedSpecies} onValueChange={setSelectedSpecies}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Especie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {PET_SPECIES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <ManagerTable>
          <ManagerTableHeader>
            <ManagerTableRow>
              <ManagerTableHead>Nombre</ManagerTableHead>
              <ManagerTableHead>Especie</ManagerTableHead>
              <ManagerTableHead>Tamaño</ManagerTableHead>
              <ManagerTableHead>Propietario</ManagerTableHead>
              <ManagerTableHead>Unidad</ManagerTableHead>
              <ManagerTableHead>Estado</ManagerTableHead>
              <ManagerTableHead className="text-right">Acciones</ManagerTableHead>
            </ManagerTableRow>
          </ManagerTableHeader>
          <ManagerTableBody>
            {filteredPets.length === 0 ? (
              <ManagerTableRow>
                <ManagerTableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No se encontraron mascotas
                </ManagerTableCell>
              </ManagerTableRow>
            ) : (
              filteredPets.map((pet) => (
                <ManagerTableRow key={pet.id} className="hover:bg-purple-50">
                  <ManagerTableCell className="font-medium">
                    <div>
                      <div className="font-medium">{pet.name}</div>
                      {pet.breed && (
                        <div className="text-sm text-muted-foreground">{pet.breed}</div>
                      )}
                    </div>
                  </ManagerTableCell>
                  <ManagerTableCell>
                    {pet.species}
                  </ManagerTableCell>
                  <ManagerTableCell>
                    {pet.size || "-"}
                  </ManagerTableCell>
                  <ManagerTableCell>
                    {pet.owner_name}
                  </ManagerTableCell>
                  <ManagerTableCell>
                    {pet.unit_number}
                  </ManagerTableCell>
                  <ManagerTableCell>
                    {statusBadge(pet.status)}
                  </ManagerTableCell>
                  <ManagerTableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(pet)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => confirmDeletePet(pet)}
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

      {/* Modal de criação/edição */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPet ? "Editar Mascota" : "Nueva Mascota"}</DialogTitle>
            <DialogDescription>Complete los campos obligatorios</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre de la mascota"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="species">Especie *</Label>
                <Select
                  value={formData.species}
                  onValueChange={(value) => setFormData({ ...formData, species: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PET_SPECIES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="breed">Raza</Label>
                <Input
                  id="breed"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  placeholder="Raza"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="Color"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Tamaño</Label>
                <Select
                  value={formData.size}
                  onValueChange={(value) => setFormData({ ...formData, size: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PET_SIZES.map((sz) => (
                      <SelectItem key={sz.value} value={sz.value}>
                        {sz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PET_STATUS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="resident_id">Propietario (Residente) *</Label>
                <Select
                  value={formData.resident_id}
                  onValueChange={(value) => setFormData({ ...formData, resident_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {residents.map((res) => (
                      <SelectItem key={res.id} value={res.id}>
                        {res.full_name} — {res.unit_number} ({res.condo_name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observaciones</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observaciones adicionales..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">{editingPet ? "Actualizar" : "Crear"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de exclusão */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Desea eliminar la mascota "{petToDelete?.name}"?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ManagerPets = () => (
  <ManagerLayout>
    <ManagerPetsContent />
  </ManagerLayout>
);

export default ManagerPets;