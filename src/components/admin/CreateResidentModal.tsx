import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { showRadixError, showRadixSuccess } from "@/utils/toast";
import { Loader2 } from "lucide-react";

const residentSchema = z.object({
  full_name: z.string().min(1, "Nome completo é obrigatório"),
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  phone: z.string().optional(),
  document: z.string().optional(),
  birth_date: z.string().optional(),
  administrator_id: z.string().min(1, "Selecione uma administradora"),
  condominium_id: z.string().min(1, "Selecione um condomínio"),
  block_id: z.string().optional(),
  unit_id: z.string().optional(),
  is_owner: z.boolean().default(false),
  is_tenant: z.boolean().default(true),
  notes: z.string().optional(),
});

type ResidentFormValues = z.infer<typeof residentSchema>;

interface Administrator {
  id: string;
  name: string;
}

interface Condominium {
  id: string;
  name: string;
  administrator_id: string;
}

interface Block {
  id: string;
  name: string;
  condo_id: string;
}

interface Unit {
  id: string;
  number: string;
  block_id: string;
}

interface CreateResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateResidentModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateResidentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [administrators, setAdministrators] = useState<Administrator[]>([]);
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<string>("");
  const [selectedCondoId, setSelectedCondoId] = useState<string>("");
  const [selectedBlockId, setSelectedBlockId] = useState<string>("");

  const form = useForm<ResidentFormValues>({
    resolver: zodResolver(residentSchema),
    defaultValues: {
      is_owner: false,
      is_tenant: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      fetchAdministrators();
      form.reset({
        is_owner: false,
        is_tenant: true,
      });
    }
  }, [isOpen, form]);

  useEffect(() => {
    if (selectedAdminId) {
      fetchCondominiums(selectedAdminId);
      setSelectedCondoId("");
      setSelectedBlockId("");
    }
  }, [selectedAdminId]);

  useEffect(() => {
    if (selectedCondoId) {
      fetchBlocks(selectedCondoId);
      setSelectedBlockId("");
    }
  }, [selectedCondoId]);

  useEffect(() => {
    if (selectedBlockId) {
      fetchUnits(selectedBlockId);
    }
  }, [selectedBlockId]);

  const fetchAdministrators = async () => {
    try {
      const { data, error } = await supabase
        .from("administrators")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setAdministrators(data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      showRadixError("Erro ao carregar administradoras: " + errorMessage);
    }
  };

  const fetchCondominiums = async (adminId: string) => {
    try {
      const { data, error } = await supabase
        .from("condos")
        .select("id, name, administrator_id")
        .eq("administrator_id", adminId)
        .order("name");

      if (error) throw error;
      setCondominiums(data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      showRadixError("Erro ao carregar condomínios: " + errorMessage);
    }
  };

  const fetchBlocks = async (condoId: string) => {
    try {
      const { data, error } = await supabase
        .from("blocks")
        .select("id, name, condo_id")
        .eq("condo_id", condoId)
        .order("name");

      if (error) throw error;
      setBlocks(data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      showRadixError("Erro ao carregar blocos: " + errorMessage);
    }
  };

  const fetchUnits = async (blockId: string) => {
    try {
      const { data, error } = await supabase
        .from("units")
        .select("id, number, block_id")
        .eq("block_id", blockId)
        .order("number");

      if (error) throw error;
      setUnits(data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      showRadixError("Erro ao carregar unidades: " + errorMessage);
    }
  };

  const generateResidentCode = () => {
    return `RES${Date.now().toString().slice(-6)}`;
  };

  const onSubmit = async (values: ResidentFormValues) => {
    setLoading(true);
    try {
      // 1. Criar usuário no Supabase Auth
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
            condoName: condominiums.find(c => c.id === values.condominium_id)?.name || 'Condomínio'
          }
        }
      );

      if (userError) {
        throw new Error(`Erro ao criar usuário: ${userError.message}`);
      }

      if (!userResponse?.user?.id) {
        throw new Error("Usuário não foi criado corretamente");
      }

      // 2. Criar registro na tabela residents
      const residentData = {
        code: generateResidentCode(),
        full_name: values.full_name.trim(),
        email: values.email.trim(),
        phone: values.phone?.trim() || null,
        document: values.document?.trim() || null,
        birth_date: values.birth_date || null,
        entry_date: new Date().toISOString().split('T')[0],
        is_owner: values.is_owner,
        is_tenant: values.is_tenant,
        status: 'Ativo',
        condo_id: values.condominium_id,
        block_id: values.block_id || null,
        unit_id: values.unit_id || null,
        notes: values.notes?.trim() || null,
        profile_id: userResponse.user.id, // Vincular ao usuário criado
      };

      const { error: residentError } = await supabase
        .from("residents")
        .insert([residentData]);

      if (residentError) {
        throw new Error(`Erro ao criar residente: ${residentError.message}`);
      }

      // 3. Criar configurações padrão do morador
      const { error: settingsError } = await supabase
        .from("resident_settings")
        .insert([{
          resident_id: userResponse.user.id,
          email_notifications: true,
          push_notifications: true,
          sms_notifications: false,
          communication_notifications: true,
          reservation_notifications: true,
          maintenance_notifications: true,
          profile_visibility: 'residents_only',
          theme_preference: 'system',
          language: 'pt',
          timezone: 'America/Sao_Paulo',
        }]);

      if (settingsError) {
        console.warn("Erro ao criar configurações padrão:", settingsError);
        // Não falha o processo, apenas avisa
      }

      showRadixSuccess("Morador cadastrado com sucesso! Email de boas-vindas enviado.");
      onSuccess();
      onClose();
      form.reset();
    } catch (error: unknown) {
      console.error("Erro ao cadastrar morador:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao cadastrar morador";
      showRadixError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    form.reset();
    setSelectedAdminId("");
    setSelectedCondoId("");
    setSelectedBlockId("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Morador</DialogTitle>
          <DialogDescription>
            Preencha os dados do morador. Uma conta de usuário será criada automaticamente.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dados Pessoais</h3>
              
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo do morador" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input placeholder="email@exemplo.com" type="email" {...field} />
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
                        <Input placeholder="(11) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="document"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Documento (CPF/RG)</FormLabel>
                      <FormControl>
                        <Input placeholder="123.456.789-00" {...field} />
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
                      <FormLabel>Data de Nascimento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Localização */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Localização</h3>
              
              <FormField
                control={form.control}
                name="administrator_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Administradora *</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedAdminId(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma administradora" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                name="condominium_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condomínio *</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedCondoId(value);
                      }}
                      value={field.value}
                      disabled={!selectedAdminId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um condomínio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {condominiums.map((condo) => (
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="block_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bloco</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedBlockId(value);
                        }}
                        value={field.value}
                        disabled={!selectedCondoId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um bloco" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {blocks.map((block) => (
                            <SelectItem key={block.id} value={block.id}>
                              {block.name}
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
                  name="unit_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidade</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedBlockId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma unidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.number}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Tipo de Morador */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tipo de Morador</h3>
              
              <div className="flex items-center space-x-6">
                <FormField
                  control={form.control}
                  name="is_owner"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Proprietário</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_tenant"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Inquilino</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Observações */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações adicionais sobre o morador"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Informação sobre criação automática */}
            <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
              <div className="text-sm">
                <p className="font-medium text-blue-800">Criação automática de conta</p>
                <p className="text-blue-700 mt-1">
                  Uma conta de usuário será criada automaticamente e um email de boas-vindas 
                  será enviado com instruções para definir a senha.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cadastrar Morador
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};