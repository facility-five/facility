import React, { useState, useEffect, useMemo } from 'react';
import { ManagerLayout } from '@/components/manager/ManagerLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ManagerTable,
  ManagerTableBody,
  ManagerTableCell,
  ManagerTableHead,
  ManagerTableHeader,
  ManagerTableRow,
} from '@/components/manager/ManagerTable';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Filter, 
  Pencil, 
  Trash2, 
  CheckCircle,
  XCircle,
  MapPin
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showRadixError, showRadixSuccess } from '@/utils/toast';
import { NewManagerReservationModal } from '@/components/manager/NewManagerReservationModal';
import { EditManagerReservationModal } from '@/components/manager/EditManagerReservationModal';
import { DeleteManagerReservationModal } from '@/components/manager/DeleteManagerReservationModal';
import { PlanGuard } from '@/components/PlanGuard';

import { usePlan } from '@/hooks/usePlan';
import { useManagerAdministradoras } from '@/contexts/ManagerAdministradorasContext';

interface Reservation {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'approved' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'cancelled';
  amount: number;
  guests_count: number;
  notes?: string;
  created_at: string;
  resident_id: string;
  common_area_id: string;
  unit_id: string;
  common_areas: {
    id: string;
    name: string;
    condominiums: {
      id: string;
      name: string;
    };
  };
  residents: {
    id: string;
    name: string;
    email: string;
  };
}

