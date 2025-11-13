import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CaptureOrderRequest {
  orderId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { orderId }: CaptureOrderRequest = await req.json();

    // Buscar configurações do PayPal do banco
    const { data: settings, error: settingsError } = await supabaseClient
      .from('settings')
      .select('value')
      .in('key', ['paypal_client_id', 'paypal_client_secret', 'paypal_environment']);

    if (settingsError || !settings) {
      throw new Error('Erro ao buscar configurações do PayPal');
    }

    const config = settings.reduce((acc, setting) => {
      const key = setting.key.replace('paypal_', '');
      acc[key] = setting.value;
      return acc;
    }, {} as any);

    const clientId = config.client_id;
    const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET') || config.client_secret;
    const environment = config.environment || 'sandbox';

    if (!clientId || !clientSecret) {
      throw new Error('Configurações do PayPal não encontradas');
    }

    // Obter token de acesso do PayPal
    const baseURL = environment === 'sandbox' 
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';

    const tokenResponse = await fetch(`${baseURL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      throw new Error('Erro ao obter token do PayPal');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Capturar ordem no PayPal
    const captureResponse = await fetch(`${baseURL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!captureResponse.ok) {
      const errorData = await captureResponse.json();
      throw new Error(`Erro ao capturar ordem PayPal: ${JSON.stringify(errorData)}`);
    }

    const captureData = await captureResponse.json();
    const captureId = captureData.purchase_units[0].payments.captures[0].id;
    const status = captureData.status;

    // Atualizar ordem no banco de dados
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({
        paypal_payment_id: captureId,
        paypal_status: status,
        status: status === 'COMPLETED' ? 'completed' : 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('paypal_order_id', orderId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Erro ao atualizar ordem:', updateError);
    }

    // Se o pagamento foi completado com sucesso, ativar a assinatura
    if (status === 'COMPLETED') {
      // Buscar ordem para obter detalhes do plano
      const { data: order } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('paypal_order_id', orderId)
        .eq('user_id', user.id)
        .single();

      if (order) {
        // Ativar assinatura do usuário
        const { error: subscriptionError } = await supabaseClient
          .from('user_subscriptions')
          .upsert({
            user_id: user.id,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
            payment_gateway: 'paypal',
            payment_id: captureId,
            updated_at: new Date().toISOString(),
          });

        if (subscriptionError) {
          console.error('Erro ao ativar assinatura:', subscriptionError);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        capture: {
          id: captureId,
          status,
          amount: captureData.purchase_units[0].payments.captures[0].amount,
          buyer: captureData.payer || {}
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Erro na função paypal-capture-order:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});