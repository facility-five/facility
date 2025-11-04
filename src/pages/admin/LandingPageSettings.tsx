import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, Image, Settings, MessageSquare, Users, Star, Save, Eye, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { createLandingPageTable, checkLandingPageTableExists } from "@/utils/createLandingPageTable";

// Tipos para as configurações
interface Feature {
  title: string;
  description: string;
  enabled: boolean;
}

interface Testimonial {
  name: string;
  role: string;
  building: string;
  rating: number;
  content: string;
  enabled: boolean;
}

interface LandingPageConfig {
  hero_title: string;
  hero_subtitle: string;
  hero_cta_text: string;
  hero_main_image_url?: string;
  hero_secondary_image_url?: string;
  features: Feature[];
  testimonials: Testimonial[];
  is_active: boolean;
  maintenance_mode: boolean;
  contact_email: string;
  contact_phone: string;
  meta_title: string;
  meta_description: string;
}

const LandingPageSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<LandingPageConfig>({
    hero_title: "Gestão Inteligente para Condomínios",
    hero_subtitle: "Simplifique a administração do seu condomínio com nossa plataforma completa de gestão.",
    hero_cta_text: "Começar Agora",
    features: [
      { title: "Comunicação Interna", description: "Sistema completo de comunicação entre moradores e administração", enabled: true },
      { title: "Gestão Financeira", description: "Controle total de receitas, despesas e relatórios financeiros", enabled: true },
      { title: "Controle de Demandas", description: "Gerenciamento eficiente de solicitações e manutenções", enabled: true },
      { title: "Acesso de Moradores", description: "Portal exclusivo para moradores com funcionalidades personalizadas", enabled: true },
      { title: "Painel Administrativo", description: "Dashboard completo com todas as informações em tempo real", enabled: true }
    ],
    testimonials: [
      { name: "Maria Silva", role: "Síndica", building: "Residencial Jardim das Flores", rating: 5, content: "Excelente plataforma! Revolucionou a gestão do nosso condomínio.", enabled: true },
      { name: "João Santos", role: "Administrador", building: "Condomínio Vista Alegre", rating: 5, content: "Excelente plataforma! Revolucionou a gestão do nosso condomínio.", enabled: true },
      { name: "Ana Costa", role: "Moradora", building: "Edifício Central Park", rating: 5, content: "Excelente plataforma! Revolucionou a gestão do nosso condomínio.", enabled: true }
    ],
    is_active: true,
    maintenance_mode: false,
    contact_email: "contato@facility.com",
    contact_phone: "+55 (11) 99999-9999",
    meta_title: "Facility - Gestão Inteligente para Condomínios",
    meta_description: "Simplifique a administração do seu condomínio com nossa plataforma completa de gestão."
  });

  // Salvar configurações no banco de dados
  const saveConfig = useCallback(async (configToSave = config, showToast = true) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('landing_page_settings')
        .upsert({
          id: 1,
          hero_title: configToSave.hero_title,
          hero_subtitle: configToSave.hero_subtitle,
          hero_cta_text: configToSave.hero_cta_text,
          hero_main_image_url: configToSave.hero_main_image_url,
          hero_secondary_image_url: configToSave.hero_secondary_image_url,
          features: configToSave.features,
          testimonials: configToSave.testimonials,
          is_active: configToSave.is_active,
          maintenance_mode: configToSave.maintenance_mode,
          contact_email: configToSave.contact_email,
          contact_phone: configToSave.contact_phone,
          meta_title: configToSave.meta_title,
          meta_description: configToSave.meta_description,
        });

      if (error) {
        console.error('Erro ao salvar configurações:', error);
        if (showToast) {
          toast({
            title: "Erro",
            description: "Erro ao salvar configurações: " + error.message,
            variant: "destructive",
          });
        }
      } else {
        if (showToast) {
          toast({
            title: "Sucesso",
            description: "Configurações salvas com sucesso!",
          });
        }
      }
    } catch (error) {
      console.error('Erro inesperado ao salvar configurações:', error);
      if (showToast) {
        toast({
          title: "Erro",
          description: "Erro inesperado ao salvar configurações.",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  }, [config, toast]);

  // Carregar configurações do banco de dados
  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const tableExists = await checkLandingPageTableExists();
      if (!tableExists) {
        console.log("Tabela não existe, criando...");
        const createResult = await createLandingPageTable();
        if (!createResult.success) {
          toast({
            title: "Erro",
            description: "Erro ao criar tabela de configurações. Usando valores padrão.",
            variant: "destructive",
          });
          return;
        }
      }

      const { data, error } = await supabase
        .from('landing_page_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('Erro ao carregar configurações:', error);
        if (error.code === 'PGRST116') {
          await saveConfig(config, false);
        } else {
          toast({
            title: "Erro",
            description: "Erro ao carregar configurações. Usando valores padrão.",
            variant: "destructive",
          });
        }
      } else if (data) {
        setConfig({
          hero_title: data.hero_title || config.hero_title,
          hero_subtitle: data.hero_subtitle || config.hero_subtitle,
          hero_cta_text: data.hero_cta_text || config.hero_cta_text,
          hero_main_image_url: data.hero_main_image_url,
          hero_secondary_image_url: data.hero_secondary_image_url,
          features: data.features || config.features,
          testimonials: data.testimonials || config.testimonials,
          is_active: data.is_active ?? config.is_active,
          maintenance_mode: data.maintenance_mode ?? config.maintenance_mode,
          contact_email: data.contact_email || config.contact_email,
          contact_phone: data.contact_phone || config.contact_phone,
          meta_title: data.meta_title || config.meta_title,
          meta_description: data.meta_description || config.meta_description,
        });
      }
    } catch (error) {
      console.error('Erro inesperado ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [config, toast, saveConfig]);


  // Atualizar funcionalidade
  const updateFeature = (index: number, field: keyof Feature, value: any) => {
    const newFeatures = [...config.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setConfig({ ...config, features: newFeatures });
  };

  // Atualizar depoimento
  const updateTestimonial = (index: number, field: keyof Testimonial, value: any) => {
    const newTestimonials = [...config.testimonials];
    newTestimonials[index] = { ...newTestimonials[index], [field]: value };
    setConfig({ ...config, testimonials: newTestimonials });
  };

  // Carregar configurações ao montar o componente
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configuração da Landing Page</h1>
            <p className="text-admin-foreground-muted">
              Configure o conteúdo e aparência da página inicial
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Visualizar
            </Button>
            <Button 
              onClick={() => saveConfig()} 
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hero">Seção Hero</TabsTrigger>
            <TabsTrigger value="features">Funcionalidades</TabsTrigger>
            <TabsTrigger value="testimonials">Depoimentos</TabsTrigger>
            <TabsTrigger value="general">Geral</TabsTrigger>
          </TabsList>

          <TabsContent value="hero" className="space-y-6">
            <Card className="bg-admin-card border-admin-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Seção Principal (Hero)
                </CardTitle>
                <CardDescription>
                  Configure o título, subtítulo e call-to-action da seção principal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="hero-title">Título Principal</Label>
                  <Input 
                    id="hero-title" 
                    value={config.hero_title}
                    onChange={(e) => setConfig({ ...config, hero_title: e.target.value })}
                    placeholder="Gestão Inteligente para Condomínios" 
                  />
                </div>
                <div>
                  <Label htmlFor="hero-subtitle">Subtítulo</Label>
                  <Textarea 
                    id="hero-subtitle" 
                    value={config.hero_subtitle}
                    onChange={(e) => setConfig({ ...config, hero_subtitle: e.target.value })}
                    placeholder="Simplifique a administração do seu condomínio com nossa plataforma completa de gestão."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="hero-cta">Texto do Botão Principal</Label>
                  <Input 
                    id="hero-cta" 
                    value={config.hero_cta_text}
                    onChange={(e) => setConfig({ ...config, hero_cta_text: e.target.value })}
                    placeholder="Começar Agora" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-admin-card border-admin-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Imagens da Seção Hero
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Imagem Principal</Label>
                    <div className="border-2 border-dashed border-admin-border rounded-lg p-8 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-admin-foreground-muted" />
                      <p className="text-sm text-admin-foreground-muted">Clique para fazer upload</p>
                    </div>
                  </div>
                  <div>
                    <Label>Imagem Secundária</Label>
                    <div className="border-2 border-dashed border-admin-border rounded-lg p-8 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-admin-foreground-muted" />
                      <p className="text-sm text-admin-foreground-muted">Clique para fazer upload</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card className="bg-admin-card border-admin-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Funcionalidades em Destaque
                </CardTitle>
                <CardDescription>
                  Configure as funcionalidades que serão destacadas na landing page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {config.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 border border-admin-border rounded-lg">
                      <Switch 
                        checked={feature.enabled}
                        onCheckedChange={(checked) => updateFeature(index, 'enabled', checked)}
                      />
                      <div className="flex-1 space-y-2">
                        <Input 
                          value={feature.title}
                          onChange={(e) => updateFeature(index, 'title', e.target.value)}
                          placeholder="Título da funcionalidade" 
                        />
                        <Textarea 
                          value={feature.description}
                          onChange={(e) => updateFeature(index, 'description', e.target.value)}
                          placeholder="Descrição da funcionalidade" 
                          rows={2} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testimonials" className="space-y-6">
            <Card className="bg-admin-card border-admin-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Depoimentos de Clientes
                </CardTitle>
                <CardDescription>
                  Gerencie os depoimentos exibidos na landing page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {config.testimonials.map((testimonial, index) => (
                    <div key={index} className="p-4 border border-admin-border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={testimonial.enabled}
                            onCheckedChange={(checked) => updateTestimonial(index, 'enabled', checked)}
                          />
                          <Badge variant="secondary">{testimonial.enabled ? 'Ativo' : 'Inativo'}</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <Input 
                          value={testimonial.name}
                          onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                          placeholder="Nome" 
                        />
                        <Input 
                          value={testimonial.role}
                          onChange={(e) => updateTestimonial(index, 'role', e.target.value)}
                          placeholder="Cargo" 
                        />
                        <Input 
                          value={testimonial.building}
                          onChange={(e) => updateTestimonial(index, 'building', e.target.value)}
                          placeholder="Edifício" 
                        />
                      </div>
                      <Textarea 
                        placeholder="Depoimento do cliente..." 
                        rows={3}
                        value={testimonial.content}
                        onChange={(e) => updateTestimonial(index, 'content', e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="space-y-6">
            <Card className="bg-admin-card border-admin-border">
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>
                  Configurações globais da landing page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Landing Page Ativa</Label>
                    <p className="text-sm text-admin-foreground-muted">
                      Controla se a landing page está visível para visitantes
                    </p>
                  </div>
                  <Switch 
                    checked={config.is_active}
                    onCheckedChange={(checked) => setConfig({ ...config, is_active: checked })}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Modo de Manutenção</Label>
                    <p className="text-sm text-admin-foreground-muted">
                      Exibe uma página de manutenção em vez da landing page
                    </p>
                  </div>
                  <Switch 
                    checked={config.maintenance_mode}
                    onCheckedChange={(checked) => setConfig({ ...config, maintenance_mode: checked })}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Informações de Contato</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact-email">E-mail de Contato</Label>
                      <Input 
                        id="contact-email" 
                        value={config.contact_email}
                        onChange={(e) => setConfig({ ...config, contact_email: e.target.value })}
                        placeholder="contato@facility.com" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-phone">Telefone</Label>
                      <Input 
                        id="contact-phone" 
                        value={config.contact_phone}
                        onChange={(e) => setConfig({ ...config, contact_phone: e.target.value })}
                        placeholder="+55 (11) 99999-9999" 
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>SEO e Meta Tags</Label>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="meta-title">Título da Página</Label>
                      <Input 
                        id="meta-title" 
                        value={config.meta_title}
                        onChange={(e) => setConfig({ ...config, meta_title: e.target.value })}
                        placeholder="Facility - Gestão Inteligente para Condomínios" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="meta-description">Descrição</Label>
                      <Textarea 
                        id="meta-description" 
                        value={config.meta_description}
                        onChange={(e) => setConfig({ ...config, meta_description: e.target.value })}
                        placeholder="Descrição para mecanismos de busca..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default LandingPageSettings;