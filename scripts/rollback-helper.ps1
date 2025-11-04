# Script Auxiliar de Rollback
# Uso: .\rollback-helper.ps1

param(
    [string]$BackupFile = "",
    [switch]$ListTables,
    [switch]$ShowDiff,
    [string]$RestoreTable = ""
)

Write-Host "🔄 ASSISTENTE DE ROLLBACK" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

# Carregar variáveis de ambiente
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
    Write-Host "✅ Variáveis de ambiente carregadas" -ForegroundColor Green
} else {
    Write-Host "❌ Arquivo .env não encontrado!" -ForegroundColor Red
    exit 1
}

function Show-Usage {
    Write-Host "`n📖 Como usar este script:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Listar tabelas do backup:" -ForegroundColor White
    Write-Host "   .\rollback-helper.ps1 -BackupFile 'backups\backup.sql' -ListTables" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Comparar estruturas:" -ForegroundColor White
    Write-Host "   .\rollback-helper.ps1 -BackupFile 'backups\backup.sql' -ShowDiff" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Restaurar tabela específica:" -ForegroundColor White
    Write-Host "   .\rollback-helper.ps1 -BackupFile 'backups\backup.sql' -RestoreTable 'reservas'" -ForegroundColor Gray
    Write-Host ""
}

function List-Tables-In-Backup {
    param([string]$BackupPath)
    
    if (!(Test-Path $BackupPath)) {
        Write-Host "❌ Arquivo de backup não encontrado: $BackupPath" -ForegroundColor Red
        return
    }
    
    Write-Host "`n📋 Analisando tabelas no backup..." -ForegroundColor Cyan
    
    try {
        $content = Get-Content $BackupPath -Raw
        
        # Procurar por CREATE TABLE
        $tables = [regex]::Matches($content, 'CREATE TABLE (?:public\.)?(\w+)', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        
        if ($tables.Count -eq 0) {
            Write-Host "❌ Nenhuma tabela encontrada no backup" -ForegroundColor Red
            return
        }
        
        Write-Host "📊 Tabelas encontradas no backup:" -ForegroundColor Green
        Write-Host ""
        
        foreach ($table in $tables) {
            $tableName = $table.Groups[1].Value
            Write-Host "  📄 $tableName" -ForegroundColor White
            
            # Tentar encontrar dados para esta tabela
            $dataPattern = "COPY public\.$tableName"
            if ($content -match $dataPattern) {
                Write-Host "    💾 Contém dados" -ForegroundColor Green
            } else {
                Write-Host "    📝 Apenas estrutura" -ForegroundColor Yellow
            }
        }
        
    } catch {
        Write-Host "❌ Erro ao analisar backup: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Show-Structure-Diff {
    param([string]$BackupPath)
    
    Write-Host "`n🔍 Comparando estruturas..." -ForegroundColor Cyan
    Write-Host "⚠️  Esta funcionalidade requer PostgreSQL client instalado" -ForegroundColor Yellow
    
    # Verificar se pg_dump está disponível
    try {
        $null = Get-Command pg_dump -ErrorAction Stop
    } catch {
        Write-Host "❌ pg_dump não encontrado. Instale PostgreSQL client primeiro." -ForegroundColor Red
        return
    }
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $currentSchema = "temp_current_schema_$timestamp.sql"
    
    try {
        Write-Host "📊 Extraindo estrutura atual..." -ForegroundColor Cyan
        
        $dbUrl = $env:SUPABASE_DB_URL
        if (!$dbUrl) {
            Write-Host "❌ SUPABASE_DB_URL não encontrada no .env" -ForegroundColor Red
            return
        }
        
        # Extrair apenas a estrutura atual
        pg_dump $dbUrl --schema-only --no-owner --no-privileges -f $currentSchema
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Estrutura atual extraída" -ForegroundColor Green
            Write-Host "📁 Arquivo temporário: $currentSchema" -ForegroundColor Gray
            
            Write-Host "`n💡 Para comparar manualmente:" -ForegroundColor Yellow
            Write-Host "   - Backup: $BackupPath" -ForegroundColor White
            Write-Host "   - Atual: $currentSchema" -ForegroundColor White
            Write-Host "   Use um editor de texto para comparar os arquivos" -ForegroundColor White
            
            # Limpeza automática após 5 minutos
            Write-Host "`n🗑️  O arquivo temporário será removido automaticamente" -ForegroundColor Gray
        } else {
            Write-Host "❌ Erro ao extrair estrutura atual" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
    } finally {
        # Agendar limpeza
        Start-Job -ScriptBlock {
            Start-Sleep 300  # 5 minutos
            if (Test-Path $using:currentSchema) {
                Remove-Item $using:currentSchema -Force
            }
        } | Out-Null
    }
}

function Restore-Specific-Table {
    param(
        [string]$BackupPath,
        [string]$TableName
    )
    
    if (!(Test-Path $BackupPath)) {
        Write-Host "❌ Arquivo de backup não encontrado: $BackupPath" -ForegroundColor Red
        return
    }
    
    Write-Host "`n🔄 Restaurando tabela específica: $TableName" -ForegroundColor Cyan
    
    Write-Host "⚠️  ATENÇÃO: Isso irá substituir os dados atuais da tabela!" -ForegroundColor Red
    $confirm = Read-Host "Deseja continuar? (digite 'SIM')"
    
    if ($confirm -ne "SIM") {
        Write-Host "Operação cancelada." -ForegroundColor Yellow
        return
    }
    
    try {
        # Verificar se psql está disponível
        try {
            $null = Get-Command psql -ErrorAction Stop
        } catch {
            Write-Host "❌ psql não encontrado. Instale PostgreSQL client primeiro." -ForegroundColor Red
            return
        }
        
        $dbUrl = $env:SUPABASE_DB_URL
        if (!$dbUrl) {
            Write-Host "❌ SUPABASE_DB_URL não encontrada no .env" -ForegroundColor Red
            return
        }
        
        # Criar script temporário para restaurar apenas a tabela específica
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $tempScript = "temp_restore_$($TableName)_$timestamp.sql"
        
        Write-Host "📝 Extraindo dados da tabela $TableName..." -ForegroundColor Cyan
        
        $content = Get-Content $BackupPath -Raw
        
        # Procurar pela seção COPY da tabela
        $pattern = "COPY public\.$TableName.*?(?=COPY public\.|\Z)"
        $tableData = [regex]::Match($content, $pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
        
        if (!$tableData.Success) {
            Write-Host "❌ Dados da tabela $TableName não encontrados no backup" -ForegroundColor Red
            return
        }
        
        # Criar script de restauração
        $restoreScript = @"
-- Restauração da tabela $TableName
-- Gerado em: $(Get-Date)

BEGIN;

-- Limpar dados atuais
TRUNCATE TABLE public.$TableName CASCADE;

-- Restaurar dados do backup
$($tableData.Value)

COMMIT;

-- Verificar resultado
SELECT COUNT(*) as total_registros FROM public.$TableName;
"@
        
        Set-Content -Path $tempScript -Value $restoreScript -Encoding UTF8
        
        Write-Host "✅ Script de restauração criado: $tempScript" -ForegroundColor Green
        Write-Host "🔄 Executando restauração..." -ForegroundColor Cyan
        
        # Solicitar senha
        $password = Read-Host "Digite a senha do banco de dados" -AsSecureString
        $env:PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
        
        # Executar restauração
        psql $dbUrl -f $tempScript
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Tabela $TableName restaurada com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "❌ Erro durante a restauração" -ForegroundColor Red
        }
        
        # Limpar senha da memória
        $env:PGPASSWORD = $null
        
        # Remover arquivo temporário
        Remove-Item $tempScript -Force
        
    } catch {
        Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Executar baseado nos parâmetros
if ($ListTables -and $BackupFile) {
    List-Tables-In-Backup -BackupPath $BackupFile
} elseif ($ShowDiff -and $BackupFile) {
    Show-Structure-Diff -BackupPath $BackupFile
} elseif ($RestoreTable -and $BackupFile) {
    Restore-Specific-Table -BackupPath $BackupFile -TableName $RestoreTable
} else {
    Show-Usage
}