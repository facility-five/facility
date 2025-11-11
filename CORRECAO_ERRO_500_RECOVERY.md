# 🚨 Correção Erro 500 - Reset Password

## Problema Identificado

**Erro:** 
```
riduqdqarirfqouazgwf.supabase.co/auth/v1/recover?redirect_to=https%3A%2F%2Fwww.facilityfincas.es%2Fnova-senha:1 
Failed to load resource: the server responded with a status of 500 ()
```

## Causa do Problema

O Supabase Auth está rejeitando o redirect para `facilityfincas.es/nova-senha` porque:

1. **URL não está na whitelist** do Supabase Auth
2. **Site URL não está configurado** para o domínio de produção
3. **Additional Redirect URLs** não incluem o domínio de produção

## ✅ Soluções para Implementar

### 1. **Configurar no Supabase Studio (URGENTE)**

#### 1.1 Authentication Settings:
```bash
# Supabase Dashboard > Authentication > URL Configuration

Site URL: https://www.facilityfincas.es

Additional redirect URLs:
- https://www.facilityfincas.es/nova-senha
- https://www.facilityfincas.es/nueva-contrasena
- https://www.facilityfincas.es/auth/callback
- https://facilityfincas.es/nova-senha
- https://facilityfincas.es/nueva-contrasena
```

#### 1.2 Verificar SMTP Settings:
```bash
# Authentication > Settings > SMTP Settings

✅ Host: smtp.resend.com
✅ Port: 587
✅ Username: resend
✅ Password: re_g9vvTZuo_JhgVUCYcmrQpBiov997pAQG3
✅ Sender email: noreply@facility.com
✅ Sender name: Facility
```

### 2. **Verificar Templates de Email**

O template `recovery.html` está usando `{{ .ActionLink }}` que deve gerar:
```html
<a href="{{ .ActionLink }}" class="button">Redefinir Senha</a>
```

**Verificar se o ActionLink está sendo gerado corretamente para:**
- `https://www.facilityfincas.es/nova-senha?access_token=...&refresh_token=...&type=recovery`

### 3. **Configuração de Domínio**

#### 3.1 Verificar DNS/SSL:
- ✅ Certificado SSL válido para `facilityfincas.es`
- ✅ Redirect de `http` para `https` configurado
- ✅ Subdomain `www` configurado

#### 3.2 Verificar Deploy:
- ✅ Aplicação deployada em `facilityfincas.es`
- ✅ Rota `/nova-senha` funcional
- ✅ Componente `ResetPassword` acessível

### 4. **Teste Rápido**

Para testar se o problema é de configuração:

#### Método 1 - URL Manual:
1. Abra: `https://www.facilityfincas.es/nova-senha`
2. Verifique se carrega o componente ResetPassword
3. Se carregar = problema é do Supabase Auth
4. Se não carregar = problema é do deploy/DNS

#### Método 2 - Console Browser:
```javascript
// No console do browser, em facilityfincas.es
console.log(window.location.href);
// Deve retornar: https://www.facilityfincas.es/...
```

### 5. **Fix Temporário (Se Urgente)**

Se precisar de fix imediato, pode alterar temporariamente:

#### Opção A - Redirect para domínio funcionando:
```bash
# No Supabase Studio > Auth > URL Configuration
# Temporariamente usar:
Site URL: https://outro-dominio-funcionando.com
```

#### Opção B - Usar localhost para teste:
```bash
Site URL: http://localhost:5173
Additional URLs: ["http://localhost:5173/nova-senha"]
```

## 📋 Checklist de Correção

- [ ] **Configurar Site URL** no Supabase Studio
- [ ] **Adicionar redirect URLs** para facilityfincas.es
- [ ] **Verificar SMTP settings** estão corretos
- [ ] **Testar URL manual** `/nova-senha`
- [ ] **Verificar deploy** está funcionando
- [ ] **Testar email recovery** completo

## 🎯 Configuração Correta Final

```bash
# Supabase Studio > Authentication > URL Configuration

Site URL: 
https://www.facilityfincas.es

Additional redirect URLs:
https://www.facilityfincas.es/nova-senha
https://www.facilityfincas.es/nueva-contrasena  
https://facilityfincas.es/nova-senha
https://facilityfincas.es/nueva-contrasena
https://www.facilityfincas.es/auth/callback
```

## ⚡ Ação Imediata

**1. Acesse Supabase Studio AGORA**
**2. Configure Site URL + Redirect URLs**  
**3. Teste recovery email novamente**

---

**Após essa configuração, o erro 500 deve ser resolvido!** 🚀