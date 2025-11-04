import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Settings, 
  Clock,
  Volume2,
  Vibrate,
  Users,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface NotificationConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NotificationSettings {
  email: {
    enabled: boolean;
    newReservations: boolean;
    cancelledReservations: boolean;
    maintenanceRequests: boolean;
    systemAlerts: boolean;
    weeklyReports: boolean;
    frequency: "immediate" | "daily" | "weekly";
  };
  sms: {
    enabled: boolean;
    urgentOnly: boolean;
    emergencies: boolean;
    maintenanceAlerts: boolean;
  };
  push: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    badge: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  inApp: {
    enabled: boolean;
    reservations: boolean;
    maintenance: boolean;
    announcements: boolean;
    reminders: boolean;
  };
}

export const NotificationConfigModal = ({ open, onOpenChange }: NotificationConfigModalProps) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      enabled: true,
      newReservations: true,
      cancelledReservations: true,
      maintenanceRequests: true,
      systemAlerts: false,
      weeklyReports: true,
      frequency: "immediate"
    },
    sms: {
      enabled: false,
      urgentOnly: true,
      emergencies: true,
      maintenanceAlerts: false
    },
    push: {
      enabled: true,
      sound: true,
      vibration: true,
      badge: true,
      quietHours: {
        enabled: true,
        start: "22:00",
        end: "07:00"
      }
    },
    inApp: {
      enabled: true,
      reservations: true,
      maintenance: true,
      announcements: true,
      reminders: true
    }
  });

  const [testNotification, setTestNotification] = useState({
    type: "email" as "email" | "sms" | "push",
    message: "Esta é uma notificação de teste do sistema Facility."
  });

  const updateEmailSettings = (key: keyof typeof settings.email, value: any) => {
    setSettings(prev => ({
      ...prev,
      email: { ...prev.email, [key]: value }
    }));
  };

  const updateSmsSettings = (key: keyof typeof settings.sms, value: any) => {
    setSettings(prev => ({
      ...prev,
      sms: { ...prev.sms, [key]: value }
    }));
  };

  const updatePushSettings = (key: keyof typeof settings.push, value: any) => {
    setSettings(prev => ({
      ...prev,
      push: { ...prev.push, [key]: value }
    }));
  };

  const updateInAppSettings = (key: keyof typeof settings.inApp, value: any) => {
    setSettings(prev => ({
      ...prev,
      inApp: { ...prev.inApp, [key]: value }
    }));
  };

  const updateQuietHours = (key: keyof typeof settings.push.quietHours, value: any) => {
    setSettings(prev => ({
      ...prev,
      push: {
        ...prev.push,
        quietHours: { ...prev.push.quietHours, [key]: value }
      }
    }));
  };

  const handleSaveSettings = () => {
    // Aqui implementaria a lógica de salvar configurações
    console.log("Salvando configurações:", settings);
  };

  const handleTestNotification = () => {
    // Aqui implementaria a lógica de enviar notificação de teste
    console.log("Enviando notificação de teste:", testNotification);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-purple-600" />
            Configurações de Notificações
          </DialogTitle>
          <DialogDescription>
            Configure como e quando você deseja receber notificações do sistema.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="email">E-mail</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
            <TabsTrigger value="push">Push</TabsTrigger>
            <TabsTrigger value="inapp">In-App</TabsTrigger>
            <TabsTrigger value="test">Teste</TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Notificações por E-mail
                </CardTitle>
                <CardDescription>
                  Configure quais eventos devem gerar notificações por e-mail
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Ativar notificações por e-mail</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações no seu endereço de e-mail
                    </p>
                  </div>
                  <Switch
                    checked={settings.email.enabled}
                    onCheckedChange={(checked) => updateEmailSettings("enabled", checked)}
                  />
                </div>

                {settings.email.enabled && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Novas reservas</Label>
                        <Switch
                          checked={settings.email.newReservations}
                          onCheckedChange={(checked) => updateEmailSettings("newReservations", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Reservas canceladas</Label>
                        <Switch
                          checked={settings.email.cancelledReservations}
                          onCheckedChange={(checked) => updateEmailSettings("cancelledReservations", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Solicitações de manutenção</Label>
                        <Switch
                          checked={settings.email.maintenanceRequests}
                          onCheckedChange={(checked) => updateEmailSettings("maintenanceRequests", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Alertas do sistema</Label>
                        <Switch
                          checked={settings.email.systemAlerts}
                          onCheckedChange={(checked) => updateEmailSettings("systemAlerts", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Relatórios semanais</Label>
                        <Switch
                          checked={settings.email.weeklyReports}
                          onCheckedChange={(checked) => updateEmailSettings("weeklyReports", checked)}
                        />
                      </div>
                    </div>

                    <Separator />
                    <div className="space-y-2">
                      <Label>Frequência de envio</Label>
                      <Select value={settings.email.frequency} onValueChange={(value: any) => updateEmailSettings("frequency", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Imediato</SelectItem>
                          <SelectItem value="daily">Resumo diário</SelectItem>
                          <SelectItem value="weekly">Resumo semanal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Notificações por SMS
                </CardTitle>
                <CardDescription>
                  Configure notificações via mensagem de texto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Ativar notificações por SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações no seu celular via SMS
                    </p>
                  </div>
                  <Switch
                    checked={settings.sms.enabled}
                    onCheckedChange={(checked) => updateSmsSettings("enabled", checked)}
                  />
                </div>

                {settings.sms.enabled && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Apenas urgências</Label>
                        <Switch
                          checked={settings.sms.urgentOnly}
                          onCheckedChange={(checked) => updateSmsSettings("urgentOnly", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Emergências</Label>
                        <Switch
                          checked={settings.sms.emergencies}
                          onCheckedChange={(checked) => updateSmsSettings("emergencies", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Alertas de manutenção</Label>
                        <Switch
                          checked={settings.sms.maintenanceAlerts}
                          onCheckedChange={(checked) => updateSmsSettings("maintenanceAlerts", checked)}
                        />
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-yellow-800">Cobrança de SMS</p>
                          <p className="text-yellow-700">
                            As notificações por SMS podem gerar custos adicionais conforme seu plano.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="push" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Notificações Push
                </CardTitle>
                <CardDescription>
                  Configure notificações push para dispositivos móveis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Ativar notificações push</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações no seu dispositivo móvel
                    </p>
                  </div>
                  <Switch
                    checked={settings.push.enabled}
                    onCheckedChange={(checked) => updatePushSettings("enabled", checked)}
                  />
                </div>

                {settings.push.enabled && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Volume2 className="h-4 w-4" />
                          <Label>Som</Label>
                        </div>
                        <Switch
                          checked={settings.push.sound}
                          onCheckedChange={(checked) => updatePushSettings("sound", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Vibrate className="h-4 w-4" />
                          <Label>Vibração</Label>
                        </div>
                        <Switch
                          checked={settings.push.vibration}
                          onCheckedChange={(checked) => updatePushSettings("vibration", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Badge no ícone</Label>
                        <Switch
                          checked={settings.push.badge}
                          onCheckedChange={(checked) => updatePushSettings("badge", checked)}
                        />
                      </div>
                    </div>

                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Horário silencioso
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Não receber notificações durante este período
                          </p>
                        </div>
                        <Switch
                          checked={settings.push.quietHours.enabled}
                          onCheckedChange={(checked) => updateQuietHours("enabled", checked)}
                        />
                      </div>

                      {settings.push.quietHours.enabled && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Início</Label>
                            <Input
                              type="time"
                              value={settings.push.quietHours.start}
                              onChange={(e) => updateQuietHours("start", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Fim</Label>
                            <Input
                              type="time"
                              value={settings.push.quietHours.end}
                              onChange={(e) => updateQuietHours("end", e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inapp" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notificações In-App
                </CardTitle>
                <CardDescription>
                  Configure notificações dentro do aplicativo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Ativar notificações in-app</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar notificações dentro do aplicativo
                    </p>
                  </div>
                  <Switch
                    checked={settings.inApp.enabled}
                    onCheckedChange={(checked) => updateInAppSettings("enabled", checked)}
                  />
                </div>

                {settings.inApp.enabled && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <Label>Reservas</Label>
                        </div>
                        <Switch
                          checked={settings.inApp.reservations}
                          onCheckedChange={(checked) => updateInAppSettings("reservations", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          <Label>Manutenção</Label>
                        </div>
                        <Switch
                          checked={settings.inApp.maintenance}
                          onCheckedChange={(checked) => updateInAppSettings("maintenance", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <Label>Comunicados</Label>
                        </div>
                        <Switch
                          checked={settings.inApp.announcements}
                          onCheckedChange={(checked) => updateInAppSettings("announcements", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <Label>Lembretes</Label>
                        </div>
                        <Switch
                          checked={settings.inApp.reminders}
                          onCheckedChange={(checked) => updateInAppSettings("reminders", checked)}
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Testar Notificações
                </CardTitle>
                <CardDescription>
                  Envie notificações de teste para verificar as configurações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de notificação</Label>
                  <Select value={testNotification.type} onValueChange={(value: any) => setTestNotification(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="push">Push</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mensagem de teste</Label>
                  <Textarea
                    value={testNotification.message}
                    onChange={(e) => setTestNotification(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Digite a mensagem de teste..."
                    rows={3}
                  />
                </div>
                <Button onClick={handleTestNotification} className="w-full">
                  Enviar Notificação de Teste
                </Button>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-800">Dica</p>
                      <p className="text-blue-700">
                        Use as notificações de teste para verificar se suas configurações estão funcionando corretamente.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSaveSettings} className="bg-purple-600 hover:bg-purple-700">
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};