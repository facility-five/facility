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
import { Pencil, Trash2, Plus, Car, Search } from "lucide-react";
import { useManagerAdministradoras } from "@/contexts/ManagerAdministradorasContext";

import { usePlan } from "@/hooks/usePlan";

type VehicleRow = {
  id: string;
  license_plate: string;
  brand: string;
  model: string;
  color: string;
  year: number | null;
  vehicle_type: string;
  status: string;
  owner_name: string;
  owner_document: string | null;
  unit_number: string | null;
  block_name: string | null;
  condo_name: string;
  notes: string | null;
  created_at: string;
};

type VehicleFormData = {
  license_plate: string;
  brand: string;
  model: string;
  color: string;
  year: number | null;
  vehicle_type: string;
  status: string;
  resident_id: string; // Changed from unit_id to resident_id
};

type CondoSummary = {
  id: string;
  name: string;
};

type UnitSummary = {
  id: string;
  number: string;
  block_name: string;
  condo_id: string;
};

type ResidentSummary = {
  id: string;
  full_name: string;
  unit_id: string;
  unit_number: string;
  condo_name: string;
};

const VEHICLE_TYPES = [
  { value: "car", label: "Automóvel" },
  { value: "motorcycle", label: "Motocicleta" },
  { value: "truck", label: "Caminhão" },
  { value: "van", label: "Van" },
  { value: "bicycle", label: "Bicicleta" },
  { value: "other", label: "Outro" },
];

const VEHICLE_STATUS = [
  { value: "active", label: "Ativo" },
  { value: "inactive", label: "Inativo" },
  { value: "blocked", label: "Bloqueado" },
];

const statusBadge = (status: string) => {
  const variants = {
    active: "default",
    inactive: "secondary",
    blocked: "destructive",
  } as const;
  
  return <Badge variant={variants[status as keyof typeof variants] || "secondary"}>{status}</Badge>;
};

const vehicleTypeBadge = (type: string) => {
  const typeLabels = {
    car: "Automóvel",
    motorcycle: "Motocicleta", 
    truck: "Caminhão",
    van: "Van",
    bicycle: "Bicicleta",
    other: "Outro",
  } as const;
  
  return <Badge variant="outline">{typeLabels[type as keyof typeof typeLabels] || type}</Badge>;
};

