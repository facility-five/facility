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
    const { 
      email, 
      residentName, 
      title, 
      content, 
      priority, 
      condominiumName 
    } = await req.json();

    if (!email || !title || !content) {
      return new Response(
        JSON.stringify({ error: 'Email, título e conteúdo são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY não configurada');
    }

    // Determinar cor baseada na prioridade
    const priorityColors = {
      'urgent': { bg: '#ef4444', text: '#ffffff' },
      'high': { bg: '#f97316', text: '#ffffff' },
      'medium': { bg: '#3b82f6', text: '#ffffff' },
      'low': { bg: '#10b981', text: '#ffffff' }
    };

    const colors = priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium;

    // Template HTML para notificação de comunicado
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Novo Comunicado - ${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .title {
            font-size: 18px;
            font-weight: 600;
            margin: 0;
          }
          .content {
            padding: 30px;
          }
          .priority-badge {
            display: inline-block;
            background: ${colors.bg};
            color: ${colors.text};
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 20px;
          }
          .communication-content {
            background: #f8fafc;
            border-left: 4px solid #7c3aed;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
          }
          .footer {
            text-align: center;
            padding: 20px 30px;
            background: #f8fafc;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
          }
          .meta-info {
            font-size: 14px;
            color: #6b7280;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Facility</div>
            <h1 class="title">Novo Comunicado</h1>
          </div>

          <div class="content">
            <p>Olá, <strong>${residentName}</strong></p>
            <p>Há um novo comunicado importante para ${condominiumName}:</p>
            
            <div class="priority-badge">${priority === 'urgent' ? 'URGENTE' : priority === 'high' ? 'ALTA' : priority === 'medium' ? 'MÉDIA' : 'BAIXA'}</div>
            
            <h2 style="color: #1f2937; margin-bottom: 15px;">${title}</h2>
            
            <div class="communication-content">
              ${content.replace(/\n/g, '<br>')}
            </div>

            <div class="meta-info">
              <strong>Condomínio:</strong> ${condominiumName}<br>
              <strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>

            <p style="margin-top: 25px;">
              <a href="${Deno.env.get('SITE_URL') || 'https://facilityfincas.es'}/morador" class="cta-button">
                Acessar Sistema
              </a>
            </p>

            <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
              💡 Você pode gerenciar suas preferências de notificação acessando o sistema.
            </p>
          </div>

          <div class="footer">
            <p><strong>Facility</strong> - Sistema de Gestão Condominial</p>
            <p>Este é um email automático, não responda.</p>
            <p>&copy; 2024 Facility. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Enviar email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Facility <no-responda@facilityfincas.es>',
        to: [email],
        subject: `📢 ${priority === 'urgent' ? '[URGENTE] ' : ''}${title} - ${condominiumName}`,
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      console.error('Erro do Resend:', errorData);
      throw new Error(`Erro ao enviar email: ${resendResponse.status}`);
    }

    const result = await resendResponse.json();
    console.log('Email de comunicado enviado:', result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notificação de comunicado enviada com sucesso',
        emailId: result.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro na função send-communication-notification:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Falha ao enviar notificação', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});