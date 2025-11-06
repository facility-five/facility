import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { session_id, plan_id: inputPlanId } = await req.json();
    if (!session_id) {
      return new Response(JSON.stringify({ error: "session_id é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }
    const token = authHeader.replace("Bearer ", "");
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized: Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session || session.status !== "complete") {
      return new Response(JSON.stringify({ error: "Sessão não está completa" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try to get line item price for amount/currency
    let amount = 0;
    let currency = "EUR";
    try {
      const items = await stripe.checkout.sessions.listLineItems(session_id, { limit: 1 });
      const priceObj = items.data?.[0]?.price as any;
      if (priceObj?.unit_amount && priceObj?.currency) {
        amount = priceObj.unit_amount / 100;
        currency = priceObj.currency.toUpperCase();
      }
    } catch (_) {}

    // Plan metadata
    const metaPlanId = (session.metadata?.plan_id as string | undefined) ?? undefined;
    const planId = inputPlanId ?? metaPlanId ?? null;
    let planName = (session.metadata?.plan_name as string | undefined) ?? "Assinatura";

    if (planId !== null) {
      const { data: plan, error: planErr } = await supabaseAdmin
        .from("plans")
        .select("name")
        .eq("id", planId)
        .single();
      if (!planErr && plan?.name) {
        planName = plan.name;
      }
    }

    const paymentIntentId = typeof session.payment_intent === "string"
      ? (session.payment_intent as string)
      : (session.payment_intent as any)?.id ?? session.id;

    // Idempotency: if active payment already exists, just ensure profile is active
    const { data: existing, error: readErr } = await supabaseAdmin
      .from("payments")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1);
    if (!readErr && existing && existing.length > 0) {
      await supabaseAdmin.from("profiles").update({ subscription_status: "active" }).eq("id", user.id);
      return new Response(JSON.stringify({ ok: true, status: "already_active" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: insertErr } = await supabaseAdmin.from("payments").insert({
      user_id: user.id,
      plan_id: planId,
      plan: planName,
      amount,
      currency,
      status: "active",
      stripe_payment_intent_id: paymentIntentId,
    });
    if (insertErr) {
      return new Response(JSON.stringify({ error: insertErr.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: profileErr } = await supabaseAdmin
      .from("profiles")
      .update({ subscription_status: "active" })
      .eq("id", user.id);
    if (profileErr) {
      return new Response(JSON.stringify({ error: profileErr.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, status: "activated" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});