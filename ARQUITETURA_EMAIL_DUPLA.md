# 📧 Arquitetura de Email Dupla - Facility

## 🎯 Estratégia de Separação

### 🔐 **SUPABASE AUTH** - Emails de Autenticação
- ✅ **Confirmação de email** (signup)
- ✅ **Recuperação de senha** (password recovery)
- ✅ **Convites de usuário** (user invitations)
- ✅ **Mudança de email** (email change)
- ✅ **Login mágico** (magic links)

### 📨 **RESEND** - Emails Transacionais  
- ✅ **Notificações de comunicados** (new announcements)
- ✅ **Convites de moradores** (resident invitations)
- ✅ **Lembretes do sistema** (system reminders)
- ✅ **Relatórios automáticos** (automated reports)
- ✅ **Newsletters** (facility updates)

---

## 🏗️ Configuração Técnica

### 1. **Supabase Auth SMTP** (Produção)
```
Host: smtp.supabase.co
Port: 587
Username: [Supabase provided]
Password: [Supabase provided]
Sender email: no-responda@facilityfincas.es
```

### 2. **Resend Edge Functions** (Transacionais)
```javascript
// supabase/functions/*
RESEND_API_KEY=re_g9vvTZuo_JhgVUCYcmrQpBiov997pAQG3
RESEND_FROM=Facility <no-responda@facilityfincas.es>
```

---

## 📁 Estrutura de Arquivos

### Supabase Auth Templates:
```
supabase/templates/
├── confirm.html          # Confirmação de email
├── recovery.html         # Recuperação de senha
├── invite.html           # Convites de usuário
└── magic_link.html       # Login mágico
```

### Resend Edge Functions:
```
supabase/functions/
├── send-notification-email/     # Notificações
├── send-resident-invite/        # Convites de morador
├── send-announcement/           # Comunicados
├── send-report/                 # Relatórios
└── send-newsletter/             # Newsletter
```

---

## ⚙️ Implementação

### Fase 1: Configurar Supabase Auth Nativo
- [ ] Desabilitar SMTP customizado no Supabase Studio
- [ ] Usar SMTP nativo do Supabase
- [ ] Configurar templates nativos
- [ ] Testar auth flows

### Fase 2: Otimizar Resend para Transacionais
- [ ] Manter Edge Functions existentes
- [ ] Criar novos endpoints para notificações
- [ ] Implementar templates específicos
- [ ] Sistema de tracking/analytics

### Fase 3: Integração Completa
- [ ] Dashboard de emails enviados
- [ ] Logs unificados
- [ ] Monitoramento de entrega
- [ ] A/B testing para templates

---

## 🚀 Vantagens desta Arquitetura

### 🔐 **Supabase Auth:**
- ✅ **Nativo e confiável** para autenticação
- ✅ **Zero configuração** complexa
- ✅ **Integrado** com todo auth flow
- ✅ **Rate limiting** automático
- ✅ **Segurança** enterprise

### 📨 **Resend:**
- ✅ **Flexibilidade total** para transacionais
- ✅ **Templates customizados** ilimitados
- ✅ **Analytics avançados** de entrega
- ✅ **API simples** e documentada
- ✅ **Webhooks** para tracking

---

## 🧪 Teste da Configuração

### Auth Emails (Supabase):
1. Registro de usuário → Email confirmação
2. Esqueci senha → Email recovery
3. Convite admin → Email convite

### Transacional Emails (Resend):
1. Novo comunicado → Notificação residente
2. Convite morador → Email personalizado
3. Relatório mensal → Email automático

**Status:** 🔄 Pronto para implementação