# Notas da Sessão — App Facility

Data: 2025-11-06

## Resumo
- Repositório correto confirmado: `https://github.com/facility-five/facility` (visibilidade: PUBLIC, branch padrão: `main`).
- Remoto `origin` atualizado para `https://github.com/facility-five/facility.git` e validado com `git remote -v`.
- Branch `main` publicado e upstream configurado: `branch 'main' set up to track 'origin/main'`.
- `README.md` atualizado com visão geral do projeto, stack, Supabase, Stripe, migrações e link do repositório correto.

## Pontos Técnicos
- Front-end: React + Vite + Tailwind + TypeScript.
- Supabase: Auth, Postgres, Storage, Edge Functions.
- Stripe: pagamentos e assinaturas.
- Deploy: Vercel.

## Variáveis de Ambiente
- Front-end e scripts:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Funções Edge (Supabase):
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

Observação: há chaves hardcoded em `src/integrations/supabase/client.ts` e `check-data.cjs`. Ideal migrar para `.env` via `import.meta.env` (Vite) para padronizar.

## Supabase (Migrações e Funções)
- Migrações relevantes:
  - `20251106000100_add_payments_rls_policies.sql`
  - `20251106020000_create_payments_rpcs.sql`
- Deploy de funções (exemplos):
  - `system-name`, `invite-user`, `stripe-webhook`, `create-checkout-session`, `create-resident-user`.

## Segurança de Pagamentos
- RLS ativo em `payments` assegura acesso por dono.
- RPCs administrativas usam `SECURITY DEFINER` e verificação de papéis para visão consolidada.

## Próximos Passos Sugeridos
- CI com GitHub Actions: build e lint em PRs.
- Proteção de branch `main`: PR obrigatório, approvals e checks.
- Padronizar variáveis com `.env` (Vite) no front-end.
- Guia de deploy detalhado para Vercel com envs (`VITE_*`).
- Adicionar testes básicos e checagens de tipos no CI.

## Links Úteis
- Repositório: `https://github.com/facility-five/facility`
- Supabase CLI: `https://supabase.com/docs/guides/cli`
- Vercel: `https://vercel.com/docs`

---
Este documento registra o estado atual e direciona próximos passos para continuidade do trabalho.