# Como Aplicar a Migration no Supabase

## Problema Identificado

1. **Inconsistência no valor do role**: O campo "Admin do SaaS" estava sendo enviado como "Administrador" ✅ **CORRIGIDO**
2. **Falta de trigger para criar perfil**: Não havia um trigger automático para criar o perfil na tabela `profiles` quando um usuário é criado

## Correções Implementadas

### 1. NewUserModal.tsx
- Corrigido o valor do `SelectItem` de "Administrador" para "Admin do SaaS"
- Agora o valor enviado corresponde ao esperado no banco de dados

### 2. Migration: 20251106040000_create_profiles_trigger.sql
Esta migration cria:
- ✅ Tabela `profiles` (se não existir)
- ✅ Trigger `on_auth_user_created` - cria perfil automaticamente quando usuário é criado
- ✅ Trigger `on_auth_user_login` - atualiza last_sign_in_at no perfil
- ✅ Função RPC `get_system_users()` - retorna lista de usuários para admins
- ✅ Políticas RLS para segurança

## Como Aplicar a Migration

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse: https://supabase.com/dashboard/project/riduqdqarirfqouazgwf
2. Vá em **SQL Editor**
3. Clique em **New Query**
4. Copie todo o conteúdo do arquivo `supabase/migrations/20251106040000_create_profiles_trigger.sql`
5. Cole no editor
6. Clique em **Run** ou pressione `Ctrl+Enter`

### Opção 2: Via Supabase CLI

```powershell
# 1. Instalar Supabase CLI (se não tiver)
scoop install supabase

# 2. Login no Supabase
supabase login

# 3. Link com o projeto
supabase link --project-ref riduqdqarirfqouazgwf

# 4. Aplicar migrations pendentes
supabase db push
```

### Opção 3: Via MCP Supabase Tool

Se você tiver o MCP Supabase configurado, pode usar:

```
apply_migration com o conteúdo da migration
```

## Verificação Pós-Migration

Após aplicar a migration, teste:

1. **Criar novo usuário Admin do SaaS**:
   - Acesse: https://www.facilityfincas.es/admin/usuarios
   - Clique em "Adicionar Usuário"
   - Preencha os dados
   - Selecione "Admin do SaaS" como tipo
   - Clique em "Registrar"

2. **Editar usuário existente**:
   - Clique no ícone de edição (lápis)
   - Modifique os dados
   - Clique em "Salvar"

3. **Verificar no banco**:
   ```sql
   -- Ver todos os perfis
   SELECT * FROM public.profiles;
   
   -- Ver apenas admins
   SELECT * FROM public.profiles WHERE role = 'Admin do SaaS';
   ```

## Estrutura da Tabela Profiles

```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,              -- Referência ao auth.users(id)
    first_name TEXT,                  -- Nome
    last_name TEXT,                   -- Sobrenome
    email TEXT,                       -- Email
    whatsapp TEXT,                    -- WhatsApp
    role TEXT DEFAULT 'Morador',      -- Tipo de usuário
    status TEXT DEFAULT 'Ativo',      -- Status
    last_sign_in_at TIMESTAMP,        -- Último acesso
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## Roles Disponíveis

- `Admin do SaaS` - Administrador da plataforma
- `Administradora` - Administradora de condomínio
- `Síndico` - Síndico
- `Funcionário` - Funcionário
- `Morador` - Morador (padrão)

## Status Disponíveis

- `Ativo` - Usuário ativo (padrão)
- `Inativo` - Usuário inativo
- `Suspenso` - Usuário suspenso

## Troubleshooting

### Erro: "relation profiles already exists"
- A tabela já existe, mas pode estar sem o trigger
- Execute apenas a parte do trigger da migration

### Erro: "permission denied"
- Você precisa ter permissões de admin no Supabase
- Use a service role key ou aplique via Dashboard

### Erro: "function get_system_users already exists"
- A função já existe, use `CREATE OR REPLACE FUNCTION` (já está na migration)

## Próximos Passos

Após aplicar a migration:
1. ✅ Testar criação de usuário Admin do SaaS
2. ✅ Testar edição de usuário
3. ✅ Verificar se os dados são salvos corretamente
4. ✅ Verificar se a lista de usuários é carregada
