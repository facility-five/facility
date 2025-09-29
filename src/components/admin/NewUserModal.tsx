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

const baseSchema = z.object({
  first_name: z.string().min(1, "O nome é obrigatório."),
  last_name: z.string().min(1, "O apelido é obrigatório."),
  email: z.string().email("E-mail inválido."),
  whatsapp: z.string().optional(),
  role: z.string().min(1, "O tipo de usuário é obrigatório."),
  status: z.string().min(1, "O estado é obrigatório."),
  password: z.string().optional(), // exigido somente na criação
});

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: SystemUser | null;
}

// Máscara simples BR: (99) 99999-9999 (adapta para 8 ou 9 dígitos no final)
function formatWhatsapp(input: string): string {
  const digits = (input || "").replace(/\D/g, "").slice(0, 11);
  const len = digits.length;

  if (len <= 2) return digits;
  if (len <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (len <= 10) {
    // formato 8 dígitos no fim: (99) 9999-9999
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  // formato 9 dígitos no fim: (99) 99999-9999
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export const NewUserModal = ({
  isOpen,
  onClose,
  onSuccess,
  user,
}: NewUserModalProps) => {
  const form = useForm<z.infer<typeof baseSchema>>({
    resolver: zodResolver(baseSchema),
  });

  useEffect(() => {
    if (user) {
      form.reset({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        whatsapp: user.whatsapp ? formatWhatsapp(user.whatsapp) : "",
        role: user.role || "Usuário",
        status: user.status || "Ativo",
        password: "",
      });
    } else {
      form.reset({
        first_name: "",
        last_name: "",
        email: "",
        whatsapp: "",
        role: "Usuário",
        status: "Ativo",
        password: "",
      });
    }
  }, [user, isOpen, form]);

  async function onSubmit(values: z.infer<typeof baseSchema>) {
    if (user) {
      // Atualização via edge (bypass RLS)
      const { error } = await supabase.functions.invoke("admin-update-user", {
        body: {
          id: user.id,
          first_name: values.first_name,
          last_name: values.last_name,
          whatsapp: values.whatsapp ?? "",
          role: values.role,
          status: values.status,
          // email desabilitado em edição para simplificar
        },
      });

      if (error) {
        showError(`Erro ao atualizar usuário: ${error.message}`);
      } else {
        showSuccess("Usuário atualizado com sucesso!");
        onSuccess();
        onClose();
      }
    } else {
      // Criação exige senha
      if (!values.password || values.password.length < 6) {
        showError("Defina uma senha com pelo menos 6 caracteres.");
        return;
      }

      const { error } = await supabase.functions.invoke("create-user-with-password", {
        body: {
          email: values.email,
          password: values.password,
          email_confirm: true,
          data: {
            first_name: values.first_name,
            last_name: values.last_name,
            whatsapp: values.whatsapp ?? "",
            role: values.role,
            status: values.status,
          },
        },
      });

      if (error) {
        showError(`Erro ao criar usuário: ${error.message}`);
      } else {
        showSuccess("Usuário criado com sucesso!");
        onSuccess();
        onClose();
      }
    }
  }

  const isEditing = !!user;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-admin-card border-admin-border text-admin-foreground">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Usuário" : "Adicionar Usuário"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="first_name" render={({ field }) => (
                <FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Escreva o nome" {...field} className="bg-admin-background border-admin-border" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="last_name" render={({ field }) => (
                <FormItem><FormLabel>Sobrenome</FormLabel><FormControl><Input placeholder="Escreva o sobrenome" {...field} className="bg-admin-background border-admin-border" /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>E-mail</FormLabel><FormControl><Input placeholder="email@exemplo.com" {...field} disabled={isEditing} className="bg-admin-background border-admin-border" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="whatsapp" render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="tel"
                      maxLength={15}
                      placeholder="(99) 99999-9999"
                      {...field}
                      onChange={(e) => field.onChange(formatWhatsapp(e.target.value))}
                      className="bg-admin-background border-admin-border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            {!isEditing && (
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem><FormLabel>Senha</FormLabel><FormControl><Input type="password" placeholder="Mínimo 6 caracteres" {...field} className="bg-admin-background border-admin-border" /></FormControl><FormMessage /></FormItem>
              )} />
            )}
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem><FormLabel>Tipo de usuário</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="bg-admin-background border-admin-border"><SelectValue /></SelectTrigger></FormControl><SelectContent className="bg-admin-card border-admin-border text-admin-foreground"><SelectItem value="Administrador">Administrador</SelectItem><SelectItem value="Gestor">Gestor</SelectItem><SelectItem value="Usuário">Usuário</SelectItem></SelectContent></Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="bg-admin-background border-admin-border"><SelectValue /></SelectTrigger></FormControl><SelectContent className="bg-admin-card border-admin-border text-admin-foreground"><SelectItem value="Ativo">Ativo</SelectItem><SelectItem value="Inativo">Inativo</SelectItem><SelectItem value="Suspenso">Suspenso</SelectItem></SelectContent></Select><FormMessage /></FormItem>
              )} />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">{isEditing ? "Salvar" : "Registrar"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};