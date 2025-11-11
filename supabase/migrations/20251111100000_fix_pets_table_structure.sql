-- Fix pets table structure - remove unwanted columns and ensure correct schema
-- Migration: 20251111100000_fix_pets_table_structure.sql

-- Remove any unwanted columns that might exist
DO $$ 
BEGIN
  -- Remove code column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'pets' 
      AND column_name = 'code'
  ) THEN
    ALTER TABLE public.pets DROP COLUMN code;
    RAISE NOTICE 'Dropped code column from pets table';
  END IF;
  
  -- Remove any other unwanted columns
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'pets' 
      AND column_name = 'pet_code'
  ) THEN
    ALTER TABLE public.pets DROP COLUMN pet_code;
    RAISE NOTICE 'Dropped pet_code column from pets table';
  END IF;
END $$;

-- Ensure all required columns exist with correct types
DO $$ 
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'pets' 
      AND column_name = 'name'
  ) THEN
    ALTER TABLE public.pets ADD COLUMN name TEXT NOT NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'pets' 
      AND column_name = 'species'
  ) THEN
    ALTER TABLE public.pets ADD COLUMN species TEXT DEFAULT 'other';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'pets' 
      AND column_name = 'breed'
  ) THEN
    ALTER TABLE public.pets ADD COLUMN breed TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'pets' 
      AND column_name = 'color'
  ) THEN
    ALTER TABLE public.pets ADD COLUMN color TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'pets' 
      AND column_name = 'size'
  ) THEN
    ALTER TABLE public.pets ADD COLUMN size TEXT DEFAULT 'medium';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'pets' 
      AND column_name = 'status'
  ) THEN
    ALTER TABLE public.pets ADD COLUMN status TEXT DEFAULT 'active';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'pets' 
      AND column_name = 'resident_id'
  ) THEN
    ALTER TABLE public.pets ADD COLUMN resident_id UUID REFERENCES public.residents(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'pets' 
      AND column_name = 'notes'
  ) THEN
    ALTER TABLE public.pets ADD COLUMN notes TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'pets' 
      AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.pets ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'pets' 
      AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.pets ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Set proper defaults and constraints
ALTER TABLE public.pets ALTER COLUMN species SET DEFAULT 'other';
ALTER TABLE public.pets ALTER COLUMN size SET DEFAULT 'medium';
ALTER TABLE public.pets ALTER COLUMN status SET DEFAULT 'active';
ALTER TABLE public.pets ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE public.pets ALTER COLUMN updated_at SET DEFAULT NOW();

-- Ensure NOT NULL constraints where needed
ALTER TABLE public.pets ALTER COLUMN name SET NOT NULL;

-- Add check constraints if they don't exist
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