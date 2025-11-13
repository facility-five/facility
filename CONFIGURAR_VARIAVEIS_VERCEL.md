# ⚠️ CONFIGURAÇÃO URGENTE - Variáveis de Ambiente Vercel

## 🚨 Erro em Produção
```
Missing required Supabase environment variables. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.
```

## 🔧 SOLUÇÃO: Configurar Variáveis no Vercel

### 1. Acessar Dashboard Vercel
- Ir para: https://vercel.com/dashboard
- Selecionar o projeto `facility` (ou `facility-app`)

### 2. Configurar Environment Variables
Ir em **Settings** → **Environment Variables** e adicionar:

```bash
# Nome: VITE_SUPABASE_URL
# Valor: https://riduqdqarirfqouazgwf.supabase.co
# Environment: Production, Preview, Development

# Nome: VITE_SUPABASE_ANON_KEY  
# Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZHVxZHFhcmlyZnFvdWF6Z3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMDQzODUsImV4cCI6MjA3NDY4MDM4NX0.sXrlOxHDKde3xo0aKIoIoPsuvEPIqIcvCIzwfegP4T0
# Environment: Production, Preview, Development

# Nome: SUPABASE_AUTH_SMTP_PASS
# Valor: re_g9vvTZuo_JhgVUCYcmrQpBiov997pAQG3
# Environment: Production, Preview, Development

# Nome: RESEND_API_KEY
# Valor: re_g9vvTZuo_JhgVUCYcmrQpBiov997pAQG3
# Environment: Production, Preview, Development
```

### 3. Redeployment Necessário
Após adicionar as variáveis:
- Ir em **Deployments**
- Clicar nos três pontos do último deploy
- Selecionar **Redeploy**

### 4. Verificação
Aguardar o redeploy e verificar se o erro foi resolvido em:
- https://facilityfincas.es
- https://www.facilityfincas.es

## 🔄 Comando Alternativo (se tiver Vercel CLI)
```bash
vercel env add VITE_SUPABASE_URL production
# Colar: https://riduqdqarirfqouazgwf.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production  
# Colar a chave anon key

vercel --prod
```

## ✅ Status Esperado
Após configuração, o console não deve mais mostrar:
- ❌ "Missing required Supabase environment variables"
- ✅ Aplicação carregando normalmente
- ✅ Autenticação funcionando
- ✅ Dados do Supabase carregando

---
**IMPORTANTE**: As variáveis VITE_* precisam estar no Vercel para serem incluídas no build de produção!