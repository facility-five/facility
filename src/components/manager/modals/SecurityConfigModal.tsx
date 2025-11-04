import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, 
  Lock, 
  Key, 
  Eye, 
  EyeOff, 
  Smartphone,
  Clock,
  AlertTriangle,
  CheckCircle,
  History,
  Globe,
  UserCheck,
  Settings,
  Fingerprint,
  Wifi
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SecurityConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SecuritySettings {
  password: {
    requireComplexity: boolean;
    minLength: number;
    requireNumbers: boolean;
    requireSymbols: boolean;
    requireUppercase: boolean;
    expirationDays: number;
    preventReuse: number;
  };
  twoFactor: {
    enabled: boolean;
    method: "sms" | "app" | "email";
    backupCodes: boolean;
  };
  session: {
    timeout: number;
    maxConcurrent: number;
    rememberDevice: boolean;
    deviceTrustDays: number;
  };
  access: {
    ipWhitelist: boolean;
    allowedIPs: string[];
    geoRestriction: boolean;
    allowedCountries: string[];
    blockSuspiciousActivity: boolean;
  };
  audit: {
    logLogins: boolean;
    logActions: boolean;
    retentionDays: number;
    alertFailedAttempts: number;
  };
}

interface LoginAttempt {
  id: string;
  timestamp: string;
  ip: string;
  location: string;
  success: boolean;
  userAgent: string;
}

