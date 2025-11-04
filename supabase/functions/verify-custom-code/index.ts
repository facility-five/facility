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
    const { email, code } = await req.json()

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: 'Email e código são obrigatórios' }),
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

    // Buscar usuário pelo email
    const { data: users, error: getUserError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (getUserError) {
      console.error('Erro ao buscar usuários:', getUserError)
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar usuário' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não encontrado' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verificar se o usuário já está confirmado
    if (user.email_confirmed_at) {
      return new Response(
        JSON.stringify({ error: 'Email já foi verificado' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verificar código e expiração
    const storedCode = user.user_metadata?.verification_code
    const codeExpiresAt = user.user_metadata?.code_expires_at

    if (!storedCode || storedCode !== code) {
      return new Response(
        JSON.stringify({ error: 'Código de verificação inválido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verificar se o código expirou
    if (codeExpiresAt && new Date() > new Date(codeExpiresAt)) {
      return new Response(
        JSON.stringify({ error: 'Código de verificação expirado' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Confirmar email do usuário
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        email_confirm: true,
        user_metadata: {
          ...user.user_metadata,
          verification_code: null, // Limpar o código usado
          code_expires_at: null,
        }
      }
    )

    if (updateError) {
      console.error('Erro ao confirmar email:', updateError)
      return new Response(
        JSON.stringify({ error: 'Erro ao confirmar email' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email verificado com sucesso!',
        user: {
          id: user.id,
          email: user.email,
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro na função verify-custom-code:', error)
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