# Notas da Sessão - 06/11/2025

## 🎯 Objetivos da Sessão

- Conectar repositório local ao GitHub via CLI
- Sincronizar código local com repositório remoto
- Pesquisar alternativas de pagamento para Espanha
- Preparar integração com PayPal

---

## ✅ Tarefas Concluídas

### 1. Configuração GitHub CLI
- **Status**: ✅ Concluído
- **Localização**: `C:\Program Files\GitHub CLI\gh.exe`
- **PATH**: Já configurado em variáveis de ambiente do sistema
- **Versão**: 2.81.0

### 2. Push para GitHub
- **Repositório**: https://github.com/facility-five/facility
- **Branch**: `main`
- **Commits realizados**:
  1. `feat: add support and tasks modules, update payment system and Stripe integration`
     - 20 arquivos modificados
     - 1.326 linhas adicionadas, 86 removidas
     - Novos módulos: Soporte, Tareas
     - Funções Supabase: activate-subscription-fallback, verify-checkout-session
     - Migrações: RLS policies, support/tasks tables, payment RPCs
  
  2. `docs: corrigir URL do repositório GitHub no README`
     - Atualização da URL do repositório no README.md

### 3. Atualização Documentação
- **Arquivo**: `README.md`
- **Mudança**: URL do repositório corrigida
  - ❌ Antiga: `https://github.com/facility-five/app-facility`
  - ✅ Nova: `https://github.com/facility-five/facility`

---

## 🔍 Pesquisa: Meios de Pagamento para Espanha

### Alternativas ao Stripe

#### 1. **Redsys** ⭐ Recomendado para mercado espanhol
- Líder de mercado na Espanha
- Integrado com todos os bancos espanhóis
- Suporta Bizum (muito popular)
- Taxas geralmente mais baixas que Stripe
- 🔗 https://www.redsys.es/

#### 2. **PayPal** ⭐ Em análise para implementação
- Popular na Europa
- Fácil integração
- Taxas: ~2.9% + €0.35 (nacional), ~3.4% (internacional)
- Sem mensalidade
- SDK: `@paypal/react-paypal-js`

#### 3. **Adyen**
- Empresa holandesa, forte na Europa
- Aceita métodos locais (Bizum, iDEAL)
- Requer volume mínimo de transações

#### 4. **Mollie**
- Popular na Europa
- Sem taxas de setup
- Suporta Bizum, SEPA, cartões

#### 5. **MONEI**
- Empresa espanhola
- Especializado em e-commerce
- 🔗 https://monei.com/

#### 6. **Paycomet**
- Empresa espanhola
- Tokenização de cartões
- Bom para SaaS

### Métodos de Pagamento Locais (Espanha)
- **Bizum**: Transferência instantânea entre bancos (muito popular!)
- **SEPA**: Para pagamentos recorrentes
- **Cartões**: Visa, Mastercard, American Express

---

## 🚀 Próximos Passos: Integração PayPal

### Pendente: Credenciais PayPal

#### Ambiente Sandbox (Testes)
Necessário obter de: https://developer.paypal.com/dashboard/

**Credenciais da API:**
- [ ] Client ID (Sandbox)
- [ ] Secret Key (Sandbox)

**Contas de Teste (opcional):**
- [ ] Email conta Business (vendedor)
- [ ] Senha conta Business
- [ ] Email conta Personal (comprador)
- [ ] Senha conta Personal

#### Onde Encontrar:
1. Login em https://developer.paypal.com/
2. "Apps & Credentials"
3. Toggle "Sandbox"
4. "REST API apps" → "Default Application"
5. Copiar Client ID e Secret
6. "Sandbox" → "Accounts" para contas de teste

### Implementação Planejada

**Dependências:**
```bash
npm install @paypal/react-paypal-js
```

**Variáveis de Ambiente (.env):**
```env
# PayPal Sandbox (Teste)
VITE_PAYPAL_CLIENT_ID=seu_client_id_sandbox
PAYPAL_SECRET_KEY=seu_secret_sandbox

# PayPal Production (Futuro)
# VITE_PAYPAL_CLIENT_ID=seu_client_id_production
# PAYPAL_SECRET_KEY=seu_secret_production
```

**Opções de Integração:**
1. PayPal como alternativa ao Stripe (usuário escolhe)
2. PayPal Subscriptions (pagamentos recorrentes)
3. Botão de teste inicial (validação)

---

## 📝 Notas Técnicas

### Git Workflow
- Mudanças sempre ocorrem primeiro nos **arquivos locais**
- Fluxo: `Working Directory` → `git add` → `git commit` → `git push`
- Apenas após `git push` as mudanças ficam visíveis no GitHub

### Trabalho Colaborativo
- Múltiplas IDEs podem trabalhar no mesmo repositório
- Sempre fazer `git pull` antes de começar
- Comunicar quais arquivos estão sendo editados
- Usar branches para features grandes

### GitHub CLI
- PATH salvo em: `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\Environment`
- Reiniciar terminal após instalação para carregar PATH
- Comando para recarregar PATH na sessão atual:
  ```powershell
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
  ```

---

## 📚 Referências

### Documentação
- **PayPal Developer**: https://developer.paypal.com/
- **PayPal REST API**: https://developer.paypal.com/docs/api/overview/
- **Redsys**: https://www.redsys.es/
- **MONEI**: https://monei.com/

### Repositório
- **GitHub**: https://github.com/facility-five/facility
- **Branch principal**: `main`

### Stack Atual
- React 18 + Vite + TypeScript
- Supabase (Auth, Postgres, Edge Functions)
- Stripe (pagamentos - atual)
- Tailwind CSS
- Vercel (deploy)

---

## ⏭️ Ações Pendentes

1. **Aguardar credenciais PayPal Sandbox**
2. **Implementar integração PayPal** quando credenciais estiverem disponíveis
3. **Testar fluxo de pagamento** em ambiente sandbox
4. **Documentar processo** de configuração PayPal

---

**Última atualização**: 06/11/2025 - 17:59 UTC-03:00
