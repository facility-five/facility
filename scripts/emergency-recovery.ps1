# Script de Recuperação de Emergência
# Uso: .\emergency-recovery.ps1

param(
    [string]$Action = "menu"  # menu, backup-current, restore-migrations, show-backups
)

Write-Host "🚨 SCRIPT DE RECUPERAÇÃO DE EMERGÊNCIA" -ForegroundColor Red
Write-Host "=====================================" -ForegroundColor Red

function Show-Menu {
    Write-Host "`n📋 Opções de Recuperação:" -ForegroundColor Cyan
    Write-Host "1. 💾 Fazer backup do estado atual (antes de qualquer ação)" -ForegroundColor White
    Write-Host "2. 🔄 Recriar estrutura usando migrations" -ForegroundColor White
    Write-Host "3. 📂 Listar backups disponíveis" -ForegroundColor White
    Write-Host "4. 🔍 Verificar status do banco" -ForegroundColor White
    Write-Host "5. 🛠️  Resetar banco e aplicar migrations" -ForegroundColor White
    Write-Host "6. 📊 Mostrar estrutura atual do banco" -ForegroundColor White
    Write-Host "0. ❌ Sair" -ForegroundColor Gray
    
    $choice = Read-Host "`nEscolha uma opção (0-6)"
    
    switch ($choice) {
        "1" { Backup-Current-State }
        "2" { Restore-From-Migrations }
        "3" { Show-Available-Backups }
        "4" { Check-Database-Status }
        "5" { Reset-And-Migrate }
        "6" { Show-Database-Structure }
        "0" { Write-Host "Saindo..." -ForegroundColor Gray; exit 0 }
        default { Write-Host "Opção inválida!" -ForegroundColor Red; Show-Menu }
    }
}

function Backup-Current-State {
    Write-Host "`n💾 Fazendo backup do estado atual..." -ForegroundColor Yellow
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $emergencyBackup = "backups/emergency_backup_$timestamp.sql"
    
    # Criar diretório se não existir
    if (!(Test-Path "backups")) {
        New-Item -ItemType Directory -Path "backups" -Force
    }
    
    try {
        Write-Host "Executando backup de emergência..." -ForegroundColor Cyan
        & .\scripts\backup-database.ps1 -OutputDir "backups"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Backup de emergência criado com sucesso!" -ForegroundColor Green
            Write-Host "📁 Localização: backups/" -ForegroundColor Green
        } else {
            Write-Host "❌ Erro ao criar backup de emergência" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "💡 Tente usar o Supabase Dashboard para fazer backup manual" -ForegroundColor Yellow
    }
    
    Read-Host "`nPressione Enter para continuar..."
    Show-Menu
}

