"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";

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
import { Administrator } from "./AdministratorCard";

const formSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  nif: z.string().optional(),
  email: z.string().email("Correo electrónico no válido."),
  phone: z.string().optional(),
  responsible_id: z.string().min(1, "Deve selecionar um responsável."),
});

interface EditAdministratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  admin: Administrator | null;
}

type Profile = {
  id: string;
  first_name: string;
  last_name: string;
};

export const EditAdministratorModal = ({
  isOpen,
  onClose,
  onSuccess,
  admin,
}: EditAdministratorModalProps) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      nif: "",
      email: "",
      phone: "",
      responsible_id: "",
    },
  });

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, first_name, last_name");
      setProfiles(data || []);
    };
    if (isOpen) {
      fetchProfiles();
    }
  }, [isOpen]);

  useEffect(() => {
    if (admin && isOpen) {
      const fetchAdminDetails = async () => {
        const { data, error } = await supabase
          .from("administrators")
          .select("name, nif, email, phone, responsible_id")
          .eq("id", admin.id)
          .single();

        if (error) {
          showRadixError("Erro ao buscar detalhes da administradora.");
          onClose();
        } else if (data) {
          form.reset({
            name: data.name,
            nif: data.nif || "",
            email: data.email || "",
            phone: data.phone || "",
            responsible_id: data.responsible_id || "",
          });
        }
      };
      fetchAdminDetails();
    }
  }, [admin, isOpen, form, onClose]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!admin) return;

    const { error } = await supabase
      .from("administrators")
      .update(values)
      .eq("id", admin.id);

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
      <DialogContent className="sm:max-w-[425px] bg-admin-card border-admin-border text-admin-foreground">
        <DialogHeader>
          <DialogTitle>Editar Administradora</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-admin-foreground-muted -mt-2">
          Atualize os dados da administradora.
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la administradora</FormLabel>
                  <FormControl>
                    <Input placeholder="Escriba el nombre de la administradora" {...field} className="bg-admin-background border-admin-border" />
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
                    <Input placeholder="NIF" {...field} className="bg-admin-background border-admin-border" />
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
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input placeholder="Escriba el correo electrónico" {...field} className="bg-admin-background border-admin-border" />
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
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="Escriba el teléfono" {...field} className="bg-admin-background border-admin-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="responsible_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del responsable</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger className="bg-admin-background border-admin-border">
                        <SelectValue placeholder="Seleccione el usuario..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-admin-card border-admin-border text-admin-foreground">
                      {profiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {`${profile.first_name || ''} ${profile.last_name || ''}`.trim()}
                        </SelectItem>
                      ))}
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
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
