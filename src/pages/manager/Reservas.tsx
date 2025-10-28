import React, { useState, useEffect, useMemo } from 'react';
import { ManagerLayout } from '@/components/manager/ManagerLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
import { useManagerAdministrators } from '@/contexts/ManagerAdministratorsContext';
import { showError, showSuccess } from '@/utils/toast';
import { NewManagerReservationModal } from '@/components/manager/NewManagerReservationModal';
import { EditManagerReservationModal } from '@/components/manager/EditManagerReservationModal';
import { DeleteManagerReservationModal } from '@/components/manager/DeleteManagerReservationModal';

interface Reservation {
  id: string;
  code: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  status: 'Pendente' | 'Confirmada' | 'Cancelada';
  total_value: number;
  observations?: string;
  created_at: string;
  common_areas: {
    id: string;
    name: string;
  };
  residents: {
    id: string;
    name: string;
    email: string;
  };
  condominiums: {
    id: string;
    name: string;
  };
}

const Reservas = () => {
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
  const { selectedAdministratorId } = useManagerAdministrators();

  const fetchReservations = async () => {
    if (!selectedAdministratorId) {
      setReservations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("reservas")
      .select(`
        *,
        common_areas!inner(
          id,
          name,
          condo_id
        ),
        residents:resident_id(
          id,
          name,
          email
        ),
        condominiums!inner(
          id,
          name,
          administrator_id
        )
      `)
      .eq("condominiums.administrator_id", selectedAdministratorId)
      .order("created_at", { ascending: false });

    if (error) {
      showError("Erro ao buscar reservas.");
      console.error("Error fetching reservations:", error);
    } else {
      setReservations(data as any[] || []);
    }
    setLoading(false);
  };

  const fetchCondominiums = async () => {
    if (!selectedAdministratorId) return;

    const { data, error } = await supabase
      .from("condominiums")
      .select("id, name")
      .eq("administrator_id", selectedAdministratorId)
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
  }, [selectedAdministratorId]);

  const stats = useMemo(() => {
    const total = reservations.length;
    const confirmed = reservations.filter(r => r.status === 'Confirmada').length;
    const pending = reservations.filter(r => r.status === 'Pendente').length;
    const cancelled = reservations.filter(r => r.status === 'Cancelada').length;
    return { total, confirmed, pending, cancelled };
  }, [reservations]);

  const filteredReservations = useMemo(() => {
    return reservations.filter(reservation => {
      const matchesSearch = 
        reservation.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.common_areas?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.residents?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.condominiums?.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || reservation.status === statusFilter;
      const matchesCondo = condoFilter === "all" || reservation.condominiums?.id === condoFilter;

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

  const handleConfirmDelete = async () => {
    if (!selectedReservation) return;

    const { error } = await supabase
      .from("reservas")
      .delete()
      .eq("id", selectedReservation.id);

    if (error) {
      showError("Erro ao excluir reserva.");
    } else {
      showSuccess("Reserva excluída com sucesso!");
      fetchReservations();
    }
    setIsDeleteModalOpen(false);
    setSelectedReservation(null);
  };

  const handleStatusChange = async (reservationId: string, newStatus: string) => {
    const { error } = await supabase
      .from("reservas")
      .update({ status: newStatus })
      .eq("id", reservationId);

    if (error) {
      showError("Erro ao atualizar status da reserva.");
    } else {
      showSuccess("Status da reserva atualizado com sucesso!");
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
      'Pendente': 'bg-yellow-100 text-yellow-800',
      'Confirmada': 'bg-green-100 text-green-800',
      'Cancelada': 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  if (!selectedAdministratorId) {
    return (
      <ManagerLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Selecione uma administradora
            </h2>
            <p className="text-gray-500">
              Para visualizar as reservas, selecione uma administradora no cabeçalho.
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
            Novo Reservo
          </Button>
        </div>

        {/* Estatísticas */}
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
                placeholder="Buscar por código, área, residente ou condomínio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Confirmada">Confirmada</SelectItem>
                  <SelectItem value="Cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
              <Select value={condoFilter} onValueChange={setCondoFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por condomínio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os condomínios</SelectItem>
                  {condominiums.map((condo) => (
                    <SelectItem key={condo.id} value={condo.id}>
                      {condo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-purple-600 hover:bg-purple-600">
                    <TableHead className="text-white">Código</TableHead>
                    <TableHead className="text-white">Residente</TableHead>
                    <TableHead className="text-white">Área Común</TableHead>
                    <TableHead className="text-white">Condomínio</TableHead>
                    <TableHead className="text-white">Fecha</TableHead>
                    <TableHead className="text-white">Horario</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Valor</TableHead>
                    <TableHead className="text-white text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        {Array.from({ length: 9 }).map((_, cellIndex) => (
                          <TableCell key={cellIndex}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : filteredReservations.length > 0 ? (
                    filteredReservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell className="font-medium text-purple-600">
                          {reservation.code}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{reservation.residents?.name}</p>
                            <p className="text-sm text-gray-500">{reservation.residents?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{reservation.common_areas?.name}</TableCell>
                        <TableCell>{reservation.condominiums?.name}</TableCell>
                        <TableCell>{formatDate(reservation.reservation_date)}</TableCell>
                        <TableCell>
                          {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={reservation.status}
                            onValueChange={(value) => handleStatusChange(reservation.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <Badge className={getStatusBadge(reservation.status)}>
                                {reservation.status}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pendente">Pendente</SelectItem>
                              <SelectItem value="Confirmada">Confirmada</SelectItem>
                              <SelectItem value="Cancelada">Cancelada</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{formatCurrency(reservation.total_value)}</TableCell>
                        <TableCell className="text-right">
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
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                        <div className="flex flex-col items-center">
                          <MapPin className="h-12 w-12 text-gray-300 mb-4" />
                          <p className="text-lg font-medium">No hay nada registrado aquí.</p>
                          <p className="text-sm">Ainda não há nenhum conteúdo registrado nesta seção.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
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
        onConfirm={handleConfirmDelete}
        reservationCode={selectedReservation?.code}
      />
    </ManagerLayout>
  );
};

export default Reservas;