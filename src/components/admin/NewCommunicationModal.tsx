"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { NotificationService } from "@/utils/notificationService";
import { Communication } from "@/pages/admin/Communications";

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
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  title: z.string().min(1, "O título é obrigatório."),
  content: z.string().optional(),
  expiration_date: z.string().optional(),
  condo_id: z.string().min(1, "O condomínio é obrigatório."),
});

interface NewCommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  communication?: Communication | null;
}

type Condo = { id: string; name: string; };

export const NewCommunicationModal = ({
  isOpen,
  onClose,
  onSuccess,
  communication,
}: NewCommunicationModalProps) => {
  const [condos, setCondos] = useState<Condo[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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
    if (communication) {
      form.reset({
        ...communication,
        expiration_date: communication.expiration_date ? communication.expiration_date.split('T')[0] : '',
      });
    } else {
      form.reset({
        title: "",
        content: "",
        expiration_date: "",
        condo_id: "",
      });
    }
  }, [communication, isOpen, form]);

  const generateCode = () => `CO-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        showRadixError("Você precisa estar logado.");
        return;
    }

    const submissionData = {
      ...values,
      expiration_date: values.expiration_date || null,
      created_by: user.id, // Changed from user_id to created_by
    };

    let error;
    if (communication) {
      const { error: updateError } = await supabase
        .from("communications")
        .update(submissionData)
        .eq("id", communication.id);
      error = updateError;
    } else {
      const { data: created, error: insertError } = await supabase
        .from("communications")
        .insert([{ ...submissionData, code: generateCode() }])
        .select("id, condo_id");
      error = insertError;

      if (!insertError && created && created[0]?.condo_id) {
        await NotificationService.notifyCondominiumResidents(
          created[0].condo_id,
          "Nuevo comunicado",
          submissionData.title,
          "communication",
          "communications",
          created[0].id
        );
      }
    }

    if (error) {
      showRadixError(error.message);
    } else {
      showRadixSuccess(`Comunicado ${communication ? "atualizado" : "registrado"} com sucesso!`);
      onSuccess();
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-admin-card border-admin-border text-admin-foreground">
        <DialogHeader>
          <DialogTitle>Comunicado</DialogTitle>
          <DialogDescription>Complete los datos del comunicado.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Título</FormLabel><FormControl><Input placeholder="Ex: Manutenção da Piscina" {...field} className="bg-admin-background border-admin-border" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="content" render={({ field }) => (
              <FormItem><FormLabel>Conteúdo</FormLabel><FormControl><Textarea placeholder="Descreva o comunicado em detalhes." {...field} className="bg-admin-background border-admin-border" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="expiration_date" render={({ field }) => (
              <FormItem><FormLabel>Data de Expiração</FormLabel><FormControl><Input type="date" {...field} className="bg-admin-background border-admin-border" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="condo_id" render={({ field }) => (
              <FormItem><FormLabel>Condomínio</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value || ""}><FormControl><SelectTrigger className="bg-admin-background border-admin-border"><SelectValue placeholder="Selecione o condomínio..." /></SelectTrigger></FormControl><SelectContent className="bg-admin-card border-admin-border text-admin-foreground">{condos.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
            )} />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                {communication ? "Salvar" : "Registrar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
