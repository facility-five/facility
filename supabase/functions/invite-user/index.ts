import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Credentials': 'true',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Request method:', req.method)
    console.log('Request headers:', Object.fromEntries(req.headers.entries()))
    
    // Parse request body
    const body = await req.json()
    console.log('Request body:', JSON.stringify(body, null, 2))
    
    const { email, data, redirectTo } = body

    // Validate required fields
    if (!email) {
      console.error('Missing required field: email')
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email é obrigatório",
          field: "email"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      )
    }

    if (!redirectTo) {
      console.error('Missing required field: redirectTo')
      return new Response(
        JSON.stringify({
          success: false,
          error: "redirectTo é obrigatório",
          field: "redirectTo"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      )
    }

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Calling inviteUserByEmail with:', { email, data, redirectTo })

    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data,
      redirectTo,
    });

    if (error) {
      console.error("Erro ao convidar usuário:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
          status: error.status,
          details: error.details,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      )
    }

    console.log('User invited successfully')
    return new Response(
      JSON.stringify({ success: true, message: "User invited successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Edge Function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Erro interno do servidor',
        details: error.stack
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
