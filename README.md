# App Facility — Plataforma de Gestão de Condomínios (SaaS)

Aplicação web construída com React + Vite, Tailwind CSS e Supabase, focada em gestão de condomínios e administradoras. Integra autenticação, perfis e papéis, módulos administrativos, gerenciamento de planos e pagamentos (Stripe), além de funções Edge no Supabase para automações.

## Stack
- React 18 + Vite
- TypeScript
- Tailwind CSS
- Supabase (Auth, Postgres, Storage, Edge Functions)
- Stripe (pagamentos e assinaturas)
- Vercel (deploy web)

## Funcionalidades
- Autenticação e sessão via Supabase Auth.
- Perfis com papéis: `Administrador`, `Síndico`, `Morador`, etc.
- Módulos: Admin, Manager, Resident, Síndico — navegação protegida.
- Pagamentos com RLS e RPCs para visão administrativa:
  - `get_all_payments_with_profile()`
  - `get_recent_payments_with_profile(limit integer)`
- Funções Edge (Supabase): `system-name`, `invite-user`, `create-checkout-session`, `stripe-webhook`, `create-resident-user`, entre outras.
- Scripts utilitários de backup/restore e recuperação.

## Estrutura
- `src/` código do front-end (páginas, componentes, hooks, contextos).
- `supabase/functions/` funções Edge (Deno).
- `supabase/migrations/` migrações SQL (tabelas, políticas RLS, RPCs).
- `scripts/` PowerShell para backup/restore e utilitários.

## Requisitos
- Node.js 18+
- npm ou pnpm
- Supabase CLI (para migrações e deploy de funções)
- GitHub CLI (opcional, para fluxo via terminal)

## Configuração

### Variáveis de ambiente
O front-end atualmente utiliza um cliente Supabase gerado em `src/integrations/supabase/client.ts` com `SUPABASE_URL` e a chave pública (anon). Para trocar o projeto, atualize esse arquivo ou migre para variáveis `.env` com Vite.

Para scripts e ambientes de build/deploy, use `.env` com:
- `VITE_SUPABASE_URL` — URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY` — chave pública (anon)

Para funções Edge no Supabase:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Outras integrações (ex.: Stripe) exigem segredos específicos no ambiente (webhooks, chave secreta). Configure-os conforme sua conta.

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
npm run dev
```
- Acesse `http://localhost:8080/`.

### Supabase (Banco e Funções)
- Aplicar migrações ao projeto remoto:
```bash
npx supabase db push
```
- Migracões relevantes:
  - `20251106000100_add_payments_rls_policies.sql` (RLS em `payments`)
  - `20251106020000_create_payments_rpcs.sql` (RPCs administrativos)

- Deploy de funções (exemplo):
```bash
npx supabase functions deploy system-name
npx supabase functions deploy invite-user
```

## Pagamentos e Segurança
- A tabela `payments` mantém RLS para garantir acesso apenas ao dono do registro por padrão.
- Para visão administrativa, as RPCs usam `SECURITY DEFINER` e validam papéis (ex.: "Admin do SaaS") para listar pagamentos com dados de perfil.
- Essa abordagem centraliza a lógica de autorização em funções e mantém a segurança do banco.

## Scripts Úteis
- `scripts/backup-database.ps1` — backup do banco (usa `VITE_SUPABASE_URL` e solicita service role).
- `scripts/restore-database.ps1` — restaura backup.
- `scripts/emergency-recovery.ps1` — utilitários de diagnóstico e reset.

## Deploy
- Vercel: o projeto contém `vercel.json`. Configure variáveis de ambiente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) no projeto Vercel.
- Supabase: gerencie migrações e funções via CLI ou Dashboard.

## GitHub
O repositório remoto está em:
- `https://github.com/facility-five/app-facility`

Fluxo básico:
```bash
# autenticação
gh auth login --hostname github.com --git-protocol https --web

# validar
gh auth status -h github.com

# push de alterações
git add .
git commit -m "docs: atualizar README"
git push
```

## Contribuição
- Padrões de código em TypeScript e ESLint configurado.
- Evite subir segredos. Use variáveis de ambiente.
- Pull Requests são bem-vindos; mantenha foco no escopo e na segurança.

## Suporte
Em caso de problemas com migrações ou funções, verifique:
- Variáveis de ambiente corretamente definidas.
- Logs de funções no Supabase.
- Políticas RLS ativas e permissões do usuário.

---
Este README resume configuração, segurança e fluxos principais para acelerar seu desenvolvimento e operação da plataforma.