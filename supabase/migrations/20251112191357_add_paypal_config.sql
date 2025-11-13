-- Adicionar configurações do PayPal na tabela de configurações do sistema
INSERT INTO settings (key, value, description, created_at, updated_at) VALUES 
('paypal_client_id', '', 'PayPal Client ID para integração', NOW(), NOW()),
('paypal_client_secret', '', 'PayPal Client Secret para integração', NOW(), NOW()),
('paypal_environment', 'sandbox', 'Ambiente PayPal: sandbox ou live', NOW(), NOW()),
('paypal_webhook_id', '', 'ID do webhook PayPal', NOW(), NOW()),
('payment_gateway_primary', 'stripe', 'Gateway de pagamento primário: stripe ou paypal', NOW(), NOW()),
('payment_gateway_secondary', 'paypal', 'Gateway de pagamento secundário: stripe ou paypal', NOW(), NOW());

-- Adicionar coluna para identificar o gateway de pagamento nos pedidos
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_gateway VARCHAR(50) DEFAULT 'stripe' CHECK (payment_gateway IN ('stripe', 'paypal'));

-- Adicionar coluna para armazenar o ID do pagamento no PayPal
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS paypal_payment_id VARCHAR(255);

-- Adicionar coluna para armazenar o status do pagamento no PayPal
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS paypal_status VARCHAR(50);

-- Criar índice para melhor performance nas buscas por gateway
CREATE INDEX IF NOT EXISTS idx_orders_payment_gateway ON orders(payment_gateway);
CREATE INDEX IF NOT EXISTS idx_orders_paypal_payment_id ON orders(paypal_payment_id);