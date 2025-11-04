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
  Palette, 
  Monitor, 
  Sun, 
  Moon, 
  Layout, 
  Type,
  Image,
  Settings,
  Eye,
  Sliders,
  Upload,
  Download,
  RotateCcw,
  Smartphone,
  Tablet,
  Laptop
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface PersonalizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PersonalizationSettings {
  theme: {
    mode: "light" | "dark" | "system";
    primaryColor: string;
    accentColor: string;
    customColors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      surface: string;
    };
  };
  layout: {
    sidebarCollapsed: boolean;
    compactMode: boolean;
    showBreadcrumbs: boolean;
    showQuickActions: boolean;
    cardSpacing: "tight" | "normal" | "relaxed";
    gridColumns: number;
  };
  typography: {
    fontFamily: string;
    fontSize: "small" | "medium" | "large";
    fontWeight: "normal" | "medium" | "semibold";
    lineHeight: "tight" | "normal" | "relaxed";
  };
  dashboard: {
    showWelcomeMessage: boolean;
    showQuickStats: boolean;
    showRecentActivity: boolean;
    showNotifications: boolean;
    defaultView: "grid" | "list" | "cards";
    itemsPerPage: number;
  };
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    largeText: boolean;
    focusIndicators: boolean;
    screenReader: boolean;
  };
}

const colorPresets = [
  { name: "Roxo", value: "#8B5CF6", class: "bg-purple-500" },
  { name: "Azul", value: "#3B82F6", class: "bg-blue-500" },
  { name: "Verde", value: "#10B981", class: "bg-green-500" },
  { name: "Vermelho", value: "#EF4444", class: "bg-red-500" },
  { name: "Laranja", value: "#F97316", class: "bg-orange-500" },
  { name: "Rosa", value: "#EC4899", class: "bg-pink-500" },
  { name: "Índigo", value: "#6366F1", class: "bg-indigo-500" },
  { name: "Teal", value: "#14B8A6", class: "bg-teal-500" }
];

const fontFamilies = [
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Roboto", value: "Roboto, sans-serif" },
  { name: "Open Sans", value: "Open Sans, sans-serif" },
  { name: "Lato", value: "Lato, sans-serif" },
  { name: "Poppins", value: "Poppins, sans-serif" },
  { name: "Nunito", value: "Nunito, sans-serif" }
];

