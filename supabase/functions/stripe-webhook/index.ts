import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
}

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? ""
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? ""
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? ""
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
})

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  const sig = req.headers.get("stripe-signature")
  const body = await req.text()

  let event: Stripe.Event

  try {
    if (!sig || !STRIPE_WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ error: "Webhook signature missing" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    event = await stripe.webhooks.constructEventAsync(body, sig, STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  try {
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        const userId = (session.metadata?.user_id as string) || ""
        const planName = (session.metadata?.plan_name as string) || "Plano"
        const planId = (session.metadata?.plan_id as string) || ""
        const amount = (session.amount_total ?? 0) / 100

        console.log("Webhook: Processando checkout.session.completed", {
          userId,
          planName,
          planId,
          amount,
          sessionId: session.id
        })

        if (userId && amount > 0) {
          // Inserir o pagamento com status "active"
          const { data: payment, error: paymentError } = await supabaseAdmin
            .from("payments")
            .insert([
              {
                user_id: userId,
                plan_id: planId || null,
                plan: planName,
                amount: amount,
                currency: session.currency || "eur",
                status: "active", // Definir como ativo
                stripe_payment_intent_id: session.payment_intent as string,
              },
            ])
            .select()
            .single()

          if (paymentError) {
            console.error("Erro ao inserir pagamento:", paymentError)
          } else {
            console.log("Pagamento inserido com sucesso:", payment)
          }

          // Atualizar o subscription_status no profile do usuário
          const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .update({ subscription_status: "active" })
            .eq("id", userId)

          if (profileError) {
            console.error("Erro ao atualizar profile:", profileError)
          } else {
            console.log("Profile atualizado com subscription_status: active")
          }
        }
        break
      }
      case "invoice.payment_succeeded": {
        // Opcional: registrar renovações de assinatura
        const invoice = event.data.object as Stripe.Invoice
        const subAmount = (invoice.amount_paid ?? 0) / 100
        const userId = (invoice.metadata?.user_id as string) || ""

        console.log("Webhook: Processando invoice.payment_succeeded", {
          userId,
          subAmount,
          invoiceId: invoice.id
        })

        if (userId && subAmount > 0) {
          const { data: payment, error: paymentError } = await supabaseAdmin
            .from("payments")
            .insert([
              {
                user_id: userId,
                plan: invoice.lines?.data?.[0]?.plan?.nickname || "Assinatura",
                amount: subAmount,
                currency: invoice.currency || "eur",
                status: "active", // Definir como ativo
                stripe_payment_intent_id: invoice.payment_intent as string,
              },
            ])
            .select()
            .single()

          if (paymentError) {
            console.error("Erro ao inserir pagamento de renovação:", paymentError)
          } else {
            console.log("Pagamento de renovação inserido com sucesso:", payment)
          }

          // Atualizar o subscription_status no profile do usuário
          const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .update({ subscription_status: "active" })
            .eq("id", userId)

          if (profileError) {
            console.error("Erro ao atualizar profile na renovação:", profileError)
          } else {
            console.log("Profile atualizado com subscription_status: active (renovação)")
          }
        }
        break
      }
      default:
        // Ignorar outros eventos
        break
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})