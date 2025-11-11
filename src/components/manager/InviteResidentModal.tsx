import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { showRadixSuccess, showRadixError } from "@/utils/toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { UserPlus, Mail, Building2, Key, Send } from "lucide-react";

const inviteSchema = z.object({
  email: z.string().email("Email inválido"),
  full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().optional(),
  condominium_id: z.string().min(1, "Selecione um condomínio"),
  block_id: z.string().optional(),
  unit_id: z.string().optional(),
  resident_type: z.enum(["owner", "tenant", "dependent"]),
  send_welcome_email: z.boolean().default(true),
  notes: z.string().optional(),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  condominiumId?: string; // Pré-seleção se vier de contexto específico
}

interface Condominium {
  id: string;
  name: string;
}

interface Block {
  id: string;
  name: string;
  condominium_id: string;
}

interface Unit {
  id: string;
  number: string;
  block_id: string;
  is_occupied: boolean;
}

export const InviteResidentModal = ({
  isOpen,
  onClose,
  onSuccess,
  condominiumId
}: InviteResidentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'preview' | 'success'>('form');
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [invitePreview, setInvitePreview] = useState<InviteFormData | null>(null);

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      full_name: "",
      phone: "",
      condominium_id: condominiumId || "",
      block_id: "",
      unit_id: "",
      resident_type: "owner",
      send_welcome_email: true,
      notes: "",
    },
  });

  const watchedCondominiumId = form.watch("condominium_id");
  const watchedBlockId = form.watch("block_id");

  useEffect(() => {
    if (isOpen) {
      fetchCondominiums();
      if (condominiumId) {
        form.setValue("condominium_id", condominiumId);
      }
    }
  }, [isOpen, condominiumId]);

  useEffect(() => {
    if (watchedCondominiumId) {
      fetchBlocks(watchedCondominiumId);
      form.setValue("block_id", "");
      form.setValue("unit_id", "");
    }
  }, [watchedCondominiumId]);

  useEffect(() => {
    if (watchedBlockId) {
      fetchUnits(watchedBlockId);
      form.setValue("unit_id", "");
    }
  }, [watchedBlockId]);

  const fetchCondominiums = async () => {
    try {
      const { data, error } = await supabase
        .from("condominiums")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setCondominiums(data || []);
    } catch (error) {
      console.error("Erro ao buscar condomínios:", error);
      showRadixError("Erro ao carregar condomínios");
    }
  };

  const fetchBlocks = async (condoId: string) => {
    try {
      const { data, error } = await supabase
        .from("blocks")
        .select("id, name, condominium_id")
        .eq("condominium_id", condoId)
        .order("name");

      if (error) throw error;
      setBlocks(data || []);
    } catch (error) {
      console.error("Erro ao buscar blocos:", error);
      setBlocks([]);
    }
  };

  const fetchUnits = async (blockId: string) => {
    try {
      const { data, error } = await supabase
        .from("units")
        .select("id, number, block_id, is_occupied")
        .eq("block_id", blockId)
        .order("number");

      if (error) throw error;
      setUnits(data || []);
    } catch (error) {
      console.error("Erro ao buscar unidades:", error);
      setUnits([]);
    }
  };

  const getResidentTypeLabel = (type: string) => {
    switch (type) {
      case "owner": return "Proprietário";
      case "tenant": return "Inquilino";
      case "dependent": return "Dependente";
      default: return type;
    }
  };

  const getResidentTypeColor = (type: string) => {
    switch (type) {
      case "owner": return "bg-emerald-100 text-emerald-800";
      case "tenant": return "bg-blue-100 text-blue-800";
      case "dependent": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handlePreview = (data: InviteFormData) => {
    setInvitePreview(data);
    setStep('preview');
  };

  const handleSendInvite = async () => {
    if (!invitePreview) return;

    setLoading(true);
    try {
      // Chamar Edge Function para criar usuário e enviar convite
      const { data: result, error } = await supabase.functions.invoke(
        'create-resident-user',
        {
          body: {
            email: invitePreview.email,
            firstName: invitePreview.full_name.split(' ')[0],
            lastName: invitePreview.full_name.split(' ').slice(1).join(' '),
            condoName: condominiums.find(c => c.id === invitePreview.condominium_id)?.name || 'Seu condomínio'
          }
        }
      );

      if (error) throw error;

      // Criar registro de residente
      const residentData = {
        code: `RE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        full_name: invitePreview.full_name,
        email: invitePreview.email,
        phone: invitePreview.phone || null,
        condo_id: invitePreview.condominium_id,
        block_id: invitePreview.block_id || null,
        unit_id: invitePreview.unit_id || null,
        is_owner: invitePreview.resident_type === 'owner',
        is_tenant: invitePreview.resident_type === 'tenant',
        status: 'active',
        notes: invitePreview.notes || null,
        profile_id: result?.user?.id,
        entry_date: new Date().toISOString().split('T')[0],
      };

      const { error: residentError } = await supabase
        .from("residents")
        .insert([residentData]);

      if (residentError) throw residentError;

      setStep('success');
      showRadixSuccess(`Convite enviado para ${invitePreview.email}!`);
      
    } catch (error: any) {
      console.error("Erro ao enviar convite:", error);
      showRadixError(`Erro ao enviar convite: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep('form');
    setInvitePreview(null);
    form.reset();
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleSuccess = () => {
    resetModal();
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === 'form' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Convidar Novo Morador
              </DialogTitle>
              <DialogDescription>
                Preencha os dados do morador para enviar um convite de acesso ao sistema
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handlePreview)} className="space-y-6">
                {/* Informações Básicas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informações Básicas</h3>
                  
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

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@exemplo.com" {...field} />
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

                <Separator />

                {/* Localização */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Localização</h3>
                  
                  <FormField
                    control={form.control}
                    name="condominium_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condomínio *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o condomínio" />
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

                  {blocks.length > 0 && (
                    <FormField
                      control={form.control}
                      name="block_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bloco</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o bloco" />
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
                  )}

                  {units.length > 0 && (
                    <FormField
                      control={form.control}
                      name="unit_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unidade</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a unidade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {units.map((unit) => (
                                <SelectItem 
                                  key={unit.id} 
                                  value={unit.id}
                                  disabled={unit.is_occupied}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span>Unidade {unit.number}</span>
                                    {unit.is_occupied && (
                                      <Badge variant="secondary" className="ml-2 text-xs">
                                        Ocupada
                                      </Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <Separator />

                {/* Tipo de Morador */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Tipo de Morador</h3>
                  
                  <FormField
                    control={form.control}
                    name="resident_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="owner">Proprietário</SelectItem>
                            <SelectItem value="tenant">Inquilino</SelectItem>
                            <SelectItem value="dependent">Dependente</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Informações adicionais sobre o morador..."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Configurações do Convite */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Configurações do Convite</h3>
                  
                  <FormField
                    control={form.control}
                    name="send_welcome_email"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between space-y-0">
                        <div className="space-y-1">
                          <FormLabel>Enviar email de boas-vindas</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            O morador receberá um email com instruções para acessar o sistema
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    <Mail className="w-4 h-4 mr-2" />
                    Revisar Convite
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )}

        {step === 'preview' && invitePreview && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Revisar Convite
              </DialogTitle>
              <DialogDescription>
                Confirme os dados antes de enviar o convite
              </DialogDescription>
            </DialogHeader>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dados do Convite</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Nome</Label>
                    <p className="text-sm">{invitePreview.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm">{invitePreview.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Telefone</Label>
                    <p className="text-sm">{invitePreview.phone || "Não informado"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Tipo</Label>
                    <Badge className={getResidentTypeColor(invitePreview.resident_type)}>
                      {getResidentTypeLabel(invitePreview.resident_type)}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm font-medium">Condomínio</Label>
                    <p className="text-sm">
                      {condominiums.find(c => c.id === invitePreview.condominium_id)?.name}
                    </p>
                  </div>
                  {invitePreview.unit_id && (
                    <div className="col-span-2">
                      <Label className="text-sm font-medium">Unidade</Label>
                      <p className="text-sm">
                        {blocks.find(b => b.id === invitePreview.block_id)?.name} - 
                        Unidade {units.find(u => u.id === invitePreview.unit_id)?.number}
                      </p>
                    </div>
                  )}
                </div>

                {invitePreview.send_welcome_email && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Email de Boas-vindas</p>
                        <p className="text-xs text-blue-700">
                          Um email será enviado com instruções para {invitePreview.email} criar a conta
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep('form')}
              >
                Voltar
              </Button>
              <Button 
                onClick={handleSendInvite}
                disabled={loading}
              >
                {loading ? (
                  "Enviando..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Convite
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {step === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-emerald-600">
                <Building2 className="h-5 w-5" />
                Convite Enviado!
              </DialogTitle>
            </DialogHeader>

            <div className="text-center space-y-4 py-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-emerald-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold">Convite enviado com sucesso!</h3>
                <p className="text-muted-foreground mt-2">
                  O morador receberá um email em <strong>{invitePreview?.email}</strong> com 
                  instruções para criar sua conta e acessar o sistema.
                </p>
              </div>

              <div className="bg-emerald-50 p-4 rounded-lg">
                <p className="text-sm text-emerald-800">
                  <Key className="w-4 h-4 inline mr-1" />
                  O morador poderá definir sua própria senha ao clicar no link do email
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={handleClose}>
                Fechar
              </Button>
              <Button onClick={handleSuccess}>
                Convidar Outro Morador
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};