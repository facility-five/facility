import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource: {
    id: string;
    status: string;
    amount?: {
      currency_code: string;
      value: string;
    };
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

    const webhookEvent: PayPalWebhookEvent = await req.json();
    
    console.log('PayPal Webhook recebido:', webhookEvent.event_type, webhookEvent.id);

    // Processar eventos relevantes
    switch (webhookEvent.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCompleted(supabaseClient, webhookEvent);
        break;
      case 'PAYMENT.CAPTURE.DENIED':
        await handlePaymentDenied(supabaseClient, webhookEvent);
        break;
      case 'PAYMENT.CAPTURE.PENDING':
        await handlePaymentPending(supabaseClient, webhookEvent);
        break;
      default:
        console.log('Evento não processado:', webhookEvent.event_type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Erro no webhook PayPal:', error);
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function handlePaymentCompleted(supabaseClient: any, event: PayPalWebhookEvent) {
  const paymentId = event.resource.id;
  
  // Atualizar status do pagamento
  const { error: updateError } = await supabaseClient
    .from('orders')
    .update({
      paypal_status: 'COMPLETED',
      status: 'completed',
      updated_at: new Date().toISOString(),
    })
    .eq('paypal_payment_id', paymentId);

  if (updateError) {
    console.error('Erro ao atualizar ordem:', updateError);
    return;
  }

  // Buscar ordem para ativar assinatura
  const { data: order } = await supabaseClient
    .from('orders')
    .select('*')
    .eq('paypal_payment_id', paymentId)
    .single();

  if (order) {
    // Ativar assinatura
    const { error: subscriptionError } = await supabaseClient
      .from('user_subscriptions')
      .upsert({
        user_id: order.user_id,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        payment_gateway: 'paypal',
        payment_id: paymentId,
        updated_at: new Date().toISOString(),
      });

    if (subscriptionError) {
      console.error('Erro ao ativar assinatura:', subscriptionError);
    }
  }
}

async function handlePaymentDenied(supabaseClient: any, event: PayPalWebhookEvent) {
  const paymentId = event.resource.id;
  
  const { error } = await supabaseClient
    .from('orders')
    .update({
      paypal_status: 'DENIED',
      status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('paypal_payment_id', paymentId);

  if (error) {
    console.error('Erro ao atualizar ordem negada:', error);
  }
}

async function handlePaymentPending(supabaseClient: any, event: PayPalWebhookEvent) {
  const paymentId = event.resource.id;
  
  const { error } = await supabaseClient
    .from('orders')
    .update({
      paypal_status: 'PENDING',
      status: 'pending',
      updated_at: new Date().toISOString(),
    })
    .eq('paypal_payment_id', paymentId);

  if (error) {
    console.error('Erro ao atualizar ordem pendente:', error);
  }
}