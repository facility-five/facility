-- Adicionar coluna subscription_status à tabela profiles
-- Necessário para rastrear status de assinatura dos usuários

-- Verificar se a coluna já existe antes de adicionar
DO $$ 
BEGIN
    -- Adicionar coluna subscription_status se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'subscription_status'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'canceled', 'past_due'));
        
        -- Criar índice para melhor performance
        CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);
        
        RAISE NOTICE 'Coluna subscription_status adicionada à tabela profiles';
    ELSE
        RAISE NOTICE 'Coluna subscription_status já existe na tabela profiles';
    END IF;
END $$;

-- Atualizar usuários que já têm pagamentos ativos
UPDATE public.profiles
SET subscription_status = 'active'
WHERE id IN (
    SELECT DISTINCT user_id 
    FROM public.payments 
    WHERE status = 'active'
);
