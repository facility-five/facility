import { createClient } from '@supabase/supabase-js';

// Service role key para operações de admin
const client = createClient(
  'https://riduqdqarirfqouazgwf.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZHVxZHFhcmlyZnFvdWF6Z3dmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDQzOTQ4MSwiZXhwIjoyMDQ2MDE1NDgxfQ.PHF-rLyMQ5Z6y-yV7oLeFQgcuV6LLzJCu_rWs2P2Vt8'
);

async function createPetsTable() {
  console.log('Criando tabela pets...');
  
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS public.pets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        species TEXT NOT NULL,
        breed TEXT,
        age INTEGER,
        weight DECIMAL(5,2),
        color TEXT,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
        resident_id UUID REFERENCES public.residents(id) ON DELETE CASCADE,
        condo_id UUID REFERENCES public.condominiums(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        deleted_at TIMESTAMPTZ,
        created_by UUID REFERENCES auth.users(id)
    );
  `;

  try {
    const result = await client.rpc('exec_sql', { query: createTableSQL });
    console.log('✅ Tabela pets criada com sucesso!');
    console.log('Resultado:', result);
  } catch (error) {
    console.error('❌ Erro ao criar tabela pets:', error);
  }
}

createPetsTable();