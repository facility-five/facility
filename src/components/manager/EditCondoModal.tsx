"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { Condo } from "@/components/admin/CondoCard"; // Reusing the type from admin

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
  condo_type: z.enum(['residencial', 'comercial', 'mixto']).optional(),
  total_blocks: z.coerce.number().optional(),
  total_units: z.coerce.number().optional(),
  email: z.string().email("E-mail inválido.").optional().or(z.literal('')),
  phone: z.string().optional(),
  observations: z.string().optional(),
  responsible_name: z.string().optional(),
  status: z.string().min(1, "O status é obrigatório."),
});

interface EditCondoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  condo: Condo | null;
  managerAdministratorId: string | null; // Pass the manager's administrator ID
}

type Administrator = {
  id: string;
  name: string;
};

export const EditCondoModal = ({
  isOpen,
  onClose,
  onSuccess,
  condo,
  managerAdministratorId,
}: EditCondoModalProps) => {
  const [administrators, setAdministrators] = useState<Administrator[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const fetchAdministrators = async () => {
      const { data } = await supabase.from("administrators").select("id, name");
      setAdministrators(data || []);
    };
    if (isOpen) {
      fetchAdministrators();
    }
  }, [isOpen]);

  useEffect(() => {
    if (condo && isOpen) {
      form.reset({
        administrator_id: condo.administrator_id || managerAdministratorId || "",
        name: condo.name || "",
        nif: condo.nif || "",
        website: condo.website || "",
        area: condo.area || "",
        condo_type: condo.condo_type || "",
        total_blocks: condo.total_blocks || 0,
        total_units: condo.total_units || 0,
        email: condo.email || "",
        phone: condo.phone || "",
        observations: condo.observations || "",
        responsible_name: condo.responsible_name || "",
        status: condo.status || "active",
      });
    } else if (isOpen) {
      // Reset for new condo if no condo prop is passed, or if it's closed
      form.reset({
        administrator_id: managerAdministratorId || "", // Pre-fill with manager's admin ID
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
        status: "active",
      });
    }
  }, [condo, isOpen, form, managerAdministratorId]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!condo) return; // Should only be called for editing existing condos

    const { error } = await supabase
      .from("condominiums") // Changed from "condos" to "condominiums"
      .update(values)
      .eq("id", condo.id);

    if (error) {
      showRadixError(error.message);
    } else {
      showRadixSuccess("Condomínio atualizado com sucesso!");
      onSuccess();
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-admin-card border-admin-border text-admin-foreground">
        <DialogHeader>
          <DialogTitle>Editar Condomínio</DialogTitle>
          <DialogDescription className="text-admin-foreground-muted">
            Atualize os dados do condomínio.
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
                  <Select onValueChange={field.onChange} value={field.value || ""} disabled={true}> {/* Disable for manager, should be fixed */}
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
                  <FormLabel>Nome</FormLabel>
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
                      <Select onValueChange={field.onChange} value={field.value || "residencial"}>
                        <SelectTrigger className="bg-admin-background border-admin-border">
                          <SelectValue placeholder="Seleccione el tipo" />
                        </SelectTrigger>
                        <SelectContent className="bg-admin-card border-admin-border text-admin-foreground">
                          <SelectItem value="residencial">Residencial</SelectItem>
                          <SelectItem value="comercial">Comercial</SelectItem>
                          <SelectItem value="mixto">Mixto</SelectItem>
                        </SelectContent>
                      </Select>
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
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
