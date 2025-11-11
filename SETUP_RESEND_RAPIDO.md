# 🚀 Configuração Rápida do Resend

## Passo 1: Obter API Key do Resend

1. **Cadastre-se no Resend:**
   - Acesse: https://resend.com
   - Crie conta gratuita (100 emails/dia)

2. **Gere sua API Key:**
   - Dashboard > API Keys > Create API Key  
   - Nome: "Facility Development"
   - Copie a chave (formato: `re_xxxxxxxxx`)

## Passo 2: Configurar Arquivos

### Arquivo: `.env.local`
```bash
# Substitua "your-resend-api-key-here" pela sua API key real:
SUPABASE_AUTH_SMTP_PASS=re_sua_api_key_aqui
RESEND_API_KEY=re_sua_api_key_aqui
```

### Arquivo: `supabase/config.toml` 
```toml
[auth.email.smtp]
host = "smtp.resend.com"
port = 587
user = "resend"
pass = "re_sua_api_key_aqui"  # ← Alterar aqui
admin_email = "noreply@facility.com"
```

## Passo 3: Reiniciar Supabase

```bash
npx supabase stop
npx supabase start
```

## Passo 4: Testar

1. Registre um usuário novo na aplicação
2. Verifique se recebe o email de confirmação
3. Teste "Esqueci minha senha"

---

**✅ Após estes passos, todo o sistema de email estará funcionando!**