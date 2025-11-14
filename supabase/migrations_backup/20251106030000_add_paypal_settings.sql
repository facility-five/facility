-- Adicionar campos do PayPal à tabela system_settings
ALTER TABLE public.system_settings
ADD COLUMN IF NOT EXISTS paypal_client_id TEXT,
ADD COLUMN IF NOT EXISTS paypal_mode TEXT DEFAULT 'sandbox' CHECK (paypal_mode IN ('sandbox', 'live'));

-- Comentários para documentação
COMMENT ON COLUMN public.system_settings.paypal_client_id IS 'Client ID do PayPal (público)';
COMMENT ON COLUMN public.system_settings.paypal_mode IS 'Modo do PayPal: sandbox (teste) ou live (produção)';
