import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Request method:', req.method)
    console.log('Request headers:', Object.fromEntries(req.headers.entries()))
    
    // Parse request body
    let body: any
    try {
      body = await req.json()
    } catch (parseErr) {
      console.error('Failed to parse JSON body:', parseErr)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Corpo da requisição inválido. Envie JSON válido.',
          details: String(parseErr),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }
    console.log('Request body:', JSON.stringify(body, null, 2))
    
    const { email, data, redirectTo } = body

    // Sanitize redirectTo (trim spaces/backticks) and basic validation
    const sanitizedRedirectTo = typeof redirectTo === 'string'
      ? redirectTo.trim().replace(/^`+|`+$/g, '')
      : ''

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
          status: 200,
        }
      )
    }

    if (!sanitizedRedirectTo) {
      console.error('Missing required field: redirectTo')
      return new Response(
        JSON.stringify({
          success: false,
          error: "redirectTo é obrigatório",
          field: "redirectTo"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      )
    }

    // Require http/https scheme for security
    if (!/^https?:\/\//.test(sanitizedRedirectTo)) {
      console.error('Invalid redirectTo format:', sanitizedRedirectTo)
      return new Response(
        JSON.stringify({
          success: false,
          error: "redirectTo deve iniciar com http:// ou https://",
          field: "redirectTo",
          value: sanitizedRedirectTo,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Calling inviteUserByEmail with:', { email, data, redirectTo: sanitizedRedirectTo })

    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data,
      redirectTo: sanitizedRedirectTo,
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
        status: 200,
      }
    )
  }
})
