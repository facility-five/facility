# Script para Restaurar Backup do Banco de Dados Supabase
# Uso: .\restore-database.ps1 -BackupFile "caminho/para/backup.sql"

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile,
    [switch]$ConfirmRestore = $false
)

# Verificar se o arquivo de backup existe
if (!(Test-Path $BackupFile)) {
    Write-Host "❌ Arquivo de backup não encontrado: $BackupFile" -ForegroundColor Red
    exit 1
}

# Carregar variáveis de ambiente do .env
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
    Write-Host "Variáveis de ambiente carregadas do .env" -ForegroundColor Green
} else {
    Write-Host "❌ Arquivo .env não encontrado!" -ForegroundColor Red
    exit 1
}

# Verificar se as variáveis necessárias existem
$supabaseUrl = $env:VITE_SUPABASE_URL

if (!$supabaseUrl) {
    Write-Host "❌ VITE_SUPABASE_URL não encontrada no .env" -ForegroundColor Red
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
    Write-Host "❌ URL do Supabase inválida: $supabaseUrl" -ForegroundColor Red
    exit 1
}

# Mostrar informações do backup
$fileSize = (Get-Item $BackupFile).Length
$fileSizeMB = [math]::Round($fileSize / 1MB, 2)
$fileDate = (Get-Item $BackupFile).LastWriteTime

Write-Host "`n📋 Informações do Backup:" -ForegroundColor Cyan
Write-Host "📁 Arquivo: $BackupFile" -ForegroundColor White
Write-Host "📊 Tamanho: $fileSizeMB MB" -ForegroundColor White
Write-Host "🕒 Data: $fileDate" -ForegroundColor White
Write-Host "🎯 Destino: $host" -ForegroundColor White

# Confirmação de segurança
if (!$ConfirmRestore) {
    Write-Host "`n⚠️  ATENÇÃO: Esta operação irá SOBRESCREVER os dados existentes!" -ForegroundColor Red
    Write-Host "⚠️  Certifique-se de ter um backup atual antes de prosseguir!" -ForegroundColor Red
    
    $confirmation = Read-Host "`nDeseja continuar com a restauração? (digite 'CONFIRMO' para prosseguir)"
    
    if ($confirmation -ne "CONFIRMO") {
        Write-Host "❌ Operação cancelada pelo usuário." -ForegroundColor Yellow
        exit 0
    }
}

# Solicitar senha do banco
$securePassword = Read-Host "Digite a senha do banco de dados (service_role key)" -AsSecureString
$password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))

Write-Host "`n🔄 Iniciando restauração..." -ForegroundColor Yellow

# Comando psql para restaurar
$env:PGPASSWORD = $password

try {
    $psqlCommand = @(
        "psql"
        "--host=$host"
        "--port=$port"
        "--username=postgres"
        "--dbname=$database"
        "--file=$BackupFile"
        "--verbose"
    )

    Write-Host "Executando: $($psqlCommand -join ' ')" -ForegroundColor Cyan
    
    & $psqlCommand[0] $psqlCommand[1..($psqlCommand.Length-1)]
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Restauração concluída com sucesso!" -ForegroundColor Green
        Write-Host "📁 Arquivo restaurado: $BackupFile" -ForegroundColor Green
        Write-Host "🕒 Data da restauração: $(Get-Date)" -ForegroundColor Green
        
        Write-Host "`n💡 Recomendações pós-restauração:" -ForegroundColor Cyan
        Write-Host "  - Verifique se todas as tabelas foram restauradas" -ForegroundColor White
        Write-Host "  - Teste as funcionalidades principais da aplicação" -ForegroundColor White
        Write-Host "  - Verifique se as políticas RLS estão funcionando" -ForegroundColor White
    } else {
        Write-Host "`n❌ Erro durante a restauração. Código de saída: $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erro ao executar psql: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Certifique-se de que o PostgreSQL client está instalado" -ForegroundColor Yellow
    Write-Host "💡 Download: https://www.postgresql.org/download/" -ForegroundColor Yellow
} finally {
    # Limpar senha da memória
    $env:PGPASSWORD = $null
}

Write-Host "`n💡 Exemplo de uso:" -ForegroundColor Cyan
Write-Host "  .\restore-database.ps1 -BackupFile 'backups\backup_full_20241028_014800.sql'" -ForegroundColor White
Write-Host "  .\restore-database.ps1 -BackupFile 'backups\schema_20241028_014800.sql' -ConfirmRestore" -ForegroundColor White