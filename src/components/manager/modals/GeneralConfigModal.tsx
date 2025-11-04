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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Settings, 
  Database, 
  Shield, 
  Clock, 
  HardDrive,
  Wifi,
  Mail,
  Bell,
  FileText,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Calendar,
  Users,
  Activity,
  Zap,
  Globe,
  Server,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface GeneralConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SystemConfig {
  general: {
    systemName: string;
    version: string;
    environment: "development" | "staging" | "production";
    timezone: string;
    language: string;
    dateFormat: string;
    currency: string;
    maintenanceMode: boolean;
    debugMode: boolean;
  };
  database: {
    host: string;
    port: number;
    name: string;
    maxConnections: number;
    connectionTimeout: number;
    backupFrequency: "daily" | "weekly" | "monthly";
    retentionDays: number;
  };
  performance: {
    cacheEnabled: boolean;
    cacheTTL: number;
    compressionEnabled: boolean;
    maxFileSize: number;
    sessionTimeout: number;
    rateLimitEnabled: boolean;
    maxRequestsPerMinute: number;
  };
  logging: {
    level: "error" | "warn" | "info" | "debug";
    maxFileSize: number;
    maxFiles: number;
    enableAuditLog: boolean;
    enablePerformanceLog: boolean;
    enableSecurityLog: boolean;
  };
  backup: {
    autoBackup: boolean;
    backupTime: string;
    backupLocation: string;
    compressionEnabled: boolean;
    encryptionEnabled: boolean;
    retentionDays: number;
  };
  integration: {
    apiEnabled: boolean;
    webhooksEnabled: boolean;
    ssoEnabled: boolean;
    ldapEnabled: boolean;
    emailServiceEnabled: boolean;
    smsServiceEnabled: boolean;
  };
}

const systemLogs = [
  { id: 1, timestamp: "2024-01-15 10:30:25", level: "INFO", message: "Sistema iniciado com sucesso", module: "System" },
  { id: 2, timestamp: "2024-01-15 10:25:12", level: "WARN", message: "Conexão com banco de dados lenta", module: "Database" },
  { id: 3, timestamp: "2024-01-15 10:20:45", level: "ERROR", message: "Falha na autenticação do usuário", module: "Auth" },
  { id: 4, timestamp: "2024-01-15 10:15:30", level: "INFO", message: "Backup automático concluído", module: "Backup" },
  { id: 5, timestamp: "2024-01-15 10:10:15", level: "DEBUG", message: "Cache limpo automaticamente", module: "Cache" }
];

const systemStats = {
  uptime: "15 dias, 8 horas",
  cpuUsage: 45,
  memoryUsage: 68,
  diskUsage: 32,
  activeUsers: 127,
  totalRequests: 45678,
  errorRate: 0.2
};

