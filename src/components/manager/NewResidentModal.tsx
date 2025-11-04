"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { showRadixSuccess } from "@/utils/toast";
import { useErrorHandler } from "@/hooks/useErrorHandler";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const residentSchema = z.object({
  full_name: z.string().min(1, "El nombre es obligatorio."),
  email: z.string().email("Correo invalido.").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  document: z.string().optional().or(z.literal("")),
  birth_date: z.string().optional().or(z.literal("")),
  entry_date: z.string().optional().or(z.literal("")),
  exit_date: z.string().optional().or(z.literal("")),
  is_owner: z.boolean(),
  is_tenant: z.boolean(),
  status: z.enum(["active", "inactive"]),
  condo_id: z.string().min(1, "Seleccione el condominio."),
  block_id: z.string().optional().or(z.literal("")),
  unit_id: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  create_user_account: z.boolean().optional(),
});

type ResidentFormValues = z.infer<typeof residentSchema>;

type SelectOption = { id: string; name: string; condo_id?: string | null; };

type UnitOption = {
  id: string;
  label: string;
  block_id: string;
};

export type ResidentForEdit = {
  id: string;
  code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  document: string | null;
  birth_date: string | null;
  entry_date: string | null;
  exit_date: string | null;
  is_owner: boolean;
  is_tenant: boolean;
  status: string;
  condo_id: string;
  block_id: string | null;
  unit_id: string | null;
  notes: string | null;
};

interface NewResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  resident?: ResidentForEdit | null;
  condos: SelectOption[];
  blocks: SelectOption[];
  units: UnitOption[];
  defaultCondoId: string | null;
}

