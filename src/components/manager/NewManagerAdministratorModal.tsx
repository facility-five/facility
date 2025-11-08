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

const formSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  nif: z.string().optional(),
  email: z.string().email("Email inválido.").optional().or(z.literal("")),
  phone: z.string().optional(),
});

interface NewManagerAdministratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewManagerAdministratorModal = ({
  isOpen,
  onClose,
  onSuccess,
}: NewManagerAdministratorModalProps) => {
  const formatSpanishPhoneInput = (raw: string) => {
    const hasPlus34 = raw.trim().startsWith("+34");
    let digits = raw.replace(/\D/g, "");
    if (hasPlus34 && digits.startsWith("34")) {
      digits = digits.slice(2);
    }
    digits = digits.slice(0, 9);
    const parts: string[] = [];
    if (digits.length > 0) parts.push(digits.slice(0, Math.min(3, digits.length)));
    if (digits.length > 3) parts.push(digits.slice(3, Math.min(5, digits.length)));
    if (digits.length > 5) parts.push(digits.slice(5, Math.min(7, digits.length)));
    if (digits.length > 7) parts.push(digits.slice(7, Math.min(9, digits.length)));
    const formattedCore = parts.join(" ");
    return hasPlus34 ? `+34 ${formattedCore}`.trim() : formattedCore;
  };
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      nif: "",
      email: "",
      phone: "",
    },
  });

  const generateCode = () => `AD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        showRadixError("Você precisa estar logado para criar uma administradora.");
        return;
    }

    const { data: newAdmin, error } = await supabase.from("administrators").insert([
      {
        ...values,
        code: generateCode(),
        user_id: user.id, // Set the current user as owner
        responsible_id: user.id, // Set the current user as responsible
      },
    ]).select().single();

    if (error) {
      showRadixError(error.message);
    } else {
      // Se for a primeira administradora, seleciona automaticamente
      const { count } = await supabase
        .from("administrators")
        .select("*", { count: "exact", head: true })
        .or(`user_id.eq.${user.id},responsible_id.eq.${user.id}`);
      
      if (count === 1 && newAdmin) {
        // É a primeira administradora, seleciona automaticamente
        localStorage.setItem("activeAdministratorId", newAdmin.id);
        await supabase
          .from("profiles")
          .update({ selected_administrator_id: newAdmin.id })
          .eq("id", user.id);
      }
      
      showRadixSuccess("Administradora registrada com sucesso!");
      onSuccess();
      onClose();
      form.reset();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle>Registrar Nova Administradora</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600 -mt-2">
          Complete os dados da administradora. Todos os campos são obrigatórios.
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
                    <Input
                      placeholder="+34 612 34 56 78"
                      inputMode="tel"
                      value={field.value}
                      onChange={(e) => field.onChange(formatSpanishPhoneInput(e.target.value))}
                      className="bg-white border-gray-300"
                    />
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
                Registrar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
