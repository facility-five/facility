# Script para Backup do Banco de Dados Supabase
# Uso: .\backup-database.ps1

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

# Carregar variáveis de ambiente do .env
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
    Write-Host "Variáveis de ambiente carregadas do .env" -ForegroundColor Green
} else {
    Write-Host "Arquivo .env não encontrado!" -ForegroundColor Red
    exit 1
}

# Verificar se as variáveis necessárias existem
$supabaseUrl = $env:VITE_SUPABASE_URL
$supabaseKey = $env:VITE_SUPABASE_ANON_KEY

if (!$supabaseUrl) {
    Write-Host "VITE_SUPABASE_URL não encontrada no .env" -ForegroundColor Red
    exit 1
}

# Extrair informações da URL do Supabase
if ($supabaseUrl -match "https://([^.]+)\.supabase\.co") {
    $projectRef = $matches[1]
    $host = "db.$projectRef.supabase.co"
    $port = "5432"
    $database = "postgres"
    
    Write-Host "Projeto Supabase detectado: $projectRef" -ForegroundColor Green
} else {
    Write-Host "URL do Supabase inválida: $supabaseUrl" -ForegroundColor Red
    exit 1
}

# Solicitar senha do banco (service_role key ou senha do postgres)
$securePassword = Read-Host "Digite a senha do banco de dados (service_role key)" -AsSecureString
$password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))

# Definir nome do arquivo baseado no tipo de backup
switch ($BackupType) {
    "schema-only" {
        $filename = "$OutputDir/schema_$timestamp.sql"
        $pgDumpArgs = @("--schema-only", "--no-owner", "--no-privileges")
    }
    "data-only" {
        $filename = "$OutputDir/data_$timestamp.sql"
        $pgDumpArgs = @("--data-only", "--no-owner", "--no-privileges")
    }
    default {
        $filename = "$OutputDir/backup_full_$timestamp.sql"
        $pgDumpArgs = @("--no-owner", "--no-privileges")
    }
}

Write-Host "Iniciando backup do tipo: $BackupType" -ForegroundColor Yellow
Write-Host "Arquivo de destino: $filename" -ForegroundColor Yellow

# Comando pg_dump
$env:PGPASSWORD = $password

try {
    $pgDumpCommand = @(
        "pg_dump"
        "--host=$host"
        "--port=$port"
        "--username=postgres"
        "--dbname=$database"
        "--verbose"
        "--file=$filename"
    ) + $pgDumpArgs

    Write-Host "Executando: $($pgDumpCommand -join ' ')" -ForegroundColor Cyan
    
    & $pgDumpCommand[0] $pgDumpCommand[1..($pgDumpCommand.Length-1)]
    
    if ($LASTEXITCODE -eq 0) {
        $fileSize = (Get-Item $filename).Length
        $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
        
        Write-Host "✅ Backup concluído com sucesso!" -ForegroundColor Green
        Write-Host "📁 Arquivo: $filename" -ForegroundColor Green
        Write-Host "📊 Tamanho: $fileSizeMB MB" -ForegroundColor Green
        Write-Host "🕒 Data: $(Get-Date)" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro durante o backup. Código de saída: $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erro ao executar pg_dump: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Certifique-se de que o PostgreSQL client está instalado" -ForegroundColor Yellow
    Write-Host "💡 Download: https://www.postgresql.org/download/" -ForegroundColor Yellow
} finally {
    # Limpar senha da memória
    $env:PGPASSWORD = $null
}

Write-Host "`n📋 Tipos de backup disponíveis:" -ForegroundColor Cyan
Write-Host "  - full: Estrutura + dados (padrão)" -ForegroundColor White
Write-Host "  - schema-only: Apenas estrutura das tabelas" -ForegroundColor White
Write-Host "  - data-only: Apenas dados" -ForegroundColor White
Write-Host "`n💡 Exemplo de uso:" -ForegroundColor Cyan
Write-Host "  .\backup-database.ps1 -BackupType schema-only" -ForegroundColor White