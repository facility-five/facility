"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";

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

// Define the full type for the template
export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string | null;
  status: 'active' | 'inactive';
  updated_at: string;
};

const formSchema = z.object({
  name: z.string().min(1, "O nome da plantilla é obrigatório."),
  subject: z.string().min(1, "O assunto é obrigatório."),
  body: z.string().optional(),
  status: z.string().min(1, "O estado é obrigatório."),
});

interface EmailTemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  template?: EmailTemplate | null;
}

export const EmailTemplateFormModal = ({
  isOpen,
  onClose,
  onSuccess,
  template,
}: EmailTemplateFormModalProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (template) {
      form.reset(template);
    } else {
      form.reset({
        name: "",
        subject: "",
        body: "",
        status: "active",
      });
    }
  }, [template, isOpen, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let error;
    if (template) {
      // Update
      const { error: updateError } = await supabase
        .from("email_templates")
        .update(values)
        .eq("id", template.id);
      error = updateError;
    } else {
      // Create
      const { error: insertError } = await supabase
        .from("email_templates")
        .insert([values]);
      error = insertError;
    }

    if (error) {
      showError(error.message);
    } else {
      showSuccess(`Plantilla ${template ? "atualizada" : "criada"} com sucesso!`);
      onSuccess();
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-admin-card border-admin-border text-admin-foreground">
        <DialogHeader>
          <DialogTitle>{template ? "Editar Plantilla de Correo Electrónico" : "Nueva Plantilla de Correo Electrónico"}</DialogTitle>
          <DialogDescription className="text-admin-foreground-muted">
            Edite el contenido de la plantilla de correo electrónico. Use variables como {"{{name}}"} para personalización.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Plantilla</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre de la Plantilla" {...field} className="bg-admin-background border-admin-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asunto</FormLabel>
                  <FormControl>
                    <Input placeholder="Asunto del correo electrónico" {...field} className="bg-admin-background border-admin-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenido</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Contenido del correo electrónico..." {...field} className="bg-admin-background border-admin-border min-h-[150px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-admin-background border-admin-border">
                        <SelectValue placeholder="Seleccione un estado..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-admin-card border-admin-border text-admin-foreground">
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};