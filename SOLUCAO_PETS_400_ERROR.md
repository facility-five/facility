# 🐾 Solução para o Erro 400 na Página de Pets

## 🔍 Problema Identificado
O erro 400 está ocorrendo porque a tabela `pets` não existe no banco de dados Supabase. Quando tentamos inserir dados em uma tabela inexistente, o PostgreSQL retorna erro 400.

## ✅ Solução Rápida

### Opção 1: Executar SQL no Dashboard do Supabase (RECOMENDADO)

1. **Acesse o Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/riduqdqarirfqouazgwf/sql

2. **Execute o SQL:**
   - Copie todo o conteúdo do arquivo `EXECUTE_IN_SUPABASE_DASHBOARD.sql`
   - Cole no SQL Editor do Supabase
   - Clique em "Run" para executar

3. **Verifique se funcionou:**
   - Recarregue a página de pets no aplicativo
   - Tente criar uma nova mascota

### Opção 2: Via Supabase CLI (alternativa)

```bash
cd "C:\Apps\App Facility"
npx supabase db push
```

**Nota:** Esta opção pode falhar devido a problemas de conexão, por isso recomendamos a Opção 1.

## 🛠️ Debug Adicionado

O código foi modificado para incluir debug detalhado:

- ✅ Verificação se a tabela `pets` existe
- ✅ Logs detalhados dos payloads enviados
- ✅ Tratamento específico para erro de tabela inexistente
- ✅ Fallback para queries simples se joins complexos falharem

## 📊 Estrutura da Tabela Pets

A tabela será criada com a seguinte estrutura:

```sql
CREATE TABLE public.pets (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  species TEXT DEFAULT 'other',
  breed TEXT,
  color TEXT,
  size TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'active',
  resident_id UUID REFERENCES residents(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔐 Políticas de Segurança (RLS)

- Usuários autenticados podem fazer SELECT, INSERT, UPDATE e DELETE
- Todas as operações são permitidas para usuários autenticados
- RLS está habilitado para segurança

## 🎯 Próximos Passos

1. Execute o SQL no dashboard
2. Teste a criação de pets
3. Se ainda houver erros, verifique o console do navegador para logs detalhados
4. Remova os arquivos de debug quando tudo estiver funcionando

## 📝 Por que isso aconteceu?

A migração `20251109103000_create_pets.sql` não foi aplicada ao banco de dados remoto. Isso pode acontecer por:

- Problemas de conectividade com o Supabase CLI
- Falhas de autenticação durante `supabase db push`
- Configuração incorreta do ambiente local

A solução manual via dashboard é a mais confiável.