const ManagerVehiculosContent = () => {
  const { activeAdministratorId } = useManagerAdministradoras();
  const { isFreePlan } = usePlan();
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [condos, setCondos] = useState<CondoSummary[]>([]);
  const [units, setUnits] = useState<UnitSummary[]>([]);
  const [residents, setResidents] = useState<ResidentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCondo, setSelectedCondo] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleRow | null>(null);
  const [formData, setFormData] = useState<VehicleFormData>({
    license_plate: "",
    brand: "",
    model: "",
    color: "",
    year: null,
    vehicle_type: "car",
    status: "active",
    resident_id: "",
  });

  const fetchCondos = useCallback(async () => {
    console.log("🚗 fetchCondos - Iniciando busca de condomínios");
    console.log("[QUERY PARAMS]", { administrator_id: activeAdministratorId });
    
    if (!activeAdministratorId) {
      console.log("❌ fetchCondos - Sem administradora ativa, retornando");
      return;
    }

    try {
      console.log("🚗 fetchCondos - Fazendo consulta ao Supabase");
      const { data, error } = await supabase
        .from("condominiums")
        .select("id, name")
        .eq("administrator_id", activeAdministratorId)
        .eq("status", "active")
        .order("name");

      console.log("🚗 fetchCondos - Resposta do Supabase:", { data, error });

      if (error) throw error;
      setCondos(data || []);
      console.log("✅ fetchCondos - Condomínios carregados:", data?.length || 0);
    } catch (error) {
      console.error("❌ fetchCondos - Erro:", error);
      showRadixError("Erro ao carregar condomínios");
    }
  }, [activeAdministratorId]);

  const fetchVehicles = useCallback(async () => {
    console.log("🚗 fetchVehicles - Iniciando busca de veículos");
    console.log("[QUERY PARAMS]", { administrator_id: activeAdministratorId });
    
    if (!activeAdministratorId) {
      console.log("❌ fetchVehicles - Sem administradora ativa, retornando");
      return;
    }

    try {
      setLoading(true);
      console.log("🚗 fetchVehicles - Fazendo consulta ao Supabase");
      
      // Use proper multi-tenant filtering: vehicles -> residents -> units -> condominiums -> administrator_id
      const { data, error } = await supabase
        .from("vehicles")
        .select(`
          id,
          plate,
          brand,
          model,
          color,
          year,
          vehicle_type,
          status,
          resident_id,
          created_at,
          updated_at,
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
        .order("plate");

      console.log("🚗 fetchVehicles - Resposta do Supabase:", { data, error });

      if (error) throw error;

      const vehiclesData: VehicleRow[] = (data || []).map((vehicle: any) => ({
        id: vehicle.id,
        license_plate: vehicle.plate, // Map plate to license_plate for UI consistency
        brand: vehicle.brand,
        model: vehicle.model,
        color: vehicle.color,
        year: vehicle.year,
        vehicle_type: vehicle.vehicle_type,
        status: vehicle.status,
        owner_name: vehicle.residents?.full_name || "N/A",
        owner_document: null, // Not available in current schema
        unit_number: vehicle.residents?.units?.number || "N/A",
        block_name: null, // Not available in current schema
        condo_name: vehicle.residents?.units?.condominiums?.name || "N/A",
        notes: null, // Not available in current schema
        created_at: vehicle.created_at,
      }));

      setVehicles(vehiclesData);
      console.log("✅ fetchVehicles - Veículos carregados:", vehiclesData.length);
    } catch (error) {
      console.error("❌ fetchVehicles - Erro:", error);
      showRadixError("Erro ao carregar veículos");
    } finally {
      setLoading(false);
    }
  }, [activeAdministratorId]);

  const fetchResidents = useCallback(async () => {
    if (!activeAdministratorId) return;

    try {
      // First get condominiums for this administrator
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

      // Get units for these condominiums
      const { data: unitsData, error: unitsError } = await supabase
        .from("units")
        .select("id")
        .in("condominium_id", condoIds);

      if (unitsError) throw unitsError;

      const unitIds = unitsData?.map(u => u.id) || [];
      if (unitIds.length === 0) {
        setResidents([]);
        return;
      }

      // Get residents for these units
      const { data, error } = await supabase
        .from("residents")
        .select(`
          id,
          full_name,
          unit_id,
          units!inner(
            id,
            number,
            condominium_id,
            condominiums!inner(
              id,
              name
            )
          )
        `)
        .in("unit_id", unitIds)
        .order("full_name");

      if (error) throw error;

      const formattedResidents: ResidentSummary[] = data?.map((resident: any) => ({
        id: resident.id,
        full_name: resident.full_name,
        unit_id: resident.unit_id,
        unit_number: resident.units?.number || "N/A",
        condo_name: resident.units?.condominiums?.name || "N/A",
      })) || [];

      setResidents(formattedResidents);
    } catch (error) {
      console.error("Erro ao buscar residentes:", error);
      setResidents([]);
    }
  }, [activeAdministratorId]);

  useEffect(() => {
    if (activeAdministratorId) {
      fetchVehicles();
      fetchCondos();
      fetchResidents();
    } else {
      // Se não há administradora_id, definir loading como false para mostrar a interface
      setLoading(false);
    }
  }, [fetchVehicles, fetchCondos, fetchResidents, activeAdministratorId]);

  // Fallback visual quando não há administradora selecionada
  if (!activeAdministratorId) {
    return (
      <div className="p-6 text-center text-gray-500">
        Selecione uma administradora para visualizar os veículos.
      </div>
    );
  }

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesSearch = 
        vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.owner_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCondo = selectedCondo === "all" || 
        condos.find(c => c.id === selectedCondo)?.name === vehicle.condo_name;
      
      const matchesStatus = selectedStatus === "all" || vehicle.status === selectedStatus;
      
      const matchesVehicleType = selectedVehicleType === "all" || vehicle.vehicle_type === selectedVehicleType;

      return matchesSearch && matchesCondo && matchesStatus && matchesVehicleType;
    });
  }, [vehicles, searchTerm, selectedCondo, selectedStatus, selectedVehicleType, condos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingVehicle) {
        const { error } = await supabase
          .from("vehicles")
          .update({
            plate: formData.license_plate,
            brand: formData.brand,
            model: formData.model,
            color: formData.color,
            year: formData.year,
            vehicle_type: formData.vehicle_type,
            status: formData.status,
            resident_id: formData.resident_id, // Use resident_id instead of unit_id
          })
          .eq("id", editingVehicle.id);

        if (error) throw error;
        showRadixSuccess("Veículo atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("vehicles")
          .insert({
            plate: formData.license_plate,
            brand: formData.brand,
            model: formData.model,
            color: formData.color,
            year: formData.year,
            vehicle_type: formData.vehicle_type,
            status: formData.status,
            resident_id: formData.resident_id, // Use resident_id instead of unit_id
          });

        if (error) throw error;
        showRadixSuccess("Veículo cadastrado com sucesso!");
      }

      setIsModalOpen(false);
      setEditingVehicle(null);
      resetForm();
      fetchVehicles();
    } catch (error) {
      console.error("Erro ao salvar veículo:", error);
      showRadixError("Erro ao salvar veículo");
    }
  };

  const handleEdit = (vehicle: VehicleRow) => {
    const unit = units.find(u => u.number === vehicle.unit_number && u.block_name === vehicle.block_name);
    
    setFormData({
      license_plate: vehicle.license_plate,
      brand: vehicle.brand,
      model: vehicle.model,
      color: vehicle.color,
      year: vehicle.year,
      vehicle_type: vehicle.vehicle_type,
      status: vehicle.status,
      owner_name: vehicle.owner_name,
      owner_document: vehicle.owner_document || "",
      unit_id: unit?.id || "",
      notes: vehicle.notes || "",
    });
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleDelete = async (vehicleId: string) => {
    if (!confirm("Tem certeza que deseja excluir este veículo?")) return;

    try {
      const { error } = await supabase
        .from("vehicles")
        .delete()
        .eq("id", vehicleId);

      if (error) throw error;
      
      showRadixSuccess("Veículo excluído com sucesso!");
      fetchVehicles();
    } catch (error) {
      console.error("Erro ao excluir veículo:", error);
      showRadixError("Erro ao excluir veículo");
    }
  };

  const resetForm = () => {
    setFormData({
      license_plate: "",
      brand: "",
      model: "",
      color: "",
      year: null,
      vehicle_type: "car",
      status: "active",
      owner_name: "",
      owner_document: "",
      unit_id: "",
      notes: "",
    });
  };

  const openNewVehicleModal = () => {
    resetForm();
    setEditingVehicle(null);
    setIsModalOpen(true);
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
          <Car className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Vehículos</h1>
        </div>
        <Button onClick={openNewVehicleModal}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Vehículo
        </Button>
      </div>



      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por placa, marca, modelo o propietario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCondo} onValueChange={setSelectedCondo}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Condominio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los condominios</SelectItem>
            {condos.map((condo) => (
              <SelectItem key={condo.id} value={condo.id}>
                {condo.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {VEHICLE_STATUS.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedVehicleType} onValueChange={setSelectedVehicleType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {VEHICLE_TYPES.map((type) => (
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
              <ManagerTableHead>Placa</ManagerTableHead>
              <ManagerTableHead>Vehículo</ManagerTableHead>
              <ManagerTableHead>Tipo</ManagerTableHead>
              <ManagerTableHead>Propietario</ManagerTableHead>
              <ManagerTableHead>Unidad</ManagerTableHead>
              <ManagerTableHead>Estado</ManagerTableHead>
              <ManagerTableHead className="text-right">Acciones</ManagerTableHead>
            </ManagerTableRow>
          </ManagerTableHeader>
          <ManagerTableBody>
            {filteredVehicles.length === 0 ? (
              <ManagerTableRow>
                <ManagerTableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No se encontraron vehículos
                </ManagerTableCell>
              </ManagerTableRow>
            ) : (
              filteredVehicles.map((vehicle) => (
                <ManagerTableRow key={vehicle.id} className="hover:bg-purple-50">
                  <ManagerTableCell className="font-mono font-medium">
                    {vehicle.license_plate}
                  </ManagerTableCell>
                  <ManagerTableCell>
                    <div>
                      <div className="font-medium">{vehicle.brand} {vehicle.model}</div>
                      <div className="text-sm text-muted-foreground">
                        {vehicle.color} {vehicle.year && `• ${vehicle.year}`}
                      </div>
                    </div>
                  </ManagerTableCell>
                  <ManagerTableCell>
                    {vehicleTypeBadge(vehicle.vehicle_type)}
                  </ManagerTableCell>
                  <ManagerTableCell>
                    <div>
                      <div className="font-medium">{vehicle.owner_name}</div>
                      {vehicle.owner_document && (
                        <div className="text-sm text-muted-foreground">
                          {vehicle.owner_document}
                        </div>
                      )}
                    </div>
                  </ManagerTableCell>
                  <ManagerTableCell>
                    <div>
                      <div className="font-medium">
                        {vehicle.unit_number} - {vehicle.block_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {vehicle.condo_name}
                      </div>
                    </div>
                  </ManagerTableCell>
                  <ManagerTableCell>
                    {statusBadge(vehicle.status)}
                  </ManagerTableCell>
                  <ManagerTableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(vehicle)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(vehicle.id)}
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVehicle ? "Editar Vehículo" : "Nuevo Vehículo"}
            </DialogTitle>
            <DialogDescription>
              {editingVehicle 
                ? "Modifica los datos del vehículo" 
                : "Completa los datos para registrar un nuevo vehículo"
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="license_plate">Placa *</Label>
                <Input
                  id="license_plate"
                  value={formData.license_plate}
                  onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                  placeholder="ABC-1234"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vehicle_type">Tipo de Vehículo *</Label>
                <Select
                  value={formData.vehicle_type}
                  onValueChange={(value) => setFormData({ ...formData, vehicle_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Marca *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Toyota"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="model">Modelo *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Corolla"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Color *</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="Blanco"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year">Año</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year || ""}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="2020"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner_name">Propietario *</Label>
                <Input
                  id="owner_name"
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  placeholder="Juan Pérez"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="owner_document">Documento</Label>
                <Input
                  id="owner_document"
                  value={formData.owner_document}
                  onChange={(e) => setFormData({ ...formData, owner_document: e.target.value })}
                  placeholder="12345678"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit_id">Unidad *</Label>
                <Select
                  value={formData.unit_id}
                  onValueChange={(value) => setFormData({ ...formData, unit_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.number} - {unit.block_name}
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
                    {VEHICLE_STATUS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
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
              <Button type="submit">
                {editingVehicle ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ManagerVehiculos = () => (
  <ManagerLayout>
    <ManagerVehiculosContent />
  </ManagerLayout>
);

export default ManagerVehiculos;
