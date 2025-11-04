import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, code, firstName, lastName } = await req.json()

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: 'Email e código são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Configurar Resend
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY não configurada')
    }

    // Template do email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verificação de Email - Facility</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code { background: #667eea; color: white; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; border-radius: 8px; letter-spacing: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏢 Facility</h1>
              <h2>Verificação de Email</h2>
            </div>
            <div class="content">
              <p>Olá ${firstName ? `${firstName} ${lastName || ''}`.trim() : ''}!</p>
              <p>Obrigado por se cadastrar na <strong>Facility</strong>. Para completar seu cadastro, use o código de verificação abaixo:</p>
              
              <div class="code">${code}</div>
              
              <p>Este código é válido por <strong>24 horas</strong> e deve ser usado apenas uma vez.</p>
              
              <p>Se você não solicitou este cadastro, pode ignorar este email com segurança.</p>
              
              <div class="footer">
                <p>© 2024 Facility - Sistema de Gestão Condominial</p>
                <p>Este é um email automático, não responda.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    // Enviar email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Facility <noreply@facility.com>',
        to: [email],
        subject: `Seu código de verificação: ${code}`,
        html: emailHtml,
      }),
    })

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text()
      console.error('Erro do Resend:', errorData)
      throw new Error(`Erro ao enviar email: ${resendResponse.status}`)
    }

    const result = await resendResponse.json()
    console.log('Email enviado com sucesso:', result)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email de verificação enviado com sucesso',
        emailId: result.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro na função send-verification-email:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})