export const PersonalizationModal = ({ open, onOpenChange }: PersonalizationModalProps) => {
  const [settings, setSettings] = useState<PersonalizationSettings>({
    theme: {
      mode: "light",
      primaryColor: "#8B5CF6",
      accentColor: "#3B82F6",
      customColors: {
        primary: "#8B5CF6",
        secondary: "#64748B",
        accent: "#3B82F6",
        background: "#FFFFFF",
        surface: "#F8FAFC"
      }
    },
    layout: {
      sidebarCollapsed: false,
      compactMode: false,
      showBreadcrumbs: true,
      showQuickActions: true,
      cardSpacing: "normal",
      gridColumns: 3
    },
    typography: {
      fontFamily: "Inter, sans-serif",
      fontSize: "medium",
      fontWeight: "normal",
      lineHeight: "normal"
    },
    dashboard: {
      showWelcomeMessage: true,
      showQuickStats: true,
      showRecentActivity: true,
      showNotifications: true,
      defaultView: "cards",
      itemsPerPage: 10
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      largeText: false,
      focusIndicators: true,
      screenReader: false
    }
  });

  const updateThemeSettings = (key: keyof typeof settings.theme, value: any) => {
    setSettings(prev => ({
      ...prev,
      theme: { ...prev.theme, [key]: value }
    }));
  };

  const updateLayoutSettings = (key: keyof typeof settings.layout, value: any) => {
    setSettings(prev => ({
      ...prev,
      layout: { ...prev.layout, [key]: value }
    }));
  };

  const updateTypographySettings = (key: keyof typeof settings.typography, value: any) => {
    setSettings(prev => ({
      ...prev,
      typography: { ...prev.typography, [key]: value }
    }));
  };

  const updateDashboardSettings = (key: keyof typeof settings.dashboard, value: any) => {
    setSettings(prev => ({
      ...prev,
      dashboard: { ...prev.dashboard, [key]: value }
    }));
  };

  const updateAccessibilitySettings = (key: keyof typeof settings.accessibility, value: any) => {
    setSettings(prev => ({
      ...prev,
      accessibility: { ...prev.accessibility, [key]: value }
    }));
  };

  const updateCustomColor = (key: keyof typeof settings.theme.customColors, value: string) => {
    setSettings(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        customColors: { ...prev.theme.customColors, [key]: value }
      }
    }));
  };

  const handleSaveSettings = () => {
    // Aqui implementaria a lógica de salvar configurações
    console.log("Salvando configurações de personalização:", settings);
  };

  const handleResetToDefault = () => {
    // Aqui implementaria a lógica de resetar para padrão
    console.log("Resetando para configurações padrão");
  };

  const handleExportSettings = () => {
    // Aqui implementaria a lógica de exportar configurações
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'facility-personalization.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setSettings(importedSettings);
        } catch (error) {
          console.error("Erro ao importar configurações:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-purple-600" />
            Personalização
          </DialogTitle>
          <DialogDescription>
            Customize a aparência e comportamento do sistema conforme suas preferências.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="theme" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="theme">Tema</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="typography">Tipografia</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="accessibility">Acessibilidade</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
          </TabsList>

          <TabsContent value="theme" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Modo de Tema
                  </CardTitle>
                  <CardDescription>
                    Escolha entre tema claro, escuro ou automático
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={settings.theme.mode === "light" ? "default" : "outline"}
                      onClick={() => updateThemeSettings("mode", "light")}
                      className="flex flex-col items-center gap-2 h-auto py-4"
                    >
                      <Sun className="h-4 w-4" />
                      Claro
                    </Button>
                    <Button
                      variant={settings.theme.mode === "dark" ? "default" : "outline"}
                      onClick={() => updateThemeSettings("mode", "dark")}
                      className="flex flex-col items-center gap-2 h-auto py-4"
                    >
                      <Moon className="h-4 w-4" />
                      Escuro
                    </Button>
                    <Button
                      variant={settings.theme.mode === "system" ? "default" : "outline"}
                      onClick={() => updateThemeSettings("mode", "system")}
                      className="flex flex-col items-center gap-2 h-auto py-4"
                    >
                      <Monitor className="h-4 w-4" />
                      Sistema
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Cores do Tema
                  </CardTitle>
                  <CardDescription>
                    Personalize as cores principais do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Cor primária</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {colorPresets.map((color) => (
                        <Button
                          key={color.value}
                          variant="outline"
                          className={`h-10 w-full ${color.class} ${
                            settings.theme.primaryColor === color.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                          }`}
                          onClick={() => updateThemeSettings("primaryColor", color.value)}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Cor de destaque</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {colorPresets.map((color) => (
                        <Button
                          key={color.value}
                          variant="outline"
                          className={`h-10 w-full ${color.class} ${
                            settings.theme.accentColor === color.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                          }`}
                          onClick={() => updateThemeSettings("accentColor", color.value)}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Cores Personalizadas</CardTitle>
                <CardDescription>
                  Defina cores específicas para elementos da interface
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label>Primária</Label>
                    <Input
                      type="color"
                      value={settings.theme.customColors.primary}
                      onChange={(e) => updateCustomColor("primary", e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Secundária</Label>
                    <Input
                      type="color"
                      value={settings.theme.customColors.secondary}
                      onChange={(e) => updateCustomColor("secondary", e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Destaque</Label>
                    <Input
                      type="color"
                      value={settings.theme.customColors.accent}
                      onChange={(e) => updateCustomColor("accent", e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fundo</Label>
                    <Input
                      type="color"
                      value={settings.theme.customColors.background}
                      onChange={(e) => updateCustomColor("background", e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Superfície</Label>
                    <Input
                      type="color"
                      value={settings.theme.customColors.surface}
                      onChange={(e) => updateCustomColor("surface", e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="h-4 w-4" />
                    Configurações de Layout
                  </CardTitle>
                  <CardDescription>
                    Ajuste a disposição dos elementos na tela
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Sidebar recolhida</Label>
                    <Switch
                      checked={settings.layout.sidebarCollapsed}
                      onCheckedChange={(checked) => updateLayoutSettings("sidebarCollapsed", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Modo compacto</Label>
                    <Switch
                      checked={settings.layout.compactMode}
                      onCheckedChange={(checked) => updateLayoutSettings("compactMode", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Mostrar breadcrumbs</Label>
                    <Switch
                      checked={settings.layout.showBreadcrumbs}
                      onCheckedChange={(checked) => updateLayoutSettings("showBreadcrumbs", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Ações rápidas</Label>
                    <Switch
                      checked={settings.layout.showQuickActions}
                      onCheckedChange={(checked) => updateLayoutSettings("showQuickActions", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sliders className="h-4 w-4" />
                    Espaçamento e Grid
                  </CardTitle>
                  <CardDescription>
                    Configure o espaçamento entre elementos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Espaçamento dos cards</Label>
                    <Select value={settings.layout.cardSpacing} onValueChange={(value: any) => updateLayoutSettings("cardSpacing", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tight">Compacto</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="relaxed">Espaçoso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Colunas do grid: {settings.layout.gridColumns}</Label>
                    <Input
                      type="range"
                      min="2"
                      max="6"
                      value={settings.layout.gridColumns}
                      onChange={(e) => updateLayoutSettings("gridColumns", parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="typography" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Configurações de Tipografia
                </CardTitle>
                <CardDescription>
                  Personalize a aparência do texto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Família da fonte</Label>
                    <Select value={settings.typography.fontFamily} onValueChange={(value) => updateTypographySettings("fontFamily", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontFamilies.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tamanho da fonte</Label>
                    <Select value={settings.typography.fontSize} onValueChange={(value: any) => updateTypographySettings("fontSize", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Pequeno</SelectItem>
                        <SelectItem value="medium">Médio</SelectItem>
                        <SelectItem value="large">Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Peso da fonte</Label>
                    <Select value={settings.typography.fontWeight} onValueChange={(value: any) => updateTypographySettings("fontWeight", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="medium">Médio</SelectItem>
                        <SelectItem value="semibold">Semi-negrito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Altura da linha</Label>
                    <Select value={settings.typography.lineHeight} onValueChange={(value: any) => updateTypographySettings("lineHeight", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tight">Compacta</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="relaxed">Espaçosa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-gray-50 border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Prévia do Texto</h4>
                  <div 
                    style={{
                      fontFamily: settings.typography.fontFamily,
                      fontSize: settings.typography.fontSize === 'small' ? '14px' : settings.typography.fontSize === 'large' ? '18px' : '16px',
                      fontWeight: settings.typography.fontWeight === 'normal' ? 400 : settings.typography.fontWeight === 'medium' ? 500 : 600,
                      lineHeight: settings.typography.lineHeight === 'tight' ? 1.25 : settings.typography.lineHeight === 'relaxed' ? 1.75 : 1.5
                    }}
                  >
                    <p>Este é um exemplo de como o texto aparecerá com suas configurações.</p>
                    <p className="text-sm text-gray-600 mt-2">Texto secundário em tamanho menor.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Elementos Visíveis
                  </CardTitle>
                  <CardDescription>
                    Escolha quais elementos mostrar no dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Mensagem de boas-vindas</Label>
                    <Switch
                      checked={settings.dashboard.showWelcomeMessage}
                      onCheckedChange={(checked) => updateDashboardSettings("showWelcomeMessage", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Estatísticas rápidas</Label>
                    <Switch
                      checked={settings.dashboard.showQuickStats}
                      onCheckedChange={(checked) => updateDashboardSettings("showQuickStats", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Atividade recente</Label>
                    <Switch
                      checked={settings.dashboard.showRecentActivity}
                      onCheckedChange={(checked) => updateDashboardSettings("showRecentActivity", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Notificações</Label>
                    <Switch
                      checked={settings.dashboard.showNotifications}
                      onCheckedChange={(checked) => updateDashboardSettings("showNotifications", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Configurações de Exibição
                  </CardTitle>
                  <CardDescription>
                    Configure como os dados são apresentados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Visualização padrão</Label>
                    <Select value={settings.dashboard.defaultView} onValueChange={(value: any) => updateDashboardSettings("defaultView", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">Grade</SelectItem>
                        <SelectItem value="list">Lista</SelectItem>
                        <SelectItem value="cards">Cards</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Itens por página</Label>
                    <Select value={settings.dashboard.itemsPerPage.toString()} onValueChange={(value) => updateDashboardSettings("itemsPerPage", parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 itens</SelectItem>
                        <SelectItem value="10">10 itens</SelectItem>
                        <SelectItem value="20">20 itens</SelectItem>
                        <SelectItem value="50">50 itens</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="accessibility" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Acessibilidade
                </CardTitle>
                <CardDescription>
                  Configure opções para melhorar a acessibilidade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Alto contraste</Label>
                    <p className="text-sm text-muted-foreground">
                      Aumenta o contraste para melhor visibilidade
                    </p>
                  </div>
                  <Switch
                    checked={settings.accessibility.highContrast}
                    onCheckedChange={(checked) => updateAccessibilitySettings("highContrast", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Reduzir movimento</Label>
                    <p className="text-sm text-muted-foreground">
                      Minimiza animações e transições
                    </p>
                  </div>
                  <Switch
                    checked={settings.accessibility.reducedMotion}
                    onCheckedChange={(checked) => updateAccessibilitySettings("reducedMotion", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Texto grande</Label>
                    <p className="text-sm text-muted-foreground">
                      Aumenta o tamanho do texto em toda a interface
                    </p>
                  </div>
                  <Switch
                    checked={settings.accessibility.largeText}
                    onCheckedChange={(checked) => updateAccessibilitySettings("largeText", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Indicadores de foco</Label>
                    <p className="text-sm text-muted-foreground">
                      Destaca elementos focados para navegação por teclado
                    </p>
                  </div>
                  <Switch
                    checked={settings.accessibility.focusIndicators}
                    onCheckedChange={(checked) => updateAccessibilitySettings("focusIndicators", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Suporte a leitor de tela</Label>
                    <p className="text-sm text-muted-foreground">
                      Otimiza a interface para leitores de tela
                    </p>
                  </div>
                  <Switch
                    checked={settings.accessibility.screenReader}
                    onCheckedChange={(checked) => updateAccessibilitySettings("screenReader", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Backup e Restauração
                </CardTitle>
                <CardDescription>
                  Faça backup ou restaure suas configurações de personalização
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Button onClick={handleExportSettings} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Exportar Configurações
                  </Button>
                  <div>
                    <Input
                      type="file"
                      accept=".json"
                      onChange={handleImportSettings}
                      className="hidden"
                      id="import-settings"
                    />
                    <Button asChild variant="outline" className="w-full">
                      <Label htmlFor="import-settings" className="flex items-center gap-2 cursor-pointer">
                        <Upload className="h-4 w-4" />
                        Importar Configurações
                      </Label>
                    </Button>
                  </div>
                  <Button onClick={handleResetToDefault} variant="destructive" className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Resetar Padrão
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Configurações Atuais</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Tema:</span>
                      <Badge variant="outline">{settings.theme.mode}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Fonte:</span>
                      <Badge variant="outline">{settings.typography.fontFamily.split(',')[0]}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Layout:</span>
                      <Badge variant="outline">{settings.layout.compactMode ? 'Compacto' : 'Normal'}</Badge>
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