const generateResidentCode = () =>
  `RE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export const NewResidentModal = ({
  isOpen,
  onClose,
  onSuccess,
  resident,
  condos,
  blocks,
  units,
  defaultCondoId,
}: NewResidentModalProps) => {
  const [activeTab, setActiveTab] = useState("personal");
  const { showError } = useErrorHandler();

  const form = useForm<ResidentFormValues>({
    resolver: zodResolver(residentSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      document: "",
      birth_date: "",
      entry_date: "",
      exit_date: "",
      is_owner: true,
      is_tenant: false,
      status: "active",
      condo_id: defaultCondoId ?? "",
      block_id: "",
      unit_id: "",
      notes: "",
      create_user_account: false,
    },
  });

  const isEditing = Boolean(resident);
  const watchHasParking = form.watch("has_parking");

  useEffect(() => {
    if (!watchHasParking) {
      form.setValue("parking_spaces", "");
    }
  }, [watchHasParking, form]);

  const watchedCondoId = form.watch("condo_id");
  const watchedBlockId = form.watch("block_id");

  const filteredBlocks = useMemo(() => {
    if (!watchedCondoId) return [] as SelectOption[];
    const supportsCondo = blocks.some((block) => block.condo_id);
    if (!supportsCondo) {
      return blocks;
    }
    return blocks.filter((block) => block.condo_id === watchedCondoId);
  }, [blocks, watchedCondoId]);

  const filteredUnits = useMemo(() => {
    if (!watchedBlockId) {
      return units;
    }
    return units.filter((unit) => unit.block_id === watchedBlockId);
  }, [units, watchedBlockId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setActiveTab("personal");

    form.reset({
      full_name: resident?.full_name ?? "",
      email: resident?.email ?? "",
      phone: resident?.phone ?? "",
      document: resident?.document ?? "",
      birth_date: resident?.birth_date ?? "",
      entry_date: resident?.entry_date ?? "",
      exit_date: resident?.exit_date ?? "",
      is_owner: resident?.is_owner ?? true,
      is_tenant: resident?.is_tenant ?? false,
      status: (resident?.status as "active" | "inactive") ?? "active",
      condo_id: resident?.condo_id ?? defaultCondoId ?? "",
      block_id: resident?.block_id ?? "",
      unit_id: resident?.unit_id ?? "",
      notes: resident?.notes ?? "",
    });
  }, [isOpen, resident, defaultCondoId, form]);

  useEffect(() => {
    if (!isOpen) return;
    const currentBlock = form.getValues("block_id");
    if (currentBlock && !filteredBlocks.some((block) => block.id === currentBlock)) {
      form.setValue("block_id", "");
      form.setValue("unit_id", "");
    }
  }, [filteredBlocks, form, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const currentUnit = form.getValues("unit_id");
    if (currentUnit && !filteredUnits.some((unit) => unit.id === currentUnit)) {
      form.setValue("unit_id", "");
    }
  }, [filteredUnits, form, isOpen]);

  const handleClose = () => {
    onClose();
    form.reset();
  };

  const onSubmit = async (values: ResidentFormValues) => {
    const payload = {
      full_name: values.full_name.trim(),
      email: values.email?.trim() || null,
      phone: values.phone?.trim() || null,
      document: values.document?.trim() || null,
      birth_date: values.birth_date ? values.birth_date : null,
      entry_date: values.entry_date ? values.entry_date : null,
      exit_date: values.exit_date ? values.exit_date : null,
      is_owner: values.is_owner,
      is_tenant: values.is_tenant,
      status: values.status,
      condo_id: values.condo_id,
      block_id: values.block_id || null,
      unit_id: values.unit_id || null,
      notes: values.notes?.trim() || null,
    };

    const requestPayload = {
      ...payload,
      code: resident?.code ?? generateResidentCode(),
    };

    let error;
    let insertedResident = null;

    if (isEditing && resident) {
      const { error: updateError } = await supabase
        .from("residents")
        .update(requestPayload)
        .eq("id", resident.id);
      error = updateError;
    } else {
      const { data, error: insertError } = await supabase
        .from("residents")
        .insert([requestPayload])
        .select()
        .single();
      error = insertError;
      insertedResident = data;
    }

    if (error) {
      showError(error.message || "No fue posible guardar el residente.", "resident_save_error");
      return;
    }

    // Se for um novo residente e tiver email, criar conta de usuário automaticamente
    if (!isEditing && values.email && values.email.trim() !== "" && insertedResident) {
      try {
        // Buscar dados do condomínio
        const { data: condoData } = await supabase
          .from("condos")
          .select("name")
          .eq("id", values.condo_id)
          .single();

        // Chamar a Edge Function para criar conta de usuário
        const nameParts = values.full_name.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const { data: userResponse, error: userError } = await supabase.functions.invoke(
          'create-resident-user',
          {
            body: {
              email: values.email,
              firstName: firstName,
              lastName: lastName,
              condoName: condoData?.name || 'Condomínio'
            }
          }
        );

        if (userError) {
          console.error('Erro ao criar conta de usuário:', userError);
          showError('Residente cadastrado, mas houve erro ao criar conta de usuário.', "user_creation_error");
        } else if (userResponse?.user?.id) {
          // Atualizar o residente com o profile_id do usuário criado
          const { error: updateError } = await supabase
            .from("residents")
            .update({ profile_id: userResponse.user.id })
            .eq("id", insertedResident.id);

          if (updateError) {
            console.error('Erro ao vincular usuário ao residente:', updateError);
            showError('Usuário criado, mas houve erro ao vincular ao residente.', "user_link_error");
          } else {
            showRadixSuccess(`Residente registrado com sucesso! Email de boas-vindas enviado para ${values.email}.`);
          }
        }
      } catch (err) {
        console.error('Erro ao processar criação de conta:', err);
        showError('Residente cadastrado, mas houve erro ao criar conta de usuário.', "account_processing_error");
      }
    } else {
      showRadixSuccess(`Residente ${isEditing ? "actualizado" : "registrado"} con exito.`);
    }

    onSuccess();
    handleClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const currentBlock = form.getValues("block_id");
    if (currentBlock && !filteredBlocks.some((block) => block.id === currentBlock)) {
      form.setValue("block_id", "");
      form.setValue("unit_id", "");
    }
  }, [filteredBlocks, form, isOpen]);
  useEffect(() => {
    if (!isOpen) return;
    const currentUnit = form.getValues("unit_id");
    if (currentUnit && !filteredUnits.some((unit) => unit.id === currentUnit)) {
      form.setValue("unit_id", "");
    }
  }, [filteredUnits, form, isOpen]);
  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? handleClose() : undefined)}>
      <DialogContent className="sm:max-w-[720px] bg-admin-card border-admin-border text-admin-foreground max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Residente" : "Agregar Residente"}</DialogTitle>
          <DialogDescription className="text-admin-foreground-muted">
            Complete los datos del residente. Estos datos se utilizaran para el acceso del morador.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 bg-admin-background">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="location">Ubicacion</TabsTrigger>
            <TabsTrigger value="pets" disabled>Mascotas</TabsTrigger>
            <TabsTrigger value="vehicles" disabled>Vehiculos</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <TabsContent value="personal" className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Nombre completo</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nombre del residente"
                            {...field}
                            className="bg-admin-background border-admin-border"
                          />
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
                        <FormLabel>Correo electronico</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="correo@ejemplo.com"
                            {...field}
                            className="bg-admin-background border-admin-border"
                          />
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
                        <FormLabel>Telefono</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Telefono"
                            {...field}
                            className="bg-admin-background border-admin-border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="document"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Documento</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Documento"
                            {...field}
                            className="bg-admin-background border-admin-border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birth_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de nacimiento</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="bg-admin-background border-admin-border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="entry_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de entrada</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="bg-admin-background border-admin-border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="exit_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de salida</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="bg-admin-background border-admin-border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="is_owner"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-md border border-admin-border bg-admin-background px-3 py-2">
                        <FormLabel className="text-sm font-medium">Propietario</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="is_tenant"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-md border border-admin-border bg-admin-background px-3 py-2">
                        <FormLabel className="text-sm font-medium">Inquilino</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="bg-admin-background border-admin-border">
                              <SelectValue placeholder="Seleccione el estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Activo</SelectItem>
                            <SelectItem value="inactive">Inactivo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Observaciones adicionales"
                          {...field}
                          className="bg-admin-background border-admin-border"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isEditing && (
                  <div className="rounded-md border border-admin-border bg-admin-background px-3 py-2">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">Criação automática de usuário</div>
                      <p className="text-xs text-muted-foreground">
                        Se um email for fornecido, uma conta de usuário será criada automaticamente e um email de boas-vindas será enviado com senha temporária.
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="location" className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="condo_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condominio</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="bg-admin-background border-admin-border">
                              <SelectValue placeholder="Seleccione el condominio" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {condos.length === 0 ? (
                              <SelectItem value="" disabled>
                                Ningun condominio disponible
                              </SelectItem>
                            ) : (
                              condos.map((condo) => (
                                <SelectItem key={condo.id} value={condo.id}>
                                  {condo.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="block_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bloque</FormLabel>
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                          disabled={!watchedCondoId || filteredBlocks.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-admin-background border-admin-border">
                              <SelectValue placeholder="Seleccione el bloque" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredBlocks.length === 0 ? (
                              <SelectItem value="" disabled>
                                Ningun bloque disponible
                              </SelectItem>
                            ) : (
                              filteredBlocks.map((block) => (
                                <SelectItem key={block.id} value={block.id}>
                                  {block.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="unit_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidad</FormLabel>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={!watchedBlockId || filteredUnits.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-admin-background border-admin-border">
                            <SelectValue placeholder="Seleccione la unidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredUnits.length === 0 ? (
                            <SelectItem value="" disabled>
                              Ninguna unidad disponible
                            </SelectItem>
                          ) : (
                            filteredUnits.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id}>
                                {unit.label}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="pets">
                <p className="text-sm text-muted-foreground">
                  Gestion de mascotas disponible proximamente.
                </p>
              </TabsContent>

              <TabsContent value="vehicles">
                <p className="text-sm text-muted-foreground">
                  Gestion de vehiculos disponible proximamente.
                </p>
              </TabsContent>

              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
                  {isEditing ? "Guardar cambios" : "Registrar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

