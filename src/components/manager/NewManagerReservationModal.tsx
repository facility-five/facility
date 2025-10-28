import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useManagerAdministrators } from '@/contexts/ManagerAdministratorsContext';
import { showError, showSuccess } from '@/utils/toast';

const formSchema = z.object({
  resident_id: z.string().min(1, "Selecione um residente"),
  common_area_id: z.string().min(1, "Selecione uma área comum"),
  reservation_date: z.date({
    required_error: "Selecione uma data",
  }),
  start_time: z.string().min(1, "Informe o horário de início"),
  end_time: z.string().min(1, "Informe o horário de fim"),
  observations: z.string().optional(),
  status: z.enum(['Pendente', 'Confirmada', 'Cancelada']).default('Pendente'),
});

interface NewManagerReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CommonArea {
  id: string;
  name: string;
  booking_fee: number;
  condo_id: string;
  condominiums: {
    name: string;
  };
}

interface Resident {
  id: string;
  name: string;
  email: string;
  condo_id: string;
  condominiums: {
    name: string;
  };
}

export const NewManagerReservationModal = ({
  isOpen,
  onClose,
  onSuccess,
}: NewManagerReservationModalProps) => {
  const [loading, setLoading] = useState(false);
  const [commonAreas, setCommonAreas] = useState<CommonArea[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selectedArea, setSelectedArea] = useState<CommonArea | null>(null);
  const { selectedAdministratorId } = useManagerAdministrators();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'Pendente',
    },
  });

  useEffect(() => {
    if (isOpen && selectedAdministratorId) {
      fetchCommonAreas();
      fetchResidents();
      form.reset({
        status: 'Pendente',
      });
    }
  }, [isOpen, selectedAdministratorId, form]);

  const fetchCommonAreas = async () => {
    if (!selectedAdministratorId) return;

    const { data, error } = await supabase
      .from("common_areas")
      .select(`
        *,
        condominiums!inner(
          name,
          administrator_id
        )
      `)
      .eq("condominiums.administrator_id", selectedAdministratorId)
      .eq("is_deleted", false)
      .order("name");

    if (error) {
      console.error("Error fetching common areas:", error);
    } else {
      setCommonAreas(data as any[] || []);
    }
  };

  const fetchResidents = async () => {
    if (!selectedAdministratorId) return;

    const { data, error } = await supabase
      .from("residents")
      .select(`
        *,
        condominiums!inner(
          name,
          administrator_id
        )
      `)
      .eq("condominiums.administrator_id", selectedAdministratorId)
      .eq("is_deleted", false)
      .order("name");

    if (error) {
      console.error("Error fetching residents:", error);
    } else {
      setResidents(data as any[] || []);
    }
  };

  const generateCode = () => `RE-${Math.random().toString(36).substr(2, 12).toUpperCase()}`;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!selectedAdministratorId) {
      showError("Selecione uma administradora primeiro.");
      return;
    }

    if (!selectedArea) {
      showError("Selecione uma área comum.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("reservas").insert([
        {
          ...values,
          reservation_date: format(values.reservation_date, 'yyyy-MM-dd'),
          condo_id: selectedArea.condo_id,
          total_value: selectedArea.booking_fee,
          code: generateCode(),
          created_by: (await supabase.auth.getUser()).data.user?.id,
        },
      ]);

      if (error) {
        showError(error.message);
      } else {
        showSuccess("Reserva criada com sucesso!");
        onSuccess();
        onClose();
      }
    } catch (error) {
      showError("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const handleAreaChange = (areaId: string) => {
    const area = commonAreas.find(a => a.id === areaId);
    setSelectedArea(area || null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Reserva</DialogTitle>
          <DialogDescription>
            Crie uma nova reserva para um residente. Preencha todos os campos obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="resident_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Residente *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar residente..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {residents.map((resident) => (
                          <SelectItem key={resident.id} value={resident.id}>
                            <div className="flex flex-col">
                              <span>{resident.name}</span>
                              <span className="text-xs text-gray-500">
                                {resident.condominiums?.name} - {resident.email}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="common_area_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área Comum *</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleAreaChange(value);
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar zona común..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {commonAreas.map((area) => (
                          <SelectItem key={area.id} value={area.id}>
                            <div className="flex flex-col">
                              <span>{area.name}</span>
                              <span className="text-xs text-gray-500">
                                {area.condominiums?.name} - {area.booking_fee > 0 ? `R$ ${area.booking_fee.toFixed(2)}` : 'Gratuito'}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reservation_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de reserva *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de inicio *</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fin de los tiempos *</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendiente</SelectItem>
                      <SelectItem value="Confirmada">Confirmada</SelectItem>
                      <SelectItem value="Cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notas adicionales sobre la reserva..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedArea && selectedArea.booking_fee > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Valor da reserva:</strong> R$ {selectedArea.booking_fee.toFixed(2)}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Reserva
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};