import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password, firstName, lastName } = await req.json()

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email e senha são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Criar cliente Supabase admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Gerar código de verificação de 6 dígitos
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Criar usuário com confirmação de email desabilitada inicialmente
    const { data: user, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Não confirmar automaticamente
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        verification_code: verificationCode,
        code_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
      },
    })

    if (signUpError) {
      console.error('Erro ao criar usuário:', signUpError)
      return new Response(
        JSON.stringify({ error: signUpError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Enviar email de verificação personalizado
    try {
      const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-verification-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: verificationCode,
          firstName,
          lastName,
        }),
      })

      if (!emailResponse.ok) {
        console.error('Erro ao enviar email de verificação')
        // Não falhar o cadastro se o email não for enviado
      }
    } catch (emailError) {
      console.error('Erro ao chamar função de email:', emailError)
      // Não falhar o cadastro se o email não for enviado
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Usuário criado com sucesso. Verifique seu email.',
        user: {
          id: user.user?.id,
          email: user.user?.email,
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro na função custom-signup:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})