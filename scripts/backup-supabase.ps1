# Script para Backup usando Supabase CLI
# Uso: .\backup-supabase.ps1

param(
    [string]$BackupType = "full",  # full, schema-only, data-only
    [string]$OutputDir = "backups"
)

# Criar diretório de backup se não existir
if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force
    Write-Host "Diretório de backup criado: $OutputDir" -ForegroundColor Green
}

# Timestamp para o arquivo
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Verificar se o Supabase CLI está disponível
try {
    $supabaseVersion = npx supabase --version 2>$null
    Write-Host "Supabase CLI detectado: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI não encontrado!" -ForegroundColor Red
    Write-Host "💡 Instale com: npm install -g @supabase/cli" -ForegroundColor Yellow
    exit 1
}

# Verificar se o Docker está rodando (necessário para Supabase CLI)
try {
    docker version 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker não está rodando"
    }
    Write-Host "Docker detectado e rodando" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não está rodando ou não está instalado!" -ForegroundColor Red
    Write-Host "💡 O Supabase CLI requer Docker para funcionar" -ForegroundColor Yellow
    Write-Host "💡 Inicie o Docker Desktop ou use o script backup-database.ps1" -ForegroundColor Yellow
    exit 1
}

# Definir argumentos baseados no tipo de backup
switch ($BackupType) {
    "schema-only" {
        $filename = "$OutputDir/schema_supabase_$timestamp.sql"
        $dumpArgs = @("--schema-only")
    }
    "data-only" {
        $filename = "$OutputDir/data_supabase_$timestamp.sql"
        $dumpArgs = @("--data-only")
    }
    default {
        $filename = "$OutputDir/backup_supabase_full_$timestamp.sql"
        $dumpArgs = @()
    }
}

Write-Host "`n🔄 Iniciando backup usando Supabase CLI..." -ForegroundColor Yellow
Write-Host "📋 Tipo: $BackupType" -ForegroundColor Cyan
Write-Host "📁 Arquivo: $filename" -ForegroundColor Cyan

try {
    # Comando supabase db dump
    $supabaseCommand = @("npx", "supabase", "db", "dump", "--linked", "-f", $filename) + $dumpArgs
    
    Write-Host "Executando: $($supabaseCommand -join ' ')" -ForegroundColor Gray
    
    & $supabaseCommand[0] $supabaseCommand[1..($supabaseCommand.Length-1)]
    
    if ($LASTEXITCODE -eq 0 -and (Test-Path $filename)) {
        $fileSize = (Get-Item $filename).Length
        $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
        
        Write-Host "`n✅ Backup concluído com sucesso!" -ForegroundColor Green
        Write-Host "📁 Arquivo: $filename" -ForegroundColor Green
        Write-Host "📊 Tamanho: $fileSizeMB MB" -ForegroundColor Green
        Write-Host "🕒 Data: $(Get-Date)" -ForegroundColor Green
        
        # Mostrar primeiras linhas do backup para verificação
        Write-Host "`n📋 Primeiras linhas do backup:" -ForegroundColor Cyan
        Get-Content $filename -Head 10 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
        
    } else {
        Write-Host "`n❌ Erro durante o backup. Código de saída: $LASTEXITCODE" -ForegroundColor Red
        
        if (!(Test-Path $filename)) {
            Write-Host "❌ Arquivo de backup não foi criado" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "❌ Erro ao executar Supabase CLI: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📋 Tipos de backup disponíveis:" -ForegroundColor Cyan
Write-Host "  - full: Estrutura + dados (padrão)" -ForegroundColor White
Write-Host "  - schema-only: Apenas estrutura das tabelas" -ForegroundColor White
Write-Host "  - data-only: Apenas dados" -ForegroundColor White

Write-Host "`n💡 Exemplos de uso:" -ForegroundColor Cyan
Write-Host "  .\backup-supabase.ps1" -ForegroundColor White
Write-Host "  .\backup-supabase.ps1 -BackupType schema-only" -ForegroundColor White
Write-Host "  .\backup-supabase.ps1 -BackupType data-only -OutputDir 'meus-backups'" -ForegroundColor White

Write-Host "`n🔧 Alternativas:" -ForegroundColor Cyan
Write-Host "  - Se o Docker não estiver disponível, use: .\backup-database.ps1" -ForegroundColor White
Write-Host "  - Para restaurar: .\restore-database.ps1 -BackupFile 'caminho/arquivo.sql'" -ForegroundColor White