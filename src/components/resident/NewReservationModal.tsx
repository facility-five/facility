"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { NotificationService } from "@/utils/notificationService";
import { useAuth } from "@/contexts/AuthContext";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  common_area_id: z.string().min(1, "Selecione a área comum."),
  reservation_date: z.string().min(1, "A data é obrigatória."),
  start_time: z.string().min(1, "A hora de início é obrigatória."),
  end_time: z.string().min(1, "A hora de fim é obrigatória."),
});

interface NewReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type CommonArea = { id: string; name: string; condo_id?: string; booking_fee?: number };

export const NewReservationModal = ({
  isOpen,
  onClose,
  onSuccess,
}: NewReservationModalProps) => {
  const { user } = useAuth();
  const [commonAreas, setCommonAreas] = useState<CommonArea[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const fetchCommonAreas = async () => {
      const { data } = await supabase.from("common_areas").select("*");
      setCommonAreas(data || []);
    };
    if (isOpen) {
      fetchCommonAreas();
      form.reset();
    }
  }, [isOpen, form]);

  const generateCode = () => `RE-${Math.random().toString(36).substr(2, 12).toUpperCase()}`;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      showRadixError("Você precisa estar logado para fazer uma reserva.");
      return;
    }

    const selectedArea = commonAreas.find(area => area.id === values.common_area_id);
    if (!selectedArea) {
      showRadixError("Área comum selecionada não é válida.");
      return;
    }

    // Obter o morador (id) a partir do usuário autenticado
    const { data: resident, error: residentError } = await supabase
      .from("residents")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (residentError || !resident) {
      showRadixError("Perfil de morador não encontrado. Contate a administração.");
      return;
    }

    // Calcular valor com base na taxa/booking_fee, quando disponível
    const [sh, sm] = values.start_time.split(":").map(Number);
    const [eh, em] = values.end_time.split(":").map(Number);
    const hours = Math.max(0, (eh + em / 60) - (sh + sm / 60));
    const total_value = (selectedArea.booking_fee || 0) * hours;

    const { data: fnResp, error: fnError } = await supabase.functions.invoke('create-resident-reservation', {
      body: {
        common_area_id: values.common_area_id,
        reservation_date: values.reservation_date,
        start_time: values.start_time,
        end_time: values.end_time,
      }
    });

    if (fnError) {
      showRadixError(fnError.message);
      return;
    }

    const reservationId = (fnResp as any)?.id as string | undefined;

    // Notificar administradora responsável pelo condomínio da área comum
    if (selectedArea.condo_id) {
      const { data: condoAdmin } = await supabase
        .from("condominiums")
        .select("id, administrator_id, administrators(user_id,responsible_id)")
        .eq("id", selectedArea.condo_id)
        .single();

      const adminUserIds: string[] = [];
      const adminRel: any = condoAdmin?.administrators || null;
      if (adminRel?.user_id) adminUserIds.push(adminRel.user_id);
      if (adminRel?.responsible_id) adminUserIds.push(adminRel.responsible_id);

      if (adminUserIds.length === 0 && condoAdmin?.administrator_id) {
        const { data: adminRow } = await supabase
          .from("administrators")
          .select("user_id,responsible_id")
          .eq("id", condoAdmin.administrator_id)
          .single();
        if (adminRow?.user_id) adminUserIds.push(adminRow.user_id);
        if (adminRow?.responsible_id) adminUserIds.push(adminRow.responsible_id);
      }

      if (adminUserIds.length > 0) {
        await Promise.all(
          adminUserIds.map((uid) =>
            NotificationService.createNotification({
              user_id: uid,
              title: "Nueva reserva solicitada",
              message: "Un residente ha solicitado una reserva. Revise y apruebe si corresponde.",
              type: "reservation",
              entity_type: "reservas",
              entity_id: reservationId,
            })
          )
        );
      }
    }

    showRadixSuccess("Reserva solicitada com sucesso!");
    onSuccess();
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Reserva</DialogTitle>
          <DialogDescription>
            Selecione a área comum e a data para sua reserva.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="common_area_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área Comum</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione uma área..." /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {commonAreas.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.name}
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
              name="reservation_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data da Reserva</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Início</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
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
                    <FormLabel>Hora de Fim</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                Solicitar Reserva
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