export const SecurityConfigModal = ({ open, onOpenChange }: SecurityConfigModalProps) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const [settings, setSettings] = useState<SecuritySettings>({
    password: {
      requireComplexity: true,
      minLength: 8,
      requireNumbers: true,
      requireSymbols: true,
      requireUppercase: true,
      expirationDays: 90,
      preventReuse: 5
    },
    twoFactor: {
      enabled: false,
      method: "app",
      backupCodes: false
    },
    session: {
      timeout: 30,
      maxConcurrent: 3,
      rememberDevice: true,
      deviceTrustDays: 30
    },
    access: {
      ipWhitelist: false,
      allowedIPs: [],
      geoRestriction: false,
      allowedCountries: ["BR"],
      blockSuspiciousActivity: true
    },
    audit: {
      logLogins: true,
      logActions: true,
      retentionDays: 365,
      alertFailedAttempts: 5
    }
  });

  // Mock data para tentativas de login
  const [loginAttempts] = useState<LoginAttempt[]>([
    {
      id: "1",
      timestamp: "2024-01-15 14:30:25",
      ip: "192.168.1.100",
      location: "São Paulo, BR",
      success: true,
      userAgent: "Chrome 120.0"
    },
    {
      id: "2",
      timestamp: "2024-01-15 09:15:10",
      ip: "192.168.1.100",
      location: "São Paulo, BR",
      success: true,
      userAgent: "Chrome 120.0"
    },
    {
      id: "3",
      timestamp: "2024-01-14 18:45:33",
      ip: "203.0.113.1",
      location: "Rio de Janeiro, BR",
      success: false,
      userAgent: "Firefox 121.0"
    }
  ]);

  const updatePasswordSettings = (key: keyof typeof settings.password, value: any) => {
    setSettings(prev => ({
      ...prev,
      password: { ...prev.password, [key]: value }
    }));
  };

  const updateTwoFactorSettings = (key: keyof typeof settings.twoFactor, value: any) => {
    setSettings(prev => ({
      ...prev,
      twoFactor: { ...prev.twoFactor, [key]: value }
    }));
  };

  const updateSessionSettings = (key: keyof typeof settings.session, value: any) => {
    setSettings(prev => ({
      ...prev,
      session: { ...prev.session, [key]: value }
    }));
  };

  const updateAccessSettings = (key: keyof typeof settings.access, value: any) => {
    setSettings(prev => ({
      ...prev,
      access: { ...prev.access, [key]: value }
    }));
  };

  const updateAuditSettings = (key: keyof typeof settings.audit, value: any) => {
    setSettings(prev => ({
      ...prev,
      audit: { ...prev.audit, [key]: value }
    }));
  };

  const handleChangePassword = () => {
    // Aqui implementaria a lógica de alteração de senha
    console.log("Alterando senha:", passwordForm);
  };

  const handleEnable2FA = () => {
    // Aqui implementaria a lógica de ativação do 2FA
    console.log("Ativando 2FA");
  };

  const handleSaveSettings = () => {
    // Aqui implementaria a lógica de salvar configurações
    console.log("Salvando configurações de segurança:", settings);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            Configurações de Segurança
          </DialogTitle>
          <DialogDescription>
            Configure as políticas de segurança e autenticação do sistema.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="password">Senha</TabsTrigger>
            <TabsTrigger value="2fa">2FA</TabsTrigger>
            <TabsTrigger value="session">Sessão</TabsTrigger>
            <TabsTrigger value="access">Acesso</TabsTrigger>
            <TabsTrigger value="audit">Auditoria</TabsTrigger>
            <TabsTrigger value="activity">Atividade</TabsTrigger>
          </TabsList>

          <TabsContent value="password" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Alterar Senha
                  </CardTitle>
                  <CardDescription>
                    Altere sua senha atual
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Senha atual</Label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.current}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
                        placeholder="Digite sua senha atual"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Nova senha</Label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.new}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, new: e.target.value }))}
                        placeholder="Digite a nova senha"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmar nova senha</Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm: e.target.value }))}
                        placeholder="Confirme a nova senha"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button onClick={handleChangePassword} className="w-full">
                    Alterar Senha
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Política de Senhas
                  </CardTitle>
                  <CardDescription>
                    Configure os requisitos de senha
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Exigir complexidade</Label>
                    <Switch
                      checked={settings.password.requireComplexity}
                      onCheckedChange={(checked) => updatePasswordSettings("requireComplexity", checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tamanho mínimo: {settings.password.minLength} caracteres</Label>
                    <Input
                      type="range"
                      min="6"
                      max="20"
                      value={settings.password.minLength}
                      onChange={(e) => updatePasswordSettings("minLength", parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Exigir números</Label>
                    <Switch
                      checked={settings.password.requireNumbers}
                      onCheckedChange={(checked) => updatePasswordSettings("requireNumbers", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Exigir símbolos</Label>
                    <Switch
                      checked={settings.password.requireSymbols}
                      onCheckedChange={(checked) => updatePasswordSettings("requireSymbols", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Exigir maiúsculas</Label>
                    <Switch
                      checked={settings.password.requireUppercase}
                      onCheckedChange={(checked) => updatePasswordSettings("requireUppercase", checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiração (dias)</Label>
                    <Select value={settings.password.expirationDays.toString()} onValueChange={(value) => updatePasswordSettings("expirationDays", parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 dias</SelectItem>
                        <SelectItem value="60">60 dias</SelectItem>
                        <SelectItem value="90">90 dias</SelectItem>
                        <SelectItem value="180">180 dias</SelectItem>
                        <SelectItem value="365">1 ano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="2fa" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fingerprint className="h-4 w-4" />
                  Autenticação de Dois Fatores (2FA)
                </CardTitle>
                <CardDescription>
                  Adicione uma camada extra de segurança à sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Ativar 2FA</Label>
                    <p className="text-sm text-muted-foreground">
                      Requer um segundo fator para fazer login
                    </p>
                  </div>
                  <Switch
                    checked={settings.twoFactor.enabled}
                    onCheckedChange={(checked) => updateTwoFactorSettings("enabled", checked)}
                  />
                </div>

                {settings.twoFactor.enabled && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Método de autenticação</Label>
                      <Select value={settings.twoFactor.method} onValueChange={(value: any) => updateTwoFactorSettings("method", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="app">Aplicativo autenticador</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="email">E-mail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Códigos de backup</Label>
                      <Switch
                        checked={settings.twoFactor.backupCodes}
                        onCheckedChange={(checked) => updateTwoFactorSettings("backupCodes", checked)}
                      />
                    </div>
                    <Button onClick={handleEnable2FA} className="w-full">
                      Configurar 2FA
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="session" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Gerenciamento de Sessão
                </CardTitle>
                <CardDescription>
                  Configure o comportamento das sessões de usuário
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Timeout da sessão (minutos)</Label>
                  <Select value={settings.session.timeout.toString()} onValueChange={(value) => updateSessionSettings("timeout", parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                      <SelectItem value="480">8 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Máximo de sessões simultâneas</Label>
                  <Select value={settings.session.maxConcurrent.toString()} onValueChange={(value) => updateSessionSettings("maxConcurrent", parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 sessão</SelectItem>
                      <SelectItem value="2">2 sessões</SelectItem>
                      <SelectItem value="3">3 sessões</SelectItem>
                      <SelectItem value="5">5 sessões</SelectItem>
                      <SelectItem value="10">10 sessões</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Lembrar dispositivo</Label>
                  <Switch
                    checked={settings.session.rememberDevice}
                    onCheckedChange={(checked) => updateSessionSettings("rememberDevice", checked)}
                  />
                </div>
                {settings.session.rememberDevice && (
                  <div className="space-y-2">
                    <Label>Confiar no dispositivo por (dias)</Label>
                    <Select value={settings.session.deviceTrustDays.toString()} onValueChange={(value) => updateSessionSettings("deviceTrustDays", parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 dias</SelectItem>
                        <SelectItem value="15">15 dias</SelectItem>
                        <SelectItem value="30">30 dias</SelectItem>
                        <SelectItem value="90">90 dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Controle de Acesso
                </CardTitle>
                <CardDescription>
                  Configure restrições de acesso por localização e IP
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Lista branca de IPs</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir acesso apenas de IPs específicos
                    </p>
                  </div>
                  <Switch
                    checked={settings.access.ipWhitelist}
                    onCheckedChange={(checked) => updateAccessSettings("ipWhitelist", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Restrição geográfica</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir acesso apenas de países específicos
                    </p>
                  </div>
                  <Switch
                    checked={settings.access.geoRestriction}
                    onCheckedChange={(checked) => updateAccessSettings("geoRestriction", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Bloquear atividade suspeita</Label>
                  <Switch
                    checked={settings.access.blockSuspiciousActivity}
                    onCheckedChange={(checked) => updateAccessSettings("blockSuspiciousActivity", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Auditoria e Logs
                </CardTitle>
                <CardDescription>
                  Configure o registro de atividades do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Registrar logins</Label>
                  <Switch
                    checked={settings.audit.logLogins}
                    onCheckedChange={(checked) => updateAuditSettings("logLogins", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Registrar ações</Label>
                  <Switch
                    checked={settings.audit.logActions}
                    onCheckedChange={(checked) => updateAuditSettings("logActions", checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Retenção de logs (dias)</Label>
                  <Select value={settings.audit.retentionDays.toString()} onValueChange={(value) => updateAuditSettings("retentionDays", parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 dias</SelectItem>
                      <SelectItem value="90">90 dias</SelectItem>
                      <SelectItem value="180">180 dias</SelectItem>
                      <SelectItem value="365">1 ano</SelectItem>
                      <SelectItem value="730">2 anos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Alertar após tentativas falhadas</Label>
                  <Select value={settings.audit.alertFailedAttempts.toString()} onValueChange={(value) => updateAuditSettings("alertFailedAttempts", parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 tentativas</SelectItem>
                      <SelectItem value="5">5 tentativas</SelectItem>
                      <SelectItem value="10">10 tentativas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Atividade Recente
                </CardTitle>
                <CardDescription>
                  Visualize as tentativas de login recentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Dispositivo</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loginAttempts.map((attempt) => (
                      <TableRow key={attempt.id}>
                        <TableCell className="font-mono text-sm">
                          {attempt.timestamp}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {attempt.ip}
                        </TableCell>
                        <TableCell>{attempt.location}</TableCell>
                        <TableCell>{attempt.userAgent}</TableCell>
                        <TableCell>
                          <Badge className={attempt.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {attempt.success ? (
                              <><CheckCircle className="h-3 w-3 mr-1" />Sucesso</>
                            ) : (
                              <><AlertTriangle className="h-3 w-3 mr-1" />Falhou</>
                            )}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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