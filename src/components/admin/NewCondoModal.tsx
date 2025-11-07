"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { useManagerAdministradoras } from "@/contexts/ManagerAdministradorasContext";

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
  administrator_id: z.string().min(1, "Selecione a administradora."),
  name: z.string().min(1, "O nome é obrigatório."),
  nif: z.string().optional(),
  website: z.string().optional(),
  area: z.string().optional(),
  condo_type: z.string().optional(),
  total_blocks: z.coerce.number().optional(),
  total_units: z.coerce.number().optional(),
  email: z.string().email("E-mail inválido.").optional().or(z.literal('')),
  phone: z.string().optional(),
  observations: z.string().optional(),
  responsible_name: z.string().optional(),
});

interface NewCondoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialAdministratorId?: string; // New prop for pre-filling
}

type Administrator = {
  id: string;
  name: string;
};

export const NewCondoModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialAdministratorId,
}: NewCondoModalProps) => {
  const { administrators } = useManagerAdministradoras();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      administrator_id: initialAdministratorId || "", // Use initialAdministratorId
      name: "",
      nif: "",
      website: "",
      area: "",
      condo_type: "",
      total_blocks: 0,
      total_units: 0,
      email: "",
      phone: "",
      observations: "",
      responsible_name: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        administrator_id: initialAdministratorId || "", // Reset with initialAdministratorId
        name: "",
        nif: "",
        website: "",
        area: "",
        condo_type: "",
        total_blocks: 0,
        total_units: 0,
        email: "",
        phone: "",
        observations: "",
        responsible_name: "",
      });
    }
  }, [isOpen, initialAdministratorId, form]);

  const generateCode = () => `CO-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { error } = await supabase.from("condominiums").insert([ // Changed from "condos" to "condominiums"
      {
        ...values,
        code: generateCode(),
      },
    ]);

    if (error) {
      showRadixError(error.message);
    } else {
      showRadixSuccess("Condomínio registrado com sucesso!");
      onSuccess();
      onClose();
      form.reset();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-admin-card border-admin-border text-admin-foreground">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Condominio</DialogTitle>
          <DialogDescription className="text-admin-foreground-muted">
            Complete los datos del nuevo condominio.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
            <FormField
              control={form.control}
              name="administrator_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Administradora</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""} disabled={!!initialAdministratorId}> {/* Disable if pre-filled */}
                    <FormControl>
                      <SelectTrigger className="bg-admin-background border-admin-border">
                        <SelectValue placeholder="Seleccione la administradora" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-admin-card border-admin-border text-admin-foreground">
                      {administrators.map((admin) => (
                        <SelectItem key={admin.id} value={admin.id}>
                          {admin.name}
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Escriba el nombre del condominio" {...field} className="bg-admin-background border-admin-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sitio web</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese el sitio web" {...field} className="bg-admin-background border-admin-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese el área" {...field} className="bg-admin-background border-admin-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="condo_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese el tipo de condominio" {...field} className="bg-admin-background border-admin-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="total_blocks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total de Bloques</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ingrese el número total de bloques" {...field} className="bg-admin-background border-admin-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="total_units"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total de Unidades</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ingrese el número total de unidades" {...field} className="bg-admin-background border-admin-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese el correo electrónico" {...field} className="bg-admin-background border-admin-border" />
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
                      <Input placeholder="Ingrese el teléfono" {...field} className="bg-admin-background border-admin-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="responsible_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do responsável" {...field} className="bg-admin-background border-admin-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ingrese las observaciones" {...field} className="bg-admin-background border-admin-border" />
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
