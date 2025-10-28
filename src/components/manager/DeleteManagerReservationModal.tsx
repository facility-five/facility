import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';

interface Reservation {
  id: string;
  code: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  status: 'Pendente' | 'Confirmada' | 'Cancelada';
  total_value: number;
  observations?: string;
  resident_id: string;
  common_area_id: string;
  common_areas: {
    id: string;
    name: string;
    booking_fee: number;
    condo_id: string;
    condominiums: {
      name: string;
    };
  };
  residents: {
    id: string;
    name: string;
    email: string;
  };
}

interface DeleteManagerReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reservation: Reservation | null;
}

export const DeleteManagerReservationModal = ({
  isOpen,
  onClose,
  onSuccess,
  reservation,
}: DeleteManagerReservationModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!reservation) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from("reservas")
        .delete()
        .eq("id", reservation.id);

      if (error) {
        showError(error.message);
      } else {
        showSuccess("Reserva excluída com sucesso!");
        onSuccess();
        onClose();
      }
    } catch (error) {
      showError("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmada':
        return 'text-green-600 bg-green-100';
      case 'Pendente':
        return 'text-yellow-600 bg-yellow-100';
      case 'Cancelada':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!reservation) return null;

  const reservationDate = parseISO(reservation.reservation_date);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Excluir Reserva
          </DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. A reserva será permanentemente removida do sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-gray-900">
                  {reservation.code}
                </h4>
                <p className="text-sm text-gray-600">
                  {reservation.residents.name}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                {reservation.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Área Comum</p>
                <p className="font-medium">{reservation.common_areas.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Condomínio</p>
                <p className="font-medium">{reservation.common_areas.condominiums.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Data</p>
                <p className="font-medium">
                  {format(reservationDate, "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Horário</p>
                <p className="font-medium">
                  {reservation.start_time} - {reservation.end_time}
                </p>
              </div>
            </div>

            {reservation.total_value > 0 && (
              <div>
                <p className="text-gray-500 text-sm">Valor</p>
                <p className="font-medium">R$ {reservation.total_value.toFixed(2)}</p>
              </div>
            )}

            {reservation.observations && (
              <div>
                <p className="text-gray-500 text-sm">Observações</p>
                <p className="text-sm">{reservation.observations}</p>
              </div>
            )}
          </div>

          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Atenção:</strong> Esta reserva será excluída permanentemente. 
              Certifique-se de que esta é a ação desejada.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleDelete} 
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Excluir Reserva
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};