-- Corrigir foreign key da coluna resident_id na tabela reservas
DO $$ 
BEGIN
    -- Remover constraint antiga se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'reservas' 
        AND constraint_name = 'reservas_resident_id_fkey'
    ) THEN
        ALTER TABLE public.reservas DROP CONSTRAINT reservas_resident_id_fkey;
    END IF;
    
    -- Adicionar foreign key correta para residents
    ALTER TABLE public.reservas 
    ADD CONSTRAINT reservas_resident_id_fkey 
    FOREIGN KEY (resident_id) REFERENCES public.residents(id) ON DELETE CASCADE;
    
    -- Criar índice para melhor performance
    CREATE INDEX IF NOT EXISTS idx_reservas_resident_id ON public.reservas(resident_id);
    
END $$;

-- Verificar se a constraint foi criada corretamente
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_schema = 'public' 
AND tc.table_name = 'reservas'
AND tc.constraint_name = 'reservas_resident_id_fkey';