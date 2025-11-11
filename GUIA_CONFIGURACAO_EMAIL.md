# 📧 Guia de Configuração de Email - Facility

## Visão Geral

O sistema Facility utiliza **Supabase Auth integrado com Resend** para envio de emails de:
- ✅ Confirmação de email
- ✅ Recuperação de senha 
- ✅ Convites de usuários
- ✅ Notificações do sistema
- ✅ Templates personalizados em português

## 1. Configuração do Resend

### 1.1 Criar conta no Resend
1. Acesse [resend.com](https://resend.com)
2. Crie uma conta gratuita (100 emails/dia)
3. Verifique seu domínio ou use o domínio de teste

### 1.2 Obter API Key
1. No dashboard do Resend, vá para **API Keys**
2. Clique em **Create API Key**
3. Nome: `Facility Production` (ou similar)
4. Copie a API key (formato: `re_xxxxxxxxx`)

### 1.3 Configurar domínio (Produção)
```bash
# Para produção, configure seu domínio no Resend:
# 1. Add domain: facility.com
# 2. Configure DNS records
# 3. Verify domain
```

## 2. Configuração Local (Desenvolvimento)

### 2.1 Atualizar .env.local
```bash
# Supabase Configuration
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# SMTP Configuration for Supabase Auth
SUPABASE_AUTH_SMTP_PASS=re_sua_api_key_do_resend_aqui

# Resend API Key (for custom email functions)
RESEND_API_KEY=re_sua_api_key_do_resend_aqui
```

### 2.2 Atualizar supabase/config.toml
```toml
[auth.email.smtp]
host = "smtp.resend.com"
port = 587
user = "resend"
pass = "re_sua_api_key_do_resend_aqui"
admin_email = "noreply@seudomminio.com"  # ou "noreply@facility.com"
```

## 3. Configuração em Produção

### 3.1 Variáveis de Ambiente Supabase
No dashboard do Supabase (Production):

```bash
# Secrets > Add new secret
RESEND_API_KEY=re_sua_api_key_do_resend_aqui
RESEND_FROM=Facility <noreply@seudomminio.com>
```

### 3.2 Configuração Auth Settings
No Supabase Dashboard > Authentication > Settings:

```bash
# SMTP Settings
Host: smtp.resend.com
Port: 587
Username: resend
Password: [sua_api_key_resend]
Sender email: noreply@seudomminio.com
Sender name: Facility
```

## 4. Templates de Email Configurados

### 4.1 Template de Confirmação
- **Arquivo:** `supabase/templates/confirm.html`
- **Uso:** Verificação de email para novos usuários
- **Personalização:** ✅ Design moderno, português brasileiro

### 4.2 Template de Recuperação
- **Arquivo:** `supabase/templates/recovery.html`  
- **Uso:** Reset de senha
- **Personalização:** ✅ Instruções claras, branding Facility

### 4.3 Configuração no config.toml
```toml
[auth.email.template.confirmation]
subject = "Confirme seu email - Facility"
content_path = "./supabase/templates/confirm.html"

[auth.email.template.recovery]
subject = "Redefinir senha - Facility"
content_path = "./supabase/templates/recovery.html"
```

## 5. Edge Functions de Email

### 5.1 Funções Disponíveis
- **send-verification-email:** Emails de verificação customizados
- **create-resident-user:** Emails de convite para moradores  
- **send-template-test:** Teste de templates

### 5.2 Configuração das Functions
Cada Edge Function usa as variáveis:
```typescript
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const RESEND_FROM = Deno.env.get('RESEND_FROM') || 'Facility <noreply@facility.com>'
```

## 6. Fluxos de Email Implementados

### 6.1 Registro de Usuário
1. Usuário se registra
2. ↓ Supabase Auth + Template confirm.html
3. Email de confirmação enviado via Resend
4. Usuário clica no link/código
5. Conta ativada

### 6.2 Convite de Morador
1. Administrador convida morador
2. ↓ Edge Function create-resident-user
3. Email de convite com senha temporária
4. ↓ Link para redefinir senha
5. Morador configura nova senha

### 6.3 Notificações do Sistema
1. Nova comunicação criada
2. ↓ Trigger da database
3. Notificação in-app criada
4. ↓ Edge Function (se configurado)
5. Email de notificação opcional

## 7. Teste da Configuração

### 7.1 Teste Rápido
```bash
# No terminal, dentro do projeto:
cd "C:\Apps\App Facility"

# Testar Edge Function
curl -X POST http://localhost:54321/functions/v1/send-template-test \
  -H "Content-Type: application/json" \
  -d '{
    "to": "seu-email@teste.com",
    "subject": "Teste Facility Email",
    "html": "<h1>Teste funcionando!</h1>"
  }'
```

### 7.2 Teste via Interface
1. Acesse a aplicação
2. Tente fazer um registro
3. Verifique se recebe email de confirmação
4. Teste "Esqueci minha senha"

## 8. Logs e Debugging

### 8.1 Logs do Supabase
```bash
# Ver logs das Edge Functions
npx supabase functions logs

# Ver logs específicos
npx supabase functions logs send-verification-email
```

### 8.2 Logs do Resend
- Dashboard Resend > Logs
- Status de entrega
- Bounces e reclamações

## 9. Limites e Planos

### 9.1 Resend Free Tier
- ✅ 100 emails/dia
- ✅ 3,000 emails/mês
- ✅ Domínio próprio
- ❌ Analytics avançado

### 9.2 Upgrade Para Pro
```bash
# Quando necessário:
# - $20/mês
# - 50,000 emails/mês
# - Analytics completo
# - Suporte prioritário
```

## 10. Próximos Passos

### 10.1 Configuração Imediata
1. ✅ Obter API Key do Resend
2. ✅ Atualizar .env.local
3. ✅ Atualizar config.toml
4. ✅ Testar envio de emails

### 10.2 Melhorias Futuras
- 📧 Templates HTML mais elaborados
- 📊 Dashboard de analytics de email
- 🔄 Emails de notificação automática
- 📱 Templates responsivos aprimorados

---

## ⚡ Resumo dos Comandos

```bash
# 1. Configurar API Key
# Editar .env.local e config.toml com sua API key real

# 2. Restart Supabase
npx supabase stop
npx supabase start

# 3. Testar
# Registrar um usuário e verificar email

# 4. Deploy
npx supabase db push
```

**Status:** ✅ Sistema de email está pronto para produção após configurar as API Keys reais do Resend.