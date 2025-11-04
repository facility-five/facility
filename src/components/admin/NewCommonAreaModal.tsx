"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { CommonArea } from "@/pages/admin/CommonAreas";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  condo_id: z.string().min(1, "O condomínio é obrigatório."),
  description: z.string().optional(),
  capacity: z.coerce.number().optional(),
  booking_fee: z.coerce.number().optional(),
  opening_time: z.string().optional(),
  closing_time: z.string().optional(),
  requires_approval: z.boolean().default(false),
  is_deleted: z.boolean().default(false),
});

interface NewCommonAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  commonArea?: CommonArea | null;
}

type Condo = { id: string; name: string; };

export const NewCommonAreaModal = ({
  isOpen,
  onClose,
  onSuccess,
  commonArea,
}: NewCommonAreaModalProps) => {
  const [condos, setCondos] = useState<Condo[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requires_approval: false,
      is_deleted: false,
    }
  });

  useEffect(() => {
    const fetchCondos = async () => {
      const { data } = await supabase.from("condominiums").select("id, name"); // Changed from "condos" to "condominiums"
      setCondos(data || []);
    };
    if (isOpen) {
      fetchCondos();
    }
  }, [isOpen]);

  useEffect(() => {
    if (commonArea) {
      form.reset(commonArea);
    } else {
      form.reset({
        name: "",
        condo_id: "",
        description: "",
        capacity: undefined,
        booking_fee: undefined,
        opening_time: "",
        closing_time: "",
        requires_approval: false,
        is_deleted: false,
      });
    }
  }, [commonArea, isOpen, form]);

  const generateCode = () => `AC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let error;
    if (commonArea) {
      const { error: updateError } = await supabase
        .from("common_areas")
        .update(values)
        .eq("id", commonArea.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("common_areas")
        .insert([{ ...values, code: generateCode() }]);
      error = insertError;
    }

    if (error) {
      showRadixError(error.message);
    } else {
      showRadixSuccess(`Área comum ${commonArea ? "atualizada" : "registrada"} com sucesso!`);
      onSuccess();
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-admin-card border-admin-border text-admin-foreground">
        <DialogHeader>
          <DialogTitle>{commonArea ? "Editar Área Comum" : "Nova Área Comum"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} className="bg-admin-background border-admin-border" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="condo_id" render={({ field }) => (
                <FormItem><FormLabel>Condominio</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value || ""}><FormControl><SelectTrigger className="bg-admin-background border-admin-border"><SelectValue placeholder="Seleccione el condominio..." /></SelectTrigger></FormControl><SelectContent className="bg-admin-card border-admin-border text-admin-foreground">{condos.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} className="bg-admin-background border-admin-border" /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="capacity" render={({ field }) => (
                <FormItem><FormLabel>Capacidad</FormLabel><FormControl><Input type="number" {...field} className="bg-admin-background border-admin-border" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="booking_fee" render={({ field }) => (
                <FormItem><FormLabel>Taxa de Reserva</FormLabel><FormControl><Input type="number" {...field} className="bg-admin-background border-admin-border" /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="opening_time" render={({ field }) => (
                <FormItem><FormLabel>Horario de Apertura</FormLabel><FormControl><Input type="time" {...field} className="bg-admin-background border-admin-border" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="closing_time" render={({ field }) => (
                <FormItem><FormLabel>Horario de Cierre</FormLabel><FormControl><Input type="time" {...field} className="bg-admin-background border-admin-border" /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="flex items-center space-x-4">
              <FormField control={form.control} name="requires_approval" render={({ field }) => (
                <FormItem className="flex items-center space-x-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Requiere aprobación para la reserva</FormLabel></FormItem>
              )} />
              <FormField control={form.control} name="is_deleted" render={({ field }) => (
                <FormItem className="flex items-center space-x-2"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Eliminado</FormLabel></FormItem>
              )} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                {commonArea ? "Salvar" : "Registrar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
