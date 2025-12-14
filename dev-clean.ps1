# Script pour nettoyer et relancer Next.js proprement
# Usage: .\dev-clean.ps1

Write-Host "🧹 Nettoyage des processus Next.js..." -ForegroundColor Yellow

# 1. Trouver et arrêter tous les processus Next.js
Get-Process | Where-Object {$_.ProcessName -eq "node" -and $_.Path -like "*nodejs*"} | ForEach-Object {
    $cmd = (Get-WmiObject Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
    if ($cmd -like "*next*" -or $cmd -like "*dev*") {
        Write-Host "  ⏹️  Arrêt du processus PID $($_.Id)" -ForegroundColor Red
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
}

# 2. Attendre que les processus se terminent
Start-Sleep -Seconds 2

# 3. Nettoyer le lock file
$lockPath = ".next\dev\lock"
if (Test-Path $lockPath) {
    Remove-Item $lockPath -Force -ErrorAction SilentlyContinue
    Write-Host "  🗑️  Lock file supprimé" -ForegroundColor Green
}

# 4. Nettoyer tous les lock files dans .next/dev
if (Test-Path ".next\dev") {
    Get-ChildItem ".next\dev" -Recurse -Filter "lock" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
}

# 5. Vérifier que les ports sont libres
$port3000 = netstat -ano | findstr ":3000" | findstr "LISTENING"
$port3001 = netstat -ano | findstr ":3001" | findstr "LISTENING"

if ($port3000 -or $port3001) {
    Write-Host "  ⚠️  Les ports 3000/3001 sont encore utilisés" -ForegroundColor Yellow
    Write-Host "  💡 Essayez de fermer manuellement les processus ou redémarrez le terminal" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ Ports libres" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Lancement de npm run dev..." -ForegroundColor Cyan
Write-Host ""

# 6. Lancer npm run dev
npm run dev
