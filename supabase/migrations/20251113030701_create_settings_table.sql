-- Criação da tabela settings para armazenar configurações do sistema
-- Execução: Via Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  encrypted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índice para busca rápida por chave
CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings(key);

-- RLS (Row Level Security)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Política: Apenas administradores podem ler/escrever configurações
CREATE POLICY "Admins can manage settings" ON public.settings
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('Super Admin', 'Administrador')
    )
  );

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para updated_at
CREATE TRIGGER handle_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Inserir configurações padrão do PayPal
INSERT INTO public.settings (key, value, description) VALUES
  ('paypal_client_id', '', 'PayPal Client ID para integração de pagamentos'),
  ('paypal_client_secret', '', 'PayPal Client Secret (criptografado)'),
  ('paypal_environment', 'sandbox', 'Ambiente PayPal: sandbox ou live'),
  ('paypal_webhook_id', '', 'PayPal Webhook ID para notificações'),
  ('paypal_enabled', 'false', 'PayPal habilitado no sistema')
ON CONFLICT (key) DO NOTHING;

-- Verificar se foi criado
SELECT 'Tabela settings criada com sucesso!' as status;