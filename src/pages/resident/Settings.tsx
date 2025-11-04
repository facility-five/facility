import { useState, useEffect } from "react";
import { ResidentLayout } from "@/components/resident/ResidentLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { showRadixSuccess } from "@/utils/toast";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  Globe, 
  Save, 
  Mail, 
  MessageSquare, 
  Calendar,
  AlertTriangle,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  Trash2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type UserSettings = {
  id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  communication_notifications: boolean;
  reservation_notifications: boolean;
  maintenance_notifications: boolean;
  profile_visibility: 'public' | 'private' | 'residents_only';
  theme_preference: 'light' | 'dark' | 'system';
  language: 'pt' | 'en' | 'es';
  timezone: string;
};

const Settings = () => {
  const { user } = useAuth();
  const { showError } = useErrorHandler();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      // Primeiro, verificar se o usuário existe na tabela residents
      const { data: residentData, error: residentError } = await supabase
        .from('residents')
        .select('id')
        .eq('profile_id', user?.id)
        .single();

      if (residentError || !residentData) {
        // Se o usuário não existe na tabela residents, mostrar erro
        showError("Perfil de morador não encontrado. Entre em contato com a administração.");
        setLoading(false);
        return;
      }

      // Se existe, buscar as configurações usando o ID do residente
      const { data, error } = await supabase
        .from('resident_settings')
        .select('*')
        .eq('resident_id', residentData.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
      } else {
        // Criar configurações padrão se não existirem
        const defaultSettings: Partial<UserSettings> = {
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
        };

        const { data: newSettings, error: createError } = await supabase
          .from('resident_settings')
          .insert({
            resident_id: residentData.id,
            ...defaultSettings,
          })
          .select()
          .single();

        if (createError) throw createError;
        setSettings(newSettings);
      }
    } catch (error: any) {
      showError("Erro ao carregar configurações: " + error.message, "SETTINGS_LOAD_ERROR");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('resident_settings')
        .update({
          email_notifications: settings.email_notifications,
          push_notifications: settings.push_notifications,
          sms_notifications: settings.sms_notifications,
          communication_notifications: settings.communication_notifications,
          reservation_notifications: settings.reservation_notifications,
          maintenance_notifications: settings.maintenance_notifications,
          profile_visibility: settings.profile_visibility,
          theme_preference: settings.theme_preference,
          language: settings.language,
          timezone: settings.timezone,
        })
        .eq('resident_id', user?.id);

      if (error) throw error;

      showRadixSuccess("Configurações salvas com sucesso!");
    } catch (error: any) {
      showError("Erro ao salvar configurações: " + error.message, "SETTINGS_SAVE_ERROR");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof UserSettings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  if (loading) {
    return (
      <ResidentLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <div className="grid gap-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </ResidentLayout>
    );
  }

  if (!settings) {
    return (
      <ResidentLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Erro ao carregar configurações.</p>
        </div>
      </ResidentLayout>
    );
  }

  return (
    <ResidentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações da sua conta e preferências.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Notificações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </CardTitle>
              <CardDescription>
                Configure como você deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Canais de Notificação */}
              <div>
                <h4 className="text-sm font-medium mb-4">Canais de Notificação</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label htmlFor="email-notifications">E-mail</Label>
                        <p className="text-xs text-muted-foreground">Receber notificações por e-mail</p>
                      </div>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings.email_notifications}
                      onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label htmlFor="push-notifications">Push</Label>
                        <p className="text-xs text-muted-foreground">Notificações no navegador/app</p>
                      </div>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={settings.push_notifications}
                      onCheckedChange={(checked) => updateSetting('push_notifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label htmlFor="sms-notifications">SMS</Label>
                        <p className="text-xs text-muted-foreground">Receber notificações por SMS</p>
                      </div>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={settings.sms_notifications}
                      onCheckedChange={(checked) => updateSetting('sms_notifications', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Tipos de Notificação */}
              <div>
                <h4 className="text-sm font-medium mb-4">Tipos de Notificação</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label htmlFor="communication-notifications">Comunicados</Label>
                        <p className="text-xs text-muted-foreground">Novos comunicados da administração</p>
                      </div>
                    </div>
                    <Switch
                      id="communication-notifications"
                      checked={settings.communication_notifications}
                      onCheckedChange={(checked) => updateSetting('communication_notifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label htmlFor="reservation-notifications">Reservas</Label>
                        <p className="text-xs text-muted-foreground">Confirmações e lembretes de reservas</p>
                      </div>
                    </div>
                    <Switch
                      id="reservation-notifications"
                      checked={settings.reservation_notifications}
                      onCheckedChange={(checked) => updateSetting('reservation_notifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label htmlFor="maintenance-notifications">Manutenção</Label>
                        <p className="text-xs text-muted-foreground">Avisos de manutenção e interrupções</p>
                      </div>
                    </div>
                    <Switch
                      id="maintenance-notifications"
                      checked={settings.maintenance_notifications}
                      onCheckedChange={(checked) => updateSetting('maintenance_notifications', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacidade
              </CardTitle>
              <CardDescription>
                Configure a visibilidade do seu perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-visibility">Visibilidade do Perfil</Label>
                <Select
                  value={settings.profile_visibility}
                  onValueChange={(value) => updateSetting('profile_visibility', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <div>
                          <div>Público</div>
                          <div className="text-xs text-muted-foreground">Visível para todos</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="residents_only">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <div>
                          <div>Apenas Moradores</div>
                          <div className="text-xs text-muted-foreground">Visível apenas para moradores do condomínio</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4" />
                        <div>
                          <div>Privado</div>
                          <div className="text-xs text-muted-foreground">Visível apenas para você</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Aparência e Idioma */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Aparência e Idioma
              </CardTitle>
              <CardDescription>
                Personalize a aparência e idioma da aplicação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Tema</Label>
                  <Select
                    value={settings.theme_preference}
                    onValueChange={(value) => updateSetting('theme_preference', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Claro
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Escuro
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          Sistema
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value) => updateSetting('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Português (BR)
                        </div>
                      </SelectItem>
                      <SelectItem value="en">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          English
                        </div>
                      </SelectItem>
                      <SelectItem value="es">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Español
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Fuso Horário</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) => updateSetting('timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                    <SelectItem value="America/New_York">Nova York (GMT-5)</SelectItem>
                    <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tóquio (GMT+9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Segurança
              </CardTitle>
              <CardDescription>
                Gerencie a segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Autenticação de Dois Fatores</p>
                      <p className="text-sm text-muted-foreground">
                        Adicione uma camada extra de segurança à sua conta
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Configurar
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Alterar Senha</p>
                      <p className="text-sm text-muted-foreground">
                        Última alteração há 3 meses
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Alterar
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Monitor className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Sessões Ativas</p>
                      <p className="text-sm text-muted-foreground">
                        Gerencie dispositivos conectados à sua conta
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver Sessões
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados e Backup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="h-5 w-5" />
                Dados e Backup
              </CardTitle>
              <CardDescription>
                Gerencie seus dados pessoais e backups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Save className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Exportar Dados</p>
                      <p className="text-sm text-muted-foreground">
                        Baixe uma cópia de todos os seus dados
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Exportar
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Trash2 className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Excluir Conta</p>
                      <p className="text-sm text-muted-foreground">
                        Remover permanentemente sua conta e dados
                      </p>
                    </div>
                  </div>
                  <Button variant="destructive" size="sm">
                    Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botão Salvar */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="lg">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </div>
      </div>
    </ResidentLayout>
  );
};

export default Settings;
