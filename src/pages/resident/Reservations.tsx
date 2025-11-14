import { useEffect, useMemo, useState } from "react";
import { ResidentLayout } from "@/components/resident/ResidentLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Clock,
  Filter,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  DollarSign,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { showRadixSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ResidentStatCard } from "@/components/resident/ResidentStatCard";
import { NewReservationModal } from "@/components/resident/NewReservationModal";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { DeleteReservationModal } from "@/components/resident/DeleteReservationModal";
import { Badge } from "@/components/ui/badge";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";

type Reservation = {
  id: string;
  code: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_value: number;
  common_areas: { name: string } | null;
};

const Reservations = () => {
  const { user } = useAuth();
  const { isMobile } = useDeviceInfo();
  const { showError, resetErrors } = useErrorHandler();
  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const fetchReservations = async () => {
    if (!user) return;
    setLoading(true);
    
    // Primeiro, buscar o residente associado ao usuário
    const { data: residentData, error: residentError } = await supabase
      .from("residents")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (residentError || !residentData) {
      // Se o usuário não existe na tabela residents, mostrar erro
      showError("Perfil de morador não encontrado. Entre em contato com a administração para cadastrar seu perfil.", "resident_not_found");
      setLoading(false);
      return;
    }

    // Buscar reservas do residente
    const { data, error } = await supabase
      .from("reservas")
      .select("*, common_areas(name)")
      .eq("resident_id", residentData.id)
      .order("reservation_date", { ascending: false });

    if (error) {
      showError("Erro ao buscar reservas: " + error.message, "reservations_fetch_error");
    } else {
      setReservations(data as Reservation[] || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    resetErrors(); // Reset error state when user changes
    fetchReservations();
  }, [user, resetErrors]);

  const stats = useMemo(() => {
    const total = reservations.length;
    const confirmed = reservations.filter(r => r.status === 'Confirmada').length;
    const pending = reservations.filter(r => r.status === 'Pendente').length;
    return { total, confirmed, pending };
  }, [reservations]);

  const filteredReservations = useMemo(() => {
    return reservations.filter(r =>
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.common_areas?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [reservations, searchQuery]);

  const openDeleteModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedReservation) return;
    const { error } = await supabase.from("reservas").delete().eq("id", selectedReservation.id);
    if (error) {
      showError("Erro ao cancelar reserva: " + error.message, "reservation_cancel_error");
    } else {
      showRadixSuccess("Reserva cancelada com sucesso.");
      fetchReservations();
    }
    setIsDeleteModalOpen(false);
  };

  const formatTime = (time: string) => time.substring(0, 5);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Confirmada': return 'default';
      case 'Pendente': return 'secondary';
      case 'Cancelada': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmada': return 'text-green-600 bg-green-50';
      case 'Pendente': return 'text-yellow-600 bg-yellow-50';
      case 'Cancelada': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const MobileReservationCard = ({ reservation }: { reservation: Reservation }) => (
    <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm">
              {reservation.common_areas?.name || 'Área não especificada'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Código: {reservation.code}
            </p>
          </div>
          <Badge variant={getStatusVariant(reservation.status)} className="text-xs">
            {reservation.status}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-purple-500" />
            <span className="text-gray-700">{formatDate(reservation.reservation_date)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-gray-700">
              {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-green-500" />
            <span className="font-medium text-gray-900">
              {formatCurrency(reservation.total_value)}
            </span>
          </div>
        </div>
        
        {reservation.status === 'Pendente' && (
          <div className="flex gap-2 mt-4 pt-3 border-t">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              disabled
            >
              <Pencil className="h-3 w-3 mr-1" />
              Editar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-red-600 hover:text-red-700"
              onClick={() => openDeleteModal(reservation)}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Cancelar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <ResidentLayout>
      <div className="space-y-4 lg:space-y-6">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col gap-3 lg:flex-row lg:justify-between lg:items-center">
          <div className="px-1">
            <h1 className="text-xl lg:text-3xl font-bold text-gray-900">Reservas</h1>
            <p className="text-sm lg:text-base text-muted-foreground">
              Suas reservas de áreas comuns
            </p>
          </div>
          <Button 
            className="bg-purple-600 hover:bg-purple-700 w-full lg:w-auto" 
            onClick={() => setIsNewModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Reserva
          </Button>
        </div>

        {/* Stats - Mobile First Grid */}
        <div className="grid grid-cols-3 gap-2 lg:gap-6 lg:grid-cols-3">
          <ResidentStatCard 
            title="Total" 
            value={stats.total.toString()} 
            icon={Calendar}
            className="text-xs lg:text-sm" 
          />
          <ResidentStatCard 
            title="Confirmadas" 
            value={stats.confirmed.toString()} 
            icon={Clock} 
            iconColorClass="text-green-500"
            className="text-xs lg:text-sm" 
          />
          <ResidentStatCard 
            title="Pendentes" 
            value={stats.pending.toString()} 
            icon={Filter} 
            iconColorClass="text-yellow-500"
            className="text-xs lg:text-sm" 
          />
        </div>

        {/* Search */}
        <div className="px-1 lg:px-0">
          <Input
            placeholder="Buscar por área ou código..."
            className="w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Reservations List - Mobile/Desktop Adaptive */}
        <div className="space-y-1 lg:space-y-0">
          {isMobile ? (
            /* Mobile Card Layout */
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="border-0">
                    <CardContent className="p-4">
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))
              ) : filteredReservations.length > 0 ? (
                filteredReservations.map((reservation) => (
                  <MobileReservationCard 
                    key={reservation.id} 
                    reservation={reservation} 
                  />
                ))
              ) : (
                <Card className="border-0">
                  <CardContent className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma reserva encontrada</p>
                    <Button 
                      className="mt-4 bg-purple-600 hover:bg-purple-700"
                      onClick={() => setIsNewModalOpen(true)}
                    >
                      Fazer primeira reserva
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            /* Desktop Table Layout */
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Lista de Reservas</h2>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-purple-600 hover:bg-purple-600">
                      <TableHead className="text-white">Código</TableHead>
                      <TableHead className="text-white">Área Comum</TableHead>
                      <TableHead className="text-white">Data</TableHead>
                      <TableHead className="text-white">Horário</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-white">Valor</TableHead>
                      <TableHead className="text-white text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={7}>
                            <Skeleton className="h-8 w-full" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredReservations.length > 0 ? (
                      filteredReservations.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.code}</TableCell>
                          <TableCell>{r.common_areas?.name}</TableCell>
                          <TableCell>{formatDate(r.reservation_date)}</TableCell>
                          <TableCell>{`${formatTime(r.start_time)} - ${formatTime(r.end_time)}`}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(r.status)}>{r.status}</Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(r.total_value)}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              disabled={r.status !== 'Pendente'}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              disabled={r.status !== 'Pendente'} 
                              onClick={() => openDeleteModal(r)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                          Nenhuma reserva encontrada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <NewReservationModal 
        isOpen={isNewModalOpen} 
        onClose={() => setIsNewModalOpen(false)} 
        onSuccess={fetchReservations} 
      />
      <DeleteReservationModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleDelete} 
      />
    </ResidentLayout>
  );
};

export default Reservations;
