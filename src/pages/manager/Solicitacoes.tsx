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
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { DeleteManagerRequestModal } from "@/components/manager/DeleteManagerRequestModal";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useManagerAdministradoras } from "@/contexts/ManagerAdministradorasContext";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { Eye, Trash2 } from "lucide-react";

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
  
  // Delete confirmation modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<{ id: string; title: string } | null>(null);

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

  const handleDeleteRequest = (requestId: string, requestTitle: string) => {
    setRequestToDelete({ id: requestId, title: requestTitle });
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteRequest = async () => {
    if (!requestToDelete) return;

    try {
      const { error } = await supabase
        .from("resident_requests")
        .delete()
        .eq("id", requestToDelete.id);

      if (error) throw error;

      showRadixSuccess("Solicitud eliminada com sucesso");
      fetchRequests();
    } catch (error) {
      console.error("Error deleting request:", error);
      showRadixError("Error ao eliminar solicitud");
    } finally {
      setIsDeleteModalOpen(false);
      setRequestToDelete(null);
    }
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
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openViewModal(r)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteRequest(r.id, r.title)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
          <DialogContent className="sm:max-w-2xl bg-white border-gray-200 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Gestión de Solicitud
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Revisa los detalles y actualiza el estado de la solicitud.
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-6 py-4">
                {/* Header Card with Request Info */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {selectedRequest.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="font-medium">📍 {selectedRequest.condominium_name || "N/A"}</span>
                        {selectedRequest.location && (
                          <span>• {selectedRequest.location}</span>
                        )}
                        <span>• {formatDate(selectedRequest.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="bg-white">
                        {categoryLabels[selectedRequest.category] || selectedRequest.category}
                      </Badge>
                      <Badge className={
                        selectedRequest.priority === 'alta' || selectedRequest.priority === 'urgente' 
                          ? 'bg-red-100 text-red-800' 
                          : selectedRequest.priority === 'media'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }>
                        {priorityLabels[selectedRequest.priority] || selectedRequest.priority}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Request Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                      {selectedRequest.description}
                    </div>
                  </div>

                  {/* Requester Information Placeholder */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      👤 Información del Solicitante
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Residente:</span>
                        <div className="font-medium">A implementar*</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Unidad:</span>
                        <div className="font-medium">A implementar*</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Teléfono:</span>
                        <div className="font-medium">A implementar*</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <div className="font-medium">A implementar*</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-blue-600">
                      * Se necesita expandir la query para incluir información del residente
                    </div>
                  </div>
                </div>

                {/* Status and Notes Update */}
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium text-gray-900">Actualizar Solicitud</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Estado</label>
                      <Select value={updateStatus} onValueChange={setUpdateStatus}>
                        <SelectTrigger className="w-full">
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
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Estado Actual</label>
                      <div className="flex items-center h-9 px-3 bg-gray-50 rounded border">
                        <Badge variant="outline">
                          {statusLabels[selectedRequest.status] || selectedRequest.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Observaciones y Resolución
                    </label>
                    <Textarea
                      className="w-full resize-none"
                      value={updateNotes}
                      onChange={(e) => setUpdateNotes(e.target.value)}
                      rows={4}
                      placeholder="Añade comentarios sobre el progreso, solución implementada o motivo de cancelación..."
                    />
                  </div>
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

        {/* Delete Confirmation Modal */}
        <DeleteManagerRequestModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setRequestToDelete(null);
          }}
          onConfirm={confirmDeleteRequest}
          requestTitle={requestToDelete?.title}
        />
      </div>
    </ManagerLayout>
  );
};

export default Solicitacoes;
