# ============================================
# CONFIGURATION AUTOMATIQUE DU SYSTÈME ANALYTICS
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURATION ANALYTICS" -ForegroundColor Cyan
Write-Host "  AnnonceAuto.ci" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Étape 1: Vérifier Supabase
Write-Host "[1/3] Vérification de la configuration Supabase..." -ForegroundColor Yellow

$envFile = ".env.local"
if (Test-Path $envFile) {
    Write-Host "   Fichier .env.local trouvé!" -ForegroundColor Green
    
    # Lire les variables
    $content = Get-Content $envFile
    $hasUrl = $content | Select-String "VITE_SUPABASE_URL"
    $hasKey = $content | Select-String "VITE_SUPABASE_ANON_KEY"
    
    if ($hasUrl -and $hasKey) {
        Write-Host "   Supabase est configuré!" -ForegroundColor Green
    } else {
        Write-Host "   ERREUR: Variables Supabase manquantes dans .env.local" -ForegroundColor Red
        Write-Host "   Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "   ERREUR: Fichier .env.local introuvable!" -ForegroundColor Red
    Write-Host "   Créez un fichier .env.local avec vos clés Supabase" -ForegroundColor Yellow
    exit 1
}

# Étape 2: Instructions pour les migrations SQL
Write-Host "`n[2/3] Application des migrations SQL..." -ForegroundColor Yellow
Write-Host "   Les migrations doivent être appliquées via le Dashboard Supabase." -ForegroundColor Cyan
Write-Host "`n   INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host "   1. Allez sur https://supabase.com/dashboard" -ForegroundColor White
Write-Host "   2. Sélectionnez votre projet" -ForegroundColor White
Write-Host "   3. Allez dans SQL Editor" -ForegroundColor White
Write-Host "   4. Copiez le contenu de supabase/migrations/create_analytics_tables.sql" -ForegroundColor White
Write-Host "   5. Collez et exécutez (Run)" -ForegroundColor White
Write-Host "   6. Répétez pour create_increment_function.sql" -ForegroundColor White
Write-Host "`n   Appuyez sur une touche une fois les migrations appliquées..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Étape 3: Réactiver le système d'analytics
Write-Host "`n[3/3] Réactivation du système d'analytics..." -ForegroundColor Yellow

$appFile = "src\app\App.tsx"
if (Test-Path $appFile) {
    $content = Get-Content $appFile -Raw
    
    # Décommenter useAnalytics import
    $content = $content -replace "// import \{ useAnalytics \} from './hooks/useAnalytics';", "import { useAnalytics } from './hooks/useAnalytics';"
    
    # Décommenter useAnalytics() call
    $content = $content -replace "// useAnalytics\(\);.*", "useAnalytics();"
    
    Set-Content $appFile -Value $content -NoNewline
    
    Write-Host "   Système d'analytics réactivé!" -ForegroundColor Green
} else {
    Write-Host "   ERREUR: Fichier App.tsx introuvable!" -ForegroundColor Red
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURATION TERMINÉE!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Le système d'analytics est maintenant actif!" -ForegroundColor Green
Write-Host "Rafraîchissez votre navigateur pour voir les changements.`n" -ForegroundColor Green

Write-Host "Dashboard Analytics:" -ForegroundColor Yellow
Write-Host "  http://localhost:5177/dashboard/admin/analytics`n" -ForegroundColor White

Write-Host "Bon tracking! 🚀📊`n" -ForegroundColor Cyan


