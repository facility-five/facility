import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Não autenticado' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const payload = await req.json();
    const { common_area_id, reservation_date, start_time, end_time } = payload;
    if (!common_area_id || !reservation_date || !start_time || !end_time) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios ausentes' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const code = `RE-${Math.random().toString(36).substr(2, 12).toUpperCase()}`;

    const { data: resident } = await serviceClient
      .from('residents')
      .select('id, condo_id')
      .eq('profile_id', user.id)
      .single();

    if (!resident) {
      return new Response(JSON.stringify({ error: 'Perfil de morador não encontrado' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: area } = await serviceClient
      .from('common_areas')
      .select('id, condo_id, booking_fee')
      .eq('id', common_area_id)
      .single();

    if (!area) {
      return new Response(JSON.stringify({ error: 'Área comum inválida' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const [sh, sm] = String(start_time).split(':').map(Number);
    const [eh, em] = String(end_time).split(':').map(Number);
    const hours = Math.max(0, (eh + (em || 0) / 60) - (sh + (sm || 0) / 60));
    const total_value = (area.booking_fee || 0) * hours;

    const insertPayload = {
      code,
      resident_id: resident.id,
      common_area_id,
      condo_id: area.condo_id,
      reservation_date,
      start_time,
      end_time,
      status: 'Pendente',
      total_value,
      created_by: user.id,
    };

    const { data: inserted, error: insertError } = await serviceClient
      .from('reservas')
      .insert([insertPayload])
      .select('id')
      .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: condoAdmin } = await serviceClient
      .from('condominiums')
      .select('id, administrator_id, administrators(user_id,responsible_id)')
      .eq('id', area.condo_id)
      .single();

    const adminUserIds: string[] = [];
    const rel: any = condoAdmin?.administrators || null;
    if (rel?.user_id) adminUserIds.push(rel.user_id);
    if (rel?.responsible_id) adminUserIds.push(rel.responsible_id);
    if (adminUserIds.length === 0 && condoAdmin?.administrator_id) {
      const { data: adminRow } = await serviceClient
        .from('administrators')
        .select('user_id,responsible_id')
        .eq('id', condoAdmin.administrator_id)
        .single();
      if (adminRow?.user_id) adminUserIds.push(adminRow.user_id);
      if (adminRow?.responsible_id) adminUserIds.push(adminRow.responsible_id);
    }

    if (adminUserIds.length > 0) {
      const notifications = adminUserIds.map((uid) => ({
        user_id: uid,
        title: 'Nueva reserva solicitada',
        message: 'Un residente ha solicitado una reserva. Revise y apruebe si corresponde.',
        type: 'reservation',
        entity_type: 'reservas',
        entity_id: inserted.id,
        is_read: false,
      }));
      await serviceClient.from('notifications').insert(notifications);
    }

    return new Response(JSON.stringify({ success: true, id: inserted.id }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

