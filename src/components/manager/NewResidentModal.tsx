"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { generateResidentCode, splitFullName, normalizeResidentData, RESIDENT_LABELS } from "@/utils/residentUtils";
import { Mail } from "lucide-react";

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
  full_name: z.string().min(1, "O nome é obrigatório."),
  email: z.string().email("Email inválido.").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  document: z.string().optional().or(z.literal("")),
  birth_date: z.string().optional().or(z.literal("")),
  entry_date: z.string().optional().or(z.literal("")),
  exit_date: z.string().optional().or(z.literal("")),
  is_owner: z.boolean(),
  is_tenant: z.boolean(),
  status: z.enum(["active", "inactive"]),
  condo_id: z.string().min(1, "Selecione o condomínio."),
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

const formatFirstAccessDate = (timestamp?: string | null) => {
  if (!timestamp) return null;
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(timestamp));
  } catch {
    return timestamp;
  }
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
  profile_id?: string | null;
  last_sign_in_at?: string | null;
};

interface NewResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  resident?: ResidentForEdit | null;
  condos: SelectOption[];
  blocks: SelectOption[];
  units: UnitOption[];
  defaultCondoId?: string | null;
}

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
  profile_id?: string | null;
  last_sign_in_at?: string | null;
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
  const [isResendingInvite, setIsResendingInvite] = useState(false);
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
  const hasAccount = Boolean(resident?.profile_id);
  const firstAccessLabel = resident?.last_sign_in_at ? formatFirstAccessDate(resident.last_sign_in_at) : null;
  const firstAccessStatus = hasAccount
    ? resident?.last_sign_in_at
      ? `Primer acceso registrado el ${firstAccessLabel}`
      : "El residente aún no hizo el primer acceso."
    : "Cuenta no vinculada; guarda el registro y genera la invitación inicial.";

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

  const handleResendInvite = async () => {
    if (!resident?.email || !resident?.profile_id) return;

    setIsResendingInvite(true);
    try {
      const formFullName = form.getValues("full_name").trim();
      const nameToUse = formFullName || resident.full_name;
      const { firstName, lastName } = splitFullName(nameToUse);
      const condoId = form.getValues("condo_id") || resident.condo_id;
      const condoName = condos.find((condo) => condo.id === condoId)?.name || "Condomínio";

      const redirectTo = `${window.location.origin.replace(/\/$/, "")}/nova-senha`;

      const { error } = await supabase.functions.invoke("invite-user", {
        body: {
          email: resident.email,
          data: {
            first_name: firstName,
            last_name: lastName,
            condo_name: condoName,
          },
          redirectTo,
        },
      });

      if (error) {
        throw error;
      }

      showRadixSuccess("Invitación reenviada con éxito. El residente recibirá nuevamente el Invite user.");
    } catch (err) {
      console.error("Erro ao reenviar convite:", err);
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "No fue posible reenviar la invitación.";
      showRadixError(`No fue posible reenviar la invitación: ${message}`, "resend_invite_error");
    } finally {
      setIsResendingInvite(false);
    }
  };

  const onSubmit = async (values: ResidentFormValues) => {
    const payload = normalizeResidentData(values);

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
      showError(error.message || RESIDENT_LABELS.ERROR_SAVE, "resident_save_error");
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
        const { firstName, lastName } = splitFullName(values.full_name);

        const { data: userResponse, error: userError } = await supabase.functions.invoke(
          'create-resident-user',
          {
            body: {
              email: values.email,
              firstName,
              lastName,
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
            showRadixSuccess(`${RESIDENT_LABELS.SUCCESS_CREATE} ${RESIDENT_LABELS.SUCCESS_WITH_EMAIL} para ${values.email}.`);
          }
        }
      } catch (err) {
        console.error('Erro ao processar criação de conta:', err);
        showError('Residente cadastrado, mas houve erro ao criar conta de usuário.', "account_processing_error");
      }
    } else {
      showRadixSuccess(isEditing ? RESIDENT_LABELS.SUCCESS_UPDATE : RESIDENT_LABELS.SUCCESS_CREATE);
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
          <DialogTitle>{isEditing ? "Editar Residente" : "Adicionar Residente"}</DialogTitle>
          <DialogDescription className="text-admin-foreground-muted">
            Complete os dados do residente. Estes dados serão utilizados para o acesso do morador.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 bg-admin-background">
            <TabsTrigger value="personal">Pessoal</TabsTrigger>
            <TabsTrigger value="location">Localização</TabsTrigger>
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
                        <FormLabel>Nome completo</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome do residente"
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="email@exemplo.com"
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
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Telefone"
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
                        <FormLabel>Data de nascimento</FormLabel>
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
                        <FormLabel>Data de entrada</FormLabel>
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
                        <FormLabel>Data de saída</FormLabel>
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
                        <FormLabel className="text-sm font-medium">Proprietário</FormLabel>
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
                        <FormLabel>Status</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="bg-admin-background border-admin-border">
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Ativo</SelectItem>
                            <SelectItem value="inactive">Inativo</SelectItem>
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
                          placeholder="Observações adicionais"
                          {...field}
                          className="bg-admin-background border-admin-border"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Informação sobre criação de usuário */}
                {!isEditing && (
                  <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
                    <div className="text-sm">
                      <p className="font-medium text-blue-800">💡 Criação automática de conta</p>
                      <p className="text-blue-700 mt-1">
                        Se um email for fornecido, uma conta de usuário será criada automaticamente 
                        e um email de boas-vindas será enviado com instruções para definir a senha.
                      </p>
                    </div>
                  </div>
                )}

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
                {isEditing && resident?.email && (
                  <div className="mt-4 rounded-md border border-purple-200 bg-purple-50 px-4 py-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-purple-900">Invite user &amp; primeiro acesso</p>
                        <p className="text-xs text-purple-800">{firstAccessStatus}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResendInvite}
                        disabled={isResendingInvite || !hasAccount}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Reenviar Invite user
                      </Button>
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
                        <FormLabel>Condomínio</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="bg-admin-background border-admin-border">
                              <SelectValue placeholder="Selecione o condomínio" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {condos.length === 0 ? (
                              <SelectItem value="" disabled>
                                Nenhum condomínio disponível
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
                        <FormLabel>Bloco</FormLabel>
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                          disabled={!watchedCondoId || filteredBlocks.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-admin-background border-admin-border">
                              <SelectValue placeholder="Selecione o bloco" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredBlocks.length === 0 ? (
                              <SelectItem value="" disabled>
                                Nenhum bloco disponível
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
                      <FormLabel>Unidade</FormLabel>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        disabled={!watchedBlockId || filteredUnits.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-admin-background border-admin-border">
                            <SelectValue placeholder="Selecione a unidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredUnits.length === 0 ? (
                            <SelectItem value="" disabled>
                              Nenhuma unidade disponível
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

              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
                  {isEditing ? "Salvar alterações" : "Cadastrar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
