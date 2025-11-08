import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: {
    id: string
    email: string
    [key: string]: any
  }
  schema: string
  old_record: null | {
    [key: string]: any
  }
}

serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json()

    // Apenas processar novos registros na tabela auth.users
    if (payload.type !== 'INSERT' || payload.table !== 'users') {
      return new Response(JSON.stringify({ message: 'Not a new user' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Criar cliente Supabase
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar plano gratuito
    const { data: freePlan, error: planError } = await supabaseAdmin
      .from('plans')
      .select('id')
      .eq('price', 0)
      .eq('interval', 'month')
      .single()

    if (planError || !freePlan) {
      throw new Error('Free plan not found')
    }

    // Criar registro de pagamento para o plano gratuito
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: payload.record.id,
        plan_id: freePlan.id,
        status: 'active',
        trial_expires_at: null, // plano gratuito não expira
        current_period_starts_at: new Date().toISOString(),
        current_period_ends_at: null, // plano gratuito não expira
      })

    if (paymentError) {
      throw paymentError
    }

    // Criar registro de profile (obrigatório)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: payload.record.id,
        email: payload.record.email,
        created_by: payload.record.id, // próprio usuário é o criador
      })

    if (profileError) {
      throw profileError
    }

    return new Response(
      JSON.stringify({ message: 'Free plan created successfully' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})