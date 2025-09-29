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
        const amount = (session.amount_total ?? 0) / 100

        if (userId && amount > 0) {
          await supabaseAdmin.from("payments").insert([
            {
              user_id: userId,
              plan: planName,
              amount: amount,
            },
          ])
        }
        break
      }
      case "invoice.payment_succeeded": {
        // Opcional: registrar renovações de assinatura
        const invoice = event.data.object as Stripe.Invoice
        const subAmount = (invoice.amount_paid ?? 0) / 100
        const userId = (invoice.metadata?.user_id as string) || ""

        if (userId && subAmount > 0) {
          await supabaseAdmin.from("payments").insert([
            {
              user_id: userId,
              plan: invoice.lines?.data?.[0]?.plan?.nickname || "Assinatura",
              amount: subAmount,
            },
          ])
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