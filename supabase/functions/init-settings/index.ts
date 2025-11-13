import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Criar tabela settings se não existir
    const { error: createTableError } = await supabaseClient.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.settings (
          id SERIAL PRIMARY KEY,
          key VARCHAR(255) UNIQUE NOT NULL,
          value TEXT,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

        -- Policy for admins
        DROP POLICY IF EXISTS "settings_admin_access" ON public.settings;
        CREATE POLICY "settings_admin_access" ON public.settings
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM public.administrators 
            WHERE administrators.user_id = auth.uid()
          )
        );

        -- Grant permissions
        GRANT ALL ON public.settings TO authenticated;
        GRANT USAGE, SELECT ON SEQUENCE settings_id_seq TO authenticated;
      `
    });

    if (createTableError) {
      console.error('Erro ao criar tabela:', createTableError);
    }

    // Inserir configurações padrão PayPal
    const defaultSettings = [
      {
        key: 'paypal_client_id',
        value: '',
        description: 'PayPal Client ID para integração'
      },
      {
        key: 'paypal_environment', 
        value: 'sandbox',
        description: 'Ambiente PayPal: sandbox ou live'
      },
      {
        key: 'paypal_webhook_id',
        value: '',
        description: 'ID do webhook PayPal'
      }
    ];

    for (const setting of defaultSettings) {
      const { error } = await supabaseClient
        .from('settings')
        .upsert(setting, { onConflict: 'key' });
      
      if (error) {
        console.error(`Erro ao inserir setting ${setting.key}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Tabela settings inicializada com sucesso'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Erro na função init-settings:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});