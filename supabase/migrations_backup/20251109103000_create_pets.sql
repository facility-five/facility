-- Criação da tabela pets e estruturas associadas (idempotente)
-- Mantém o conteúdo da aplicação em espanhol; nomes de colunas em inglês por consistência

-- Extensões comumente usadas (idempotente)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Função genérica para atualizar updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tabela residents presumida existente: public.residents(id uuid, unit_id uuid)
-- Tabela units presumida existente: public.units(id uuid, condo_id uuid)
-- Tabela condominiums presumida existente: public.condominiums(id uuid, administrator_id uuid)

-- Cria a tabela pets se não existir
CREATE TABLE IF NOT EXISTS public.pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  species TEXT DEFAULT 'other' CHECK (species IN ('dog','cat','bird','other')),
  breed TEXT,
  color TEXT,
  size TEXT DEFAULT 'medium' CHECK (size IN ('small','medium','large')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','inactive')),
  resident_id UUID NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Garante colunas (idempotente)
ALTER TABLE public.pets
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS species TEXT,
  ADD COLUMN IF NOT EXISTS breed TEXT,
  ADD COLUMN IF NOT EXISTS color TEXT,
  ADD COLUMN IF NOT EXISTS size TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS resident_id UUID,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- Aplica defaults e checks (idempotente)
ALTER TABLE public.pets ALTER COLUMN species SET DEFAULT 'other';
ALTER TABLE public.pets ALTER COLUMN size SET DEFAULT 'medium';
ALTER TABLE public.pets ALTER COLUMN status SET DEFAULT 'active';
ALTER TABLE public.pets ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.pets ALTER COLUMN updated_at SET DEFAULT now();

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pets_species_check'
  ) THEN
    ALTER TABLE public.pets ADD CONSTRAINT pets_species_check CHECK (species IN ('dog','cat','bird','other'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pets_size_check'
  ) THEN
    ALTER TABLE public.pets ADD CONSTRAINT pets_size_check CHECK (size IN ('small','medium','large'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pets_status_check'
  ) THEN
    ALTER TABLE public.pets ADD CONSTRAINT pets_status_check CHECK (status IN ('active','inactive'));
  END IF;
END $$;

-- FK idempotente
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pets_resident_id_fkey'
  ) THEN
    ALTER TABLE public.pets
      ADD CONSTRAINT pets_resident_id_fkey FOREIGN KEY (resident_id)
      REFERENCES public.residents(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Trigger updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_pets_updated_at'
  ) THEN
    CREATE TRIGGER set_pets_updated_at
      BEFORE UPDATE ON public.pets
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_pets_resident_id ON public.pets(resident_id);
CREATE INDEX IF NOT EXISTS idx_pets_name ON public.pets(name);
CREATE INDEX IF NOT EXISTS idx_pets_status ON public.pets(status);
CREATE INDEX IF NOT EXISTS idx_pets_species ON public.pets(species);

-- RLS básico para permitir operação inicial
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Seleção por usuários autenticados (refina depois conforme papéis)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'pets_select_authenticated' 
  ) THEN
    CREATE POLICY pets_select_authenticated ON public.pets
      FOR SELECT TO authenticated
      USING (true);
  END IF;
END $$;

-- Inserção por usuários autenticados (ajustar conforme papéis/titularidade)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'pets_insert_authenticated'
  ) THEN
    CREATE POLICY pets_insert_authenticated ON public.pets
      FOR INSERT TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Update por usuários autenticados
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'pets_update_authenticated'
  ) THEN
    CREATE POLICY pets_update_authenticated ON public.pets
      FOR UPDATE TO authenticated
      USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Delete por usuários autenticados
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'pets_delete_authenticated'
  ) THEN
    CREATE POLICY pets_delete_authenticated ON public.pets
      FOR DELETE TO authenticated
      USING (true);
  END IF;
END $$;