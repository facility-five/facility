-- EXECUTAR NO SUPABASE DASHBOARD > SQL EDITOR
-- Para criar tabela settings de forma segura

-- Primeiro, verificar se a tabela já existe
DO $$
BEGIN
    -- Se a tabela não existe, cria ela
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'settings') THEN
        
        -- Criar tabela settings
        CREATE TABLE public.settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          key TEXT UNIQUE NOT NULL,
          value TEXT,
          description TEXT,
          encrypted BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );

        -- Índice para busca rápida
        CREATE INDEX idx_settings_key ON public.settings(key);
        
        -- Habilitar RLS
        ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
        
        -- Política: Apenas admins podem gerenciar
        CREATE POLICY "Admin can manage settings" ON public.settings
          FOR ALL 
          TO authenticated 
          USING (
            EXISTS (
              SELECT 1 FROM public.profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role IN ('Super Admin', 'Administrador')
            )
          );

        -- Trigger para updated_at
        CREATE TRIGGER handle_settings_updated_at
          BEFORE UPDATE ON public.settings
          FOR EACH ROW
          EXECUTE FUNCTION public.handle_updated_at();
          
        RAISE NOTICE 'Tabela settings criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela settings já existe!';
    END IF;
END
$$;

-- Inserir configurações padrão do PayPal (apenas se não existir)
INSERT INTO public.settings (key, value, description) VALUES
  ('paypal_client_id', '', 'PayPal Client ID para integração de pagamentos'),
  ('paypal_client_secret', '', 'PayPal Client Secret (criptografado)'),
  ('paypal_environment', 'sandbox', 'Ambiente PayPal: sandbox ou live'),
  ('paypal_webhook_id', '', 'PayPal Webhook ID para notificações'),
  ('paypal_enabled', 'false', 'PayPal habilitado no sistema')
ON CONFLICT (key) DO NOTHING;

-- Verificar configurações inseridas
SELECT 'Configurações PayPal inseridas!' as status;
SELECT key, value, description FROM public.settings WHERE key LIKE 'paypal%';