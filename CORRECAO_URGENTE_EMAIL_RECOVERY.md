# 🚨 CORREÇÃO URGENTE - Email Recovery Error

## ❌ Problema Identificado
O usuário está recebendo "Error sending recovery email" ao tentar recuperar a senha para `wfss1982@gmail.com`.

## 🎯 Causa Raiz
**SMTP não configurado em produção** no Supabase Studio. O código está correto, mas as configurações de email não foram aplicadas no ambiente de produção.

## ✅ SOLUÇÃO IMEDIATA

### 1. 🔧 Configurar SMTP no Supabase Studio (URGENTE)

1. **Acesse:** https://supabase.com/dashboard/projects
2. **Selecione:** Seu projeto em produção 
3. **Vá para:** Authentication > Settings > SMTP Settings

```bash
# SMTP Configuration
Enable custom SMTP: ✅ YES

Host: smtp.resend.com
Port: 587
Username: resend
Password: re_g9vvTZuo_JhgVUCYcmrQpBiov997pAQG3
Sender email: no-responda@facilityfincas.es
Sender name: Facility

# Enable SMTP: ✅ YES
```

### 2. 🌐 Configurar URLs de Redirecionamento

1. **Vá para:** Authentication > URL Configuration

```bash
Site URL: 
https://www.facilityfincas.es

Additional redirect URLs (adicionar cada linha):
https://www.facilityfincas.es/nova-senha
https://facilityfincas.es/nova-senha
https://www.facilityfincas.es/auth/callback
https://facilityfincas.es/auth/callback
```

### 3. 📧 Configurar Templates de Email

1. **Vá para:** Authentication > Email Templates
2. **Password Recovery:**

```html
Subject: Redefinir senha - Facility

<!-- Use o template do arquivo supabase/templates/recovery.html -->
```

### 4. 🧪 Teste Imediato

Após configurar, teste:

1. Ir para: https://www.facilityfincas.es/esqueci-senha
2. Inserir email: `wfss1982@gmail.com`
3. Verificar se o email é enviado sem erro

---

## 🔍 DIAGNÓSTICO TÉCNICO

### Código Atual (CORRETO):
```tsx
// src/components/ForgotPasswordForm.tsx - Linha 45
const redirectTo = `${window.location.origin}/nova-senha`;
const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
  redirectTo,
});
```

### Configuração Local (FUNCIONANDO):
```toml
# supabase/config.toml
[auth.email.smtp]
host = "smtp.resend.com"
port = 587
user = "resend"
pass = "re_g9vvTZuo_JhgVUCYcmrQpBiov997pAQG3"
```

### Configuração Produção (AUSENTE):
❌ SMTP não configurado no Supabase Studio online

---

## ⚡ CHECKLIST DE CORREÇÃO

- [ ] 🔧 Configurar SMTP no Supabase Studio
- [ ] 🌐 Adicionar URLs de redirecionamento
- [ ] 📧 Configurar template de recovery
- [ ] 🧪 Testar recuperação de senha
- [ ] ✅ Confirmar funcionamento

## 🎯 RESULTADO ESPERADO

Após a configuração:
- ✅ Formulário de recuperação funcionará sem erro
- ✅ Email será enviado via Resend
- ✅ Link de reset redirecionará para `/nova-senha`
- ✅ Usuário poderá redefinir senha normalmente

---

## 📝 NOTAS

- **API Key:** `re_g9vvTZuo_JhgVUCYcmrQpBiov997pAQG3` (já testada localmente)
- **Template:** Usar arquivo `supabase/templates/recovery.html`
- **URL Produção:** https://www.facilityfincas.es
- **Redirect:** `/nova-senha` configurado no código

**Status:** 🔄 Aguardando configuração no Supabase Studio