# 🗄️ Guia de Backup e Restauração do Banco de Dados

Este guia explica como fazer backup e restauração do banco de dados Supabase do projeto Facility.

## 📋 Índice

- [Métodos de Backup](#métodos-de-backup)
- [Pré-requisitos](#pré-requisitos)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Como Fazer Backup](#como-fazer-backup)
- [Como Restaurar Backup](#como-restaurar-backup)
- [Tipos de Backup](#tipos-de-backup)
- [Automação](#automação)
- [Troubleshooting](#troubleshooting)

## 🔧 Métodos de Backup

### 1. **Método Recomendado: PostgreSQL Client (pg_dump)**
- ✅ Funciona sem Docker
- ✅ Mais rápido e confiável
- ✅ Controle total sobre o processo
- ❌ Requer instalação do PostgreSQL client

### 2. **Método Alternativo: Supabase CLI**
- ✅ Integração nativa com Supabase
- ✅ Comandos simplificados
- ❌ Requer Docker Desktop rodando
- ❌ Pode ser mais lento

## 📦 Pré-requisitos

### Para PostgreSQL Client (Recomendado)
```powershell
# Instalar PostgreSQL (inclui pg_dump e psql)
# Download: https://www.postgresql.org/download/windows/
# Ou via Chocolatey:
choco install postgresql
```

### Para Supabase CLI
```powershell
# Docker Desktop deve estar rodando
# Supabase CLI já está instalado no projeto
```

## 📜 Scripts Disponíveis

| Script | Descrição | Método |
|--------|-----------|---------|
| `backup-database.ps1` | Backup usando pg_dump (recomendado) | PostgreSQL Client |
| `backup-supabase.ps1` | Backup usando Supabase CLI | Supabase CLI |
| `restore-database.ps1` | Restauração usando psql | PostgreSQL Client |

## 💾 Como Fazer Backup

### Método 1: PostgreSQL Client (Recomendado)

```powershell
# Backup completo (estrutura + dados)
.\scripts\backup-database.ps1

# Backup apenas da estrutura
.\scripts\backup-database.ps1 -BackupType schema-only

# Backup apenas dos dados
.\scripts\backup-database.ps1 -BackupType data-only

# Backup em diretório específico
.\scripts\backup-database.ps1 -OutputDir "meus-backups"
```

### Método 2: Supabase CLI

```powershell
# Backup completo (requer Docker)
.\scripts\backup-supabase.ps1

# Backup apenas da estrutura
.\scripts\backup-supabase.ps1 -BackupType schema-only

# Backup apenas dos dados
.\scripts\backup-supabase.ps1 -BackupType data-only
```

### Backup Manual via Supabase Dashboard

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para seu projeto
3. Navegue para **Settings** → **Database**
4. Clique em **Database Backups**
5. Faça download do backup desejado

## 🔄 Como Restaurar Backup

```powershell
# Restaurar backup (com confirmação interativa)
.\scripts\restore-database.ps1 -BackupFile "backups\backup_full_20241028_014800.sql"

# Restaurar sem confirmação (cuidado!)
.\scripts\restore-database.ps1 -BackupFile "backups\backup_full_20241028_014800.sql" -ConfirmRestore
```

### ⚠️ **ATENÇÃO**: A restauração sobrescreve todos os dados existentes!

## 📊 Tipos de Backup

### 1. **Full Backup** (Padrão)
- **Conteúdo**: Estrutura completa + todos os dados
- **Uso**: Backup completo para recuperação total
- **Arquivo**: `backup_full_YYYYMMDD_HHMMSS.sql`

### 2. **Schema Only**
- **Conteúdo**: Apenas estrutura (tabelas, índices, políticas, funções)
- **Uso**: Recriar estrutura em novo ambiente
- **Arquivo**: `schema_YYYYMMDD_HHMMSS.sql`

### 3. **Data Only**
- **Conteúdo**: Apenas dados das tabelas
- **Uso**: Migrar dados entre ambientes com mesma estrutura
- **Arquivo**: `data_YYYYMMDD_HHMMSS.sql`

## 🤖 Automação

### Backup Diário Automático

Crie uma tarefa agendada no Windows:

```powershell
# Criar tarefa que roda todo dia às 2:00 AM
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File 'C:\caminho\para\projeto\scripts\backup-database.ps1'"
$trigger = New-ScheduledTaskTrigger -Daily -At "02:00"
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName "Facility-Backup-Diario" -Action $action -Trigger $trigger -Settings $settings
```

### Script de Limpeza de Backups Antigos

```powershell
# Manter apenas backups dos últimos 30 dias
Get-ChildItem "backups\*.sql" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | Remove-Item -Force
```

## 🔍 Estrutura dos Backups

Os backups incluem:

- ✅ **Tabelas**: condominiums, residents, reservas, common_areas, etc.
- ✅ **Políticas RLS**: Todas as políticas de segurança
- ✅ **Índices**: Otimizações de performance
- ✅ **Funções**: Funções customizadas do banco
- ✅ **Triggers**: Gatilhos automáticos
- ✅ **Dados**: Todos os registros das tabelas

## 🚨 Troubleshooting

### Erro: "pg_dump não encontrado"
```powershell
# Solução: Instalar PostgreSQL client
# Download: https://www.postgresql.org/download/
# Ou adicionar ao PATH: C:\Program Files\PostgreSQL\16\bin
```

### Erro: "Docker não está rodando"
```powershell
# Solução: Iniciar Docker Desktop ou usar método alternativo
.\scripts\backup-database.ps1  # Use este em vez do Supabase CLI
```

### Erro: "Acesso negado ao banco"
```powershell
# Verifique se a service_role key está correta
# Encontre em: Supabase Dashboard → Settings → API → service_role
```

### Backup muito grande
```powershell
# Use backup apenas de dados se a estrutura não mudou
.\scripts\backup-database.ps1 -BackupType data-only

# Ou comprima o arquivo
Compress-Archive -Path "backups\*.sql" -DestinationPath "backups\backup_$(Get-Date -Format 'yyyyMMdd').zip"
```

## 📅 Estratégia de Backup Recomendada

### Desenvolvimento
- **Frequência**: Antes de mudanças importantes
- **Tipo**: Schema-only (estrutura) + backup completo semanal
- **Retenção**: 7 dias

### Produção
- **Frequência**: Diário (automático)
- **Tipo**: Full backup
- **Retenção**: 30 dias localmente + backup mensal em nuvem
- **Localização**: Múltiplas (local + cloud storage)

## 🚨 Recuperação de Emergência

### Se a Restauração Deu Errado

Quando uma restauração não funciona como esperado, você tem várias opções:

#### 1. Script de Recuperação de Emergência
```powershell
# Executar o assistente de recuperação
.\scripts\emergency-recovery.ps1
```

**Opções disponíveis:**
- 💾 **Backup do estado atual** - Salva o que está no banco agora
- 🔄 **Recriar usando migrations** - Aplica todas as migrations novamente
- 📂 **Listar backups disponíveis** - Mostra todos os backups
- 🔍 **Verificar status do banco** - Diagnóstico completo
- 🛠️ **Reset completo** - Apaga tudo e recria do zero
- 📊 **Mostrar estrutura atual** - Vê como está o banco

#### 2. Rollback Inteligente
```powershell
# Listar tabelas em um backup específico
.\scripts\rollback-helper.ps1 -BackupFile "backups\backup_20241201_143022.sql" -ListTables

# Comparar estruturas (atual vs backup)
.\scripts\rollback-helper.ps1 -BackupFile "backups\backup_20241201_143022.sql" -ShowDiff

# Restaurar apenas uma tabela específica
.\scripts\rollback-helper.ps1 -BackupFile "backups\backup_20241201_143022.sql" -RestoreTable "reservas"
```

#### 3. Cenários Comuns de Problemas

**🔴 Problema: "Tabelas não existem após restauração"**
```powershell
# Solução: Recriar estrutura com migrations
.\scripts\emergency-recovery.ps1
# Escolha opção 2 ou 5
```

**🔴 Problema: "Dados corrompidos ou incompletos"**
```powershell
# Solução: Restaurar tabelas específicas
.\scripts\rollback-helper.ps1 -BackupFile "seu_backup.sql" -RestoreTable "nome_da_tabela"
```

**🔴 Problema: "Erro de permissões ou RLS"**
```powershell
# Solução: Reset completo
.\scripts\emergency-recovery.ps1
# Escolha opção 5 (Reset completo)
```

**🔴 Problema: "Backup muito antigo"**
```powershell
# Solução: Aplicar migrations após restauração
npx supabase db reset --linked
```

#### 4. Plano de Contingência

1. **SEMPRE faça backup antes de qualquer ação de recuperação**
2. **Use o ambiente de desenvolvimento primeiro** para testar
3. **Documente o que deu errado** para evitar repetir
4. **Mantenha backups de diferentes períodos** (diário, semanal, mensal)

#### 5. Comandos de Emergência Rápidos

```powershell
# Backup de emergência AGORA
.\scripts\backup-database.ps1 -Type complete

# Ver o que tem no banco atual
npx supabase db dump --schema-only --dry-run

# Listar migrations aplicadas
npx supabase migration list

# Status completo do projeto
npx supabase status

# Reset total (CUIDADO!)
npx supabase db reset --linked
```

## 🔐 Segurança

- ✅ **Nunca** commite backups no Git (já está no .gitignore)
- ✅ **Sempre** use conexões SSL para backup remoto
- ✅ **Criptografe** backups sensíveis antes de armazenar
- ✅ **Teste** restaurações periodicamente
- ✅ **Documente** procedimentos de recuperação
- ✅ **Mantenha logs de recuperação** - Documente todas as ações de emergência

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs de erro nos scripts
2. Confirme conectividade com o banco
3. Valide credenciais no arquivo `.env`
4. Teste com backup menor primeiro
5. Consulte a documentação do Supabase

---

**💡 Dica**: Sempre teste a restauração em ambiente de desenvolvimento antes de aplicar em produção!