function Restore-From-Migrations {
    Write-Host "`n🔄 Recriando estrutura usando migrations..." -ForegroundColor Yellow
    
    Write-Host "⚠️  ATENÇÃO: Isso irá recriar a estrutura do banco!" -ForegroundColor Red
    Write-Host "⚠️  Os dados existentes podem ser perdidos!" -ForegroundColor Red
    
    $confirm = Read-Host "`nDeseja continuar? (digite 'SIM' para confirmar)"
    
    if ($confirm -ne "SIM") {
        Write-Host "Operação cancelada." -ForegroundColor Yellow
        Show-Menu
        return
    }
    
    try {
        Write-Host "`n🔄 Aplicando migrations..." -ForegroundColor Cyan
        
        # Verificar se há migrations
        if (Test-Path "supabase/migrations") {
            $migrations = Get-ChildItem "supabase/migrations/*.sql" | Sort-Object Name
            Write-Host "📋 Migrations encontradas: $($migrations.Count)" -ForegroundColor Green
            
            # Tentar usar Supabase CLI
            Write-Host "Tentando aplicar migrations via Supabase CLI..." -ForegroundColor Cyan
            npx supabase db reset --linked
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Migrations aplicadas com sucesso!" -ForegroundColor Green
            } else {
                Write-Host "❌ Erro ao aplicar migrations via CLI" -ForegroundColor Red
                Write-Host "💡 Tente aplicar manualmente via Dashboard" -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ Pasta de migrations não encontrada!" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Read-Host "`nPressione Enter para continuar..."
    Show-Menu
}

function Show-Available-Backups {
    Write-Host "`n📂 Backups Disponíveis:" -ForegroundColor Cyan
    
    if (Test-Path "backups") {
        $backups = Get-ChildItem "backups/*.sql" | Sort-Object LastWriteTime -Descending
        
        if ($backups.Count -eq 0) {
            Write-Host "❌ Nenhum backup encontrado na pasta 'backups'" -ForegroundColor Red
        } else {
            Write-Host "📋 Total de backups: $($backups.Count)" -ForegroundColor Green
            Write-Host ""
            
            foreach ($backup in $backups) {
                $size = [math]::Round($backup.Length / 1MB, 2)
                $age = (Get-Date) - $backup.LastWriteTime
                
                Write-Host "📄 $($backup.Name)" -ForegroundColor White
                Write-Host "   📊 Tamanho: $size MB" -ForegroundColor Gray
                Write-Host "   🕒 Criado: $($backup.LastWriteTime)" -ForegroundColor Gray
                Write-Host "   ⏰ Idade: $($age.Days) dias, $($age.Hours) horas" -ForegroundColor Gray
                Write-Host ""
            }
            
            Write-Host "💡 Para restaurar um backup:" -ForegroundColor Cyan
            Write-Host "   .\scripts\restore-database.ps1 -BackupFile 'backups\nome_do_arquivo.sql'" -ForegroundColor White
        }
    } else {
        Write-Host "❌ Pasta 'backups' não encontrada!" -ForegroundColor Red
        Write-Host "💡 Execute um backup primeiro" -ForegroundColor Yellow
    }
    
    Read-Host "`nPressione Enter para continuar..."
    Show-Menu
}

function Check-Database-Status {
    Write-Host "`n🔍 Verificando status do banco..." -ForegroundColor Yellow
    
    try {
        Write-Host "📋 Listando migrations aplicadas..." -ForegroundColor Cyan
        npx supabase migration list
        
        Write-Host "`n📊 Status do projeto..." -ForegroundColor Cyan
        npx supabase status
        
    } catch {
        Write-Host "❌ Erro ao verificar status: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "💡 Verifique se o Supabase CLI está configurado" -ForegroundColor Yellow
    }
    
    Read-Host "`nPressione Enter para continuar..."
    Show-Menu
}

function Reset-And-Migrate {
    Write-Host "`n🛠️  RESET COMPLETO DO BANCO" -ForegroundColor Red
    Write-Host "=========================" -ForegroundColor Red
    
    Write-Host "⚠️  ATENÇÃO: Esta ação irá:" -ForegroundColor Red
    Write-Host "   - APAGAR todos os dados existentes" -ForegroundColor Red
    Write-Host "   - Recriar toda a estrutura do banco" -ForegroundColor Red
    Write-Host "   - Aplicar todas as migrations" -ForegroundColor Red
    
    Write-Host "`n💡 Recomendação: Faça um backup antes!" -ForegroundColor Yellow
    
    $confirm1 = Read-Host "`nTem certeza? (digite 'TENHO CERTEZA')"
    
    if ($confirm1 -ne "TENHO CERTEZA") {
        Write-Host "Operação cancelada." -ForegroundColor Yellow
        Show-Menu
        return
    }
    
    $confirm2 = Read-Host "Última confirmação - digite 'RESET COMPLETO'"
    
    if ($confirm2 -ne "RESET COMPLETO") {
        Write-Host "Operação cancelada." -ForegroundColor Yellow
        Show-Menu
        return
    }
    
    try {
        Write-Host "`n🔄 Executando reset completo..." -ForegroundColor Red
        npx supabase db reset --linked
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Reset completo executado com sucesso!" -ForegroundColor Green
            Write-Host "✅ Todas as migrations foram reaplicadas!" -ForegroundColor Green
        } else {
            Write-Host "❌ Erro durante o reset" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Read-Host "`nPressione Enter para continuar..."
    Show-Menu
}

function Show-Database-Structure {
    Write-Host "`n📊 Estrutura Atual do Banco:" -ForegroundColor Cyan
    
    try {
        Write-Host "Consultando estrutura..." -ForegroundColor Yellow
        
        # Tentar mostrar tabelas via Supabase CLI
        Write-Host "`n📋 Tentando listar tabelas..." -ForegroundColor Cyan
        npx supabase db dump --schema-only --dry-run
        
    } catch {
        Write-Host "❌ Erro ao consultar estrutura: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "💡 Verifique o banco via Supabase Dashboard" -ForegroundColor Yellow
    }
    
    Read-Host "`nPressione Enter para continuar..."
    Show-Menu
}

# Executar baseado no parâmetro
switch ($Action) {
    "backup-current" { Backup-Current-State }
    "restore-migrations" { Restore-From-Migrations }
    "show-backups" { Show-Available-Backups }
    default { Show-Menu }
}