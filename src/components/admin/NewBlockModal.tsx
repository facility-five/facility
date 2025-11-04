"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { Block } from "@/pages/admin/Blocks";

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
  name: z.string().min(1, "El nombre es obligatorio."),
  condo_id: z.string().min(1, "Debe seleccionar un condominio."),
  responsible_id: z.string().min(1, "Debe seleccionar un responsable."),
  status: z.string().min(1, "El estado es obligatorio."),
});

interface NewBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  block?: Block | null;
}

type Condo = { id: string; name: string; };
type Profile = { id: string; first_name: string; last_name: string; };

export const NewBlockModal = ({
  isOpen,
  onClose,
  onSuccess,
  block,
}: NewBlockModalProps) => {
  const [condos, setCondos] = useState<Condo[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: condosData } = await supabase.from("condominiums").select("id, name"); // Changed from "condos" to "condominiums"
      setCondos(condosData || []);
      const { data: profilesData } = await supabase.from("profiles").select("id, first_name, last_name");
      setProfiles(profilesData || []);
    };
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (block) {
      form.reset(block);
    } else {
      form.reset({
        name: "",
        condo_id: "",
        responsible_id: "",
        status: "active",
      });
    }
  }, [block, isOpen, form]);

  const generateCode = () => `BL-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let error;
    if (block) {
      const { error: updateError } = await supabase
        .from("blocks")
        .update(values)
        .eq("id", block.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("blocks")
        .insert([{ ...values, code: generateCode() }]);
      error = insertError;
    }

    if (error) {
      showRadixError(error.message);
    } else {
      showRadixSuccess(`Bloque ${block ? "actualizado" : "registrado"} com sucesso!`);
      onSuccess();
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-admin-card border-admin-border text-admin-foreground">
        <DialogHeader>
          <DialogTitle>{block ? "Editar Bloque" : "Nuevo Bloque"}</DialogTitle>
          <DialogDescription className="text-admin-foreground-muted">
            Complete la información del bloque.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Bloque</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Bloque A" {...field} className="bg-admin-background border-admin-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="condo_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condominio</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                    <FormControl>
                      <SelectTrigger className="bg-admin-background border-admin-border">
                        <SelectValue placeholder="Seleccione un condominio..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-admin-card border-admin-border text-admin-foreground">
                      {condos.map((condo) => (
                        <SelectItem key={condo.id} value={condo.id}>
                          {condo.name}
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
              name="responsible_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                    <FormControl>
                      <SelectTrigger className="bg-admin-background border-admin-border">
                        <SelectValue placeholder="Seleccione un responsable..." />
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
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                    <FormControl>
                      <SelectTrigger className="bg-admin-background border-admin-border">
                        <SelectValue placeholder="Seleccione el estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-admin-card border-admin-border text-admin-foreground">
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Eliminado</SelectItem>
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
                {block ? "Salvar" : "Registrar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
