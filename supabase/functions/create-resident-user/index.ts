import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, firstName, lastName, condoName } = await req.json()

    if (!email || !firstName) {
      return new Response(JSON.stringify({ error: "Email e nome são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // Gerar uma senha temporária
    const tempPassword = Math.random().toString(36).slice(-12) + "A1!"

    // Criar usuário no Supabase Auth
    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: 'Morador',
        status: 'Ativo'
      },
    })

    if (createError) {
      console.error('Erro ao criar usuário:', createError)
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Enviar email de boas-vindas com instruções para definir senha
    try {
      const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: email,
      })

      if (resetError) {
        console.error('Erro ao gerar link de recuperação:', resetError)
      }
    } catch (resetErr) {
      console.error('Erro ao processar link de recuperação:', resetErr)
    }

    return new Response(JSON.stringify({ 
      user: user.user,
      message: `Usuário criado com sucesso. Email de boas-vindas enviado para ${email}.`
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  } catch (error) {
    console.error('Erro geral:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})