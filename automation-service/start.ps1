# Script PowerShell pour démarrer le serveur en tuant d'abord les processus sur le port 3001

Write-Host "`n🔍 Vérification du port 3001..." -ForegroundColor Cyan

# Trouver et tuer les processus utilisant le port 3001
$processes = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processes) {
    Write-Host "⚠️  Processus trouvés sur le port 3001, arrêt en cours..." -ForegroundColor Yellow
    $processes | ForEach-Object {
        taskkill /PID $_ /F 2>$null
        Write-Host "   ✅ Processus $_ arrêté" -ForegroundColor Green
    }
    Start-Sleep -Seconds 1
} else {
    Write-Host "✅ Port 3001 libre" -ForegroundColor Green
}

Write-Host "`n🚀 Démarrage du serveur...`n" -ForegroundColor Cyan
npm start

