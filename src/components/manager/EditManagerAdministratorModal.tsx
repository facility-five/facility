import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
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
import { Button } from "@/components/ui/button";
import type { ManagerAdministrator } from "@/contexts/ManagerAdministradorasContext";

const formSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  nif: z.string().optional(),
  email: z.string().email("Email inválido.").optional().or(z.literal("")),
  phone: z.string().optional(),
});

interface EditManagerAdministratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  administrator: ManagerAdministrator | null;
}

export const EditManagerAdministratorModal = ({
  isOpen,
  onClose,
  onSuccess,
  administrator,
}: EditManagerAdministratorModalProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      nif: "",
      email: "",
      phone: "",
    },
  });

  // Atualiza o formulário quando a administradora muda
  useEffect(() => {
    if (administrator) {
      form.reset({
        name: administrator.name || "",
        nif: administrator.nif || "",
        email: administrator.email || "",
        phone: administrator.phone || "",
      });
    }
  }, [administrator, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!administrator?.id) {
      showRadixError("Administradora não encontrada.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showRadixError("Você precisa estar logado para editar uma administradora.");
      return;
    }

    const { error } = await supabase
      .from("administrators")
      .update({
        name: values.name,
        nif: values.nif || null,
        email: values.email || null,
        phone: values.phone || null,
      })
      .eq("id", administrator.id);

    if (error) {
      showRadixError(error.message);
    } else {
      showRadixSuccess("Administradora atualizada com sucesso!");
      onSuccess();
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle>Editar Administradora</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600 -mt-2">
          Atualize os dados da administradora.
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da administradora</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome da administradora" {...field} className="bg-white border-gray-300" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nif"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIF</FormLabel>
                  <FormControl>
                    <Input placeholder="NIF" {...field} className="bg-white border-gray-300" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@exemplo.com" {...field} className="bg-white border-gray-300" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="Telefone" {...field} className="bg-white border-gray-300" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
