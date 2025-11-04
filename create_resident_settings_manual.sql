-- Script para criar a tabela resident_settings manualmente
-- Execute este script no Supabase Dashboard > SQL Editor

-- Criar a tabela resident_settings
CREATE TABLE IF NOT EXISTS public.resident_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relacionamento com o usuário
    resident_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Configurações de notificações
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    communication_notifications BOOLEAN DEFAULT true,
    reservation_notifications BOOLEAN DEFAULT true,
    maintenance_notifications BOOLEAN DEFAULT true,
    
    -- Configurações de privacidade
    profile_visibility VARCHAR(20) DEFAULT 'residents_only' CHECK (profile_visibility IN ('public', 'private', 'residents_only')),
    
    -- Configurações de interface
    theme_preference VARCHAR(10) DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
    language VARCHAR(5) DEFAULT 'pt' CHECK (language IN ('pt', 'en', 'es')),
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_resident_settings_resident_id ON public.resident_settings(resident_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_resident_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_resident_settings_updated_at
    BEFORE UPDATE ON public.resident_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_resident_settings_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.resident_settings ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
-- Moradores podem ver e editar apenas suas próprias configurações
CREATE POLICY "Residents can manage own settings" ON public.resident_settings
    FOR ALL USING (auth.uid() = resident_id)
    WITH CHECK (auth.uid() = resident_id);

-- Comentários para documentação
COMMENT ON TABLE public.resident_settings IS 'Configurações personalizadas dos moradores';
COMMENT ON COLUMN public.resident_settings.resident_id IS 'ID do morador (referência para auth.users)';
COMMENT ON COLUMN public.resident_settings.profile_visibility IS 'Visibilidade do perfil: public, private, residents_only';
COMMENT ON COLUMN public.resident_settings.theme_preference IS 'Preferência de tema: light, dark, system';
COMMENT ON COLUMN public.resident_settings.language IS 'Idioma preferido: pt, en, es';