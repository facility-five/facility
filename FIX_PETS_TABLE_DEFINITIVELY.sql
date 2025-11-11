-- Fix pets table schema - remove code column if it exists and ensure proper structure
-- Execute this in Supabase Dashboard SQL Editor

-- First, let's check if code column exists and remove it if it does
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'pets' 
      AND column_name = 'code'
  ) THEN
    ALTER TABLE public.pets DROP COLUMN code;
    RAISE NOTICE 'Dropped code column from pets table';
  END IF;
END $$;

-- Ensure the pets table has the correct structure
-- Drop and recreate to ensure clean schema
DROP TABLE IF EXISTS public.pets CASCADE;

-- Recreate pets table with correct structure
CREATE TABLE public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  species TEXT DEFAULT 'other' CHECK (species IN ('dog','cat','bird','other')),
  breed TEXT,
  color TEXT,
  size TEXT DEFAULT 'medium' CHECK (size IN ('small','medium','large')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','inactive')),
  resident_id UUID NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_pets_resident_id ON public.pets(resident_id);
CREATE INDEX idx_pets_species ON public.pets(species);
CREATE INDEX idx_pets_status ON public.pets(status);

-- Enable RLS
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_pets_updated_at
  BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Simple policies for testing (we'll make them more restrictive later)
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

-- Verify the table structure
SELECT 
  'Pets table recreated successfully!' as message,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'pets'
ORDER BY ordinal_position;