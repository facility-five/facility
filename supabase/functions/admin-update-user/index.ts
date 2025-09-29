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
    const body = await req.json()
    const { id, email, password, first_name, last_name, whatsapp, role, status } = body

    if (!id) {
      return new Response(JSON.stringify({ error: "id do usuário é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // Atualiza auth (opcionais)
    if (email || password || first_name || last_name) {
      const { error: authErr } = await supabaseAdmin.auth.admin.updateUserById(id, {
        email: email || undefined,
        password: password || undefined,
        email_confirm: email ? true : undefined,
        user_metadata: {
          ...(first_name !== undefined ? { first_name } : {}),
          ...(last_name !== undefined ? { last_name } : {}),
        },
      })
      if (authErr) {
        return new Response(JSON.stringify({ error: authErr.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }
    }

    // Atualiza perfil
    const updates: Record<string, any> = {}
    if (first_name !== undefined) updates.first_name = first_name
    if (last_name !== undefined) updates.last_name = last_name
    if (whatsapp !== undefined) updates.whatsapp = whatsapp
    if (role !== undefined) updates.role = role
    if (status !== undefined) updates.status = status

    if (Object.keys(updates).length > 0) {
      const { error: profErr } = await supabaseAdmin
        .from("profiles")
        .update(updates)
        .eq("id", id)

      if (profErr) {
        return new Response(JSON.stringify({ error: profErr.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
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