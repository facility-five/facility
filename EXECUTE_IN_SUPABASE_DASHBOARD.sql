-- Execute this SQL in Supabase Dashboard SQL Editor
-- URL: https://supabase.com/dashboard/project/riduqdqarirfqouazgwf/sql

-- Create pets table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  species TEXT DEFAULT 'other',
  breed TEXT,
  color TEXT,
  size TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'active',
  resident_id UUID REFERENCES public.residents(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraints if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'pets_species_check'
  ) THEN
    ALTER TABLE public.pets 
    ADD CONSTRAINT pets_species_check 
    CHECK (species IN ('dog','cat','bird','other'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'pets_size_check'
  ) THEN
    ALTER TABLE public.pets 
    ADD CONSTRAINT pets_size_check 
    CHECK (size IN ('small','medium','large'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'pets_status_check'
  ) THEN
    ALTER TABLE public.pets 
    ADD CONSTRAINT pets_status_check 
    CHECK (status IN ('active','inactive'));
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pets_resident_id ON public.pets(resident_id);
CREATE INDEX IF NOT EXISTS idx_pets_species ON public.pets(species);
CREATE INDEX IF NOT EXISTS idx_pets_status ON public.pets(status);

-- Enable Row Level Security
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS pets_select_authenticated ON public.pets;
DROP POLICY IF EXISTS pets_insert_authenticated ON public.pets;
DROP POLICY IF EXISTS pets_update_authenticated ON public.pets;
DROP POLICY IF EXISTS pets_delete_authenticated ON public.pets;

-- Create policies for authenticated users
CREATE POLICY pets_select_authenticated ON public.pets
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY pets_insert_authenticated ON public.pets
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY pets_update_authenticated ON public.pets
  FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY pets_delete_authenticated ON public.pets
  FOR DELETE TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_pets_updated_at ON public.pets;
CREATE TRIGGER set_pets_updated_at
  BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Verify table was created
SELECT 
  'Table created successfully!' as message,
  COUNT(*) as current_pets_count
FROM public.pets;