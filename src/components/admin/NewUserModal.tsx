"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { SystemUser } from "@/pages/admin/Users";

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

const formSchema = z.object({
  first_name: z.string().min(1, "O nome é obrigatório."),
  last_name: z.string().min(1, "O apelido é obrigatório."),
  email: z.string().email("E-mail inválido."),
  whatsapp: z.string().optional(),
  role: z.string().min(1, "O tipo de usuário é obrigatório."),
  status: z.string().min(1, "O estado é obrigatório."),
});

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: SystemUser | null;
}

export const NewUserModal = ({
  isOpen,
  onClose,
  onSuccess,
  user,
}: NewUserModalProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (user) {
      form.reset(user);
    } else {
      form.reset({
        first_name: "",
        last_name: "",
        email: "",
        whatsapp: "",
        role: "Usuário",
        status: "Ativo",
      });
    }
  }, [user, isOpen, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (user) {
      // Update user
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          whatsapp: values.whatsapp,
          role: values.role,
          status: values.status,
        })
        .eq('id', user.id);
      
      if (error) {
        showError(`Erro ao atualizar usuário: ${error.message}`);
      } else {
        showSuccess("Usuário atualizado com sucesso!");
        onSuccess();
        onClose();
      }
    } else {
      // Invite new user
      const { error } = await supabase.functions.invoke('invite-user', {
        body: {
          email: values.email,
          data: {
            first_name: values.first_name,
            last_name: values.last_name,
            whatsapp: values.whatsapp,
            role: values.role,
            status: values.status,
          }
        }
      });

      if (error) {
        showError(`Erro ao convidar usuário: ${error.message}`);
      } else {
        showSuccess("Convite enviado com sucesso!");
        onSuccess();
        onClose();
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-admin-card border-admin-border text-admin-foreground">
        <DialogHeader>
          <DialogTitle>{user ? "Editar Usuário" : "Adicionar Usuário"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="first_name" render={({ field }) => (
                <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="Escriba el nombre" {...field} className="bg-admin-background border-admin-border" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="last_name" render={({ field }) => (
                <FormItem><FormLabel>Apellido</FormLabel><FormControl><Input placeholder="Escriba el apellido" {...field} className="bg-admin-background border-admin-border" /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Correo electrónico</FormLabel><FormControl><Input placeholder="Escriba el correo" {...field} disabled={!!user} className="bg-admin-background border-admin-border" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="whatsapp" render={({ field }) => (
                <FormItem><FormLabel>WhatsApp</FormLabel><FormControl><Input placeholder="Escriba el número" {...field} className="bg-admin-background border-admin-border" /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem><FormLabel>Tipo de usuario</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="bg-admin-background border-admin-border"><SelectValue /></SelectTrigger></FormControl><SelectContent className="bg-admin-card border-admin-border text-admin-foreground"><SelectItem value="Administrador">Administrador</SelectItem><SelectItem value="Gestor">Gestor</SelectItem><SelectItem value="Usuário">Usuário</SelectItem></SelectContent></Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem><FormLabel>Estado</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="bg-admin-background border-admin-border"><SelectValue /></SelectTrigger></FormControl><SelectContent className="bg-admin-card border-admin-border text-admin-foreground"><SelectItem value="Ativo">Activo</SelectItem><SelectItem value="Inativo">Inactivo</SelectItem><SelectItem value="Suspenso">Suspendido</SelectItem></SelectContent></Select><FormMessage /></FormItem>
              )} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">{user ? "Salvar" : "Registrar"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};