export const GeneralConfigModal = ({ open, onOpenChange }: GeneralConfigModalProps) => {
  const [config, setConfig] = useState<SystemConfig>({
    general: {
      systemName: "Facility Management System",
      version: "1.2.3",
      environment: "production",
      timezone: "America/Sao_Paulo",
      language: "pt-BR",
      dateFormat: "DD/MM/YYYY",
      currency: "BRL",
      maintenanceMode: false,
      debugMode: false
    },
    database: {
      host: "localhost",
      port: 5432,
      name: "facility_db",
      maxConnections: 100,
      connectionTimeout: 30,
      backupFrequency: "daily",
      retentionDays: 30
    },
    performance: {
      cacheEnabled: true,
      cacheTTL: 3600,
      compressionEnabled: true,
      maxFileSize: 10,
      sessionTimeout: 1800,
      rateLimitEnabled: true,
      maxRequestsPerMinute: 1000
    },
    logging: {
      level: "info",
      maxFileSize: 100,
      maxFiles: 10,
      enableAuditLog: true,
      enablePerformanceLog: true,
      enableSecurityLog: true
    },
    backup: {
      autoBackup: true,
      backupTime: "02:00",
      backupLocation: "/backups",
      compressionEnabled: true,
      encryptionEnabled: true,
      retentionDays: 90
    },
    integration: {
      apiEnabled: true,
      webhooksEnabled: true,
      ssoEnabled: false,
      ldapEnabled: false,
      emailServiceEnabled: true,
      smsServiceEnabled: true
    }
  });

  const [showDatabasePassword, setShowDatabasePassword] = useState(false);

  const updateGeneralConfig = (key: keyof typeof config.general, value: any) => {
    setConfig(prev => ({
      ...prev,
      general: { ...prev.general, [key]: value }
    }));
  };

  const updateDatabaseConfig = (key: keyof typeof config.database, value: any) => {
    setConfig(prev => ({
      ...prev,
      database: { ...prev.database, [key]: value }
    }));
  };

  const updatePerformanceConfig = (key: keyof typeof config.performance, value: any) => {
    setConfig(prev => ({
      ...prev,
      performance: { ...prev.performance, [key]: value }
    }));
  };

  const updateLoggingConfig = (key: keyof typeof config.logging, value: any) => {
    setConfig(prev => ({
      ...prev,
      logging: { ...prev.logging, [key]: value }
    }));
  };

  const updateBackupConfig = (key: keyof typeof config.backup, value: any) => {
    setConfig(prev => ({
      ...prev,
      backup: { ...prev.backup, [key]: value }
    }));
  };

  const updateIntegrationConfig = (key: keyof typeof config.integration, value: any) => {
    setConfig(prev => ({
      ...prev,
      integration: { ...prev.integration, [key]: value }
    }));
  };

  const handleSaveConfig = () => {
    console.log("Salvando configurações gerais:", config);
  };

  const handleTestConnection = () => {
    console.log("Testando conexão com banco de dados...");
  };

  const handleBackupNow = () => {
    console.log("Iniciando backup manual...");
  };

  const handleClearCache = () => {
    console.log("Limpando cache do sistema...");
  };

  const handleRestartSystem = () => {
    console.log("Reiniciando sistema...");
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "ERROR": return "destructive";
      case "WARN": return "secondary";
      case "INFO": return "default";
      case "DEBUG": return "outline";
      default: return "default";
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "ERROR": return <XCircle className="h-4 w-4 text-red-500" />;
      case "WARN": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "INFO": return <Info className="h-4 w-4 text-blue-500" />;
      case "DEBUG": return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            Configurações Gerais do Sistema
          </DialogTitle>
          <DialogDescription>
            Configure parâmetros gerais, banco de dados, performance e integrações do sistema.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="database">Banco</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="logging">Logs</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
            <TabsTrigger value="integration">Integração</TabsTrigger>
            <TabsTrigger value="monitoring">Monitor</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Informações do Sistema
                  </CardTitle>
                  <CardDescription>
                    Configurações básicas do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome do Sistema</Label>
                    <Input
                      value={config.general.systemName}
                      onChange={(e) => updateGeneralConfig("systemName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Versão</Label>
                    <Input
                      value={config.general.version}
                      onChange={(e) => updateGeneralConfig("version", e.target.value)}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ambiente</Label>
                    <Select value={config.general.environment} onValueChange={(value: any) => updateGeneralConfig("environment", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Desenvolvimento</SelectItem>
                        <SelectItem value="staging">Homologação</SelectItem>
                        <SelectItem value="production">Produção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fuso Horário</Label>
                    <Select value={config.general.timezone} onValueChange={(value) => updateGeneralConfig("timezone", value)}>
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Localização e Formato
                  </CardTitle>
                  <CardDescription>
                    Configurações de idioma e formato
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Idioma</Label>
                    <Select value={config.general.language} onValueChange={(value) => updateGeneralConfig("language", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es-ES">Español</SelectItem>
                        <SelectItem value="fr-FR">Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Formato de Data</Label>
                    <Select value={config.general.dateFormat} onValueChange={(value) => updateGeneralConfig("dateFormat", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Moeda</Label>
                    <Select value={config.general.currency} onValueChange={(value) => updateGeneralConfig("currency", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">Real (R$)</SelectItem>
                        <SelectItem value="USD">Dólar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Modo de Manutenção</Label>
                    <Switch
                      checked={config.general.maintenanceMode}
                      onCheckedChange={(checked) => updateGeneralConfig("maintenanceMode", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Modo Debug</Label>
                    <Switch
                      checked={config.general.debugMode}
                      onCheckedChange={(checked) => updateGeneralConfig("debugMode", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="database" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Configurações do Banco de Dados
                </CardTitle>
                <CardDescription>
                  Configure a conexão e parâmetros do banco de dados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Host</Label>
                    <Input
                      value={config.database.host}
                      onChange={(e) => updateDatabaseConfig("host", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Porta</Label>
                    <Input
                      type="number"
                      value={config.database.port}
                      onChange={(e) => updateDatabaseConfig("port", parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome do Banco</Label>
                    <Input
                      value={config.database.name}
                      onChange={(e) => updateDatabaseConfig("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Senha</Label>
                    <div className="relative">
                      <Input
                        type={showDatabasePassword ? "text" : "password"}
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowDatabasePassword(!showDatabasePassword)}
                      >
                        {showDatabasePassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Máximo de Conexões</Label>
                    <Input
                      type="number"
                      value={config.database.maxConnections}
                      onChange={(e) => updateDatabaseConfig("maxConnections", parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Timeout de Conexão (s)</Label>
                    <Input
                      type="number"
                      value={config.database.connectionTimeout}
                      onChange={(e) => updateDatabaseConfig("connectionTimeout", parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Frequência de Backup</Label>
                    <Select value={config.database.backupFrequency} onValueChange={(value: any) => updateDatabaseConfig("backupFrequency", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Retenção (dias)</Label>
                    <Input
                      type="number"
                      value={config.database.retentionDays}
                      onChange={(e) => updateDatabaseConfig("retentionDays", parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleTestConnection} variant="outline">
                    Testar Conexão
                  </Button>
                  <Button onClick={handleBackupNow} variant="outline">
                    Backup Agora
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Cache e Compressão
                  </CardTitle>
                  <CardDescription>
                    Configurações de performance e otimização
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Cache Habilitado</Label>
                    <Switch
                      checked={config.performance.cacheEnabled}
                      onCheckedChange={(checked) => updatePerformanceConfig("cacheEnabled", checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>TTL do Cache (segundos)</Label>
                    <Input
                      type="number"
                      value={config.performance.cacheTTL}
                      onChange={(e) => updatePerformanceConfig("cacheTTL", parseInt(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Compressão Habilitada</Label>
                    <Switch
                      checked={config.performance.compressionEnabled}
                      onCheckedChange={(checked) => updatePerformanceConfig("compressionEnabled", checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tamanho Máximo de Arquivo (MB)</Label>
                    <Input
                      type="number"
                      value={config.performance.maxFileSize}
                      onChange={(e) => updatePerformanceConfig("maxFileSize", parseInt(e.target.value))}
                    />
                  </div>
                  <Button onClick={handleClearCache} variant="outline" className="w-full">
                    Limpar Cache
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Sessão e Rate Limiting
                  </CardTitle>
                  <CardDescription>
                    Configurações de sessão e limitação de requisições
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Timeout de Sessão (segundos)</Label>
                    <Input
                      type="number"
                      value={config.performance.sessionTimeout}
                      onChange={(e) => updatePerformanceConfig("sessionTimeout", parseInt(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Rate Limiting Habilitado</Label>
                    <Switch
                      checked={config.performance.rateLimitEnabled}
                      onCheckedChange={(checked) => updatePerformanceConfig("rateLimitEnabled", checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Máx. Requisições/Minuto</Label>
                    <Input
                      type="number"
                      value={config.performance.maxRequestsPerMinute}
                      onChange={(e) => updatePerformanceConfig("maxRequestsPerMinute", parseInt(e.target.value))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logging" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Configurações de Log
                  </CardTitle>
                  <CardDescription>
                    Configure o sistema de logs e auditoria
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nível de Log</Label>
                    <Select value={config.logging.level} onValueChange={(value: any) => updateLoggingConfig("level", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="warn">Warning</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="debug">Debug</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tamanho Máximo do Arquivo (MB)</Label>
                    <Input
                      type="number"
                      value={config.logging.maxFileSize}
                      onChange={(e) => updateLoggingConfig("maxFileSize", parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Máximo de Arquivos</Label>
                    <Input
                      type="number"
                      value={config.logging.maxFiles}
                      onChange={(e) => updateLoggingConfig("maxFiles", parseInt(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Log de Auditoria</Label>
                    <Switch
                      checked={config.logging.enableAuditLog}
                      onCheckedChange={(checked) => updateLoggingConfig("enableAuditLog", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Log de Performance</Label>
                    <Switch
                      checked={config.logging.enablePerformanceLog}
                      onCheckedChange={(checked) => updateLoggingConfig("enablePerformanceLog", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Log de Segurança</Label>
                    <Switch
                      checked={config.logging.enableSecurityLog}
                      onCheckedChange={(checked) => updateLoggingConfig("enableSecurityLog", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Logs Recentes</CardTitle>
                  <CardDescription>
                    Últimas entradas do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {systemLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-2 p-2 rounded-lg border">
                        {getLevelIcon(log.level)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant={getLevelBadgeColor(log.level) as any} className="text-xs">
                              {log.level}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{log.module}</span>
                          </div>
                          <p className="text-sm mt-1">{log.message}</p>
                          <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="backup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  Configurações de Backup
                </CardTitle>
                <CardDescription>
                  Configure backups automáticos e manuais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between">
                    <Label>Backup Automático</Label>
                    <Switch
                      checked={config.backup.autoBackup}
                      onCheckedChange={(checked) => updateBackupConfig("autoBackup", checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Horário do Backup</Label>
                    <Input
                      type="time"
                      value={config.backup.backupTime}
                      onChange={(e) => updateBackupConfig("backupTime", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Local do Backup</Label>
                    <Input
                      value={config.backup.backupLocation}
                      onChange={(e) => updateBackupConfig("backupLocation", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Retenção (dias)</Label>
                    <Input
                      type="number"
                      value={config.backup.retentionDays}
                      onChange={(e) => updateBackupConfig("retentionDays", parseInt(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Compressão</Label>
                    <Switch
                      checked={config.backup.compressionEnabled}
                      onCheckedChange={(checked) => updateBackupConfig("compressionEnabled", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Criptografia</Label>
                    <Switch
                      checked={config.backup.encryptionEnabled}
                      onCheckedChange={(checked) => updateBackupConfig("encryptionEnabled", checked)}
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleBackupNow}>
                    <Download className="h-4 w-4 mr-2" />
                    Backup Agora
                  </Button>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Restaurar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integration" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  Integrações e Serviços
                </CardTitle>
                <CardDescription>
                  Configure integrações com serviços externos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>API Externa</Label>
                      <p className="text-sm text-muted-foreground">Habilita acesso via API REST</p>
                    </div>
                    <Switch
                      checked={config.integration.apiEnabled}
                      onCheckedChange={(checked) => updateIntegrationConfig("apiEnabled", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Webhooks</Label>
                      <p className="text-sm text-muted-foreground">Notificações automáticas</p>
                    </div>
                    <Switch
                      checked={config.integration.webhooksEnabled}
                      onCheckedChange={(checked) => updateIntegrationConfig("webhooksEnabled", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Single Sign-On (SSO)</Label>
                      <p className="text-sm text-muted-foreground">Autenticação única</p>
                    </div>
                    <Switch
                      checked={config.integration.ssoEnabled}
                      onCheckedChange={(checked) => updateIntegrationConfig("ssoEnabled", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>LDAP/Active Directory</Label>
                      <p className="text-sm text-muted-foreground">Integração com diretório</p>
                    </div>
                    <Switch
                      checked={config.integration.ldapEnabled}
                      onCheckedChange={(checked) => updateIntegrationConfig("ldapEnabled", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Serviço de E-mail</Label>
                      <p className="text-sm text-muted-foreground">Envio de notificações</p>
                    </div>
                    <Switch
                      checked={config.integration.emailServiceEnabled}
                      onCheckedChange={(checked) => updateIntegrationConfig("emailServiceEnabled", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Serviço de SMS</Label>
                      <p className="text-sm text-muted-foreground">Notificações por SMS</p>
                    </div>
                    <Switch
                      checked={config.integration.smsServiceEnabled}
                      onCheckedChange={(checked) => updateIntegrationConfig("smsServiceEnabled", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Status do Sistema
                  </CardTitle>
                  <CardDescription>
                    Monitoramento em tempo real
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uso de CPU</span>
                      <span>{systemStats.cpuUsage}%</span>
                    </div>
                    <Progress value={systemStats.cpuUsage} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uso de Memória</span>
                      <span>{systemStats.memoryUsage}%</span>
                    </div>
                    <Progress value={systemStats.memoryUsage} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uso de Disco</span>
                      <span>{systemStats.diskUsage}%</span>
                    </div>
                    <Progress value={systemStats.diskUsage} className="h-2" />
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Uptime</p>
                      <p className="font-medium">{systemStats.uptime}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Usuários Ativos</p>
                      <p className="font-medium">{systemStats.activeUsers}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Requisições</p>
                      <p className="font-medium">{systemStats.totalRequests.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Taxa de Erro</p>
                      <p className="font-medium">{systemStats.errorRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    Ações do Sistema
                  </CardTitle>
                  <CardDescription>
                    Operações de manutenção
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={handleRestartSystem} variant="outline" className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reiniciar Sistema
                  </Button>
                  <Button onClick={handleClearCache} variant="outline" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar Cache
                  </Button>
                  <Button onClick={handleBackupNow} variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Backup Manual
                  </Button>
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar Logs
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSaveConfig} className="bg-blue-600 hover:bg-blue-700">
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};