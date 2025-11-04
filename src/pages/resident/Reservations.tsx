import { useEffect, useMemo, useState } from "react";
import { ResidentLayout } from "@/components/resident/ResidentLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    const { error } = await supabase.from("reservations").delete().eq("id", selectedReservation.id);
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

  return (
    <ResidentLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Reservas</h1>
            <p className="text-muted-foreground">Sus reservas de áreas comunes</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setIsNewModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Reserva
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <ResidentStatCard title="Total de Reservas" value={stats.total.toString()} icon={Calendar} />
          <ResidentStatCard title="Confirmadas" value={stats.confirmed.toString()} icon={Clock} iconColorClass="text-green-500" />
          <ResidentStatCard title="Pendientes" value={stats.pending.toString()} icon={Filter} iconColorClass="text-yellow-500" />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4">Lista de Reservas</h2>
          <Input
            placeholder="Buscar por reserva..."
            className="mb-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-purple-600 hover:bg-purple-600">
                  <TableHead className="text-white">Código</TableHead>
                  <TableHead className="text-white">Área Común</TableHead>
                  <TableHead className="text-white">Fecha</TableHead>
                  <TableHead className="text-white">Horario</TableHead>
                  <TableHead className="text-white">Estado</TableHead>
                  <TableHead className="text-white">Valor</TableHead>
                  <TableHead className="text-white text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                  ))
                ) : filteredReservations.length > 0 ? (
                  filteredReservations.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.code}</TableCell>
                      <TableCell>{r.common_areas?.name}</TableCell>
                      <TableCell>{formatDate(r.reservation_date)}</TableCell>
                      <TableCell>{`${formatTime(r.start_time)} - ${formatTime(r.end_time)}`}</TableCell>
                      <TableCell><Badge variant={getStatusVariant(r.status)}>{r.status}</Badge></TableCell>
                      <TableCell>{formatCurrency(r.total_value)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" disabled={r.status !== 'Pendente'}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" disabled={r.status !== 'Pendente'} onClick={() => openDeleteModal(r)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={7} className="text-center text-gray-500 py-8">Nenhuma reserva encontrada.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <NewReservationModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} onSuccess={fetchReservations} />
      <DeleteReservationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDelete} />
    </ResidentLayout>
  );
};

export default Reservations;