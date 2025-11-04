-- Migration: Create landing_page_settings table
-- Created: 2024-01-01

CREATE TABLE IF NOT EXISTS public.landing_page_settings (
    id BIGINT PRIMARY KEY DEFAULT 1,
    
    -- Seção Hero
    hero_title TEXT DEFAULT 'Gestão Inteligente para Condomínios',
    hero_subtitle TEXT DEFAULT 'Simplifique a administração do seu condomínio com nossa plataforma completa de gestão.',
    hero_cta_text TEXT DEFAULT 'Começar Agora',
    hero_main_image_url TEXT,
    hero_secondary_image_url TEXT,
    
    -- Funcionalidades (JSON para armazenar array de funcionalidades)
    features JSONB DEFAULT '[
        {
            "title": "Comunicação Interna",
            "description": "Sistema completo de comunicação entre moradores e administração",
            "enabled": true
        },
        {
            "title": "Gestão Financeira", 
            "description": "Controle total de receitas, despesas e relatórios financeiros",
            "enabled": true
        },
        {
            "title": "Controle de Demandas",
            "description": "Gerenciamento eficiente de solicitações e manutenções", 
            "enabled": true
        },
        {
            "title": "Acesso de Moradores",
            "description": "Portal exclusivo para moradores com funcionalidades personalizadas",
            "enabled": true
        },
        {
            "title": "Painel Administrativo",
            "description": "Dashboard completo com todas as informações em tempo real",
            "enabled": true
        }
    ]'::jsonb,
    
    -- Depoimentos (JSON para armazenar array de depoimentos)
    testimonials JSONB DEFAULT '[
        {
            "name": "Maria Silva",
            "role": "Síndica", 
            "building": "Residencial Jardim das Flores",
            "rating": 5,
            "content": "Excelente plataforma! Revolucionou a gestão do nosso condomínio.",
            "enabled": true
        },
        {
            "name": "João Santos",
            "role": "Administrador",
            "building": "Condomínio Vista Alegre", 
            "rating": 5,
            "content": "Excelente plataforma! Revolucionou a gestão do nosso condomínio.",
            "enabled": true
        },
        {
            "name": "Ana Costa",
            "role": "Moradora",
            "building": "Edifício Central Park",
            "rating": 5, 
            "content": "Excelente plataforma! Revolucionou a gestão do nosso condomínio.",
            "enabled": true
        }
    ]'::jsonb,
    
    -- Configurações Gerais
    is_active BOOLEAN DEFAULT true,
    maintenance_mode BOOLEAN DEFAULT false,
    contact_email TEXT DEFAULT 'contato@facility.com',
    contact_phone TEXT DEFAULT '+55 (11) 99999-9999',
    
    -- SEO
    meta_title TEXT DEFAULT 'Facility - Gestão Inteligente para Condomínios',
    meta_description TEXT DEFAULT 'Simplifique a administração do seu condomínio com nossa plataforma completa de gestão.',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configuração inicial se não existir
INSERT INTO public.landing_page_settings (id) 
VALUES (1) 
ON CONFLICT (id) DO NOTHING;

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_landing_page_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_landing_page_settings_updated_at
    BEFORE UPDATE ON public.landing_page_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_landing_page_settings_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.landing_page_settings ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
-- Permitir leitura para todos (landing page pública)
CREATE POLICY "Allow public read access" ON public.landing_page_settings
    FOR SELECT USING (true);

-- Permitir escrita apenas para usuários autenticados (administradores)
CREATE POLICY "Allow authenticated write access" ON public.landing_page_settings
    FOR ALL USING (auth.role() = 'authenticated');

-- Comentários para documentação
COMMENT ON TABLE public.landing_page_settings IS 'Configurações da landing page do sistema';
COMMENT ON COLUMN public.landing_page_settings.features IS 'Array JSON das funcionalidades exibidas na landing page';
COMMENT ON COLUMN public.landing_page_settings.testimonials IS 'Array JSON dos depoimentos de clientes';
COMMENT ON COLUMN public.landing_page_settings.is_active IS 'Define se a landing page está ativa';
COMMENT ON COLUMN public.landing_page_settings.maintenance_mode IS 'Define se está em modo de manutenção';