# 🎯 Configuração Supabase Studio - Facility Email

## ✅ API Key Configurada Localmente

Sua API key `re_g9vvTZuo_JhgVUCYcmrQpBiov997pAQG3` foi configurada nos arquivos:
- ✅ `.env.local` 
- ✅ `supabase/config.toml`

## 🔄 Próximos Passos

### 1. Reiniciar Supabase Local
```bash
npx supabase stop
npx supabase start
```

### 2. Configuração no Supabase Studio (Produção)

Quando você fizer deploy para produção, configure no **Supabase Dashboard**:

#### 2.1 Acessar Dashboard de Produção
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto Facility
3. Vá para **Settings** > **API**

#### 2.2 Configurar Secrets (Environment Variables)
```bash
# Settings > API > Environment variables > Add new variable

Nome: RESEND_API_KEY
Valor: re_g9vvTZuo_JhgVUCYcmrQpBiov997pAQG3

Nome: RESEND_FROM  
Valor: Facility <noreply@facility.com>
```

#### 2.3 Configurar SMTP Settings
```bash
# Authentication > Settings > SMTP Settings

Host: smtp.resend.com
Port: 587
Username: resend
Password: re_g9vvTZuo_JhgVUCYcmrQpBiov997pAQG3
Sender email: noreply@facility.com
Sender name: Facility
```

#### 2.4 Configurar Templates de Email
```bash
# Authentication > Templates

# Email Confirmation Template:
Subject: Confirme seu email - Facility
(Usar o template do arquivo: supabase/templates/confirm.html)

# Password Recovery Template:
Subject: Redefinir senha - Facility  
(Usar o template do arquivo: supabase/templates/recovery.html)
```

## 🧪 Como Testar

### Teste Local (Agora):
```bash
# 1. Reiniciar Supabase
npx supabase stop && npx supabase start

# 2. Acessar aplicação
http://localhost:5173

# 3. Registrar usuário novo
# 4. Verificar se recebe email de confirmação
# 5. Testar "Esqueci minha senha"
```

### Verificar Logs:
```bash
# Ver logs das Edge Functions
npx supabase functions logs

# Ver logs específicos
npx supabase functions logs send-verification-email
```

## 📊 Dashboard Resend

Para monitorar emails enviados:
1. Acesse: https://resend.com/dashboard
2. Vá em **Logs** para ver status dos emails
3. Monitore bounces e entregas

## 🚨 Troubleshooting

Se emails não chegarem:
1. ✅ Verificar spam/lixo eletrônico
2. ✅ Confirmar API key no Resend Dashboard
3. ✅ Ver logs no Supabase: `npx supabase functions logs`
4. ✅ Verificar configurações SMTP

---

## 📋 Resumo do Status

- ✅ **API Key configurada localmente**
- ✅ **Templates personalizados prontos**
- ✅ **Edge Functions configuradas**
- 🔄 **Próximo:** Testar envio de emails
- 📝 **Para produção:** Configurar no Supabase Studio online

**Execute `npx supabase stop && npx supabase start` e teste o sistema!** 🚀