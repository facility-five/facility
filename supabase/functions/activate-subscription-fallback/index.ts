import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type Payload = {
  plan_id?: string | number;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const {
      data: userData,
      error: userError,
    } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));

    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: userError?.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userId = userData.user.id;
    const body: Payload = await req.json().catch(() => ({}));
    const planId = body.plan_id ?? null;

    // Check if there is already an active payment
    const { data: existingPayments, error: paymentsErr } = await supabaseAdmin
      .from("payments")
      .select("id, status")
      .eq("user_id", userId)
      .eq("status", "active")
      .limit(1);

    if (paymentsErr) {
      return new Response(
        JSON.stringify({ error: "Read payments failed", details: paymentsErr.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (existingPayments && existingPayments.length > 0) {
      // Ensure profile is active as well
      await supabaseAdmin.from("profiles").update({ subscription_status: "active" }).eq("id", userId);
      return new Response(
        JSON.stringify({ ok: true, status: "already_active" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Try to fetch plan details if provided
    let amount = 0;
    let currency = "EUR";
    let plan_name = "Assinatura";

    if (planId !== null) {
      const { data: plan, error: planErr } = await supabaseAdmin
        .from("plans")
        .select("id, name, price, currency")
        .eq("id", planId)
        .limit(1)
        .single();
      if (!planErr && plan) {
        amount = plan.price ?? 0;
        currency = plan.currency ?? currency;
        plan_name = plan.name ?? plan_name;
      }
    }

    const fallbackIntentId = `fallback_${Date.now()}`;

    const { error: insertErr } = await supabaseAdmin.from("payments").insert({
      user_id: userId,
      plan_id: planId,
      plan: plan_name,
      amount,
      currency,
      status: "active",
      stripe_payment_intent_id: fallbackIntentId,
    });

    if (insertErr) {
      return new Response(
        JSON.stringify({ error: "Insert payment failed", details: insertErr.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { error: profileErr } = await supabaseAdmin
      .from("profiles")
      .update({ subscription_status: "active" })
      .eq("id", userId);

    if (profileErr) {
      return new Response(
        JSON.stringify({ error: "Profile update failed", details: profileErr.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ ok: true, status: "activated", intent_id: fallbackIntentId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Unexpected error", details: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});