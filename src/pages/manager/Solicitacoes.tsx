import { useEffect, useMemo, useState } from "react";
import { ManagerLayout } from "@/components/manager/ManagerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ManagerTable,
  ManagerTableBody,
  ManagerTableCell,
  ManagerTableHead,
  ManagerTableHeader,
  ManagerTableRow,
} from "@/components/manager/ManagerTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useManagerAdministradoras } from "@/contexts/ManagerAdministradorasContext";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { Eye } from "lucide-react";

type Request = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  location?: string;
  created_at: string;
  updated_at: string;
  condominium_id: string;
  resident_id: string;
  resolution_notes?: string;
  condominium_name?: string | null;
};

const categoryLabels: Record<string, string> = {
  manutencao: "Mantenimiento",
  limpeza: "Limpieza",
  seguranca: "Seguridad",
  infraestrutura: "Infraestructura",
  outros: "Otros",
};

const priorityLabels: Record<string, string> = {
  baixa: "Baja",
  media: "Media",
  alta: "Alta",
  urgente: "Urgente",
};

const statusLabels: Record<string, string> = {
  pendente: "Pendiente",
  em_andamento: "En progreso",
  concluida: "Completada",
  cancelada: "Cancelada",
};

const Solicitacoes = () => {
  const { activeAdministratorId } = useManagerAdministradoras();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [condominiums, setCondominiums] = useState<{ id: string; name: string }[]>([]);
  const [selectedCondominium, setSelectedCondominium] = useState<string>("all");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string>("");
  const [updateNotes, setUpdateNotes] = useState<string>("");

  const fetchRequests = async () => {
    if (!activeAdministratorId) {
      setLoading(false);
      setRequests([]);
      setCondominiums([]);
      return;
    }

    try {
      setLoading(true);

      const { data: condosData, error: condosError } = await supabase
        .from("condominiums")
        .select("id, name")
        .eq("administrator_id", activeAdministratorId)
        .order("name");

      if (condosError) {
        showRadixError("Error al cargar condominios");
        setLoading(false);
        return;
      }

      setCondominiums(condosData || []);
      const condoIds = (condosData || []).map((c) => c.id);
      if (condoIds.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      const filterIds = selectedCondominium === "all" ? condoIds : [selectedCondominium];
      const { data, error } = await supabase
        .from("resident_requests")
        .select("*")
        .in("condominium_id", filterIds)
        .order("created_at", { ascending: false });

      if (error) {
        showRadixError("Error al buscar solicitudes: " + error.message);
        setLoading(false);
        return;
      }

      const withNames = (data || []).map((r: any) => ({
        ...r,
        condominium_name: (condosData || []).find((c) => c.id === r.condominium_id)?.name || null,
      }));

      setRequests(withNames as Request[]);
    } catch (err: any) {
      showRadixError("Error al buscar solicitudes: " + (err?.message || ""));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeAdministratorId, selectedCondominium]);

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || r.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [requests, searchQuery, statusFilter, categoryFilter]);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("es-ES");

  const openViewModal = (request: Request) => {
    setSelectedRequest(request);
    setUpdateStatus(request.status);
    setUpdateNotes(request.resolution_notes || "");
    setIsViewModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedRequest) {
      console.error("No selected request");
      return;
    }
    
    console.log("Updating request:", {
      id: selectedRequest.id,
      status: updateStatus,
      notes: updateNotes
    });
    
    const { error, data } = await supabase
      .from("resident_requests")
      .update({ status: updateStatus, resolution_notes: updateNotes })
      .eq("id", selectedRequest.id);

    if (error) {
      console.error("Update error:", error);
      showRadixError("Error al actualizar solicitud: " + error.message);
      return;
    }

    console.log("Update successful:", data);
    showRadixSuccess("Solicitud actualizada");
    setIsViewModalOpen(false);
    fetchRequests();
  };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solicitudes</h1>
          <p className="text-muted-foreground">
            Solicitudes recibidas de los residentes de tus condominios.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <Input
              placeholder="Buscar solicitudes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="md:w-64"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="md:w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pendente">Pendiente</SelectItem>
                <SelectItem value="em_andamento">En progreso</SelectItem>
                <SelectItem value="concluida">Completada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="md:w-40">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="manutencao">Mantenimiento</SelectItem>
                <SelectItem value="limpeza">Limpieza</SelectItem>
                <SelectItem value="seguranca">Seguridad</SelectItem>
                <SelectItem value="infraestrutura">Infraestructura</SelectItem>
                <SelectItem value="outros">Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={selectedCondominium} onValueChange={setSelectedCondominium}>
            <SelectTrigger className="md:w-64">
              <SelectValue placeholder="Filtrar por condominio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los condominios</SelectItem>
              {condominiums.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ManagerTable>
          <ManagerTableHeader>
            <ManagerTableRow>
              <ManagerTableHead>Título</ManagerTableHead>
              <ManagerTableHead>Categoría</ManagerTableHead>
              <ManagerTableHead>Prioridad</ManagerTableHead>
              <ManagerTableHead>Estado</ManagerTableHead>
              <ManagerTableHead>Condominio</ManagerTableHead>
              <ManagerTableHead>Fecha</ManagerTableHead>
              <ManagerTableHead className="text-right">Acciones</ManagerTableHead>
            </ManagerTableRow>
          </ManagerTableHeader>
          <ManagerTableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <ManagerTableRow key={i}>
                  <ManagerTableCell colSpan={7}>
                    <Skeleton className="h-8 w-full" />
                  </ManagerTableCell>
                </ManagerTableRow>
              ))
            ) : filteredRequests.length > 0 ? (
              filteredRequests.map((r) => (
                <ManagerTableRow key={r.id}>
                  <ManagerTableCell className="font-medium">{r.title}</ManagerTableCell>
                  <ManagerTableCell>
                    <Badge variant="outline">
                      {categoryLabels[r.category] || r.category}
                    </Badge>
                  </ManagerTableCell>
                  <ManagerTableCell>
                    <Badge>
                      {priorityLabels[r.priority] || r.priority}
                    </Badge>
                  </ManagerTableCell>
                  <ManagerTableCell>
                    <Badge>
                      {statusLabels[r.status] || r.status}
                    </Badge>
                  </ManagerTableCell>
                  <ManagerTableCell>{r.condominium_name || "N/A"}</ManagerTableCell>
                  <ManagerTableCell>{formatDate(r.created_at)}</ManagerTableCell>
                  <ManagerTableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openViewModal(r)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </ManagerTableCell>
                </ManagerTableRow>
              ))
            ) : (
              <ManagerTableRow>
                <ManagerTableCell colSpan={7} className="text-center text-muted-foreground">
                  No se encontraron solicitudes.
                </ManagerTableCell>
              </ManagerTableRow>
            )}
          </ManagerTableBody>
        </ManagerTable>

        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-lg bg-white border-gray-200">
            <DialogHeader>
              <DialogTitle>Solicitud</DialogTitle>
              <DialogDescription>Actualiza el estado y registra observaciones.</DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-1">
                  <span className="font-medium">{selectedRequest.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {selectedRequest.condominium_name || ""}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm">Estado</label>
                    <Select value={updateStatus} onValueChange={setUpdateStatus}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendiente</SelectItem>
                        <SelectItem value="em_andamento">En progreso</SelectItem>
                        <SelectItem value="concluida">Completada</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm">Prioridad</label>
                    <div className="mt-2">
                      <Badge>{priorityLabels[selectedRequest.priority] || selectedRequest.priority}</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm">Observaciones</label>
                  <Textarea
                    className="mt-1"
                    value={updateNotes}
                    onChange={(e) => setUpdateNotes(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsViewModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdate}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ManagerLayout>
  );
};

export default Solicitacoes;
