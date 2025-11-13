import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateOrderRequest {
  amount: string;
  currency: string;
}

interface PayPalOrder {
  intent: string;
  purchase_units: Array<{
    amount: {
      currency_code: string;
      value: string;
    };
  }>;
  application_context?: {
    brand_name?: string;
    landing_page?: string;
    shipping_preference?: string;
    user_action?: string;
  };
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

    const { amount, currency }: CreateOrderRequest = await req.json();

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

    // Criar ordem no PayPal
    const orderData: PayPalOrder = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount,
        },
      }],
      application_context: {
        brand_name: 'Facility',
        landing_page: 'NO_PREFERENCE',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
      },
    };

    const orderResponse = await fetch(`${baseURL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      throw new Error(`Erro ao criar ordem PayPal: ${JSON.stringify(errorData)}`);
    }

    const order = await orderResponse.json();

    // Salvar ordem no banco de dados
    const { error: insertError } = await supabaseClient
      .from('orders')
      .insert({
        paypal_order_id: order.id,
        user_id: user.id,
        amount: parseFloat(amount),
        currency,
        status: 'pending',
        payment_gateway: 'paypal',
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Erro ao salvar ordem:', insertError);
    }

    return new Response(
      JSON.stringify({ orderId: order.id, order }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Erro na função paypal-create-order:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});