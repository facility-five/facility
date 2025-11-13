-- Verificar se tabela settings existe e criar se necessário
CREATE TABLE IF NOT EXISTS public.settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configurações PayPal se não existirem
INSERT INTO public.settings (key, value, description, created_at, updated_at) 
VALUES 
('paypal_client_id', '', 'PayPal Client ID para integração', NOW(), NOW()),
('paypal_environment', 'sandbox', 'Ambiente PayPal: sandbox ou live', NOW(), NOW()),
('paypal_webhook_id', '', 'ID do webhook PayPal', NOW(), NOW())
ON CONFLICT (key) DO NOTHING;

-- RLS para settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Policy para admins poderem ver e editar
CREATE POLICY IF NOT EXISTS "settings_admin_access" ON public.settings
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.administrators 
    WHERE administrators.user_id = auth.uid()
  )
);

-- Grant permissions
GRANT ALL ON public.settings TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE settings_id_seq TO authenticated;