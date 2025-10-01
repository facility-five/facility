"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
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

type CommonArea = { id: string; name: string; condo_id: string; booking_fee: number };

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
      showError("Você precisa estar logado para fazer uma reserva.");
      return;
    }

    const selectedArea = commonAreas.find(area => area.id === values.common_area_id);
    if (!selectedArea) {
      showError("Área comum selecionada não é válida.");
      return;
    }

    const { error } = await supabase.from("reservations").insert([
      {
        ...values,
        user_id: user.id,
        condo_id: selectedArea.condo_id,
        total_value: selectedArea.booking_fee,
        code: generateCode(),
      },
    ]);

    if (error) {
      showError(error.message);
    } else {
      showSuccess("Reserva solicitada com sucesso!");
      onSuccess();
      onClose();
    }
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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