import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import { ImageUpload } from "./ImageUpload";
import { Separator } from "@/components/ui/separator";

const settingsSchema = z.object({
  system_name: z.string().optional(),
  default_language: z.string().optional(),
  timezone: z.string().optional(),
  date_format: z.string().optional(),
  currency: z.string().optional(),
  system_description: z.string().optional(),
  maintenance_mode: z.boolean(),
  allow_registrations: z.boolean(),
  logo_url: z.string().nullable().optional(),
  logo_negative_url: z.string().nullable().optional(),
  logo_file: z.any().optional(),
  logo_negative_file: z.any().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export const SystemSettingsTab = () => {
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      maintenance_mode: false,
      allow_registrations: true,
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .limit(1)
        .single();
      if (data) {
        form.reset({
          ...data,
          logo_file: data.logo_url,
          logo_negative_file: data.logo_negative_url,
        });
      }
      if (error && error.code !== 'PGRST116') {
        showError("Erro ao carregar configurações.");
      }
    };
    fetchSettings();
  }, [form]);

  async function onSubmit(values: SettingsFormValues) {
    const { logo_file, logo_negative_file, ...dbValues } = values;
    let newLogoUrl = form.getValues('logo_url');
    let newLogoNegativeUrl = form.getValues('logo_negative_url');
    let hasError = false;

    const uploadFile = async (file: any, path: string): Promise<string | null> => {
      if (file instanceof File) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${path}_${Date.now()}.${fileExt}`;
        const { error, data } = await supabase.storage
          .from('system-assets')
          .upload(fileName, file, { upsert: true });

        if (error) {
          showError(`Erro ao carregar imagem: ${error.message}`);
          hasError = true;
          return null;
        }
        
        const { data: publicURL } = supabase.storage.from('system-assets').getPublicUrl(data.path);
        return publicURL.publicUrl;
      }
      return file; // Retorna o valor existente (URL ou null) se não for um novo arquivo
    };

    const uploadedLogoUrl = await uploadFile(logo_file, 'logo_main');
    if (!hasError) newLogoUrl = uploadedLogoUrl;

    const uploadedLogoNegativeUrl = await uploadFile(logo_negative_file, 'logo_negative');
    if (!hasError) newLogoNegativeUrl = uploadedLogoNegativeUrl;

    if (hasError) return;

    const { error } = await supabase
      .from("system_settings")
      .update({ 
          ...dbValues, 
          logo_url: newLogoUrl, 
          logo_negative_url: newLogoNegativeUrl 
      })
      .eq("id", 1);

    if (error) {
      showError(error.message);
    } else {
      showSuccess("Configurações salvas com sucesso!");
      form.reset({
          ...values,
          logo_url: newLogoUrl,
          logo_negative_url: newLogoNegativeUrl,
          logo_file: newLogoUrl,
          logo_negative_file: newLogoNegativeUrl,
      });
    }
  }

  return (
    <Card className="bg-admin-card border-admin-border text-admin-foreground">
      <CardHeader>
        <CardTitle>Configurações do Sistema</CardTitle>
        <CardDescription className="text-admin-foreground-muted">
          Configure as opções básicas e a identidade visual do sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
                <h3 className="text-lg font-medium">Identidade Visual</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ImageUpload
                        name="logo_file"
                        label="Logo Principal"
                        currentImageUrl={form.getValues('logo_url')}
                    />
                    <ImageUpload
                        name="logo_negative_file"
                        label="Logo Negativa (para fundos escuros)"
                        currentImageUrl={form.getValues('logo_negative_url')}
                    />
                </div>
            </div>

            <Separator />

            <div className="space-y-6">
                <h3 className="text-lg font-medium">Configurações Gerais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="system_name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nome do Sistema</FormLabel>
                        <FormControl>
                        <Input {...field} className="bg-admin-background border-admin-border" />
                        </FormControl>
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="default_language"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Idioma Padrão</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger className="bg-admin-background border-admin-border"><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-admin-card border-admin-border text-admin-foreground">
                            <SelectItem value="pt-br">Português (Brasil)</SelectItem>
                            <SelectItem value="en-us">English (US)</SelectItem>
                        </SelectContent>
                        </Select>
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Fuso Horário</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger className="bg-admin-background border-admin-border"><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-admin-card border-admin-border text-admin-foreground">
                            <SelectItem value="utc-3">UTC-3</SelectItem>
                            <SelectItem value="utc-0">UTC</SelectItem>
                        </SelectContent>
                        </Select>
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="date_format"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Formato de Data</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger className="bg-admin-background border-admin-border"><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-admin-card border-admin-border text-admin-foreground">
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        </SelectContent>
                        </Select>
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Moeda</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger className="bg-admin-background border-admin-border"><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-admin-card border-admin-border text-admin-foreground">
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="BRL">BRL (R$)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                        </SelectContent>
                        </Select>
                    </FormItem>
                    )}
                />
                </div>
                <FormField
                control={form.control}
                name="system_description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Descrição do Sistema</FormLabel>
                    <FormControl>
                        <Textarea {...field} className="bg-admin-background border-admin-border" />
                    </FormControl>
                    </FormItem>
                )}
                />
            </div>

            <Separator />

            <div className="space-y-6">
                <h3 className="text-lg font-medium">Controles do Sistema</h3>
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="maintenance_mode"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-admin-border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel>Modo de Manutenção</FormLabel>
                                    <FormDescription className="text-admin-foreground-muted">
                                        Pausa o sistema para todos, exceto administradores.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="allow_registrations"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-admin-border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel>Permitir Registros</FormLabel>
                                    <FormDescription className="text-admin-foreground-muted">
                                        Permite que novos usuários se cadastrem no sistema.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Salvar Alterações</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};