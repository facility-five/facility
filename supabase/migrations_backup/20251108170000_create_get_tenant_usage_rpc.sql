-- Criar função RPC centralizada para uso do tenant
CREATE OR REPLACE FUNCTION public.get_tenant_usage(user_uuid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'administrators', (SELECT COUNT(*) FROM public.administrators WHERE user_id = user_uuid),
    'condominiums',  (SELECT COUNT(*) FROM public.condominiums  WHERE user_id = user_uuid),
    'units',         (SELECT COUNT(*) FROM public.units         WHERE user_id = user_uuid)
  )
  INTO result;

  RETURN result;
END;
$$;

-- Habilitar RLS nas tabelas envolvidas e criar políticas básicas de leitura
ALTER TABLE public.administrators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.condominiums  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units         ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura por usuário
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'administrators' AND policyname = 'Usuário pode ver seus próprios dados'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Usuário pode ver seus próprios dados"
      ON public.administrators FOR SELECT
      USING (user_id = auth.uid())
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'condominiums' AND policyname = 'Usuário pode ver seus próprios dados'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Usuário pode ver seus próprios dados"
      ON public.condominiums FOR SELECT
      USING (user_id = auth.uid())
    $$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'units' AND policyname = 'Usuário pode ver seus próprios dados'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Usuário pode ver seus próprios dados"
      ON public.units FOR SELECT
      USING (user_id = auth.uid())
    $$;
  END IF;
END$$;