const Reservas = () => {
  const { currentPlan, isLoading: planLoading } = usePlan();
  const { activeAdministratorId } = useManagerAdministradoras();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [condoFilter, setCondoFilter] = useState<string>("all");
  const [condominiums, setCondominiums] = useState<any[]>([]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const fetchReservations = async () => {
    if (!activeAdministratorId) {
      console.log("🔍 Reservas - Sem administradora ativa");
      setLoading(false);
      return;
    }

    console.log("🔍 Reservas - Buscando reservas para administradora:", activeAdministratorId);
    setLoading(true);
    
    try {
      // Primeiro buscar os condominios da administradora
      const { data: condoData, error: condoError } = await supabase
        .from("condominiums")
        .select("id")
        .eq("administrator_id", activeAdministratorId);

      if (condoError) throw condoError;

      const condoIds = condoData?.map(c => c.id) || [];
      
      if (condoIds.length === 0) {
        console.log("📭 Nenhum condomínio encontrado para esta administradora");
        setReservations([]);
        setLoading(false);
        return;
      }

      // Buscar áreas comuns dos condominios com seus nomes
      const { data: areasData, error: areasError } = await supabase
        .from("common_areas")
        .select("id, name, condo_id")
        .in("condo_id", condoIds);

      if (areasError) throw areasError;

      const areaIds = areasData?.map(a => a.id) || [];

      if (areaIds.length === 0) {
        console.log("📭 Nenhuma área comum encontrada");
        setReservations([]);
        setLoading(false);
        return;
      }

      // Criar mapa de área -> condomínio
      const areaToCondoMap = new Map();
      areasData?.forEach(area => {
        const condo = condoData?.find(c => c.id === area.condo_id);
        areaToCondoMap.set(area.id, {
          areaName: area.name,
          condoId: condo?.id || '',
          condoName: condo?.name || 'N/A'
        });
      });

      // Buscar reservas das áreas comuns (sem JOIN)
      const { data: reservasData, error } = await supabase
        .from("reservations")
        .select("*")
        .in("common_area_id", areaIds)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Buscar todos os residentes únicos das reservas
      const residentIds = [...new Set(reservasData?.map(r => r.resident_id).filter(Boolean))];
      
      let residentsMap = new Map();
      if (residentIds.length > 0) {
        const { data: residentsData } = await supabase
          .from("residents")
          .select("id, full_name, email")
          .in("id", residentIds);
        
        residentsData?.forEach(resident => {
          residentsMap.set(resident.id, {
            id: resident.id,
            name: resident.full_name,
            email: resident.email
          });
        });
      }

      // Mapear dados manualmente
      const formattedReservations = (reservasData || []).map((reservation: any) => {
        const areaInfo = areaToCondoMap.get(reservation.common_area_id);
        const resident = residentsMap.get(reservation.resident_id);
        return {
          ...reservation,
          common_areas: {
            id: reservation.common_area_id,
            name: areaInfo?.areaName || 'N/A',
            condominiums: {
              id: areaInfo?.condoId || '',
              name: areaInfo?.condoName || 'N/A'
            }
          },
          residents: resident || {
            id: reservation.resident_id,
            name: 'N/A',
            email: 'N/A'
          }
        };
      });

      console.log("✅ Reservas - Reservas carregadas:", formattedReservations.length);
      setReservations(formattedReservations);
    } catch (error) {
      console.error("❌ Erro ao buscar reservas:", error);
      showRadixError("Error al buscar reservas.");
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCondominiums = async () => {
    if (!activeAdministratorId) return;

    const { data, error } = await supabase
      .from("condominiums")
      .select("id, name")
      .eq("administrator_id", activeAdministratorId)
      .order("name");

    if (error) {
      console.error("Error fetching condominiums:", error);
    } else {
      setCondominiums(data || []);
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchCondominiums();
  }, [activeAdministratorId]);

  const stats = useMemo(() => {
    const total = reservations.length;
    const confirmed = reservations.filter(r => r.status === 'approved').length;
    const pending = reservations.filter(r => r.status === 'pending').length;
    const cancelled = reservations.filter(r => r.status === 'cancelled').length;
    return { total, confirmed, pending, cancelled };
  }, [reservations]);

  const filteredReservations = useMemo(() => {
    return reservations.filter(reservation => {
      const matchesSearch = 
        reservation.common_areas?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.residents?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.common_areas?.condominiums?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.date.includes(searchTerm);

      const matchesStatus = statusFilter === "all" || reservation.status === statusFilter;
      const matchesCondo = condoFilter === "all" || reservation.common_areas?.condominiums?.id === condoFilter;

      return matchesSearch && matchesStatus && matchesCondo;
    });
  }, [reservations, searchTerm, statusFilter, condoFilter]);

  const handleEditReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsEditModalOpen(true);
  };

  const handleDeleteReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsDeleteModalOpen(true);
  };

  // A exclus�o agora � tratada dentro do modal

  const handleStatusChange = async (reservationId: string, newStatus: string) => {
    const { error } = await supabase
      .from("reservations")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", reservationId);

    if (error) {
      showRadixError("Error al actualizar estado de la reserva.");
    } else {
      showRadixSuccess("¡Estado de la reserva actualizado con éxito!");
      fetchReservations();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (time: string) => {
    return time ? time.substring(0, 5) : '-';
  };

  const formatCurrency = (value: number) => {
    return value ? new Intl.NumberFormat("pt-BR", { 
      style: "currency", 
      currency: "BRL" 
    }).format(value) : '-';
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'pending': 'Pendiente',
      'approved': 'Aprobada',
      'cancelled': 'Cancelada'
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (!activeAdministratorId) {
    return (
      <ManagerLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Seleccione una administradora
            </h2>
            <p className="text-gray-500">
              Para visualizar las reservas, seleccione una administradora en el encabezado.
            </p>
          </div>
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reservas</h1>
            <p className="text-gray-600 mt-1">
              Gestione las reservas de las áreas comunes
            </p>
          </div>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => setIsNewModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Reserva
          </Button>
        </div>



        {/* Estat�sticas */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Reservas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lista de Reservas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Input
                placeholder="Buscar por código, área, residente o condominio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os estados</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="approved">Aprobada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
              <Select value={condoFilter} onValueChange={setCondoFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por condominio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los condominios</SelectItem>
                  {condominiums.map((condo) => (
                    <SelectItem key={condo.id} value={condo.id}>
                      {condo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ManagerTable>
              <ManagerTableHeader>
                <ManagerTableRow>
                  <ManagerTableHead>Fecha</ManagerTableHead>
                  <ManagerTableHead>Residente</ManagerTableHead>
                  <ManagerTableHead>Área Común</ManagerTableHead>
                  <ManagerTableHead>Condominio</ManagerTableHead>
                  <ManagerTableHead>Horario</ManagerTableHead>
                  <ManagerTableHead>Estado</ManagerTableHead>
                  <ManagerTableHead>Valor</ManagerTableHead>
                  <ManagerTableHead className="text-right">Acciones</ManagerTableHead>
                </ManagerTableRow>
              </ManagerTableHeader>
              <ManagerTableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <ManagerTableRow key={index}>
                      {Array.from({ length: 9 }).map((_, cellIndex) => (
                        <ManagerTableCell key={cellIndex}>
                          <Skeleton className="h-4 w-full" />
                        </ManagerTableCell>
                      ))}
                    </ManagerTableRow>
                  ))
                ) : filteredReservations.length > 0 ? (
                  filteredReservations.map((reservation) => (
                    <ManagerTableRow key={reservation.id}>
                      <ManagerTableCell className="font-medium text-purple-600">
                        {formatDate(reservation.date)}
                      </ManagerTableCell>
                      <ManagerTableCell>
                        <div>
                          <p className="font-medium">{reservation.residents?.name}</p>
                          <p className="text-sm text-gray-500">{reservation.residents?.email}</p>
                        </div>
                      </ManagerTableCell>
                      <ManagerTableCell>{reservation.common_areas?.name}</ManagerTableCell>
                      <ManagerTableCell>{reservation.common_areas?.condominiums?.name}</ManagerTableCell>
                      <ManagerTableCell>
                        {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                      </ManagerTableCell>
                      <ManagerTableCell>
                        <Select
                          value={reservation.status}
                          onValueChange={(value) => handleStatusChange(reservation.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <Badge className={getStatusBadge(reservation.status)}>
                              {getStatusLabel(reservation.status)}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="approved">Aprobada</SelectItem>
                            <SelectItem value="cancelled">Cancelada</SelectItem>
                          </SelectContent>
                        </Select>
                      </ManagerTableCell>
                      <ManagerTableCell>{formatCurrency(reservation.amount)}</ManagerTableCell>
                      <ManagerTableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditReservation(reservation)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteReservation(reservation)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </ManagerTableCell>
                      </ManagerTableRow>
                    ))
                  ) : (
                    <ManagerTableRow>
                      <ManagerTableCell colSpan={9} className="text-center text-gray-500 py-8">
                        <div className="flex flex-col items-center">
                          <MapPin className="h-12 w-12 text-gray-300 mb-4" />
                          <p className="text-lg font-medium">No hay nada registrado aquí.</p>
                          <p className="text-sm">Todavía no hay ningún contenido registrado en esta sección.</p>
                        </div>
                      </ManagerTableCell>
                    </ManagerTableRow>
                  )}
                </ManagerTableBody>
              </ManagerTable>
          </CardContent>
        </Card>
      </div>

      <NewManagerReservationModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={fetchReservations}
      />

      <EditManagerReservationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchReservations}
        reservation={selectedReservation}
      />

      <DeleteManagerReservationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={fetchReservations}
        reservation={selectedReservation}
      />
    </ManagerLayout>
  );
};

export default Reservas;
