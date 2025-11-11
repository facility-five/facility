# 🚨 FIX IMEDIATO - Email Recovery Error 

## 🎯 PROBLEMA
Usuário `wfss1982@gmail.com` recebe erro "Error sending recovery email" ao tentar recuperar senha.

## 💡 CAUSA
**SMTP não configurado em PRODUÇÃO** no Supabase Studio. O local funciona, mas produção não.

## ⚡ SOLUÇÃO URGENTE (5 MINUTOS)

### PASSO 1: Abrir Supabase Dashboard
1. 🌐 Ir para: https://supabase.com/dashboard/projects
2. 🔍 Localizar seu projeto de PRODUÇÃO (não local)
3. 📁 Clicar no projeto

### PASSO 2: Configurar SMTP
1. 👈 Menu lateral → **Authentication**
2. ⚙️ Clicar em **Settings** (sub-menu)
3. 📧 Procurar seção **SMTP Settings**
4. 🔘 **Enable custom SMTP:** marcar como **YES**

#### Configuração SMTP:
```
Host: smtp.resend.com
Port: 587
Username: resend
Password: re_g9vvTZuo_JhgVUCYcmrQpBiov997pAQG3
Sender email: no-responda@facilityfincas.es
Sender name: Facility
```

5. 💾 **SAVE** - MUITO IMPORTANTE!

### PASSO 3: Configurar URLs
1. 👈 Ainda em Authentication
2. ⚙️ Ir para **URL Configuration** 
3. 🌐 **Site URL:** `https://www.facilityfincas.es`
4. ➕ **Additional redirect URLs** (adicionar uma por linha):
```
https://www.facilityfincas.es/nova-senha
https://facilityfincas.es/nova-senha
```

5. 💾 **SAVE** - MUITO IMPORTANTE!

### PASSO 4: Template de Email (OPCIONAL)
1. 👈 Ainda em Authentication  
2. 📧 Ir para **Email Templates**
3. 🔑 Clicar em **Password Recovery**
4. ✍️ **Subject:** `Redefinir senha - Facility`
5. 💾 **SAVE**

## 🧪 TESTE IMEDIATO

1. 🌐 Abrir: https://www.facilityfincas.es/esqueci-senha
2. 📧 Inserir: `wfss1982@gmail.com`
3. 🔘 Clicar "Enviar"
4. ✅ Deve mostrar: "Enviamos um e-mail com instruções..."

## 📊 RESULTADO ESPERADO

- ✅ Não deve mostrar mais "Error sending recovery email"
- ✅ Email será enviado via Resend para `wfss1982@gmail.com`
- ✅ Email conterá link para https://www.facilityfincas.es/nova-senha
- ✅ Usuário conseguirá redefinir a senha

---

## 🔍 SE AINDA NÃO FUNCIONAR

### Verificar se salvou:
1. 🔄 Refresh na página do Supabase Studio
2. 👀 Verificar se as configurações permanecem
3. ⚙️ Se sumiram = não salvou corretamente

### Debug rápido:
1. F12 (Developer Tools) no browser
2. Network tab
3. Tentar recuperar senha novamente
4. Verificar se há erro 500 ou outro

---

## ⏱️ TEMPO ESTIMADO: 3-5 minutos

**APÓS CONFIGURAR: Teste imediatamente com `wfss1982@gmail.com`** ✅