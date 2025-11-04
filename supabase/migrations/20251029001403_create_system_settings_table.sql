-- Criar tabela system_settings
CREATE TABLE IF NOT EXISTS public.system_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    
    -- Configurações básicas do sistema
    system_name TEXT DEFAULT 'Facility Fincas',
    system_description TEXT,
    default_language TEXT DEFAULT 'pt-br',
    timezone TEXT DEFAULT 'utc-3',
    date_format TEXT DEFAULT 'DD/MM/YYYY',
    currency TEXT DEFAULT 'EUR',
    
    -- Configurações de controle
    maintenance_mode BOOLEAN DEFAULT false,
    allow_registrations BOOLEAN DEFAULT true,
    
    -- URLs de logos
    logo_url TEXT,
    logo_negative_url TEXT,
    
    -- Configurações do Stripe
    stripe_publishable_key TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Garantir que só existe uma linha de configuração
    CONSTRAINT system_settings_single_row CHECK (id = 1)
);

-- Inserir configuração inicial
INSERT INTO public.system_settings (id) 
VALUES (1) 
ON CONFLICT (id) DO NOTHING;

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_system_settings_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
-- Permitir leitura para usuários autenticados
CREATE POLICY "Allow authenticated read access" ON public.system_settings
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir escrita apenas para usuários autenticados (administradores)
CREATE POLICY "Allow authenticated write access" ON public.system_settings
    FOR ALL USING (auth.role() = 'authenticated');

-- Comentários para documentação
COMMENT ON TABLE public.system_settings IS 'Configurações globais do sistema';
COMMENT ON COLUMN public.system_settings.id IS 'ID fixo (sempre 1) para garantir uma única linha de configuração';
COMMENT ON COLUMN public.system_settings.system_name IS 'Nome do sistema exibido na interface';
COMMENT ON COLUMN public.system_settings.stripe_publishable_key IS 'Chave publicável do Stripe para pagamentos';