/**
 * Edge Function: invite-user
 * Responsável por convidar usuários via Supabase Auth usando emailRedirectTo,
 * sanitizar e validar o redirectTo permitido (facilityfincas.es), e aplicar
 * fallback com generateLink + envio de e-mail via Resend quando necessário.
 * Todas as respostas retornam HTTP 200 com { success: boolean } para evitar
 * FunctionsHttpError no cliente.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function sanitizeRedirect(input: unknown): string {
  if (typeof input !== 'string') return ''
  // Remove espaços extras e crases (backticks) em volta
  const trimmed = input.trim().replace(/^`+|`+$/g, '')
  // Remover aspas simples/dobradas nas extremidades, se houver
  return trimmed.replace(/^['"]+|['"]+$/g, '')
}

function isAllowedRedirect(urlStr: string): boolean {
  try {
    const url = new URL(urlStr)
    const host = url.hostname.toLowerCase()
    const path = url.pathname
    const isHttps = url.protocol === 'https:' || url.protocol === 'http:'
    const allowedHosts = new Set(['facilityfincas.es', 'www.facilityfincas.es'])
    return isHttps && allowedHosts.has(host) && path.startsWith('/nova-senha')
  } catch (_) {
    return false
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse body de forma resiliente
    let body: any = null
    try {
      body = await req.json()
    } catch (err) {
      console.error('JSON inválido:', err)
      return new Response(
        JSON.stringify({ success: false, error: 'Corpo da requisição inválido. Envie JSON válido.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { email, data, redirectTo } = body || {}
    const sanitizedRedirectTo = sanitizeRedirect(redirectTo)

    // Default para SITE_URL se não vier redirectTo
    const siteUrl = (Deno.env.get('SITE_URL') || 'https://facilityfincas.es').replace(/\/$/, '')
    const effectiveRedirect = sanitizedRedirectTo || `${siteUrl}/nova-senha`

    // Validações
    if (!email || typeof email !== 'string' || !email.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email é obrigatório', field: 'email' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!/^https?:\/\//.test(effectiveRedirect)) {
      return new Response(
        JSON.stringify({ success: false, error: 'redirectTo deve iniciar com http:// ou https://', field: 'redirectTo', value: effectiveRedirect }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!isAllowedRedirect(effectiveRedirect)) {
      return new Response(
        JSON.stringify({ success: false, error: 'redirectTo não permitido. Use https://facilityfincas.es/nova-senha (com ou sem www).', field: 'redirectTo', value: effectiveRedirect }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    if (!supabaseUrl || !serviceKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey)

    console.log('Invite attempt:', { email, redirectTo: effectiveRedirect, userData: data })

    // 1) Tentar convite padrão do Supabase (usa emailRedirectTo)
    const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data,
      emailRedirectTo: effectiveRedirect,
    })

    if (!inviteError) {
      return new Response(
        JSON.stringify({ success: true, message: 'Convite enviado pelo Supabase com sucesso' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.warn('Falha no inviteUserByEmail, tentando fallback generateLink:', inviteError)

    // 2) Fallback: gerar link de convite e enviar por email via Resend
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'invite',
      email,
      options: { data, redirectTo: effectiveRedirect },
    } as any)

    if (linkError || !linkData?.action_link) {
      return new Response(
        JSON.stringify({ success: false, error: linkError?.message || 'Falha ao gerar link de convite', details: linkError || null }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'RESEND_API_KEY não configurada para envio de email de fallback', action_link: linkData.action_link }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const firstName = data?.first_name || data?.firstName || ''
    const lastName = data?.last_name || data?.lastName || ''
    const condoName = data?.condo_name || ''

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><title>Convite - Facility</title></head>
        <body style="font-family: Arial, sans-serif;">
          <h2>Convite para acessar o Facility</h2>
          <p>Olá ${firstName} ${lastName}!</p>
          ${condoName ? `<p>Você foi convidado para o condomínio <strong>${condoName}</strong>.</p>` : ''}
          <p>Para definir sua senha e acessar, clique no botão abaixo:</p>
          <p><a href="${linkData.action_link}" style="background:#4f46e5;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;display:inline-block">Definir senha</a></p>
          <p>Se o botão não funcionar, copie e cole este link no navegador:</p>
          <p><a href="${linkData.action_link}">${linkData.action_link}</a></p>
          <hr/>
          <p style="color:#666">Se você não esperava este convite, pode ignorar.</p>
        </body>
      </html>
    `

    const resendResp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Facility <no-responda@facilityfincas.es>',
        to: [email],
        subject: 'Convite para acessar o Facility',
        html: emailHtml,
      }),
    })

    if (!resendResp.ok) {
      const details = await resendResp.text()
      return new Response(
        JSON.stringify({ success: false, error: 'Falha no envio de email via Resend', details, action_link: linkData.action_link }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const resendResult = await resendResp.json()
    return new Response(
      JSON.stringify({ success: true, message: 'Convite gerado via link e enviado por email', emailId: resendResult.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    console.error('Erro geral invite-user:', err)
    return new Response(
      JSON.stringify({ success: false, error: err?.message || 'Erro interno do servidor' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
